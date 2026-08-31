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

### 💾 RELANCER L'INSTALLATEUR DE SAUVEGARDE — **1 clic dans l'IDE Apps Script** *(31/08/2026)*

> Michel, après le bug du sélecteur qui a abîmé une séance : *« on verra si on peut pas faire
> 2 sauvegardes par jour »*. **C'est fait dans le code (ft-v1074) — il reste à l'activer.**

**⛔⛔ POURQUOI CE N'EST PAS AUTOMATIQUE.** `Code.js` part tout seul en prod à chaque push
(workflow `deploy-appsscript.yml`), **mais un déploiement ne recrée PAS les déclencheurs** : ils
vivent dans le projet Apps Script, pas dans le code. *Tant que l'installateur n'est pas relancé,
la sauvegarde reste à 1 par jour.*

**👉 LA MANIP, une fois :**
1. [script.google.com](https://script.google.com) → projet **Force Tracker**
2. dans la liste des fonctions, choisir **`installDailyBackupTrigger_`**
3. **Exécuter**
4. vérifier dans **Journaux** : `2 triggers installés — backupAllUserData_ à 2h ET 14h UTC`

⛔ L'installateur **supprime d'abord les anciens** déclencheurs de sauvegarde : le relancer deux
fois ne crée pas de doublons.

**⭐ POURQUOI 2h ET 14h** (et pas 2h et 3h) : ce qu'on réduit, c'est la **fenêtre de perte**. Avec
une seule sauvegarde nocturne, une séance faite à 13h et abîmée à 14h n'a **jamais** été
sauvegardée. Les deux passages encadrent la journée d'entraînement.

**⚠️ LE COÛT, ÉCRIT PLUTÔT QUE DÉCOUVERT** : le dossier Drive est en **append-only** (rien n'est
purgé). On passe de ~365 à **~730 fichiers par an**, pour un avertissement de quota posé à
**1000** (@54). *L'alerte tombera donc dans ~16 mois* — la purge devra être une décision, pas une
surprise.

---

### ⌚ AJOUTER LE SOMMEIL ET LES PAS AU RACCOURCI iOS *(30/08/2026)* — **sur le TÉLÉPHONE, pas le PC**

> Michel : *« on devait le faire mais on n'a pas rajouté les pas et le sommeil »*.

**⛔⛔ POURQUOI C'EST LA SEULE CHOSE QUI MANQUE.** Trois versions ont été livrées et testées —
**ft-v1069** (le sommeil mesuré remplace la saisie), **ft-v1070** (les pas comptent dans le TDEE),
**ft-v1071** (la courbe des pas dans Progrès). Elles sont **correctes et vertes**, mais elles sont
**DORMANTES** : le raccourci n'envoie que la **FC au repos**, donc `sleep` et `steps` n'arrivent
jamais. *Rien ne s'affichera tant que ces deux champs ne partent pas.*

**⚠️ ET C'EST UNE ERREUR QUE J'AI ÉCRITE TROIS FOIS** : j'ai affirmé dans les journaux que « la
donnée arrivait depuis ft-v916 ». Le **serveur l'accepte** depuis ft-v916 — mais **personne ne
l'envoie**. *J'ai pris une capacité pour un fait* (**R28** à l'envers). Corrigé dans `CLAUDE.md`,
`docs/CONTEXTE-ACTUEL.md` et le journal de partage.

**👉 CE QU'IL FAUT AJOUTER** — le raccourci envoie déjà `action`, `email`, `authCode`, `date` et
`rhr` (sinon la FC au repos ne marcherait pas). Il ne manque que **deux champs** dans le même
dictionnaire JSON :

| champ | valeur | unité / format |
|---|---|---|
| `sleep` | Santé → **Analyse du sommeil**, durée de la nuit | **en HEURES décimales** (ex. `6.5`, pas `6h30`) |
| `steps` | Santé → **Pas**, total du jour | **entier** (ex. `9430`) |

**⛔ LES BORNES DU SERVEUR** (au-delà, la valeur est **ignorée en silence**) : `sleep` doit être
**> 0 et < 16** — *si tu envoies des minutes (390) au lieu d'heures (6.5), rien ne passe et rien
ne le dit* ; `steps` doit être **≥ 0 et < 100 000**.

**⭐ COMMENT VÉRIFIER EN 10 SECONDES** : la réponse du serveur renvoie ce qu'il a accepté —
`{"status":"ok","rhr":…,"sleep":…,"steps":…}`. Un `null` sur `sleep` ou `steps` = la valeur a été
refusée (mauvaise unité, ou champ absent). Sinon, côté app : **Progrès → Poids** — si la carte
« Tes pas » apparaît, ça marche.

**⏳ ET IL FAUDRA 7 JOURS** avant que le surplus de pas se calcule et que tes calories bougent :
sans base connue, l'app ne sait pas ce qu'est « en plus » chez toi, et elle préfère se taire que
d'inventer. Le **sommeil**, lui, agit **dès la première nuit reçue**.

## ✅ Fait

### ✅ CLOS — le plafond de dépense est **ARMÉ** (30/08/2026)
Michel était devant son PC, on a refait la paire clé/empreinte de bout en bout. Vérifié dans
l'app, Profil → Admin → Santé du système : **🛡️ Plafond de dépense — ARMÉ**, constaté le
30/08 à 12:54. *Au-delà du plafond, les appels à Milo sont désormais refusés ; avant, ils
étaient comptés et rien ne les arrêtait.*

**⛔ POURQUOI ÇA A TRAÎNÉ SI LONGTEMPS, ET C'EST LA LEÇON À GARDER.** L'empreinte du 25/08 était
bien en place — mais **la clé chez Cloudflare était l'ANCIENNE**, et personne ne pouvait le
voir : Cloudflare **chiffre** ses variables, donc la valeur posée est illisible pour tout le
monde, **y compris son propriétaire**. Michel l'a dit en une phrase en ouvrant l'écran — *« j'ai
déjà un count token chiffré, je comprends pas »*. 👉 ***Deux secrets qu'on ne peut ni l'un ni
l'autre relire ne se comparent jamais : ils se REFONT ensemble, des deux côtés, ou pas du tout.***

**⚠️ Et un défaut de MA part au passage, qui a failli coûter un faux diagnostic.** J'ai annoncé
« poussé, le backend se déploie » alors que mon `git push origin master` était lancé **depuis une
autre branche** : il a poussé la branche locale `master`, pas mon travail — en répondant un
message de **succès**. Si Michel avait collé la clé à ce moment-là, il aurait lu **DÉSARMÉ** et
conclu que sa clé était mauvaise. *Une commande qui réussit ne fait pas forcément ce qu'on croit*
(journal de partage) — et **R18** : on vérifie le **déploiement** (run #96 vert), pas le push.

<details><summary>📋 La procédure complète, gardée pour la prochaine fois</summary>

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
2. Remplacer **`_COUNT_TOKEN_HASH_`** dans `Code.js` par l'empreinte — **jamais la clé en clair**,
   le dépôt est public. ⚠️ *Cette étape disait `_HASH_COUNT` jusqu'au 30/08/2026 : ce nom n'existe
   plus depuis le 24/08, où le jeton a été factorisé pour servir aussi à `aiUsageLog`. Une
   procédure qui nomme une constante disparue envoie son lecteur chercher au mauvais endroit* (R23).
3. Pousser sur `master` : le backend se déploie tout seul (~1-2 min, workflow `deploy-appsscript.yml`)
4. Coller **la clé** dans Cloudflare → le Worker de Milo → variable **`FT_COUNT_TOKEN`**
   (⚠️ **rien à mettre dans Google** — c'était le but du changement du 11/08)

**Vérifier** : poser une question à Milo, puis rouvrir Profil → Admin → « Vérifier maintenant ».
La ligne doit passer au **vert : ARMÉ**. Si elle reste rouge alors que la clé vient d'être posée,
le problème n'est pas la valeur mais **le nom de la variable ou le Worker sur lequel elle est posée**.


_Dernier déploiement backend : **historique études corporelles** (`bodyStudies`), déployé **automatiquement via la CI GitHub** le 2026-07-11 (run #22, succès, `?test=1` OK)._

---

</details>

---

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
