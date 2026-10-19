# D-031-SÉCURITÉ-01 — des tests sûrs par construction (19/10/2026)

> **Pour qui** : toute session qui lance la passe D-031, un banc ou un outil de mutation.
> **En une phrase** : la passe ne peut plus rien envoyer sur le réseau, n'emploie plus d'identité réelle, et trois
> formes de faux vert déjà payées sont refusées à l'écriture.
> **État** : branche `claude/d031-securite-01`, **non fusionnée, non poussée** — en attente du feu vert de Michel.

## 1. Pourquoi

La contre-expertise du 19/10 (C1, M4) a recompté, dans une passe complète, **1 356 requêtes externes** qu'aucun test
n'arrêtait : 502 vers la production (Apps Script, Worker), dont des **écritures sans jeton** (`saveProfile`,
`logCustomExercise`, `logSearchMiss`, `sendConfirmCode`), une sous l'adresse **réelle** d'un testeur. Elles n'ont été
arrêtées que par un garde **extérieur** à la passe. 👉 *L'innocuité de la passe dépendait du réseau de la machine.*

## 2. Ce qui protège, couche par couche

| Couche | Où | Ce qu'elle fait | Signature quand elle mord |
|---|---|---|---|
| ① Refus par défaut (navigateur) | `tests/_garde_reseau.js`, posé sur **chaque** contexte à sa création | toute adresse non locale est abandonnée, sauf si un test la **simule** (`route.fulfill`) | `net::ERR_BLOCKED_BY_CLIENT` |
| ② Proxy mort + résolution coupée (processus) | arguments de lancement de Chromium, imposés | une requête qu'un test laisse **partir** (`route.continue`) n'aboutit pas ; les options de contournement sont retirées | `net::ERR_PROXY_CONNECTION_FAILED` |
| ③ Node sans réseau externe | `net`, `dns`, `dgram`, `fetch` patchés | TCP/DNS/UDP non locaux refusés ; enfants gardés (`NODE_OPTIONS`) ; navigateur lancé hors Playwright sans proxy mort refusé ; secrets retirés de l'environnement | erreur marquée `gardeReseau` |
| ④ Isolement système (preuves, qualification) | `tools/isoler_reseau.py [--en-ligne]` | espace réseau où seule `lo` existe (+ `ftnet0` sans route : Chromium se croit en ligne) ; **refuse** de lancer si l'isolement n'est pas mesuré | `ENETUNREACH` |

⛔ **Fermé par défaut** : une copie de Playwright de forme inconnue fait échouer le chargement ; un navigateur d'une
copie non patchée est refusé ; contexte persistant, `connect`, CDP et `launchServer` sont refusés. **Si le garde
n'est pas prouvé au début de la passe (D031S-I), la passe s'arrête avant le premier test, sans total.**

## 3. Les témoins ajoutés à la passe

| Bloc | Prouve |
|---|---|
| **D031S-I** (15) | le garde est chargé avant Playwright et **mord**, sur des destinations **fictives** (RFC 2606 / 6761 / 5737) : refus par défaut, simulation intacte, `continue()` arrêté par le proxy mort, `fallback()`, sous-ressources, navigation, WebSocket, `unrouteAll()`, contexte implicite, chemins de lancement, options de contournement, enfants Node et non-Node, navigateur nu, aucun contournement **écrit** dans les fichiers de la passe |
| **D031S-II** (2, à la fin) | le garde est toujours en place ; **aucune requête n'a reçu de réponse du vrai réseau (SORTIE = 0)** ; résumé ℹ️ des requêtes non simulées, par destination et action |
| **D031S-III** (4) | identités lues dans le code (aucune recopiée) ; l'app servie n'en porte aucune réelle ; elle reconnaît les fictives comme les vraies ; aucune identité réelle **écrite** dans les fichiers de test de la passe |
| **D031S-IV** (1) | aucune des trois formes de faux vert déjà payées : condition `true` en dur · `.match(/…/g\|\|[])` · `corps…(…)\|\|'x'` |
| **D031S-V** (2) | oracles **indépendants** : 1RM (Brzycki) et macros D-035, valeurs calculées à la main |
| **D031S-VI** (6) | le RIR en superset, conduit par de **vrais appuis** : pas de question sur l'échauffement ni au milieu du tour, une question par série de travail avec le nom de l'exercice, boutons visibles et libres, chaque réponse sur SA série |

## 4. Identités de test

`tests/identites_fictives.js` lit les identités dans le code servi (`ADMIN_EMAILS`, `TESTER_EMAILS`,
`SUPER_TESTER_EMAILS`, `PREMIUM_CLIENT_EMAILS`, `TESTER_FEEDBACK_EMAIL`, `_isChristophe`, `_isEline`, `_isEmma`) et
les associe à `fondateur@`, `christophe@`, `eline@`, `emma@`, `boite-idees@`, `testeur-1@example.test`. Le serveur de la
passe **sert** l'app avec ces valeurs (un fichier sans identité est servi exactement comme avant). ⛔ **Un test écrit
`IDF.ID.christophe` ou `'christophe@example.test'`, jamais une adresse réelle** — D031S-III ④ le refuse.

## 5. Lancer un banc, une mutation, l'annexe — gardés

La passe se garde seule. **Un banc lancé seul, non** (109 points d'entrée, compte ℹ️ affiché par D031S-I) :

```
tools/sous_garde.sh node tools/banc_x.js
tools/sous_garde.sh python3 tools/mut_x.py
python3 tools/isoler_reseau.py --en-ligne -- tools/sous_garde.sh python3 tools/recette_annexe.py   # + isolement système
```

## 6. Ce qui n'est PAS fait, et attend une décision de Michel

- ~~SEC-04~~ → **APPLIQUÉ le 19/10/2026 (décision de Michel : « OUI »)** — voir § 7.
- **Témoins D-091 (volume total, échauffements compris)** : préparés dans `tests/parcours/d091_volume_prepare.js`,
  **non branchés** — à brancher avec Principal quand D-091 est livré. Ils lisent le panneau « Ta séance jusqu'ici »
  (`#log-finish`) tel que D-092 l'affiche, et la séance enregistrée. Mesuré sur le code de D-091 (`clone/` de
  `origin/master` `ed05faa1`) : 8/8 verts ; sur le code d'avant : 3/8 (les totaux rougissent, attendu). Contrôle
  négatif : `python3 tools/mut_d091_volume_prepare.py <arbre-qui-porte-D-091>` — 7/7 conformes.
- **Bancs et outils lancés seuls** : non modifiés (115 fichiers) — `tools/sous_garde.sh` les garde ; rendre le garde
  obligatoire pour les **nouveaux** bancs est une proposition.
- **`tests/milo/eval.js`, `eval-scenarios.js`** : portent encore une identité réelle — c'est le banc d'essai **réel**
  de Milo, qui choisit son modèle par l'adresse (`worker.js`) ; hors de ce chantier, non modifié.

## 7. SEC-04 — un module qui plante devient un KO identifié (décision de Michel du 19/10/2026)

- **Où** : `tests/_plantages.js`, installé par UNE ligne du runner, juste après la définition de `t` (avant le premier
  module). La passe reçoit une VUE (Proxy) des exports de chaque `require('./x.js')` : toute fonction exportée est appelée
  dans une enveloppe. Le module lui-même n'est jamais modifié ; les autres modules voient l'original.
- **Ce qui devient un KO nommé (la passe continue, total rouge, code 1)** : une exception synchrone · une promesse
  rejetée (fonction `async` ou fonction qui rend une promesse) · un `throw` qui n'est pas une `Error` · un module qui ne
  se CHARGE pas (ses appels sont alors nommés « non joué ») · un `module.exports = function` qui plante · une promesse
  rejetée que personne n'attend (« ⛔ PROMESSE REJETÉE SANS ÊTRE ATTENDUE (fichier:ligne) »).
- **Ce qui reste une passe INVALIDE (aucun total, code ≠ 0)** : un plantage du CORPS de la passe (hors module) · une
  exception non rattrapée (reprendre après n'est pas sûr) · un `process.exit(0)` ou une fin avant la ligne de total
  (code forcé à 3, message « PASSE INTERROMPUE AVANT LA LIGNE DE TOTAL ») · la preuve du garde qui plante (KO, puis
  arrêt fermé, code 97).
- ⛔ **Jamais réussie après un plantage** : `tools/passe_valide.sh` refuse (condition ② ou ①, et rouges réels).
- **Preuves** : `python3 tools/mut_plantages.py` (11 plantages volontaires, chacun doit être conforme) et
  `python3 tools/mut_plantages.py --contre-epreuve` (SEC-04 retiré de la copie : les 10 plantages doivent alors ÉCHOUER au
  contrôle, le témoin de contrôle rester vert). Dans la passe, `D031S-IV ②` rougit si SEC-04 n'est plus installé avant
  le premier module (mutation H2 de `tools/mut_garde_reseau.py`).
