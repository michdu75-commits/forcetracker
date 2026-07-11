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

_Rien en attente. 🎉_

_Dernier déploiement backend : **historique études corporelles** (`bodyStudies`), déployé **automatiquement via la CI GitHub** le 2026-07-11 (run #22, succès, `?test=1` OK)._

---

## ✅ Fait

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
