# 📄 MILO-PDF1 — une réponse de Milo coupée par la limite de longueur ne passe plus pour complète

> **Chantier du 25/09/2026**, branche `claude/project-status-a0qakd`, base `8c3d43e7`.
> **État : CORRIGÉ ET TESTÉ (déterministe + contrôle négatif) — PAS vérifié en réel.**
> Le Worker de production n'a pas été redéployé (publication interdite par le brief) : voir §8.

## 1. L'invariant

> **Force Tracker ne présente jamais comme « complète » une réponse que le modèle a signalée
> comme tronquée.**

Quatre états, distinguables à chaque étage :

| État | Signal réel | Ce qu'on voit |
|---|---|---|
| complète | `stop_reason` = `end_turn` / `stop_sequence` | rien de plus (une réponse courte volontaire est ici) |
| **coupée** | `stop_reason` = `max_tokens` | bandeau « ✂️ … incomplète — génération interrompue » |
| interrompue (technique) | pas de texte (`_diag` ≠ `ok`) | « Désolé, réessaie. » (inchangé) |
| inconnu | serveur qui ne transmet pas le signal / raison inconnue (`refusal`…) | rien : on ne prétend ni « complète » ni « coupée » |

⛔ **On lit le signal du modèle, jamais la ponctuation ni la longueur** : un texte sans point
final peut être fini (PDF-08), un texte bien ponctué peut être coupé.

## 2. La cause, mesurée (et une prémisse corrigée)

- La conversation appelle `claude-sonnet-4-6` avec **`max_tokens: 1024`** (`worker.js`, `coach()`).
- `callClaudeDiag` ne gardait que `content[0].text` : **`stop_reason` apparaissait 0 fois** dans
  `worker.js`. Une réponse coupée ressortait exactement comme une réponse finie.
- Le texte était donc **déjà tronqué avant le PDF** ; `exportCoachPdf` le recopiait en entier.
- ⚠️ **Prémisse corrigée** : le titre « Analyse complète » **n'est écrit nulle part dans le code**
  (0 occurrence). L'en-tête PDF de l'app dit « Coach Milo » : « Analyse complète » est un titre que
  **Milo a écrit dans son propre texte**. On ne réécrit pas son texte ; on pose l'état réel AVANT lui.

## 3. La carte du chemin (avant → après)

`analyzeProgIa` (log.js) ou `sendToCoach` (coach.js) → Worker `coach()` → `callClaudeDiag` →
API Anthropic → **`stopReason` transporté** → JSON `{reply, …, stopReason, truncated, complete,
continued}` → `_miloEtatReponse` (propriétaire unique, coach.js) → bulle (`renderCoachMsg`,
`dataset.coupee`) → fil (`coachHistory`, `_lightMsg` → `ft4_coach_hist` / « Mes discussions ») →
PDF (`exportCoachPdf`) et partage (`shareCoachReply`).

Le chemin d'Apps Script (`Code.js`) n'est **pas** emprunté par la conversation (`coach` ∈
`AI_PROXY_ACTIONS`) : il n'est pas touché.

## 4. Ce qui a changé

**Worker (`worker.js`)**
- `callClaudeDiag` rend `stopReason` (valeur réelle, `null` si absente) sur ses deux sorties.
- `coach()` rend, en plus de `reply` (ancien contrat intact) : `stopReason`, `truncated`
  (`max_tokens`), `complete` (`end_turn`/`stop_sequence` ET un texte), `continued`, et
  `_diagSuite` quand une suite a été tentée.
- **Suite bornée** : si `body.suite === true` **et** `stop_reason === 'max_tokens'`, UN second appel,
  même modèle, même `system`, même budget : le texte déjà écrit est renvoyé comme réponse de
  l'assistant, suivi d'une consigne de reprise qui cite sa fin (« écris UNIQUEMENT la suite, ne répète
  rien »). ⛔ **Au plus une**, aucune boucle. Suite coupée à son tour → `truncated: true`. Suite en
  échec (réseau, 529) → la 1ʳᵉ partie est **gardée** et reste `truncated: true`, jamais `complete`.
- **Couture déterministe** (`_recollerSuite`) : retire une répétition de la fin (≥ 12 caractères),
  recolle un mot coupé (« Épau » + « les » / « Épaules »), ne mange jamais un mot nouveau
  (« et le » + « lendemain »). Rien d'autre n'est réécrit.
- ⚠️ La suite n'utilise **pas** le « préremplissage » de l'assistant : ce mode n'a pas pu être
  vérifié sur ce modèle, et un appel qui échouerait à chaque fois laisserait toutes les analyses
  incomplètes.

**Client**
- `_miloEtatReponse(d)` (coach.js) : `coupee` · `complete` · `interrompue` · `inconnu` — **un seul
  propriétaire** (R2), lu par le chat et par l'analyse.
- **Analyse de programme** : envoie `suite:true` ; si elle reste coupée, bandeau **en tête** de la
  fenêtre ; « Continuer dans le Coach » garde le marqueur (`coupee:'analyse'`).
- **Chat** : ⛔ **n'envoie pas `suite`** (1 seul appel au quotidien). Une réponse coupée est
  **signalée** sous la bulle (« Écris « continue » pour qu'il la termine » — vérifié : ce message part
  bien à Milo, avec sa réponse coupée dans l'historique).
- **Fil** : le marqueur passe par `_lightMsg` (sinon il mourrait au premier enregistrement, même piège
  que `ts` en ft-v1010) et revient au rechargement (`_renderCoachThread`). Liste blanche
  (`analyse`/`reponse`) : une valeur abîmée n'affiche rien. ⛔ Il ne part **jamais** à l'API
  (`_coachHistPayload` : `role`/`content` seulement — un champ inconnu = 400).
- **PDF** : titre à droite « ANALYSE/RÉPONSE INCOMPLÈTE », bandeau **avant** le texte de Milo, repère
  « [... la réponse s'arrête ici — génération interrompue] » à la fin, fichier `…-incomplet.pdf`.
- **Partage texte** : même avertissement en tête et à la fin.

## 5. Budget (`max_tokens`) — §25

**Aucun changement.** Conversation : 1024 avant, 1024 après, sur les deux appels (1ʳᵉ partie et
suite). Un témoin l'épingle (B-CCCLXXVIII ③). Monter à 4096 « partout » aurait déplacé la coupure
sans la rendre visible. L'analyse dispose au plus de 2 × 1024 jetons.

## 6. Coût, appels, latence — §10

| Cas | Appels modèle | Quota compté |
|---|---|---|
| Chat (fini ou coupé) | **1** | 1 |
| Analyse non coupée | **1** | 1 |
| Analyse coupée → suite | **2** | 1 (compté par requête, en amont) |

Le coût réel des deux appels est rapporté (`_envoyerUsage`, une fois par appel). La suite relit le
même `system` : le bloc commun est lu en cache. Latence : un second appel Sonnet seulement quand
l'analyse a été coupée (écran « Analyse en cours… » déjà présent). ⚠️ Un client modifié pourrait
poser `suite:true` sur le chat : effet borné à ×2 sur le coût de SES réponses coupées, quota inchangé.

## 7. Sorties machine (JSON) — §19-20

La suite **n'est pas** généralisée aux actions JSON. **Les gardes existantes suffisent** : un JSON
coupé est déséquilibré, donc `JSON.parse` échoue — `firstJson` rend `null` (séance du cervelet,
estimations…), `importDoc` rend `JSON invalide`. Rien n'est « réparé ». Prouvé sur le vrai
`worker.js` (PDF-07) avec un **témoin de sensibilité** : le même JSON, complet, est accepté.

## 8. Vérification réelle — non faite, et pourquoi (règle d'or #16)

**0 appel facturé.** Le Worker de production a été déployé pour la dernière fois le **20/09 à 14:05
UTC** (run 35515417231, `deploy-worker.yml`, depuis `master` @ `e77060c3`) ; ce `worker.js` contient
**0 occurrence** de `stop_reason`. Tout appel réel passerait donc par l'ancien Worker : il ne rendrait
ni `stopReason` ni suite, et ne pourrait rien dire du correctif. Déployer la branche
(`workflow_dispatch`) serait une **publication**, interdite par le brief. La vérification réelle
viendra **après** publication : lancer une analyse de programme longue et lire `stopReason`,
`continued`, `complete` dans la réponse.

## 9. Ce qui n'est PAS couvert (dit plutôt que masqué)

- **Débrief de séance** : le Worker transporte le signal, mais le débrief ne le lit pas (consigne
  « 4-6 phrases », coupure improbable). Une coupure y resterait non marquée dans le fil.
- **`summarizeCoach`** (250 jetons) et les autres actions texte (`callClaude`) ne transportent pas
  le signal : non traité (hors périmètre).
- **Bouton « Commencer cette séance » sous une réponse coupée** : inchangé. Si la coupure tombe au
  milieu de la séance, la séance lue peut être incomplète ; le marqueur « Réponse incomplète » est
  affiché juste au-dessus. ❓ **Décision possible de Michel** : retirer le bouton dans ce cas.
- **Chat** : pas de suite automatique (choix du brief, §10) ; la personne peut écrire « continue ».
- Vu en passant, non corrigé : la fenêtre d'analyse formate le texte avec `_coachFmtHtml` **sans
  échapper le HTML** (le chat, lui, échappe). Défaut préexistant, hors périmètre.

## 10. Tests

- `tests/parcours/milo_pdf1.js` : **B-CCCLXXVIII** (10 témoins de source), **B-CCCLXXIX** (15, le
  vrai `worker.js` conduit avec une API Anthropic simulée : PDF-01 → PDF-08 + raison absente,
  `refusal`, panne du 1ᵉʳ appel, modèle), **B-CCCLXXX** (12, conduits dans le navigateur).
- Banc ciblé `tools/banc_milo_pdf1.js` : **37 OK / 0 rouge** ; **rouge sur l'ancien code** (`8c3d43e7`)
  sauf les deux gardes JSON, qui existaient déjà.
- Contrôle négatif `tools/mut_milo_pdf1.py` : **26/26 conformes** — 23 mutations mordent (chacune
  sur au moins un témoin de **comportement**), 3 mutations de commentaire restent vertes.
- **Passe complète** sur l'arbre `d83b0270` : **5083 ✅ / 0 ❌**, valide aux **4 conditions**
  (`tools/passe_valide.sh` : ligne de total · runner code 0 · arbre inchangé · aucune publication
  concurrente sur `origin/master`).
