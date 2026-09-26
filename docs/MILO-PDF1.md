# 📄 MILO-PDF1 — une réponse de Milo coupée par la limite de longueur ne passe plus pour complète

> **Chantier du 25/09/2026**, branche `claude/project-status-a0qakd`, base `8c3d43e7`.
> **État : CORRIGÉ ET TESTÉ (déterministe + contrôle négatif) — PAS vérifié en réel.**
> Le Worker de production n'a pas été redéployé (publication interdite par le brief) : voir §8.
>
> ↪️ **ÉTAT ACTUEL (26/09/2026) — les deux lignes ci-dessus sont l'état du 25/09, conservé tel quel.**
> **Publié en `ft-v1235`** · **Worker redéployé** (avant l'app) · **vérification réelle faite** :
> V1 (réponse normale `complete: true`, `end_turn`, aucun marqueur), V2 (un seul envoi à Milo) et
> V4 (séance chargée) **vérifiés** ; **V3** (suite réelle d'une analyse coupée) **non observée, à surveiller**.
> Les §1 → §9 décrivent MILO-PDF1 **avant** sa correction MILO-PDF1B (section suivante) ; la publication est en §C.
> ⚠️ **Défaut ACTIF connu — réouverture ÉTROITE de D-025, pas de tout MILO-PDF1** : « Mes discussions » peut perdre
> le marqueur « coupée » et permettre à une réponse incomplète de redevenir candidate à une séance. Démontré par
> MILO-SEANCE-01, **non corrigé**.
> ↪️ **Rectification du §C5** : la vérification n'établit **pas** deux échecs de traduction de séance. Essai 1 : une
> traduction lancée au tap, lue 2,5 s plus tard ; essai 2 : **un** échec établi, délai ou réseau non distingué.

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

---

# 📄 MILO-PDF1B — correction après contre-vérification (25/09/2026, soir)

> Ce qui précède est le constat **d'origine** de MILO-PDF1 et reste tel quel (historique
> append-only). Trois de ses affirmations sont **remplacées** ci-dessous : la couture (§4),
> « une raison inconnue n'est ni coupée ni complète » (§1, §4) et le bouton séance (§9).

## B1. Ce que la contre-vérification a démontré

- **La couture heuristique abîmait le texte**, puis marquait le résultat complet :
  « Les épaules » + « sont » → `épaulessont` · « et le » + « lendemain » → `et lendemain`
  (un **mot perdu**) · « de » + « de 10 reps » → `dede 10 reps` · Markdown `- **Épau **Épaules**`
  · une réponse longue redémarrée depuis le début → **dupliquée**, marquée complète.
  Mes témoins ne couvraient que les cas où la suite commençait par une espace.
- **Une raison d'arrêt inconnue ou absente** (`refusal`, `null`…) rendait `complete: false`,
  mais l'app l'affichait **exactement comme une réponse finie** (état « inconnu », sans marqueur).
- **Le bouton séance restait actif sous une réponse coupée** : « Leg curl 3×12 » coupé en
  « 3×1 » entrait dans la séance du jour.

## B2. Le raccord à ancre (remplace la couture heuristique)

- L'**ancre** = les 60 derniers points de code réellement écrits (sans blanc de fin, jamais un
  blanc ni un caractère de liaison en tête, emoji jamais coupé).
- La 2ᵉ requête reçoit le même contexte FT, le message d'origine, la 1ʳᵉ partie, et la consigne :
  répondre **exactement** `<FT_SUITE>` + l'ancre recopiée + la suite + `</FT_SUITE>`, rien avant,
  rien après. Format machine simple, pas du JSON.
- **Validation, sans aucune approximation** (`_raccorderSuite`, worker.js) :
  enveloppe présente, rien avant ni après · fermeture exigée sauf si la suite est elle-même
  coupée (`max_tokens`, une fermeture tronquée `</FT_SU` est alors retirée) · l'ancre doit être
  **au début, à l'identique** · la 1ʳᵉ ligne de la réponse (≥ 12 caractères) ne doit pas
  réapparaître (**redémarrage**).
- **Échec → la 1ʳᵉ partie est gardée, intacte, et reste INCOMPLÈTE** (`truncated: true`,
  `complete: false`), avec la raison dans `_raccord` (`echec` · `structure` · `ancre_absente` ·
  `ancre_fausse` · `redemarrage`).
- **Succès → texte = 1ʳᵉ partie + ce que Milo a écrit APRÈS l'ancre.** Aucun caractère de la
  1ʳᵉ partie n'est jamais retiré (sauf ses blancs de fin, remplacés par ceux que Milo écrit
  après l'ancre — c'est lui qui décide de l'espace entre « épaules » et « sont »).
- ⚠️ **Limite dite** : ce que Milo écrit après une ancre correctement recopiée est pris tel
  quel. S'il écrit lui-même « lendemain » au lieu de « le lendemain », c'est son texte, pas une
  couture — aucune règle déterministe ne peut le distinguer d'un mot coupé (« épa » + « ules »).
- Toujours **au plus 2 appels**, jamais de boucle ; le chat n'envoie jamais `suite`.
- Le préremplissage n'est pas utilisé : il est **refusé (400)** sur la famille Sonnet 4.6
  (documentation Anthropic) — la phrase « pas pu être vérifié » du §4 est remplacée par ce fait.

## B3. Fail-closed sur la raison d'arrêt

| Raison rendue par le modèle | complete | truncated | ce que l'app affiche |
|---|---|---|---|
| `end_turn` | **oui** | non | rien (réponse normale) |
| `max_tokens` | non | **oui** | « Réponse / Analyse incomplète — génération interrompue » |
| `stop_sequence` (l'app n'en envoie aucune), `refusal`, `pause_turn`, `tool_use`, `null`, valeur future | non | non | « Réponse non confirmée — fin non confirmée » |
| serveur qui ne transmet pas le signal (ancien Worker) | — | — | « Réponse non confirmée » |

⚠️ **Conséquence de publication** : ce client **exige** le Worker corrigé. Publié sans lui,
chaque réponse serait marquée « non confirmée » et aucune séance ne se lancerait depuis le chat —
bruyant, jamais faux. Le Worker et l'app se publient ensemble depuis `master`, mais un
déploiement Worker peut échouer en silence (R18) : **le vérifier au moment de publier**.

## B4. Décisions de Michel appliquées

- **« Une réponse incomplète ne peut pas être transformée en séance. »** Toute réponse non
  confirmée complète ne passe par AUCUNE voie de séance : ni bloc caché, ni cervelet, ni filet,
  ni question « on démarre ? » — ni à l'arrivée, ni au rechargement du fil. Le texte reste lisible.
  ⚠️ Les messages **anciens** du fil (d'avant ce correctif) ne portent aucun marqueur : on ne
  réécrit pas l'histoire, ils se comportent comme avant.
- **Le statut se lit AVANT le texte de Milo** : le marqueur est le premier élément de la bulle.
  Le texte de Milo reste intact ; le PDF gardait déjà le bandeau en tête.

## B5. Non modifié

Chat à 1 appel · JSON coupé toujours refusé, sans réparation · budget 1024 · modèle
`claude-sonnet-4-6` · garde AUTH1 · Nutrition, contrat FT→Milo, D-024, programme, dashboard,
cloudSave : 0 ligne. Aucune publication, aucun bump, aucun déploiement Worker, 0 appel réel.

## B6. Tests MILO-PDF1B

- `tests/parcours/milo_pdf1b.js` : **B-CCCLXXXI** (10 témoins de source), **B-CCCLXXXII** (vrai
  `worker.js`, API simulée : C1 → C12, enveloppe, ancre exacte, casse, emoji, invariant « la 1ʳᵉ
  partie n'est jamais amputée », fail-closed sur 7 raisons d'arrêt), **B-CCCLXXXIII** (navigateur :
  séance refusée à l'arrivée ET au rechargement — y compris avec un bloc caché lisible —, marqueur
  premier élément de la bulle, 1 appel par message).
- Témoins de MILO-PDF1 **retournés** (annotés « ↩️ MILO-PDF1B » dans le fichier), jamais effacés en
  silence : ②④⑤⑦⑨, PDF-03/04 (suite au format ancre), E7 (serveur sans signal → marqué). Les deux
  témoins de la couture heuristique sont **retirés** avec leur raison écrite sur place.
- Banc `tools/banc_milo_pdf1.js` (PDF1 + PDF1B) : **79 OK / 0 rouge** ; sur l'arbre d'avant
  (`c26aa0c6`) les mêmes témoins rendent **38 rouges** — les défauts sont reproduits.
- Contrôle négatif `tools/mut_milo_pdf1.py` : **47 mutations, 47 conformes, 0 ancre morte** (44
  mordent — raccord, fail-closed, séance, marqueur — et 3 mutations de commentaire restent vertes).
  R03 (casse ignorée) et R13 (ancre en unités UTF-16) n'étaient mordues que par la source : deux
  témoins conduits ont été ajoutés, et elles mordent maintenant par le comportement.
- Non-régression : AUTH1 25/0 · contrat FT→Milo 23/0 · D-021/D-022/D-024 42/0 · débrief 24/0 ·
  Worker S2-B 49/0.

---

# 🚀 PUBLICATION MILO-PDF1 — Worker d'abord, app ensuite (26/09/2026)

> Ce qui précède (MILO-PDF1 puis MILO-PDF1B) reste tel quel. Cette section ajoute ce qui a été
> mesuré et décidé **au moment de publier**.

## C1. Le Worker d'abord, vérifié avant toute intégration

- Déployé **depuis la branche** par `workflow_dispatch` (`deploy-worker.yml`, run 36228928712, vert),
  `worker.js` **identique** à `11cabbc8`. Wrangler : 60,43 KiB (l'ancien : 56,28 KiB), nouvelle
  version Cloudflare.
- **Preuve qu'il est actif — 1 appel réel, et un seul** (banc Milo, run 36229012611, scénario
  EV-001, sonde passive restée sur la branche) : enveloppe reçue avec `complete`, `truncated`,
  `stopReason`, `continued` · `complete: true` · `stopReason: end_turn` · `continued: false` ·
  `_model: claude-sonnet-4-6` · **1 seul appel `coach`**. L'app en ligne (ft-v1234) l'ignore, comme
  prévu : l'ancien client ne lit que `reply`.
- ⚠️ Le refus sans jeton (AUTH1) n'a pas été rejoué en production : il est éprouvé par le banc
  AUTH1 local, sur le même `worker.js`, et l'appel réel est bien passé par l'identité S1.

## C2. D-027 — le bouton « Enregistrer ce programme » : déjà conforme, rien changé

Décision de Michel : le bouton **peut** rester sous une réponse globalement incomplète **uniquement
si** le bloc JSON est complet, accepté par le parseur, de schéma valide, et qu'aucun JSON partiel
n'est réparé ni enregistré. **Mesuré dans l'app servie avant publication** : c'était déjà exactement
le comportement.

| cas | bouton | enregistré avant le clic |
|---|---|---|
| réponse complète + JSON complet | oui | non |
| réponse **coupée après** un JSON complet | **oui**, sous le marqueur | non |
| fin **non confirmée** (`refusal`) + JSON complet | **oui**, sous le marqueur | non |
| JSON coupé **dans** son bloc (même réparable par `]}`) | **non** | non |
| JSON complet mais **aucune journée** | **non** | non |

Aucune ligne de code modifiée ; le comportement est **figé** par des témoins.

## C3. D-028 — l'annonce de la prochaine séance : c'était une ÉCRITURE → bloquée

Mesuré : sous une réponse coupée ou non confirmée, un bloc caché `prevu` **complet** écrivait
`S.nextPlanned` en mémoire, sur le disque (`ft4_nextplanned`) ~~et vers le cloud~~ *(↪️ rectifié le 26/09 : une synchronisation était ensuite déclenchée, mais `nextPlanned` ne figure dans aucun paquet cloud vérifié — `setup.js`, `Code.js`, `supabase.js`)* — déjà le cas en
production (ft-v1234), donc **pas une régression**, mais une **mutation** (cas B du brief).
Rapporté à Michel **avant** de publier l'app ; sa décision : **bloquer d'abord**, même règle que la
séance (D-025).

- `coach.js` : `const _plan = _coupee ? null : _extractPlannedSession(reply);` — **une ligne**.
- Une annonce **déjà** enregistrée n'est ni remplacée ni effacée par une réponse incomplète.
- Le bloc reste retiré de l'affichage ; une annonce coupée dans son bloc n'était déjà pas lue.
- ⚠️ Les autres blocs cachés (mémoire proposée, réponses rapides) n'ont pas été touchés : la
  mémoire exige déjà l'accord de la personne (Principe 3), les réponses rapides n'écrivent rien.

## C4. Tests

- `tests/parcours/milo_suites.js` : **B-CCCLXXXIV** (4 témoins de source) et **B-CCCLXXXV**
  (14 conduits dans le navigateur : P1 → P6 programme, N1 → N7 prochaine séance, 1 appel par
  message, 0 erreur de page).
- Banc `tools/banc_milo_pdf1.js` : **97 OK / 0 rouge**.
- Contrôle négatif `tools/mut_milo_pdf1.py D '[negatif]'` : **13/13 conformes** (D01 → D09 mordent, 4 commentaires restent verts).
- Sur le candidat master `a8f2e9ab` : AUTH1 25/0 · contrat FT→Milo 23/0 · D-021/D-022/D-024 42/0 · débrief 24/0 · Worker S2-B 49/0 · activité/provenance 54/0 · poids 78/0 · noyau Milo 12/12 · données toutes classées · **passe complète 5143 ✅ / 0 ❌, les 4 conditions vertes**.

## C5. Vérification réelle après publication (26/09/2026)

- **Version servie : `ft-v1235`** (lue sur le site par la sonde). Pages, Worker et Apps Script
  (`?test=1` → `online`, seuls `Code.js` et `appsscript.json` poussés, déploiement @190) : verts.
- **V1** — réponse normale : `complete: true`, `stopReason: end_turn`, **aucun marqueur**, état
  client `complete` (runs 36231606494 et 36231841452).
- **V2** — vrai chemin du chat (`sendToCoach`, écritures gelées) : **1 seul envoi à Milo** par
  message ; le seul autre appel est la traduction de séance, comme avant.
- **V3** — aucune troncature naturelle observée : le chemin réel de la suite (ancre, `_raccord`)
  **reste à observer**. Elle n'a pas été provoquée (consigne).
- **V4** — carte « ⚡ Oui, on démarre (2 exercices) » sur une réponse complète, clic → **séance
  chargée**. ⚠️ Observé au passage : ~~la traduction de séance n'a répondu dans sa fenêtre dans aucun
  des deux essais~~ *(↪️ rectifié le 26/09 : un seul échec établi, à l'essai 2 — voir l'en-tête)* ; la séance est venue de la lecture locale de secours (chemin inchangé par cette
  publication — doute consigné dans `docs/JOURNAL-DE-TEST.md`).
- ⚠️ La 1ʳᵉ sonde lisait 2,5 s après le tap, pendant que la séance se préparait encore : son « 0 »
  ne mesurait que l'impatience de la sonde. Corrigée (attente bornée) avant le 2ᵉ essai.
- Coût réel après publication : **5 requêtes Milo** (2 × scénario EV-001, dont une abandonnée par le banc à 30 s puis relancée ; 2 × chat) + **2 traductions de séance** ; avant publication : **1** requête (la preuve du Worker, §C1).

- ↪️ **Correction (26/09, MILO-SEANCE-01)** : « la traduction de séance n'a répondu dans sa fenêtre
  dans aucun des deux essais » est **faux pour le 1ᵉʳ** — une seule traduction, lancée au tap, lue
  2,5 s plus tard (un dépassement de 12 s y est impossible). Fait établi : **un** échec sur deux
  essais. Diagnostic complet : `docs/MILO-SEANCE-01.md`.
