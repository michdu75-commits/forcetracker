# 🤝 Protocole de coordination — deux sessions en parallèle

> **Proposé le 13/09/2026**, à la demande de Michel, à partir du dossier `DOSSIER-GPT-SEPARATION`.
> ⛔⛔ **PROPOSITION SEULE — RIEN N'EST MODIFIÉ, RIEN N'EST APPLIQUÉ.** ⛔ Nutrition non approchée.
> ⛔ Aucun framework, aucun build, aucune CI : tout ce qui suit tient avec les outils du dépôt.

---

## 1. IDENTIFIANTS PARTAGÉS

### ⛔ Ta proposition marche pour l'un, pas pour l'autre — et la mesure le dit

| | Mesure | Verdict |
|---|---|---|
| **numéro de version** (`ft-vNNNN`) | ⛔ **analysé par `check_regles.py`** en 4 endroits, motif `ft-v(\d+)` — **chiffres stricts** | un identifiant temporaire `ft-vB-3` **casse les contrôles de gouvernance** |
| **numéro de bloc de tests** (`CCCIII`) | ⭐ **analysé par AUCUN outil** — `check_regles.py` ne le mentionne que dans un commentaire historique | un préfixe de session est **gratuit** |

### ⭐ Ce que je propose, et c'est différent selon le sujet

**Le numéro de version : ne pas en attribuer du tout pendant le travail.**
C'est ton idée, **moins le préfixe**. `sw.js` garde le numéro **de master** tant qu'on n'a pas décidé
de publier ; le bump se fait **au moment de l'intégration**, une fois `origin/master` relu.
⭐ *Aucune adaptation d'outil n'est nécessaire* : les contrôles vérifient la **cohérence** entre
`sw.js`, `CLAUDE.md` et `CONTEXTE-ACTUEL.md`, pas la nouveauté du numéro. Ils restent verts.
⚠️ **Ce que ça change pour nous** : le commentaire de version de `sw.js` (qui raconte la livraison)
se rédige **avant**, mais le **numéro** se pose **après** le `git fetch`. Une seule ligne à toucher.

**Le numéro de bloc : un préfixe de session PERMANENT, jamais renommé.**
`B-CCCIII` au lieu de `CCCIII`. ⭐⭐ **L'avantage est qu'il n'y a plus JAMAIS de renommage** — et
c'est précisément l'opération qui m'a fait renommer 13 témoins de session-A aujourd'hui.
👉 ***Un identifiant qu'on ne renomme jamais ne peut pas être renommé de travers.***
⚠️ **Ce qu'il faudrait adapter** : rien dans les outils. Seulement **les blocs existants restent
tels quels** — on ne renumérote pas le passé, le préfixe ne vaut que pour les nouveaux.

⛔ **Et une chose que ta formulation laisse ouverte, qu'il faut fermer** : *« aucun renommage global
aveugle »* ne suffit pas comme règle, parce qu'on ne sait pas qu'on est aveugle. La règle utilisable
est plus étroite : **un remplacement se borne au corps du bloc concerné, jamais au fichier entier.**

---

## 2. PASSE RAPIDE ET PASSE COMPLÈTE

### ⛔ JE NE PEUX PAS PROUVER QU'UN SOUS-ENSEMBLE EST SÛR. Mesuré :

| Banc | Durée | Témoins |
|---|---|---|
| `parcours` | **~1500 s** | 3 763 |
| `calculs` | 100 s | 339 |
| `muscles` · `croises` · `dates` · `donnees` | **11 s à eux quatre** | 300 |

**Couverture des défauts corrigés aujourd'hui, par banc :**

| Ce qui a été corrigé | 5 petits bancs | `parcours` |
|---|---|---|
| `_pdfToText` (le contrat) | **0** | 12 |
| `pagesTotal` / `LIRE_PARTIEL` | **0** | 9 |
| `reposDefaut` | **0** | 3 |
| `_rpeDeRir` · `_rirTxt` | **0** | 12 |

👉 ***Les 111 secondes de bancs rapides auraient attrapé ZÉRO défaut sur les cinq corrigés
aujourd'hui.*** Un sous-ensemble rapide n'est donc pas une passe abrégée : c'est **une autre
mesure, qui regarde ailleurs**.

### ⭐ MAIS LA MESURE OUVRE UNE PORTE QUE LA QUESTION NE POSAIT PAS

Dans `tests/parcours/runner.js` :

| | |
|---|---|
| somme des `waitForTimeout` | ⭐⭐ **610 700 ms = 10 min 11 s** |
| part de la passe passée à **attendre** | **≈ 41 %** |
| rechargements de page (`p.goto`) | 42 |
| témoins de **source** (aucun navigateur nécessaire) | **233** |

👉 **La passe n'est pas lente parce qu'elle teste beaucoup : elle dort 10 minutes.**
⛔ **Je ne propose PAS de réduire ces attentes** — elles existent parce que l'app démarre de façon
asynchrone, et je n'ai **aucune mesure** qui prouve qu'une attente plus courte serait sûre. *Le
raccourcir sans mesure serait exactement la « petite modif sans conséquence supposée » que tu
interdis.* **C'est un chantier à part, avec son propre avant/après.**

### Ce que je propose donc, sans sous-ensemble

| Moment | Quoi | Durée |
|---|---|---|
| **pendant le travail** | le **harnais du bloc en cours** (un seul bloc, navigateur unique) + les **mutations** | **quelques secondes** |
| **avant de proposer** | les **5 petits bancs** (111 s) + `check_regles.py` | ~2 min |
| ⛔ **avant de publier** | **la passe complète, entière, sur l'arbre refusionné** | ~25 min, **non négociable** |

⭐ **Ce qui doit ABSOLUMENT rester dans la passe finale** : tout. Le tableau ci-dessus montre que
les témoins d'un chantier vivent **dans le parcours** — en retirer une partie reviendrait à ne plus
tester ce qu'on vient d'écrire.

---

## 3. JOURNAUX DE BORD — la forme append-only

### Ce qu'elle réduit vraiment, et ce qu'elle ne réduit pas

| Défaut mesuré | Append-only le règle-t-il ? |
|---|---|
| une entrée **dédoublée** par l'union | ⚠️ **NON, pas seule** — deux sessions qui ajoutent en tête produisent toujours un conflit d'insertion |
| une entrée **ressuscitée** après suppression | ⭐ **OUI** — on ne supprime plus, donc rien à ressusciter |
| une **modification** transformée en doublon | ⭐ **OUI** — on ne modifie plus une entrée, on en ajoute une qui corrige |

👉 ***Append-only règle deux défauts sur trois. Le troisième se règle par le LIEU d'insertion, pas
par la forme.***

### ⭐ Ce qui règle le troisième : ajouter **à la fin**, pas en tête

Aujourd'hui les deux sessions insèrent **en tête du même tableau** — c'est-à-dire **exactement la
même ligne**, à chaque fois. Git ne peut pas faire autrement qu'un conflit.
👉 **Ajouter à la FIN** transforme le conflit en simple `>>>` sur deux lignes voisines, que git
résout seul dans la plupart des cas. ⚠️ **Au prix de la lisibilité** : le plus récent n'est plus en
haut. *C'est un vrai arbitrage, pas un détail — et il t'appartient.*

### La correction volontaire

⭐ **Une entrée de correction qui CITE l'ancienne**, jamais une réécriture :

```
| 🟢 | 13/09 16:20 | session-B | … la ligne d'origine …                    | fichiers | ft-vNNNN |
| ↩️ | 13/09 18:05 | session-B | CORRIGE la ligne du 13/09 16:20 : le chiffre annonce etait faux
                                (14 097 -> 38). La ligne d'origine reste, avec son erreur.  |  —  |  —  |
```

⛔ **L'ancienne ligne reste, avec son erreur.** C'est la règle **R30** appliquée aux journaux : *un
retrait volontaire s'écrit, il ne s'efface pas* — et une erreur effacée est une erreur qu'on
recommence.

### Comment éviter les doublons

`check_regles.py` sait déjà les **détecter** (il l'a fait aujourd'hui sur une entrée d'archive) et
**exige de vérifier que les deux copies sont identiques avant d'en retirer une**. ⭐ **Ce contrôle
est le bon, et il ne change pas** : append-only réduit la fréquence, il ne supprime pas le besoin.

---

## 4. TÉMOINS DE PÉRIMÈTRE — les 5 formes, et la règle d'écriture

### Les cibles, par ordre de valeur mesurée

| # | Cible | Exemple réel d'aujourd'hui |
|---|---|---|
| ① | **une fonction qui ne doit pas être migrée** | *« `_pdfToImages` n'est PAS migrée »* → la mutation ⑨ fait **1 rouge** |
| ② | **un plafond qui ne doit pas bouger** | *« `MAX_PAGES` vaut toujours 15 »* → la mutation ⑧ fait **4 rouges** |
| ③ | **des appelants qui restent sur l'ancien contrat** | *« les 4 appelants lisent toujours `.length` »* |
| ④ | **un module qui ne doit pas lire/écrire une structure** | *« le hub ne touche pas à `S.foodLog` »* (session-A) |
| ⑤ | **un fichier partagé** | `app.js` : 2 lignes touchées, **aucune ligne de nutrition** |

### ⛔ Les 4 exigences d'écriture — chacune payée aujourd'hui

| Exigence | Ce qui l'a fondée |
|---|---|
| **éprouvé sur le code SAIN d'abord** | un témoin bornait à « 1400 caractères après la déclaration » — le corps fait **836** : il débordait sur la fonction voisine et **rougissait sur du code juste** |
| **cassé volontairement par mutation** | un témoin qui ne peut pas rougir ne mesure rien, il rassure |
| **appelle ou inspecte le VRAI code** | une sonde qui recopiait la règle au lieu de l'appeler ne pouvait rien détecter |
| ⛔ **pas un motif fragile** | ***une borne en distance de caractères n'est pas une borne de fonction*** — on découpe le **corps réel** de la fonction, on ne compte pas des caractères |

⛔ **Et une 5ᵉ, apprise deux fois aujourd'hui** : un témoin de source doit **retirer les commentaires
avant de compter**, sinon il interdit d'écrire la documentation de ce qu'il protège.

---

## 5. CE QU'IL FAUT INSTRUMENTER — ta règle, appliquée

> **Si un outil de mesure peut échouer silencieusement et produire quand même « 0 rouge »,
> « 0 trou » ou « tout va bien », il est prioritaire.**

| Outil | Le mode d'échec silencieux | Garde-fou | Automatisable ? |
|---|---|---|---|
| **la passe** | s'arrête sans total → **ressemble à une passe verte** | exiger la **ligne de total**, refuser de conclure sans elle | ⭐ **oui, une ligne** |
| **le code de sortie** | mesure la **dernière commande du shell**, pas le runner | lancer le runner **seul**, lire `$?` immédiatement | ⭐ **oui** |
| **l'identité de l'arbre** | la passe décrit un arbre qui n'existe plus | enregistrer `git rev-parse HEAD` **au début**, le comparer **avant** de pousser | ⭐ **oui** |
| **une publication concurrente** | invisible sans `git fetch` | `git fetch && git rev-list --count HEAD..origin/master` doit valoir **0** | ⭐ **oui** |
| **une sonde** | n'atteint pas la ligne visée → **verte sans rien mesurer** | un **garde qui LÈVE** si la fixture ne franchit pas le garde visé | ⚠️ oui, mais à écrire sonde par sonde |
| **un compteur** | confond déclaration / commentaire / appel | retirer les **blocs de commentaires entiers** et **neutraliser la déclaration** avant de compter | ⚠️ oui, motif par motif |
| **un inventaire** | un motif qui suppose une syntaxe **ne compte pas les endroits** | recroiser par une **2ᵉ méthode** quand il dimensionne un chantier | ⛔ **manuel** |
| **une mutation** | frappe la mauvaise fonction → indiscernable d'un témoin aveugle | **ancrer sur deux lignes contiguës** propres à la cible | ⛔ **manuel** |

---

## 6. VALIDITÉ D'UNE PASSE — mesurable automatiquement, oui

**Tes 3 conditions se vérifient avec les outils actuels, sans rien installer :**

```bash
# ── AVANT la passe
ARBRE=$(git rev-parse HEAD)

# ── la passe, SEULE, pour que $? soit bien le sien
node tests/parcours/runner.js > passe.log 2>&1 ; CODE=$?

# ── les 3 conditions
grep -q "TOTAL CROISÉ" passe.log            || echo "⛔ PAS DE TOTAL — passe invalide"
[ "$CODE" = "0" ]                            || echo "⛔ le runner a échoué"
[ "$(git rev-parse HEAD)" = "$ARBRE" ]       || echo "⛔ l'arbre a changé pendant la passe"
git fetch -q --all
[ "$(git rev-list --count HEAD..origin/master)" = "0" ] || echo "⛔ PUBLICATION CONCURRENTE — passe périmée"
```

⭐ **Les 4 sont des une-lignes.** ⛔ **La 4ᵉ est la seule qui manquait aujourd'hui**, et c'est elle
qui a rendu une passe périmée.

---

## 7. AUTORITÉ DE PUBLICATION — réaliste, avec une réserve

**Le principe tient**, et il décrit déjà ce qui se passe : git **impose** de fait une sérialisation
(un push non-fast-forward échoue). Le formaliser ne coûte rien.

⚠️ **Mais il ne peut pas être un VERROU, et il faut le dire** : les deux sessions vivent dans des
conteneurs séparés, **sans canal direct**. Une session ne peut pas *« prendre »* l'autorité — elle
peut seulement **l'annoncer dans le journal de partage**, et l'autre ne le verra que si elle fait
`git fetch`. *C'est un panneau d'affichage, pas une serrure.*

⭐ **Ce qui le rend quand même utile** : il ne sert pas à **empêcher** deux publications, il sert à
**décider qui refusionne**. Aujourd'hui, la règle implicite (*la première publiée garde son numéro*)
fait déjà ce travail — elle a juste coûté **3 renumérotations**.

👉 **Proposition minimale** : celle qui **publie en dernier** est celle qui refusionne, renumérote
et relance. C'est déjà le cas ; l'écrire évite d'en discuter à chaque fois.

---

## 8. LA LIMITE DES INSTANTANÉS — à écrire telle quelle

> **Un instantané identique octet pour octet est une forte preuve locale de non-régression
> UNIQUEMENT sur les chemins réellement conduits par la sonde.**
> Il ne prouve pas que « rien n'a changé partout ».

**Chaque instantané doit donc déclarer, en tête de son fichier :**
- **les chemins qu'il conduit** — les fonctions de production réellement appelées, nommées ;
- **ce qu'il LIT** — ⚠️ *conduire n'est pas observer* : un instantané peut appeler une fonction sans
  jamais lire ce qu'elle change à l'écran ;
- **ce qui reste hors couverture**, nommé.

⭐ **C'est la leçon la plus chère de la semaine** : une sonde est passée verte en mesurant *l'écran
d'avant*, parce que sa fixture ne franchissait pas le garde où vivait la ligne visée.

---

# 📋 LA PROCÉDURE

```
TRAVAIL EN COURS
   · aucun numero de version pose ; bloc de tests prefixe par session (B-…)
   · harnais du bloc en cours + mutations, quelques secondes

SYNCHRONISATION
   · git fetch --all
   · lire le journal de partage
   · refusionner master ; resoudre ; NE PAS renommer globalement

TEMOINS DE PERIMETRE
   · eprouves sur le code sain, puis casses par mutation
   · ils inspectent le vrai code, jamais un motif fragile

PASSE FINALE
   · ARBRE=$(git rev-parse HEAD)
   · le runner SEUL ; lire son propre code de sortie
   · exiger la LIGNE DE TOTAL

VERIFICATION QU'AUCUNE PUBLICATION CONCURRENTE N'EST ARRIVEE
   · git fetch --all
   · git rev-list --count HEAD..origin/master  ==  0
   · sinon : passe PERIMEE -> refusionner, renumeroter, relancer

PUSH
   · poser le numero de version MAINTENANT, pas avant
   · check_regles.py a 0 rouge
   · verifier le deploiement, pas seulement le push
```

---

## Ce qui est prêt tout de suite, et ce qui demande une décision

| | Sujet | État |
|---|---|---|
| ⭐ | les **4 vérifications de validité d'une passe** | **applicables immédiatement**, aucun outil à écrire |
| ⭐ | le **préfixe de session** sur les blocs de tests | **gratuit** — aucun outil ne les lit |
| ⭐ | le **numéro de version posé au push** | **gratuit** — les contrôles restent verts |
| ⭐ | les **4 + 1 exigences** d'un témoin de périmètre | **applicables immédiatement** |
| ⚖️ | les journaux **append-only + ajout en fin** | ⚠️ **décision** : ça coûte la lisibilité anti-chronologique |
| ⚖️ | l'**autorité de publication** | ⚠️ **décision** : c'est un panneau d'affichage, pas une serrure |
| ⛔ | les **10 minutes d'attente** de la passe | **chantier à part**, avec son propre avant/après. Non mesuré, donc non proposé |

*Proposition du 13/09/2026. Aucun fichier de production modifié, aucun outil modifié,
aucune règle appliquée — tout attend ta validation.*
