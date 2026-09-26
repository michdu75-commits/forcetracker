# 🔬 MILO-SEANCE-01 — Où une séance perd-elle des exercices ? (26/09/2026)

> **Diagnostic seulement.** Aucune correction n'est codée : Michel voit d'abord le diagnostic
> (consigne §10). MILO-PDF1 est fermé et n'est pas rouvert — un défaut qui le touche est
> **signalé** (§7), pas corrigé.
> Instruments : `tools/diag_seance01.js` (mesure, étage par étage) · `tests/parcours/seance_unicite.js`
> + `tools/banc_seance_unicite.js` (témoin d'unicité, bloc B-CCCLXXXVI) · `tools/mut_seance_unicite.py`
> (contrôle négatif). **0 appel réel** : l'app servie est conduite dans un navigateur, le Worker est simulé.
> ⛔ Rien de tout ça n'est branché dans la passe complète : deux témoins sont rouges exprès (§6).

## 0. Ce qui a été observé — et une correction de mon propre compte rendu

Vérification réelle de `ft-v1235` (runs 36231606494 et 36231841452), demande : 4 exercices.

| essai | voie à l'arrivée | traductions `seanceJson` | ce qui s'est passé |
|---|---|---|---|
| 1 | aucune traduction : la réponse n'a **pas** été reconnue comme une séance, le repli n'a rien lu → **question** « Cette séance te convient ? » (déduit : une seule traduction au total, et une carte sans compte d'exercices) | **1**, lancée **par le tap** | la sonde a lu **2,5 s** après le tap, sans réponse : traduction encore en cours **ou** échouée en réseau (non distingué). ⛔ **Un dépassement du délai de 12 s est impossible en 2,5 s : il n'a pas eu lieu.** |
| 2 | traduction lancée | **1** | elle a **échoué** (délai de 12 s ou panne réseau — la sonde ne les distingue pas) → **repli** → carte « 2 exercices » → `S.wkt` = 2 |

⚠️ **Correction** : j'avais écrit, dans le compte rendu de publication et au journal de test, que la
traduction « n'a répondu dans sa fenêtre dans aucun des deux essais ». **C'est faux pour l'essai 1** :
une seule traduction y a été lancée, au tap, et la sonde l'a lue trop tôt. Le fait établi est : **un
échec sur un essai**, pas deux. *Une sonde qui lit trop tôt fabrique un échec qui n'a pas eu lieu.*

Le texte de Milo n'a pas été conservé (voulu : la sonde ne garde aucun texte). On ne sait donc
**toujours pas** s'il avait écrit 4 ou 2 exercices dans l'essai 2 (voir §8).

## 1. Le chemin complet

```
demande (sendToCoach)
 → réponse de Milo (Worker, 1 appel)
 → ① bloc caché ```json {"seance":…}``` ? ── oui → carte immédiate (pas de traduction)
 → sinon « ça ressemble à une séance ? » (_ressembleASeance : ≥ 2 lignes « N×R »)
      oui → ② TRADUCTION (_cerveletSeance → Worker seanceJson → Haiku), non attendue, 12 s max
             réussie → _cerveletFidele (noms retrouvés dans le texte) → carte
             échouée → ③ REPLI (_seanceDepuisTexte, lu à l'arrivée) → carte
             repli vide → question « Cette séance te convient ? » si la personne a DEMANDÉ une séance
      non  → ③ repli s'il lit ≥ 2 exercices → carte ; sinon question (si demande)
 → question « Oui » : construite AU TAP (repli, puis traduction ATTENDUE, 12 s max) → carte, ou « je n'arrive pas à lire »
 → carte « Oui, on démarre (N exercices) » → _startSessionFromMilo → _appliqueMiloSession → S.wkt
 → rechargement du fil / « Mes discussions » : ① ou ③ SEULEMENT (jamais de traduction)
```

| voie | entrée | lecture | normalisation | échec → | où la liste peut raccourcir |
|---|---|---|---|---|---|
| ① bloc caché | `_extractDaySession` | `JSON.parse` | `_montee` puis `_normalizeMiloSession` | ③ (si le texte en lit **plus**, on suit le texte) | exercice sans nom ou sans série (normalisation) |
| ② traduction | `_cerveletSeance` | Haiku → `firstJson` (Worker) | `_cerveletFidele` puis `_montee`, `_normalizeMiloSession` | ③ (arrivée) · message d'échec (tap) | `_cerveletFidele` écarte un nom absent du texte ; **tout** rejeté si < 2 restent ou > 1/3 écartés |
| ③ repli | `_seanceDepuisTexte` | 3 motifs de ligne (voir §4) | `_montee`, `_normalizeMiloSession` | question (si demande) | **toute ligne qu'aucun motif ne lit** ; lignes > 90 caractères ; moins de 2 lus → rien |
| injection | `_startSessionFromMilo` | — | `_appliqueMiloSession` | — | `_extraireCardioMilo` retire le cardio (mesuré : « Rowing barre » → `barre`, pas cardio) |

## 2. Le délai de 12 s

- **Propriétaire unique** : `_cerveletSeance` (`coach.js`, `AbortController` + `setTimeout(…, 12000)`).
  Il ne concerne **que** `seanceJson`, appelé depuis **deux** endroits : l'arrivée (non attendu) et
  le tap sur la question (attendu).
- **Il annule vraiment la requête** : mesuré (B2, U4) — carte de repli à **12,1 s**, réponse tardive
  livrée à 13 s **ignorée**, **aucune** deuxième carte.
- ⚠️ Le minuteur est levé dès que les **en-têtes** arrivent : la lecture du corps (`r.json()`) n'a
  plus de délai. Non observé en défaut, noté.
- Côté serveur, l'annulation du navigateur n'arrête pas forcément le travail du Worker (non mesurable ici).
- **Pas de nouvel essai automatique.** Deux traductions dans une même conversation = **arrivée + tap**
  (B4 : 12 s + 12 s, puis « je n'arrive pas à lire cette séance »). Dans la vérification, chacune des
  deux traductions appartient à un **essai différent**.
- ⚠️ Le commentaire du code justifie 12 s par « une réponse Haiku normale (1-2 s) » : **non mesuré
  aujourd'hui** (il faudrait des appels réels, voir §8).

## 3. Reproduction déterministe — la séance du brief (4 exercices)

Nombre d'exercices à chaque étage (`tools/diag_seance01.js`) :

| écriture de Milo | ressemble | repli lu | extrait | normalisé | **S.wkt** |
|---|---|---|---|---|---|
| F1 une ligne complète, numérotée (**ce que le prompt demande**) | oui | **0** | 0 | 0 | **0** |
| F2 une ligne complète, puces | oui | **0** | 0 | 0 | **0** |
| F3 une ligne courte « Nom : 4×6 @ 80 kg » | oui | 4 | 4 | 4 | **4** |
| F4 bloc : nom / séries / consigne | oui | 4 | 4 | 4 | **4** |
| F5 « 4 séries de 6 à 80 kg » | oui | **0** | 0 | 0 | **0** |
| F6 gras en ligne + « (repos 2 min) » | oui | **0** | 0 | 0 | **0** |
| **F7 mixte : 2 courtes + 2 complètes** | oui | **2** | 2 | 2 | **2** |
| F8 tableau Markdown | oui | **0** | 0 | 0 | **0** |
| F9 gras + points médians | oui | **0** | 0 | 0 | **0** |
| F10 « Nom 4×6 » sans charge | oui | 4 | 4 | 4 | **4** |

- Traduction **parfaite** passée à `_cerveletFidele` : **4 gardés sur 4** dans les 10 écritures.
- `_normalizeMiloSession`, `_startSessionFromMilo`, `_appliqueMiloSession` : **0 perte** (extrait = normalisé = S.wkt partout).
- De bout en bout (`sendToCoach`) : F7 + traduction réussie → **4** · F7 + traduction en panne → **2** ·
  F7 + traduction lente (13 s) → **2** à 12,1 s · F1 + traduction en panne → question → tap → « je
  n'arrive pas à lire cette séance », **0**.

👉 **La fonction qui fait tomber le compte de 4 à 2 est `_seanceDepuisTexte`** (le repli), et
seulement elle. Les deux exercices perdus en F7 sont des lignes **conformes au prompt**
(« 3. Développé militaire — 3×8 à 40 kg, repos 2 min — gainage fort, ne cambre pas ») :
aucune de ses trois lectures ne les accepte, **même seules** (mesuré).

## 4. Pourquoi le repli ne lit pas ces lignes (lu dans le code, confirmé par les mesures)

1. Le motif principal est **ancré en fin de ligne** et n'accepte après les répétitions que
   « `@ 80 kg` » ou « `80 kg` » : **« à 80 kg »**, **« , repos 90 s »**, **« — consigne »**,
   **« (en superset…) »**, **« au ressenti »** font échouer la ligne entière.
2. La lecture « séries seules » n'accepte qu'une ligne qui **commence** par « 4×6 » (nom au-dessus).
3. Une ligne de plus de **90 caractères** est ignorée.
4. Ni « 12/10/8/8 », ni tableau, ni points médians.

Or le prompt de Milo lui demande **exactement** « UN EXERCICE PAR LIGNE, avec ses séries × reps, la
charge en kg, le REPOS et ta consigne technique ». *Le repli ne sait pas lire le format que le
prompt impose* — il ne lit que les écritures courtes, ou le format en bloc.

## 5. Cas limites (§6) — attendu / lu / normalisé / chargé

| cas | attendu | lu | normalisé | chargé | cause |
|---|---|---|---|---|---|
| S1 simples | 4 | 4 | 4 | 4 | — |
| S2 accents | 4 | 4 | 4 | 4 | — |
| S3 hors catalogue | 4 | 4 | 4 | 4 | nom gardé tel quel |
| S4 3×12 | 4 | 4 | 4 | 4 | — |
| S5 12/10/8/8 | 4 | **0** | 0 | 0 | notation non lue ; **pas reconnue comme séance** → aucune traduction à l'arrivée |
| S6 « , repos 90 s » | 4 | **0** | 0 | 0 | texte après la charge |
| S7 « au ressenti » | 4 | **0** | 0 | 0 | charge non numérique |
| S8 superset | 4 | **2** | 2 | 2 | « (en superset avec…) » après la charge |
| S9 cardio avant/après | 4 | 4 | 4 | 4 | ⚠️ le cardio déclaré n'est **pas** repris par le repli |
| S10 texte intercalé | 4 | 4 | 4 | 4 | — |
| S11 Markdown | 4 | 4 | 4 | 4 | — |
| S12 longue réponse | 4 | 4 | 4 | 4 | — |

Ces chiffres sont ceux du **repli** : quand la traduction répond, elle lit ces cas (elle n'a pas ces limites).

## 6. Une seule carte ? — et deux défauts d'intégrité trouvés en le vérifiant

Témoin B-CCCLXXXVI (`tests/parcours/seance_unicite.js`), compté sur **tout le fil** :

| situation | cartes séance |
|---|---|
| U1 bloc caché | **1** |
| U2 traduction réussie | **1** (4 ex.) |
| U3 traduction en panne → repli | **1** |
| U4 traduction tardive (13 s) + 2,5 s | **1** — la réponse tardive n'en pose pas une 2ᵉ |
| U5 question → tap → échec | **1** |
| U6 fil rechargé deux fois | **1** |
| U7 « Mes discussions » | **1** |
| U10 deux séances dans le même fil | **1**, sur la plus récente |

**Jamais 2, jamais N** : aucun cas de cartes multiples n'a été trouvé.

⚠️ **U8 — une proposition de MÉMOIRE fait disparaître la carte séance.** La carte « Je retiens … ? »
porte la même classe (`coach-prog-save`) que la carte séance. Quand la séance passe par la
traduction (réponse non attendue), la carte mémoire est déjà posée ; la garde de
`_appendStartSessionBtn` (« déjà un bouton dessous ») la prend pour une carte séance et **renonce** —
en répondant « posé », donc sans repli ni question. Mesuré : séance lue (1 en attente), **0 carte**.
Même réponse sans mémoire : 1 carte. **Rouge sur ft-v1235.**

⚠️ **U9 — la séance change de taille au rechargement.** La séance traduite (4) ne vit qu'en mémoire ;
au rechargement du fil ou via « Mes discussions », la carte est reconstruite par le **repli** (2).
La personne qui ferme l'app et la rouvre à la salle démarre une séance **amputée**, sans message.
**Rouge sur ft-v1235.**

## 7. Signalé, hors de ce chantier : D-025 contourné par « Mes discussions »

`loadCoachConv` recopie les messages **sans** le champ `coupee` (il garde `role`, `content`, `ts`,
`_silent`). Mesuré (B10) : une réponse **coupée** (marquée, aucune carte à l'arrivée) rangée puis
rouverte depuis « Mes discussions » **perd son marqueur** et **redevient une séance** (carte 4 ex.,
chargée). C'est une porte que MILO-PDF1B n'a pas fermée ; le chantier étant fermé, **rien n'est
touché** — la décision de le rouvrir appartient à Michel.

## 8. Ce qui n'est pas établi

- **Ce que Milo a réellement écrit** pendant l'essai 2 : 4 exercices dont 2 illisibles pour le repli
  (hypothèse B, rendue parfaitement plausible par F7/S6/S8), ou 2 seulement (A) — **non tranché**.
- **Pourquoi la traduction a échoué** dans l'essai 2 : délai ou réseau — **non distingué**.
- **La latence réelle** de la traduction en production.

👉 Une mesure réelle les trancherait **sans garder de texte** : la sonde de la branche compterait,
dans la page, les lignes d'exercice que Milo a écrites, ce que le repli en lit, ce que la traduction
en rend, et la durée de la traduction (avec un délai de lecture plus long que 12 s). Coût : 1 appel
Milo + 1 à 2 traductions par essai. **Pas lancée** : c'est une décision de Michel.

## 9. Correctifs minimaux proposés — NON CODÉS

| # | défaut | correctif minimal proposé | risque |
|---|---|---|---|
| C1 | le repli ne lit pas le format du prompt (4 → 2, ou 0) | élargir `_seanceDepuisTexte` : accepter « à 80 kg », « au ressenti », « N séries de R », un texte **après** la charge (repos, consigne, parenthèse), lever la limite de 90 caractères ; garder la règle « nom exact ou tel quel » | un repli plus large peut lire une ligne qui n'est pas un exercice — à borner par les témoins S1-S12 et F1-F10 |
| C2 | U8 : la carte mémoire bloque la carte séance | la garde de `_appendStartSessionBtn` ne regarde que les **cartes séance** (marque propre à la carte séance), pas toute `coach-prog-save` | faible |
| C3 | U9 : la séance traduite n'est pas gardée | garder avec le message la séance **déjà traduite** et la relire au rechargement, au lieu de repasser par le repli | touche le format de l'historique enregistré : décision de Michel |
| — | délai de 12 s | **ne pas y toucher** avant d'avoir mesuré la latence réelle (§8) | — |
| — | D-025 / « Mes discussions » (§7) | recopier `coupee` dans `loadCoachConv` (une ligne) — **seulement si Michel rouvre MILO-PDF1** | — |
