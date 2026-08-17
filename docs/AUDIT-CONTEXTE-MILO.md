# 🧠 Audit du contexte de Milo — ce que coûte et ce que contient chaque message

> **Créé le 17/08/2026**, à la demande de Michel : *« fais le chantier du prompt de Milo, mais aucune
> modif — qu'une analyse complète et approfondie, et pas linéaire, dans tous les sens »*.
>
> **Nature : analyse seule. Aucun fichier de code n'a été modifié.** Version auditée : **ft-v894**.
>
> **Pourquoi ce document existe.** Le prompt de Milo est le seul gros morceau du projet que personne
> n'avait jamais mesuré. Un garde-fou surveillait une moitié ; l'autre avait grossi jusqu'à la
> dépasser sans que rien ne regarde. *Une chose surveillée, sa jumelle pas du tout* — la famille de
> défauts la plus fréquente de ce projet.

---

## 1. La méthode — et pourquoi elle compte

Toutes les mesures viennent de **l'exécution du code réel** : un serveur statique sert le dépôt à un
Chromium sans tête, l'état `S` est injecté, `buildCoachContext(msg)` est appelée telle quelle. Les
frontières de cache sont relevées avec **les mêmes marqueurs que le Worker** (`indexOf('PROFIL
ATHLÈTE:')`, `indexOf("═══ SITUATION DE L'INSTANT ═══")`). L'historique passe par `git worktree`.

⚠️ **Ce que je n'ai pas mesuré, et il faut le lire comme tel** : les **tokens**. Aucune clé API dans
l'environnement, donc `count_tokens` n'a pas tourné. Les tokens et les coûts utilisent le ratio
**2,34 car./token** — le chiffre du projet lui-même (`worker.js` : « ~37 000 car., ~15 800 tokens »).
**Les caractères sont mesurés, les tokens sont dérivés.**

⚠️ **Et deux affirmations que j'avais faites AVANT de mesurer étaient fausses**, toutes deux pour la
même raison : j'avais lu un commentaire au lieu d'exécuter le code.

| Ce que j'avais dit | La mesure |
|---|---|
| « le catalogue fait 13 912 car. **non cachés** » | **9 400** car., dans la zone cachée 5 min depuis le 10/08 — un retrait de filtrage **volontaire et documenté** (R30), justement pour qu'il soit cachable |
| « 50 357 car. ne sont pas mis en cache » | la zone jamais cachée fait **2 300** car. |

*L'architecture de cache est nettement meilleure que ce que je décrivais.*

---

## 2. La mesure de base

Contexte construit pour le compte réel de Michel (32 séances, ~50 records, profil santé renseigné),
sur six questions de nature très différente :

```
« fais moi une séance de haut du corps »        97 732 car.
« je dors mal en ce moment »                    97 732 car.
« je mange quoi ce soir ? »                     97 732 car.
« j'ai mal à l'épaule droite depuis 3 jours »   97 732 car.
« salut »                                       97 732 car.
« c'est quoi mon record au développé couché ? » 97 732 car.
```

**Identique au caractère près — et c'est VOULU.** `_ctxEntrainement()` a été **retirée le 10/08**
(R30, écrit dans le code) : un bloc envoyé « parfois » ne peut pas être mis en cache, donc il serait
payé plein tarif au lieu d'être relu à 0,1×. *Le raisonnement était juste en caractères et faux en
prix.* Cet arbitrage tient.

### ⚠️ CORRECTION DU 17/08 AU SOIR — mes trois zones ne s'additionnaient pas

**La première version de ce tableau annonçait 49 220 + 48 042 + 2 300 = 99 562 pour un total mesuré
à 97 732 — soit 1 830 caractères d'incohérence.** L'auteur de l'audit extérieur l'a relevé, et il a
raison : *j'avais pris chaque ligne dans une exécution différente.* Le bloc commun venait d'un
lancement **sans** e-mail, le total d'un lancement **avec** — or l'e-mail change la variante (voir
ci-dessous). *Trois chiffres justes séparément et faux ensemble : c'est exactement le défaut que je
reprochais à leurs rapports deux heures plus tôt (comparer des mesures de périmètres différents).*

Voici les mesures **issues d'une seule exécution**, donc cohérentes par construction :

| Compte | COMMUN (1 h) | PERSONNEL (5 min) | INSTANT (jamais) | **total** |
|---|---|---|---|---|
| Michel **non-admin**, gratuit | **49 280** | 45 042 | 2 485 | **96 807** ✅ |
| Michel **non-admin**, premium | **49 280** | 45 300 | 2 485 | **97 065** ✅ |
| Michel **admin** (son vrai compte) | **47 375** | 48 056 | 2 485 | **97 916** ✅ |
| Profil neutre, **aucune blessure** | **46 466** | — | — | 69 434 |

**Deux choses que cette mesure propre apprend, et que la précédente masquait :**

① **Le statut premium ne change PAS le bloc commun** (49 280 dans les deux cas) — seulement le bloc
personnel, de 258 caractères. C'est sain.

② **L'e-mail admin, lui, le change de −1 905 caractères**, et l'écart est entièrement dans **une
seule section** : `TA PERSONNALITÉ` passe de **4 196 à 2 291** (le passage qui explique à Milo
comment parler de l'offre payante disparaît). C'est la 2ᵉ variante documentée en ft-v767 — elle
existe bien, elle est juste **beaucoup plus petite que celle du profil santé**.

**⚠️ Le nombre de variantes du bloc « commun » est donc le produit des deux :**
`(admin ou non) × (combinaison de blessures)`. Michel cumule les deux, donc son bloc n'est partagé
avec personne.

Le bloc **INSTANT** varie légèrement d'une mesure à l'autre (2 300 → 2 485) : il porte l'heure
locale. C'est normal et sans conséquence — c'est précisément la zone qui n'est jamais mise en cache.

---

## 3. ⭐⭐ LE CONSTAT PRINCIPAL — le bloc « commun » n'est commun que pour les gens en bonne santé

Le cache de prompt est un **cache de PRÉFIXE** : deux requêtes partagent une entrée seulement tant
que leurs octets sont identiques **depuis le tout premier**. La première différence coupe tout ce
qui suit.

Or le contexte se construit ainsi (`coach.js:2275`) :

```js
return _gardienRules() + `Tu es Milo, le coach personnel de cet athlète ...`
```

`_gardienRules()` rend une chaîne **vide** quand rien n'est déclaré, et un bloc **personnalisé**
sinon — il nomme les zones fragiles une par une (« protège les cervicales… », « protège le genou… »).
Ce bloc est donc placé **avant la première ligne du prompt**.

**La mesure, huit profils de santé, même personne par ailleurs :**

| Profil santé | bloc commun | empreinte |
|---|---|---|
| aucune blessure | 46 466 | `8b7fc12be0` |
| épaule droite | 48 199 | `09318bd918` |
| épaule gauche | 48 199 | `09318bd918` |
| genou droit | 48 208 | `d4a1c58f75` |
| lombaires | 48 146 | `66b98412ba` |
| épaule D + genou D | 48 705 | `ab92a1a888` |
| épaule D + lombaires | 48 643 | `0bfe4fd883` |
| poignet gauche | 48 027 | `4390d6f760` |

**8 profils → 7 entrées de cache distinctes.** Seuls la gauche et la droite d'une même zone se
rejoignent (texte identique). Le Gardien nomme **20 zones** et **5 conditions** : le nombre de blocs
« communs » possibles n'est pas 2, c'est le nombre de **combinaisons de blessures**.

### ⚠️ Pourquoi le garde-fou ne peut pas le voir

Le témoin de `tests/parcours` (bloc Q) est **excellent** et fait quatre choses justes : il compare le
bloc commun de **3 profils opposés**, vérifie qu'il reste sous **46 500** caractères, qu'aucun prénom
n'y fuit, et qu'il **ne dépend pas de l'heure** (trouvé grâce à une remarque de GPT le 08/08).

Mais ses trois profils sont `{name, gender, age, bw, goal, email}` — **aucun n'a de profil santé**.
Le chemin qui casse le partage n'est jamais emprunté. *C'est un angle mort de la fixture, pas du
témoin.*

Le commentaire du témoin dit « Vérifié le 08/08 : 2 empreintes seulement (admin / non-admin) ». La
vérification était **manuelle**, et sa conclusion est fausse aujourd'hui : la deuxième variante n'est
pas l'admin, c'est **le profil santé**. *Une vérification manuelle non figée par un test se périme
sans prévenir.*

### ⚠️⚠️ Et il n'y a PAS de correctif évident

Descendre le Gardien sous le repère `PROFIL ATHLÈTE:` le rendrait cachable comme donnée
personnelle — **mais il perdrait sa position « à prendre en compte AVANT tout le reste »**, qui est
exactement ce que **R11** exige (la sécurité prime, les règles ne s'additionnent pas, elles se
hiérarchisent). **En cas de conflit, la Constitution l'emporte** : la solution ne peut pas être
« le descendre ». C'est un vrai arbitrage à poser, pas un bug à corriger en trois lignes.

### ⭐⭐ SAUF QUE LE DILEMME EST FAUX — et c'est l'auditeur extérieur qui l'a vu

**Mon raisonnement supposait le bloc INDIVISIBLE. Il ne l'est pas.** Sa proposition, vérifiée et
chiffrée ici : le Gardien contient **deux natures**, et une seule est personnelle.

| Nature | Taille | Contenu |
|---|---|---|
| **Générique** — identique pour tout le monde | **1 234** car. (4 lignes) | le titre « PRIORITÉ ABSOLUE, à prendre en compte AVANT tout le reste » · « Principe : ADAPTER, jamais interdire bêtement… » · « Tu ne juges jamais un exercice bon ou mauvais… » · « Ces points sont DURABLES… consulte un professionnel » |
| **Personnel** — les zones nommées | **1 578** car. (4 lignes) | « • protège les cervicales… » · « • protège le genou… » · « • protège l'épaule… » · « • arthrose/arthrite… » |

**Ce qui descendrait n'est donc pas une règle, c'est une DONNÉE.** La phrase qui porte la priorité de
sécurité — *« PRIORITÉ ABSOLUE, à prendre en compte AVANT tout le reste »* — reste en tête, commune
et partagée. **R11 est respectée, et le partage de cache est rétabli : 8 profils passeraient de 7
empreintes à 1.**

**⭐ Et l'argument est plus fort qu'ils ne le disent** : le bloc personnel contient **déjà** les mêmes
faits, 47 000 caractères plus loin —

```
⚠️ PROFIL SANTÉ — adapter les conseils en conséquence:
- Conditions: Arthrose/Arthrite
- Blessures: Cou/Cervicales (ancienne/guérie), Genou D…, Genou G…, Épaule D…
- Notes: Zones fragiles : Épaule droit (déchirure partielle du supraépineux…)
```

Les zones du Gardien ne sont pas une information de plus : c'est **la même information sous une autre
forme** (les faits ici, l'adaptation à en tirer là-bas). Les réunir au même endroit, c'est **R2** —
une information, un propriétaire — et ça règle le cache par la même occasion.

**⚠️ CE QUI RESTE À VÉRIFIER AVANT DE LE FAIRE, et ce n'est pas une question de cache** : le modèle
lira les *règles* d'adaptation en tête, et les *zones* auxquelles les appliquer beaucoup plus loin.
Rien ne dit que ça se comporte pareil. **C'est mesurable** — le corpus `tests/milo` contient
justement des scénarios blessure — et **ça doit l'être avant la livraison**, parce que le risque
porte sur la sécurité, pas sur la facture (R29 : le coût de l'erreur décide).

**⚠️ ET UN CORRECTIF À FAIRE DANS TOUS LES CAS, indépendamment de cette décision** : ajouter deux
profils avec `healthProfile` renseigné à la fixture de `tests/parcours`. Sans ça, l'angle mort du §3
reste ouvert et la régression reviendra sans être vue.

---

## 4. Le bloc PERSONNEL est plus gros que celui qu'on plafonne — et il n'a aucun plafond

| | Taille (compte réel) | Plafond | Testé par |
|---|---|---|---|
| Bloc COMMUN | 46 466 – 49 220 | **46 500** | 3 profils, sans blessure |
| Bloc PERSONNEL | **48 042** | **aucun** | aucun test de taille |

Le garde-fou de taille a été construit en août sur le bloc commun, à l'époque le gros morceau, et il
a **fait son travail** — il a refusé une livraison le 12/08 et une autre le 15/08. Pendant ce temps
la moitié personnelle a grossi jusqu'à le dépasser, sans que rien ne regarde.

### Est-il borné ?

| Jeu de données | bloc personnel | verdict |
|---|---|---|
| 32 séances (le compte réel) | 45 042 | — |
| 96 séances (×3) | 45 038 | **borné ✅** |
| 320 séances (×10) | 45 041 | **borné ✅** |
| 320 séances + 40 records | **46 671** | **NON borné ❌** (+1 629) |

**L'historique est correctement borné** — 10× plus de séances ne changent pas un caractère. C'est le
point qui aurait pu coûter le plus cher, et il est tenu.

En revanche `RECORDS PERSONNELS` est construit par `Object.entries(S.prs).map(…).join(', ')` —
**sans découpe ni plafond**. ~41 caractères par record, linéaire, à vie. Quelqu'un qui suit 200
exercices ajoute ~8 000 caractères à chacun de ses messages.

⚠️ **Ce n'est pas un appel à couper.** Les records sont exactement le genre d'information qui doit
atteindre Milo (**R4**), et une coupe mal faite lui ferait oublier un record réel — ce qui coûte plus
cher que les caractères (**R29** : le droit de deviner dépend du coût de l'erreur). Le constat est
qu'il n'y a **ni borne ni mesure**, pas qu'il faut trancher.

---

## 5. La croissance, mesurée

Contexte reconstruit sur quatre révisions datées, **même profil neutre** à chaque fois :

| Date | total | bloc commun | personnel + instant |
|---|---|---|---|
| 5 août | 60 102 | 37 239 | 22 863 |
| 10 août | 62 224 | 44 684 | 17 540 |
| 14 août | 67 523 | 46 462 | 21 061 |
| 17 août | 69 434 | **46 466** | 22 968 |

**+25 % de bloc commun en 12 jours**, puis un plateau net à 46 462 → 46 466. Ce plateau n'est pas un
hasard : **c'est le plafond qui mord**. *Le garde-fou fonctionne, et on le voit dans les chiffres.*

⭐ La mesure du 5 août recoupe **au caractère près** le commentaire écrit dans `worker.js` ce jour-là
(37 261 annoncés, 37 239 mesurés) : deux méthodes indépendantes, même résultat.

---

## 6. ✅ Ce qui est SAIN — et qui doit être dit

| Vérification | Résultat |
|---|---|
| **R8 — le prompt cite-t-il des sources absentes du contexte ?** 16 sources nommées (catalogue, records, programmes, calendrier, registre, ADN, profil santé, questionnaire, état du jour, bilans sanguin et corporel, étude du corps, rythme mesuré, discipline, mémoire longue, raisons de remplacement) | **16/16 présentes. Zéro trou.** C'est le résultat direct de la discipline R8 tenue depuis juillet |
| **R2 — duplication entre bloc commun et bloc personnel** (phrases > 60 car.) | **0 phrase en double** |
| **Bornage de l'historique** | 10× les séances → **0 caractère** de plus |
| **Couverture du témoin existant** | identité entre profils · plafond · fuite de prénom · **indépendance à l'heure** : les quatre testés en permanence |

Seule duplication trouvée : **interne au bloc du Gardien** — deux phrases d'alternatives se répètent
quand deux zones voisines sont déclarées (~180 car.). Effet de gabarit par zone, sans gravité.

---

## 7. ❓ La densité d'insistance — question ouverte, PAS une recommandation

Marqueurs d'autorité dans le bloc commun : **JAMAIS ×47** · **⛔ ×17** · **TOUJOURS ×9** ·
**INTERDIT ×4** · **ABSOLUE ×2** · **INTERDICTION ×1**.

Chacun a une histoire, et la plupart sont nés d'un vrai bug de comportement — les retirer à l'aveugle
serait exactement l'erreur que **R30** décrit. Deux choses méritent quand même d'être posées :

① **Quand tout est critique, plus rien ne l'est.** 47 interdits absolus dans un même bloc se
concurrencent — c'est la thèse de **R11** (les règles se hiérarchisent) et de **R20** (chaque règle
ajoutée dilue les autres).

② **Le niveau de modèle a changé sous le prompt.** Beaucoup de ces formulations datent de l'époque
Haiku, où Milo sous-appliquait les consignes ; le défaut est Sonnet depuis le 26/07 (**R9**). Une
consigne écrite pour forcer la main d'un modèle léger devient, sur un modèle qui suit bien, une
consigne **sur-appliquée**. *Ce n'est pas une hypothèse générale : c'est le motif déjà vécu ici,
quand trois durcissements de prompt n'ont rien corrigé et que la vraie variable était le modèle.*

⚠️ **C'est le seul point de cet audit sans mesure.** On ne peut pas mesurer l'effet d'un « JAMAIS »
sans faire tourner le modèle. À trancher par des essais A/B sur le corpus de tests, **jamais au
jugement**.

---

## 8. Le coût — ordres de grandeur

Modèle en production : `claude-sonnet-4-6` (en dur dans `worker.js`, ligne 438) — 3 $/million de
tokens en entrée. Lecture de cache ≈ 0,1× · écriture 5 min ≈ 1,25× · écriture 1 h ≈ 2×.
Contexte ≈ **42 500 tokens** par message (dérivé, voir §1).

| Situation | Coût d'entrée / message |
|---|---|
| Aucun cache (référence) | 0,128 $ |
| Les deux caches lus — le cas normal en conversation | **0,015 $** |
| 1ᵉʳ message d'une fenêtre : écriture commun 1 h + perso 5 min | 0,206 $ |

**Le cache marche très bien à l'intérieur d'une conversation**, y compris pour une personne blessée :
elle relit sa propre entrée. **Le constat du §3 ne coûte donc rien à une personne seule — il coûte à
mesure que les utilisateurs se multiplient.** Le bloc commun a été conçu (le 05/08) pour être **une
seule entrée partagée par tout le monde** ; il devient une entrée par combinaison de blessures.

⚠️ **Honnêteté sur la portée** : c'est exactement la logique déjà écrite dans `worker.js` — *« le gain
est proportionnel à l'USAGE, nul avec un seul utilisateur par jour »*. Le défaut est structurel et
invisible aujourd'hui ; il devient visible sur la facture le jour où l'app a des utilisateurs.
**C'est précisément le moment où on ne veut pas le découvrir.**

---

## 8 bis. ⭐⭐ POURQUOI LE CACHE NE RAPPORTE RIEN — ce n'est pas la proportion, c'est l'ORDRE

> **Mesuré le 17/08 au soir**, en réponse à l'analyse de facturation de l'auditeur extérieur. Sa
> question était : *« quelle est la somme des sections stables contre mutables dans le bloc
> personnel ? »* avec un seuil à 65 % pour décider d'une scission en deux points de cache.
>
> **La mesure montre que la question ne se pose pas dans ces termes.**

### L'expérience

On construit le contexte, on **valide une série** (le geste le plus fréquent d'une séance, toutes les
~90 s), on reconstruit, et on cherche **le premier caractère qui diffère** — puisqu'un cache de
préfixe ne conserve que ce qui précède la première différence.

```
bloc personnel : 45 338 car.
premier caractère qui change : position 23 006
  → survit au cache : 23 006 car.
  → RÉÉCRIT         : 22 332 car.  (49,3 %)
```

**⚠️ Première correction à l'analyse de facturation** : elle écrit *« loguer une série pendant la
conversation réécrit les 48 042 caractères »*. **Non — elle en réécrit 49 %.** La moitié qui précède
la coupure survit. Le raisonnement reste juste, l'ampleur est double de la réalité.

### ⭐ Ce que la mesure révèle vraiment : des blocs stables coincés derrière un bloc mutable

Les sections du bloc personnel, **dans leur ordre réel** (⛔ = après la coupure) :

```
✅      0   1 634  PROFIL ATHLÈTE
✅  2 964     421  ⚠️ PROFIL SANTÉ
✅  3 387   3 877  📐 ÉTUDE DU CORPS
✅ 14 808   1 973  REGISTRE ATHLÈTE
✅ 19 161   2 486  RECORDS PERSONNELS
✅ 22 729     294  SÉANCE EN COURS      ← la coupure est ICI
⛔ 23 025   6 960  DERNIÈRES SÉANCES         (mutable)
⛔ 29 987     116  POIDS & COMPOSITION       ← stable
⛔ 30 105     152  CHECK-IN SÉANCES RÉCENTES (mutable)
⛔ 30 260   1 049  BILAN CORPOREL            ← stable
⛔ 31 312   1 001  BILAN SANGUIN             ← stable
⛔ 32 315   1 406  MÉTHODE DE COACHING       ← stable
⛔ 33 723   9 401  🏋️ EXERCICES DISPONIBLES  ← stable
⛔ 43 126   2 210  🔀 EXERCICES UNILATÉRAUX   ← stable
```

**15 183 caractères parfaitement stables sont réécrits toutes les 90 secondes** — uniquement parce
qu'ils sont rangés *après* le bloc de la séance en cours. Le catalogue d'exercices à lui seul pèse
**9 401** caractères et ne change jamais d'une séance à l'autre.

### Le correctif est un DÉPLACEMENT, pas une scission

| | coupure | réécrit par série validée |
|---|---|---|
| Aujourd'hui | 23 006 | **22 332** car. (49,3 %) |
| Les 3 blocs mutables déplacés à la fin | ≈ 37 932 | **7 406** car. (16,3 %) |

**Gain : ~14 900 caractères sauvés à chaque série validée**, sans ajouter de point de cache (le
maximum est de 4, trois sont déjà pris), **sans retirer une ligne de texte**, et sans toucher au
contenu que Milo reçoit.

**⚠️ PORTÉE HONNÊTE, et elle compte :**
- La mesure ne couvre **qu'une seule mutation** — valider une série. C'est la plus fréquente de
  très loin, mais pas la seule : un **nouveau record** touche `RECORDS PERSONNELS` en position
  19 161, donc **plus haut que la coupure actuelle**. Un record par séance au maximum, contre une
  série toutes les 90 s — mais le déplacement ne le règle pas.
- **L'ordre du contexte n'est pas neutre pour un modèle.** Déplacer des blocs de *données* est moins
  risqué que déplacer des *règles*, mais ça reste à vérifier sur `tests/milo` avant livraison.
- Ce constat **ne remplace pas** la scission stable/mutable proposée par l'auditeur : il la rend
  beaucoup moins urgente, et il coûte infiniment moins cher à implémenter.

### Vérification indépendante de la facturation

Sur les exports de facturation dont je dispose (jeu partiel, différent du sien), **la conclusion va
dans le même sens et elle est même plus marquée** :

| Modèle | écritures / lectures | verdict |
|---|---|---|
| Sonnet | **4,80 : 1** | le cache coûte **1,20 $ de plus** qu'aucun cache |
| Opus | **11,81 : 1** | le cache coûte **3,40 $ de plus** |

⚠️ Mes chiffres absolus diffèrent des siens (il annonce 3,03 : 1 et 0,41 $) — nos jeux de fichiers ne
sont pas les mêmes et je n'ai pas son export de juillet. **Ce sont les ratios qui portent la
conclusion, et les deux mesures indépendantes disent la même chose : aujourd'hui, le cache est à
perte parce qu'on écrit bien plus qu'on ne lit.** Le seuil de rentabilité est de **1,4 lecture par
écriture** ; on en est loin.

---

## 9. Ce que cet audit n'a PAS mesuré

| Question | Pourquoi elle reste ouverte |
|---|---|
| Les tokens réels | Pas de clé API — `count_tokens` n'a pas tourné. Tout chiffre en tokens est dérivé. |
| L'effet du contexte sur la **qualité** des réponses | Demande de faire tourner le modèle avec et sans. **Aucun résultat ici n'autorise à dire qu'une section « sert » ou « ne sert pas ».** |
| Le taux de lecture de cache réel en production | Se lit dans les exports de facturation, pas dans le code. |
| Les autres appels IA | Seule la conversation est auditée. Les tâches utilitaires (étiquette, code-barres, résumés) tournent sur Haiku, ailleurs. |
| Le poids des consignes les unes sur les autres | Voir §7 — non mesurable sans expérimentation. |

---

## 10. Les quatre questions à trancher

| # | Point | Ce qui reste à décider |
|---|---|---|
| 1 | **Le Gardien en tête de contexte** | Le descendre le rendrait cachable, mais lui ferait perdre sa priorité de sécurité. **R11 et la Constitution interdisent ce chemin.** Quelle autre voie ? |
| 2 | **Plafonner le bloc personnel** | Un plafond sur des données personnelles n'a pas le même sens qu'un plafond sur des consignes : dépasser signifierait **couper de l'information vraie sur la personne**. Faut-il un plafond, ou seulement une **mesure visible** ? |
| 3 | **Les records non bornés** | Couper les plus anciens ? Les plus légers ? Ne rien couper et mesurer ? **R29** : l'erreur ici, c'est Milo qui oublie un record réel. |
| 4 | **La densité d'insistance** | Testable seulement par A/B sur le corpus. Personne ne devrait trancher ça au jugement. |

---

*Scripts de mesure conservés hors dépôt (espace de travail temporaire) : contexte par type de
question · comparaison entre profils · empreintes par profil santé · croissance par révision git ·
bornage du bloc personnel. Sources lues : `coach.js` (422 456 car.), `worker.js`,
`tests/parcours/runner.js`, `tests/milo/runner.js`. **Aucun fichier du dépôt n'a été modifié.***


---

# 11. 📜 L'AUDIT PRÉCÉDENT — 9 août 2026, conservé tel quel

> **⚠️ POURQUOI CETTE SECTION EXISTE — et c'est une erreur de ma part, rattrapée.**
> Un audit du même contexte avait déjà été écrit le **9 août**, dans **ce fichier**. En rédigeant
> celui du 17 août, je l'ai **écrasé** — exactement le geste qui a coûté 297 entrées de journal le
> 04/08. `git` l'a rendu, et il est remis ici **intégralement**. *Une archive s'ajoute, elle ne se
> réécrit jamais* — et un fichier de doc au même nom est une archive comme une autre.
>
> **⚠️ SES CHIFFRES NE SONT PLUS VALABLES, ET C'EST TOUT SON INTÉRÊT.** Il mesure **60 775 car.**
> sur un message d'entraînement et **45 996** sinon — parce qu'à cette date `_ctxEntrainement()`
> **conditionnait** encore le catalogue au message. Cette fonction a été **retirée le 10/08** (R30,
> écrit dans `coach.js`) : le raisonnement était juste en caractères et faux en prix (un bloc envoyé
> « parfois » ne peut pas être mis en cache). D'où les 97 732 car. constants du §2.
>
> ⭐ **Et il avait déjà vu l'essentiel** — sa conclusion n°1 (*« le vrai sujet n'est pas la
> longueur, c'est la POSITION »*) est exactement ce que le §3 démontre huit jours plus tard sur le
> Gardien. Sa question ouverte n°6 (*« le bloc admin crée une seconde empreinte de cache »*) posait
> déjà le bon problème — avec la mauvaise cause : ce n'est pas l'admin, c'est le **profil santé**.

> **Aucune modification de code.** Analyse seule, demandée par Michel le 09/08/2026.
> Tout ce qui suit est **mesuré en exécutant l'application**, jamais déduit du code à l'œil.

### Méthode

Le contexte est construit par `buildCoachContext(msg)` (`coach.js:1597`), qui rend
`_gardienRules()` + un gabarit unique. Trois mesures ont été faites dans un vrai navigateur,
sur un profil réaliste (40 séances, records, poids, sommeil, premium) :

1. **taille par différence** — on retire une donnée, on remesure le contexte ;
2. **découpe par en-tête** — le texte produit est recoupé sur ses titres réels ;
3. **variation du message** — le même profil avec 5 messages différents.

⚠️ **Deux erreurs de ma sonde, corrigées avant de conclure** (elles auraient produit un audit faux) :
- mes fausses données utilisaient `S.objectives`, `S.registre`, `S.checkins` — **ces champs
  n'existent pas** ; les vrais sont `S.priorities`, `S.strengthGoals`, `S.healthProfile`,
  `S.coachQuiz`. Six blocs mesuraient « 0 » à cause de moi, pas du code ;
- j'appelais `buildCoachContext()` **sans message**, ce qui force l'envoi du catalogue. La
  vraie prod passe le message (`coach.js:2534`) — le conditionnement existe déjà.

---

### Les 3 zones de facturation

Le worker Cloudflare coupe le prompt en trois au marqueur `═══ SITUATION DE L'INSTANT ═══`
(`worker.js:314`) :

| Zone | Taille | Part | Cache | Prix réel |
|---|---:|---:|---|---|
| **Commun** — identique pour tous | 36 352 | 57 % | 1 h | ~10 % s'il est relu |
| **Personnel** — les données de la personne | 7 650 – 9 960 | 13-16 % | 5 min | ~10 % s'il est relu |
| **Instant** — après le marqueur | 17 339 | **27 %** | ❌ **jamais** | **100 %, à chaque message** |
| **TOTAL** (message d'entraînement) | **60 775** | | | |

**Le chiffre qui cadre tout l'audit : un profil totalement VIDE produit déjà 58 381 caractères,
soit 92 % du prompt d'un utilisateur complet.** Les données personnelles d'un athlète avec
40 séances ne pèsent que ~5 300 caractères. **Ce n'est pas la personne qui coûte cher, ce sont
les instructions.**

---

### Tableau d'audit

Colonnes : **T** = taille · **Chaque msg ?** = indispensable à chaque message · **Code ?** =
calculable par le code · **Déplaçable ?** = peut passer dans une zone cachée · **Gain** = gain
potentiel par message.

### ZONE « INSTANT » — jamais cachée, payée plein tarif (17 339 car.)

| # | Bloc | T | Condition d'injection | Pourquoi Milo en a besoin | Chaque msg ? | Code ? | Redondant ? | Déplaçable ? | Gain | Risque si retiré | Classe |
|---|---|---:|---|---|---|---|---|---|---:|---|:--:|
| 1 | 🏋️ **Catalogue d'exercices** | 9 264 | **déjà conditionné** : message OU 4 derniers tours contenant un mot d'entraînement, message < 25 car., < 2 tours, aucune séance → envoi complet (`_ctxEntrainement`, `coach.js:2128`). Filtré par **lieu** si renseigné | nommer un exercice que l'app **reconnaît** — sinon la démo, les records et le suivi tombent (R8, bug ft-v713) | Non — et c'est **déjà** géré | Non | Non | Partiellement : la liste bouge quand la personne crée un exercice perso ou change de lieu | 0 (déjà pris) | **Élevé** — Milo invente des noms d'exercices | **D** |
| 2 | **INTÉGRER LA SÉANCE DANS L'APP** | 2 286 | **aucune** — toujours | format du bloc technique que l'app relit pour créer la séance | Non — utile seulement s'il propose une séance | Non | Non | **Oui** — texte 100 % fixe | 2 286 | Moyen — le bloc séance peut être mal formé | **C** |
| 3 | **MODÈLE DE PROGRAMME PRO** | 1 396 | **aucune** — toujours | niveau de détail attendu quand on demande un programme | Non — sert sur une demande de programme | Non | Non | **Oui** — texte 100 % fixe | 1 396 | Faible — programmes moins détaillés | **B** |
| 4 | 🌟 **CRÉER LE PREMIER MOMENT MILO** | 1 151 | **aucune** — toujours | soigner le tout premier échange | **Non** — le texte dit lui-même « surtout au TOUT PREMIER échange » | **Oui** (`coachHistory.length`) | Non | **Oui** | 1 151 | Faible — hors du 1ᵉʳ échange | **B** |
| 5 | **SE SOUVENIR DE LA PROCHAINE SÉANCE** | 921 | **aucune** — toujours | cohérence avec une séance annoncée | Non — seulement si `S.nextPlanned` existe | **Oui** | Partiel (le fait est ailleurs) | **Oui** | 921 | Faible | **B** |
| 6 | **ORDRE ET EXHAUSTIVITÉ du bloc** | 915 | **aucune** — toujours | le bloc séance doit refléter la réponse | Non — lié au bloc n°2 | Non | **Oui — avec n°2** | **Oui** | 915 | Moyen | **C** |
| 7 | Note « au-dessus de cette ligne = identique » | 860 | **aucune** — toujours | explique le découpage du cache | **Non** — c'est une note d'architecture | — | Non | **Oui** | 860 | **Aucun connu** | **B** |
| 8 | **RÉCUPÉRATION & SOMMEIL** | 515 | si `S.sleepLog` / check-ins | l'état du jour réel | **Oui** | Déjà calculé (score) | Non | Non — change chaque jour | 0 | Élevé | **D** |
| 9 | **MOMENT PRÉSENT** (heure) | 301 | toujours | saluer et conseiller selon l'heure | **Oui** | Déjà calculé | Non | **Non** — change à chaque message | 0 | Moyen | **D** |
| 10 | En-tête `SITUATION DE L'INSTANT` | 31 | toujours | marqueur de coupure de cache | Oui | — | Non | Non | 0 | **Critique** — casse le cache | **D** |

> **Total réellement variable dans cette zone : ~816 caractères** (n°8 + n°9).
> **~6 500 caractères y sont strictement fixes** (n°2, 3, 4, 5, 6, 7) et payés plein tarif à
> chaque message **uniquement à cause de leur position dans le fichier**.

### ZONE « COMMUN » — cachée 1 h (36 352 car.)

| # | Bloc | T | Condition | Chaque msg ? | Code ? | Déplaçable ? | Risque si retiré | Classe |
|---|---|---:|---|---|---|---|---|:--:|
| 11 | Personnalité, méthode de coach, raisonnement, sécurité, mémoire, ancre/accessoire, pertinence, cohérence | ~24 000 | aucune | Oui | Non | déjà au bon endroit | **Critique** | **D** |
| 12 | **NUTRITION** (bloc complet) | ~9 350 | **aucune** | Non — inutile sur une question d'entraînement pur | Non | déjà caché | Faible/moyen | **C** |
| 13 | **CALENDRIER** (hier/aujourd'hui/demain + 14 j) | ~600 | toujours | Oui (1×/jour) | **Déjà fait par le code** — c'est son rôle | déjà caché ; **change à minuit**, donc stable dans une fenêtre de cache | **Élevé** — bugs ft-v658/660 | **D** |
| 14 | Bloc **admin** (`_estSuperAdmin()`) | ~1 000 | **admin uniquement** | — | — | **crée 2 empreintes de cache** au lieu d'1 | Aucun pour les autres | **C** |

### ZONE « PERSONNEL » — cachée 5 min (7 650 – 9 960 car.)

| # | Bloc | T mesurée | Condition | Code ? | Risque si retiré | Classe |
|---|---|---:|---|---|---|:--:|
| 15 | 40 dernières séances (détail) | **3 559** | `S.sessions` | non | Élevé | **D** |
| 16 | Historique compact | 1 461 | `_historiqueCompact()` | non | Élevé | **D** |
| 17 | Bilan corporel | 961 | `S.bodyScans` | non | Moyen | **D** |
| 18 | Mémoire longue | 946 | `_memoireLongue()` | non | Élevé | **D** |
| 19 | Prochaine séance annoncée | 477 | `S.nextPlanned` | oui (le fait) | Moyen | **D** |
| 20 | Séance **en cours** | 323 | `S.wkt` | non | Élevé | **D** |
| 21 | Statut premium | 258 | toujours | oui | Faible | **C** |
| 22 | Records (PRs) | 147 | `S.prs` | non | Élevé | **D** |
| 23 | Niveau | 96 | `S.level` | non | Moyen | **D** |
| 24 | Exercices perso | 66 | `S.customExercises` | non | Moyen | **D** |
| 25 | Poids / sommeil | 57 / 33 | logs | déjà agrégé | Moyen | **D** |
| 26 | `_gardienRules()` — blessures | **0 ici** | **uniquement si blessure déclarée** | non | **Critique** (sécurité) | **D** |
| 27 | `_coachQuizContext()` | **0 ici** | uniquement si questionnaire rempli | non | Moyen | **D** |

⚠️ **26 et 27 mesurent 0 sur mon profil de test parce que les données sont absentes, pas parce
que le code ne les envoie pas.** Non démontrable autrement sans un profil réel.

---

### Ce que le conditionnement fait DÉJÀ (mesuré)

| Message | Taille | Catalogue |
|---|---:|:--:|
| « je fais quoi comme séance aujourd'hui ? » | 60 775 | ✅ |
| « salut » (< 25 car. → on envoie tout, exprès) | 60 775 | ✅ |
| « je me sens fatigué, j'ai mal dormi » | **45 996** | ❌ |
| « qu'est-ce que je mange ce soir ? » | **45 996** | ❌ |
| + lieu = « maison sans matériel » | 52 985 | ✅ (filtré) |

**Le levier le plus gros est déjà en place et fonctionne : −14 779 caractères (−24 %) sur un
message hors entraînement.**

---

### Classement demandé

**A — CERTAIN (démontré par la mesure)**
- Le prompt fait **60 775 car.** sur un message d'entraînement, **45 996** sinon.
- **92 % du prompt part même vers un profil vide** — le coût n'est pas dans les données de la personne.
- **27 % du prompt n'est jamais caché**, dont **~6 500 car. strictement fixes**.
- Le catalogue (9 264 car.) est **déjà conditionné** au message et au lieu.
- Seuls **~816 car.** de la zone non cachée changent réellement d'un message à l'autre.

**B — PROBABLEMENT INUTILE À CHAQUE MESSAGE**
- n°7 note d'architecture du cache (860) — aucun effet sur le comportement identifié.
- n°4 « Moment Milo » (1 151) — le texte lui-même le limite au premier échange.
- n°5 « prochaine séance annoncée » (921) — n'a de sens que si `S.nextPlanned` existe.
- n°3 « Modèle de programme pro » (1 396) — ne sert que sur une demande de programme.

**C — MÉRITE UNE ÉTUDE**
- n°2 + n°6 « intégrer la séance » (3 201 ensemble) : conditionnables comme le catalogue, **mais
  même risque asymétrique** — sans eux, le bloc que l'app relit peut être mal formé.
- n°12 bloc nutrition (9 350) : gros, mais **déjà caché** → gain réel faible, risque de dilution non mesuré.
- n°14 bloc admin : **coupe le cache commun en deux empreintes**. À mesurer.
- n°21 statut premium (258) : reformulable en une ligne.

**D — INDISPENSABLE**
- Tout le socle de comportement, sécurité et raisonnement (n°11).
- Le calendrier (n°13) — il **corrige** deux bugs réels ; le retirer les ramène.
- Toutes les données réelles de la personne (n°15→27), y compris le Gardien blessures.
- L'heure et la récupération (n°8, 9) — ce sont les seules choses qui changent vraiment.

---

### Conclusions

1. **Le vrai sujet n'est pas la longueur, c'est la POSITION.** ~6 500 caractères parfaitement
   fixes vivent après le marqueur de cache et sont donc payés **plein tarif** à chaque message,
   alors que le même texte placé 20 lignes plus haut coûterait **10 %**. À qualité de réponse
   **strictement identique**.

2. **Réduire le prompt rapporterait peu.** 57 % est déjà caché 1 h ; y retirer du texte ne fait
   économiser que 10 % de ce qu'on retire. L'effort utile porte sur les 27 % non cachés.

3. **Le conditionnement au message marche déjà** (−24 %) et il est bien conçu : il lit les
   4 derniers tours, pas seulement le message, et penche toujours du côté de l'inclusion.

4. **Rien ne suggère de toucher au comportement de Milo.** Aucun bloc de personnalité,
   sécurité ou raisonnement n'apparaît comme superflu ; le socle est cohérent et chaque règle
   y est reliée à un incident réel.

5. **Ce que je ne peux PAS démontrer depuis le code :** l'effet d'un prompt plus court sur la
   **qualité** des réponses. Le code dit ce qui est envoyé, pas ce que le modèle en fait.
   Toute affirmation du type « alléger rendra Milo plus obéissant » est une hypothèse — elle
   demanderait une comparaison à l'aveugle sur des cas réels.

6. **Question ouverte, non tranchée ici :** le bloc admin crée une **seconde empreinte de cache**.
   Sur peu d'utilisateurs, ça peut coûter plus cher que ce qu'il économise. Mesurable.
