# 🖥️ À FAIRE SUR PC (backend Apps Script — clasp)

> **Pour Michel.** Ce fichier liste les modifs **backend** (`Code.js`) préparées côté web mais qui doivent être **déployées depuis ton PC** (via `clasp`, car ça demande le login Google impossible dans le cloud).
>
> À chaque fois que tu es sur ton PC pour une « session backend », ouvre ce fichier et fais les points cochables ci-dessous. Claude ajoutera ici tout nouveau point en attente.
>
> **Rappel de la séquence de déploiement backend** (voir CLAUDE.md) :
> ```
> NODE_TLS_REJECT_UNAUTHORIZED=0 npx clasp push --force
> NODE_TLS_REJECT_UNAUTHORIZED=0 npx clasp deploy -i AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA
> # puis vérifier : ?test=1 renvoie {"status":"online"}
> ```

---

> 💡 **Note Windows (cmd)** : la syntaxe `NODE_TLS_REJECT_UNAUTHORIZED=0 npx …` (une ligne) est du Mac/Linux. Sur **cmd Windows**, faire d'abord `set NODE_TLS_REJECT_UNAUTHORIZED=0` (ligne à part), puis la commande clasp. Pour récupérer juste le backend sans toucher aux fichiers locaux : `git checkout origin/master -- Code.js`.

## ⏳ En attente

> ⭐ **UNE SEULE TÂCHE ICI, ET C'EST VOULU.** Ce qui est **clos** descend dans « ✅ Fait »,
> même quand la décision est récente. *Un « ✅ CLOS » posé au milieu de « ⏳ En attente » se lit
> comme une deuxième tâche* — c'est la famille « premier match gagnant » de `BUGS.md`, et elle
> vient de me faire reproposer à Michel une figurine qu'il avait supprimée la veille (26/08).
> ⛔ **Rien n'est supprimé en descendant** : la raison et l'historique partent avec le bloc.

### 🔐 Régénérer la clé du plafond de dépense (`FT_COUNT_TOKEN`) — procédure

**À quoi ça sert** : sans cette clé, les appels à Milo sont **comptés mais jamais bloqués** — rien ne
protège d'une facture qui s'emballe. L'état est visible dans **Profil → Admin → Santé du système**,
ligne « 🛡️ Plafond de dépense ».

**⚠️ Pourquoi cette procédure existe** : depuis le 11/08/2026, le contrôle compare une **empreinte
SHA-256 figée dans `Code.js`**. Une empreinte **ne se remonte pas** : si la valeur posée chez
Cloudflare est perdue, elle n'existe plus nulle part et **aucune vérification n'est possible**. La
seule issue est d'en refaire une. (C'est arrivé : le 11/08 la serrure a été changée sans que la clé
soit transmise, et le plafond est resté désarmé deux jours sans que ça se voie.)

**Les 4 étapes** :
1. Générer une clé (≥ 12 caractères, **alphanumérique uniquement** — rien à échapper chez Cloudflare)
   et calculer son empreinte : `python3 -c "import hashlib;print(hashlib.sha256('LA_CLE'.encode()).hexdigest())"`
2. Remplacer `_HASH_COUNT` dans `Code.js` par l'empreinte — **jamais la clé en clair**, le dépôt est public
3. Pousser sur `master` : le backend se déploie tout seul (~1-2 min, workflow `deploy-appsscript.yml`)
4. Coller **la clé** dans Cloudflare → le Worker de Milo → variable **`FT_COUNT_TOKEN`**
   (⚠️ **rien à mettre dans Google** — c'était le but du changement du 11/08)

**Vérifier** : poser une question à Milo, puis rouvrir Profil → Admin → « Vérifier maintenant ».
La ligne doit passer au **vert : ARMÉ**. Si elle reste rouge alors que la clé vient d'être posée,
le problème n'est pas la valeur mais **le nom de la variable ou le Worker sur lequel elle est posée**.


_Dernier déploiement backend : **historique études corporelles** (`bodyStudies`), déployé **automatiquement via la CI GitHub** le 2026-07-11 (run #22, succès, `?test=1` OK)._

---

## ✅ Fait

### ✅ CLOS — « Squat Sumo » : l'exercice a été RETIRÉ (25/08/2026)

⛔ **Cette tâche n'a plus d'objet.** Elle demandait une figurine de squat sumo **à la barre**,
depuis le 13/08 — l'illustration d'alors montrait un **haltère** entre les jambes, c'est-à-dire
le geste du **Squat Gobelet** qui a déjà sa photo. On affichait donc la photo d'un autre
exercice.

**Ce qui s'est passé** : la figurine n'est jamais venue, et au bout de 12 jours Michel a tranché
— *« squat sumo on supprime, ça me soûle »*. L'exercice est **sorti du catalogue** en ft-v1001.

- Le fichier `exercises/squat-sumo-avec-haltere.webp` a été **supprimé** du dépôt **et du cache
  du service worker** : il y dormait depuis le 13/08 et était téléchargé par tout le monde pour
  rien. *(Récupérable dans l'historique git si un jour une variante haltère est créée.)*
- ⭐ **L'identifiant `squat-sumo` est GARDÉ** (`EX_IDS` + `RETIRES_VOLONTAIREMENT`) : les séances
  et records déjà faits gardent leur nom, leurs muscles et leurs calories. *On retire du CHOIX,
  jamais de la MÉMOIRE.*
- Les 2 équivalences d'import qui le visaient (`sumo squat`, `wide stance squat`) ont été
  retirées : aucune autre fiche ne décrit ce geste, donc un import « sumo squat » sera proposé
  comme exercice **nouveau** plutôt que rattaché de force au mauvais squat.

### 9 + 7. Boîte à idées cloud + persistance « niveau » — ✅ déployé @65 (2026-07-06)
Déployés ensemble depuis le PC de Michel (`clasp push` → « already up to date » puis `clasp deploy -i …` → **@65**). Désormais :
- **Boîte à idées** lisible côté backend → Claude peut lire `…/exec?action=getIdees&token=FT_IDEES_2026` et résumer les idées de Christophe (les photos restent sur l'email).
- **Niveau** (débutant/inter/confirmé) sauvegardé dans le cloud → survit à une réinstallation.

### 9. Boîte à idées → backend (ft-v273) — pour que Claude/Michel lisent les idées directement
**Code déjà écrit dans `Code.js`** (commité) :
- `doPost` : route `if (body.action === 'testerIdea') return handleTesterIdea_(body);` + fonction `handleTesterIdea_` (stocke les idées dans la Script Property `TESTER_IDEAS`, garde les 300 dernières).
- `doGet` : `?action=getIdees&token=FT_IDEES_2026` → renvoie toutes les idées en JSON.
- Le **frontend** (déjà en ligne, ft-v273) envoie chaque idée au backend en plus du mail (texte + nom + email + date + nb photos ; **pas les photos**, trop lourdes).

👉 **Déployer** : `clasp push --force` puis `clasp deploy -i …` (séquence en haut), vérifier `?test=1` → `online`.
- **Après déploiement** : dis à Claude « regarde les idées de Christophe » → il lira `…/exec?action=getIdees&token=FT_IDEES_2026` et te les résumera. (Les photos restent sur ton email.)
- **Avant déploiement** : les idées partent quand même par email (comme avant) ; l'envoi backend est juste ignoré sans erreur.

### 7. Persistance cloud « niveau » (ft-v240) — 1 ligne
Dans `Code.js`, fonction `handleSaveProfile_`, la ligne est **déjà écrite** (juste sous `discipline`) :
```js
if (body.level !== undefined) profile.level = _ps_(body.level, profile.level);
```
👉 Il reste juste à **déployer** : `clasp push --force` puis `clasp deploy -i …` (voir séquence en haut), vérifier `?test=1` → `{"status":"online"}`.
- **Sans ce déploiement** : le niveau (débutant/intermédiaire/confirmé) fonctionne quand même sur le téléphone (Coach adapté + auto-promotion), mais il ne serait **pas restauré** après une réinstallation. Avec le déploiement, il survit comme la discipline.

---

### 8. « Suivi photos » du Super Testeur (Christophe) — ✅ FAIT (frontend ft-v262 + backend déployé @63, 2026-07-06)
> ✅ **Déployé @63** : la clé `evolution` (comparaison d'évolution) est active. La section ci-dessous est conservée pour référence.

**Ce qui est déjà en ligne (frontend, ft-v262)** — Espace Testeur → « 📸 Mon suivi photos » (`openBodySeries`, setup.js) :
- Christophe prend des **séries de 4 photos** (face relâché/contracté, dos contracté, profil), **jusqu'à 4 séries/mois** (compteur `_bserCountThisMonth`, limite `_BSER_MONTHLY_LIMIT=4`).
- **Historique** des séries + bilan complet de chaque série (réutilise `handleBodyStudy_`).
- Photos stockées **en local** (`S.bodySeries`, `ft4_body_series`) — les 2 dernières gardent leurs photos pour la comparaison (pas de sync cloud, trop lourd).
- Le front envoie déjà, pour chaque nouvelle série, `deep:true` + (si série précédente) `compare:true` + `prevImages` + `prevDate` + `prevAnalysis`.

**⏳ CE QU'IL RESTE À DÉPLOYER (backend `Code.js` — code déjà écrit)** :
- `handleBodyStudy_` a été **enrichi** (déjà commité) : il lit `deep`/`compare`/`prevImages`/`prevDate`/`prevAnalysis`, ajoute les photos « avant » au prompt, demande une clé JSON `"evolution"` (comparaison d'évolution) et monte `max_tokens` à 3072.
- 👉 **Déployer** : `clasp push --force` puis `clasp deploy -i …` (séquence en haut), vérifier `?test=1` → `{"status":"online"}`.
- **Avant ce déploiement** : le suivi photos marche déjà (bilan complet par série), mais **sans la ligne « 📈 Évolution »** (l'ancien backend ignore les champs de comparaison). Après déploiement : la comparaison d'évolution s'affiche.

⚠️ **Honnêteté à garder en tête** :
- L'IA **analyse et décrit** l'évolution entre les séries — elle ne **fabrique pas** d'image « avec −5 kg ».
- Pour une **photo nue**, la **sécurité d'Anthropic peut refuser** l'analyse, quoi qu'on écrive dans le prompt. Photo en sous-vêtements/short = pas de souci.

---

## ✅ Fait

### 6. Persistance cloud « poids objectif » (ft-v229) — ✅ déployé @62 (2026-07-05)
`if (body.targetWeight !== undefined) profile.targetWeight = _pn_(...)` dans `handleSaveProfile_`. Déployé depuis le PC de Michel (clasp push + deploy -i → **@62**). Le poids objectif survit désormais à une réinstallation.

### 3 + 4 + 5. Étude du corps (@61) + photos exercices bibliothèque (@61) — ✅ déployé (2026-07-05)
- **Étude du corps** (ft-v224) : `handleBodyStudy_` (Claude **Sonnet**, bilan posture/insertions/équilibre/santé/exercices) + route `bodyStudy` + persistance `bodyStudy` dans `handleSaveProfile_`. Réalise le point 3 (« analyse morpho la totale »).
- **Photos exercices bibliothèque** (ft-v212) : `if (body.exPhotos !== undefined) profile.exPhotos = _po_(...)` — embarqué dans le même déploiement.
- Déployé depuis le PC de Michel (clasp push + deploy -i → **@61**), `?test=1` OK.

### 1 + 2. Persistance cloud « Discipline » (ft-v194) + compteur « imports journal » (ft-v168) — ✅ déployé @59 (2026-07-04)
Ajout dans `handleSaveProfile_` (Code.js) : `body.discipline` (`_ps_`) et `body.histImports` (`_pn_`). Déployé depuis le PC de Michel (clasp push + deploy -i → **@59**). Les deux champs sont désormais sauvegardés dans le cloud (survivent à une réinstallation).
