# 💰 MINI-PHASE 1bis — un rechargement pendant `en_vol` fait-il payer DEUX fois ?

> **15/09/2026 · mesure seule, AUCUN correctif appliqué.** Consigne de Michel :
> *« MESURE AVANT CORRECTIF »* · *« Si la mesure démontre que deux appels modèle partent pour le
> même débrief logique, ARRÊTE avant correction et donne-moi le résultat. »*
> **C'est ce que la mesure démontre. Le chantier s'arrête donc ici.**
>
> Prérequis vérifié avant d'ouvrir la passe : `origin/master` = local = `01e233a9`, arbre propre,
> `ft-v1215` publié, passe `4140 ✅ · 0 ❌`.

---

## ⛔⛔ 1. LA CONCLUSION DE ft-v1215 ÉTAIT FAUSSE, ET MICHEL A EU RAISON DE LA CONTESTER

`banc_a.js:106` étiquetait le scénario *« rechargement PENDANT `en_vol` »* ainsi :

> `2 appels — attendu (rien n'était payé)`

**Cette phrase affirme un fait de FACTURATION à partir d'une observation de NAVIGATEUR.**
Le navigateur ne savait qu'une chose : *la réponse n'était pas revenue*. Il ne pouvait rien dire
de ce que le serveur avait déjà fait.

👉 **Mesuré aujourd'hui : la première requête était ARRIVÉE, CORPS COMPLET, et l'abandon client
n'est survenu que 2,2 à 2,6 secondes plus tard** — c'est-à-dire bien après le point où le Worker
appelle Anthropic.

*Ce n'est pas un chiffre qui était faux, c'est une catégorie : on ne conclut pas sur ce que fait un
serveur en regardant le client.*

---

## 2. POURQUOI LE BANC A DÛ CHANGER DE NATURE

| | banc de ft-v1215 | banc 1bis |
|---|---|---|
| mécanisme | `fetch` **remplacé** dans la page | **vrai serveur HTTP** qui reçoit |
| ce qu'il compte | ce que le navigateur **demande** | ce qui **arrive** |
| abandon client | invisible | observé (`aborted`, `writableFinished`) |
| latence serveur | inexistante | **contrôlée** (9 s) |

⭐ Le détournement se fait **sans toucher au produit** : on sert un `constants.js` dont la seule
constante `AI_PROXY_URL` change. Le vrai `_aiUrl`, la vraie `_runSeDebrief` et le vrai `fetch` du
navigateur sont employés. *Une sonde qui remplace `fetch` ne peut pas mesurer ce qui ARRIVE.*

### ⚠️⚠️ ET LE BANC A D'ABORD FABRIQUÉ LE DÉFAUT QU'IL MESURAIT

Premier jet : **2 requêtes arrivées même SANS rechargement**, à 1 214 ms d'intervalle, octet pour
octet identiques. Cause trouvée en lisant le produit, pas en relisant le banc : mon faux Worker
n'envoyait **aucun en-tête CORS**, alors que le vrai en envoie (`worker.js:109`). Une requête
cross-origin en `text/plain` **part et arrive** puis sa réponse est **bloquée** — donc `fetch`
rejette, donc la **vraie** boucle de reprise de `_runSeDebrief` (`log.js:4731`, 1 200 ms) se
déclenche.

👉 ***Le banc doublait CHAQUE appel, rechargement ou non.*** Sans le témoin ① — un débrief normal
qui doit coûter exactement 1 requête — j'aurais publié *« le rechargement fait payer deux fois »*
sur un chiffre entièrement produit par mon instrument.

*Un instrument qui produit le phénomène qu'il observe est pire qu'un instrument muet : il est
crédible.*

---

## 3. LES 10 SCÉNARIOS — CE QUI ARRIVE RÉELLEMENT AU SERVEUR

| # | scénario | requêtes `coach` **arrivées** | abandonnées | même débrief logique ? |
|---|---|---|---|---|
| ① | **témoin** — débrief normal, sans rechargement | **1** | 0 | — |
| ② | rechargement **AVANT** le départ (hors ligne) | **0** | 0 | — |
| ③ | ⛔ **rechargement PENDANT `en_vol`** | **2** | 1 | **OUI** |
| ④ | rechargement, serveur qui ne répond jamais | **2** | 1 | **OUI** |
| ⑤ | application **fermée puis rouverte** pendant `en_vol` | **2** | 1 | **OUI** |
| ⑥ | ⛔ même chose par le chemin **Coach** (`_maybeAutoDebrief`) | **2** | 1 | **OUI** |
| ⑦ | **témoin** — deux séances réellement différentes | 2 | 0 | non (2 désignations) |
| ⑧ | ⚠️ deux séances **identiques le même jour** | 2 | 0 | désignations **identiques** |
| ⑨ | ⛔⛔ **DEUX rechargements** pendant `en_vol` | **3** | 2 | **OUI** |
| ⑩ | bouton **« Réessayer »** après un échec | 2 | 0 (1 en suspens) | oui, mais **volontaire** |

**Faits complémentaires mesurés :**

- **le corps de la première requête est COMPLET** à l'arrivée dans tous les cas (le serveur ne
  compte qu'au `end`). L'abandon survient **2 172 à 2 614 ms plus tard** ;
- ⭐ **le second appel est PLUS GROS que le premier** : 79 272 → **84 889** octets en ③ (+7,1 %),
  jusqu'à **90 215** octets en ⑥. *On ne paie pas deux fois la même chose : on paie deux fois, la
  seconde plus cher* — l'historique a grossi entre-temps ;
- ⛔⛔ **le coût n'est pas borné** (⑨) : trois rechargements, trois requêtes. Rien ne plafonne la
  répétition, ni côté navigateur ni côté Worker ;
- ⚠️ **⑧ est une limite mesurée, hors sujet de cette passe et NON corrigée** : deux séances du même
  jour avec le même nombre d'exercices et le même volume produisent **la même désignation**. Ce
  n'est pas un problème de coût — les jetons, eux, restent distincts (anomalie B close en
  ft-v1215) — mais le modèle, lui, ne peut pas les distinguer dans la consigne. *Écrit, rendu à
  Michel, pas réparé.*

### ⚠️ Une honnêteté sur le 2ᵉ appel (Haiku)

`summarizeCoach` part dans ③-⑨ et **pas** dans ①. La cause n'est PAS le rechargement : c'est le
seuil `coachHistory.length>=4` (`log.js:4763`), et le témoin ① part d'un historique vidé par le
banc. **Chez une vraie personne, l'historique est déjà au-dessus du seuil dans les deux cas.**
👉 *Le surcoût réel d'un rechargement est donc UN appel Sonnet de plus, pas deux.* Le dire
autrement gonflerait le chiffre.

---

## 4. CE QUE LA CHARGE UTILE CONTIENT — ET CE QU'ELLE NE CONTIENT PAS

Clés relevées sur **toutes** les requêtes `coach` reçues :

```
action, coachMemory, context, email, history, message
```

⛔⛔ **Aucun identifiant de séance. Aucun identifiant de requête.**

👉 Même si le Worker *voulait* reconnaître deux requêtes comme le même débrief logique,
**il n'en a pas le moyen**. Le seul repère est la désignation en clair dans `message`
(`**2026-09-15 (1 exercice) — 400kg de volume**`), qui sert à Milo et n'a jamais été conçue comme
une clé — et le scénario ⑧ montre qu'elle n'est pas unique.

---

## 5. OBJECTIF 6 — L'IDEMPOTENCE EXISTANTE : **RIEN**

Consigne de Michel : *« Ne crée rien avant d'avoir cherché [une idempotence existante]. Si la
réponse est `rien`, écris-le clairement. »*

**La réponse est `rien`.** Recherché dans `worker.js` et `Code.js` : aucune clé d'idempotence,
aucun verrou de session, aucune déduplication, aucun cache de réponse, aucun registre de requêtes.

Le seul garde-fou existant est `_plafondAtteint()` (`worker.js:36/145`) — un **plafond d'ABUS**
(600 appels/jour au global, 50 par personne), pas une déduplication, et explicitement approximatif
(*« l'objectif est de borner le coût en cas d'abus, pas de tenir une comptabilité exacte »*).

---

## 6. CE QUE LE WORKER FAIT D'UNE REQUÊTE DONT LE CLIENT A DISPARU

Lu dans le code, pas supposé :

| fait | ligne | conséquence |
|---|---|---|
| `_compterIA` est appelé **avant** l'aiguillage, sous `ctx.waitUntil` | `worker.js:152` | ⛔ **le quota est débité pour les DEUX requêtes**, abandon ou non — `waitUntil` prolonge explicitement la vie du Worker au-delà de la réponse |
| `callClaudeDiag` ne passe **aucun `AbortSignal`** au `fetch` vers Anthropic | `worker.js:212-216` | **rien dans notre code n'annule l'appel amont** |
| `_rapporterUsage` n'est appelé qu'**après** `await r.json()` | `worker.js:220` | ⚠️ si l'isolat est tué à la déconnexion, **notre propre journal d'usage ne verra jamais l'appel abandonné** |

**Deux comptabilités, deux réponses :**

- ✅ **le quota (notre comptabilité) est bel et bien débité deux fois** — c'est prouvé par lecture
  du code, et c'est **observable en production** dans Profil → Admin → Santé du système ;
- ⛔ **la facturation Anthropic du premier appel : `facturation exacte non prouvable`.** Elle
  dépend de deux choses qu'aucune mesure faite ici ne peut atteindre : Cloudflare annule-t-il le
  contexte d'exécution à la déconnexion du client, et Anthropic facture-t-il une requête dont la
  connexion est coupée en vol.

⛔⛔ **Et cette formule ne doit jamais être remplacée par `rien n'était payé`** — c'est exactement
l'erreur de ft-v1215, et c'est la seule phrase que les faits interdisent.

---

## 7. VERDICT

> ### ⛔ CAS B — **deux requêtes complètes partent et ARRIVENT pour le même débrief logique.**
>
> - Le départ et l'arrivée des deux requêtes : **prouvés** (10 scénarios, serveur réel).
> - Le débit du **quota** deux fois : **prouvé par lecture du code** (`waitUntil`).
> - La **facturation Anthropic** du premier appel : **`facturation exacte non prouvable`**.
> - Le coût **n'est pas borné** : N rechargements ⇒ N requêtes.

---

## 8. CE QU'IL MANQUE POUR TRANCHER LA FACTURATION

Deux mesures, aucune ne demande de modifier le produit :

1. ⭐ **Le rapprochement `aiCount` ↔ `aiUsageLog` sur le même jour, déjà disponible** dans
   Profil → Admin → Santé du système. `aiCount` est incrémenté **avant** l'appel (sous
   `waitUntil`) ; `aiUsageLog` n'est écrit qu'**après** la réponse d'Anthropic. 👉 *Un écart entre
   les deux est la signature exacte des appels partis et non aboutis.* Il suffit que Michel
   reproduise le geste sur son iPhone (terminer une séance, recharger pendant que Milo analyse)
   puis lise les deux nombres.
2. **La page d'usage de la console Anthropic** à la minute près — la **seule** source de vérité sur
   la facturation. Un chiffre de facturation se lit sur une facture, il ne se déduit pas.

---

## 9. CE QUE CETTE PASSE NE FAIT PAS

⛔ **Aucun correctif**, conformément à la consigne — le chantier s'arrête au constat.
⛔ **Aucun fichier servi modifié** : `sw.js` n'est donc pas incrémenté.
⛔ Périmètre nommé par Michel intact : **Nutrition** · le **contexte dédié** du débrief ·
le **modèle** (Sonnet/Haiku) · la **stratégie de cache** · la **politique mémoire** ·
le **prévu vs réalisé** · l'architecture générale de Milo.
⛔ La limite du scénario ⑧ (désignations identiques le même jour) est **écrite, pas réparée**.

⚠️ **Et la tension à trancher est nommée plutôt que résolue** : la remise en file au rechargement
est **voulue** (ft-v979) — elle existe pour qu'un débrief ne soit **jamais perdu**. Fermer la
fenêtre `en_vol` sans y penser, c'est risquer d'échanger un doublon contre une perte silencieuse,
c'est-à-dire refaire à l'envers l'erreur que ft-v1215 venait de corriger (**R29**).
**La décision appartient à Michel.**
