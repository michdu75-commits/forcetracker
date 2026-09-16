# 🔑 PHASE 1ter — ÉTAPE 0 : l'infrastructure permet-elle une idempotence serveur fiable ?

> **15/09/2026 · inventaire seul. ⛔ ARRÊT AVANT CODAGE, comme demandé.**
> Consigne de Michel : *« Si aucune infrastructure existante ne permet une idempotence serveur
> fiable, ARRÊTE AVANT DE CODER et donne-moi les options »* · *« N'ajoute pas un nouveau service
> payant sans feu vert »* · *« ne maquille pas une déduplication approximative en idempotence
> fiable »*.
>
> ⛔ **Aucun fichier servi n'est modifié. `sw.js` n'est pas incrémenté.**

---

## ⛔⛔ 1. LE VERDICT, ET IL NE TIENT PAS À CE QU'ON CROYAIT

**Il n'existe aujourd'hui aucun stockage serveur configuré côté Cloudflare.** `wrangler.toml`
déclare **zéro binding** et `env` ne porte que **deux secrets** (`ANTHROPIC_API_KEY`,
`FT_COUNT_TOKEN`). Ni KV, ni D1, ni Durable Objects, ni R2.

Mais ce n'est **pas** le vrai blocage. Le vrai blocage est plus haut, et il est structurel :

> ### Pour tenir *à la fois* « un seul appel IA » **et** « jamais de perte », le RÉSULTAT doit survivre à la disparition du client. Le Worker est sans état. Donc le résultat doit être **stocké côté serveur**.

Et c'est là que ça coince, pour une raison qui n'est **pas** technique — `coach.js:1258` :

> *« Le fil des échanges vit UNIQUEMENT sur le téléphone (`ft4_coach_hist`) : il ne part ni chez
> Google, ni sur le Drive, ni chez Supabase. **C'est un CHOIX de conception** — les gens parlent à
> Milo de leur corps, de leur moral, de leurs blessures — pas un oubli. »*

👉 **Le remède correct croise une décision de confidentialité que le projet a prise exprès**
(Constitution **P3**, **R36** : *ce qui décrit la personne reste chez elle*). Un débrief est un
texte de Milo **sur l'entraînement d'une personne nommée**. Le persister côté serveur, même une
heure, est une **décision produit** — elle appartient à Michel, pas à moi.

⚠️ **Et l'alternative « ne stocker que l'état, jamais le texte » ne marche pas** : elle empêche
bien le 2ᵉ appel, mais le client rechargé n'a alors **rien à afficher** — on remplace un doublon
coûteux par la **perte silencieuse** que Michel interdit explicitement (**R29**). *Les deux moitiés
du problème se tiennent : on ne peut pas résoudre l'une sans payer l'autre.*

---

## 2. L'INVENTAIRE, DANS LES TROIS CATÉGORIES DEMANDÉES

### ✅ A — Disponible **ET déjà configuré**

| mécanisme | état réel | atomique ? |
|---|---|---|
| **Apps Script** (web app déployée, **déjà appelée par le Worker** à chaque action IA) | actif | — |
| ↳ `LockService` | **disponible sans configuration**, ⚠️ **employé nulle part aujourd'hui** (0 occurrence dans `Code.js`) | ✅ **vraie exclusion mutuelle** |
| ↳ `PropertiesService` | actif, **limite lue dans le code : 512 000 octets** | ✅ sous verrou |
| ↳ **Google Sheet** (5 onglets déjà en écriture) | actif, pas de plafond à 512 Ko | ✅ sous verrou |
| **Cache API** du Worker (`caches.default`) | disponible, **zéro configuration** | ⛔ **NON** |
| **`localStorage`** client | actif (ft-v1215 : `ft4_debrief_recu`) | ⛔ ne traverse pas un rechargement en vol |

⚠️⚠️ **`PropertiesService` est une ressource DÉJÀ SATURÉE UNE FOIS** : le 29/07/2026 elle est
montée à **102 %** de ses 512 Ko et **plus aucune écriture ne passait pendant deux jours, en
silence**. Tous les comptes utilisateurs (`u_{email}`, gzippés) y vivent. *Y écrire des débriefs
serait exactement le geste qui a produit la panne.* → si Apps Script est retenu, le résultat va
dans le **Sheet**, pas dans les Properties.

### ⚠️ B — Techniquement possible mais **NON configuré**

**KV · D1 · Durable Objects · R2.** Aucun n'est déclaré dans `wrangler.toml`. Chacun demande :
créer la ressource chez Cloudflare → ajouter le binding → redéployer le Worker.

| | atomicité réelle | verdict pour une idempotence |
|---|---|---|
| **Durable Objects** | mono-thread par objet — **la primitive idéale** | ✅ le meilleur techniquement |
| **D1** | contrainte `UNIQUE` + `INSERT … ON CONFLICT` → vrai *create-if-absent* | ✅ correct |
| **KV** | ⛔ **pas de compare-and-set**, cohérence **éventuelle** | ⛔ **à refuser** — ce serait précisément la « déduplication approximative maquillée en idempotence » |
| **Cache API** | par **centre de données**, éviction libre | ⛔ à refuser |

### ❓ C — Nouveau service / nouveau coût

⛔⛔ **JE NE PEUX PAS TRANCHER CETTE CATÉGORIE, ET JE NE L'INVENTE PAS.** Les docs Cloudflare sont
**injoignables depuis ce conteneur** (`connect_rejected` par le proxy). Je ne connais donc pas de
source vérifiable pour : les limites gratuites de KV/D1/R2, **ni si les Durable Objects exigent un
plan payant** sur son compte.

👉 *Un tarif ne se devine pas, il se lit sur la facture.* **À vérifier par Michel dans son tableau
de bord Cloudflare** avant tout choix. Le seul chiffre du dépôt est `GUIDE-CLOUDFLARE.md` :
*« l'offre gratuite = 100 000 requêtes/jour »* — c'est le quota **Workers**, il ne dit rien du
stockage.

---

## ⭐⭐ 3. UNE BONNE NOUVELLE : L'IDENTIFIANT DEMANDÉ EXISTE DÉJÀ (objectif 1)

Mesuré dans `log.js:4331` — **toute séance porte déjà un identifiant stable** :

```js
const sess = { id: Date.now(), date: …, ts: Date.now(), … };
```

et les séances **importées** aussi (`log.js:7721` → `id: now + si`).

| exigence de Michel | `sess.id` |
|---|---|
| stable après rechargement | ✅ persisté dans `S.sessions` (localStorage) |
| stable après fermeture/réouverture | ✅ |
| distinct entre deux séances du même jour | ✅ **milliseconde**, pas la date |
| indépendant du libellé humain | ✅ |
| indépendant de la date seule | ✅ |
| indépendant du nb d'exercices / du volume | ✅ |

👉 **Le schéma ne demande aucun mécanisme nouveau** (**R13**) :

```
sessionId  = sess.id                    (existe déjà)
debriefId  = "debrief:" + sess.id       (dérivé, dédié au débrief AUTO)
requestId  = identifiant par TENTATIVE réseau (à créer, côté client)
```

⛔ Et **la désignation humaine n'est pas la clé** — c'est exactement le défaut mesuré en 1bis
(scénario ⑧ : deux séances identiques le même jour partagent leur désignation). *La désignation
décrit, l'identifiant choisit* — le contrat déjà posé en ft-v1215.

---

## 4. LES OPTIONS, AVEC LEUR PRIX

| | fiabilité | complexité | coût € | impact architecture |
|---|---|---|---|---|
| **1. Apps Script + `LockService` + Sheet** | ✅ **atomique** | moyenne | **0 €** (déjà payé) | ⚠️ ajoute un aller-retour **BLOQUANT** sur le chemin critique · ⚠️ **stocke du texte personnel côté serveur** |
| **2. D1** | ✅ atomique | moyenne | ❓ à vérifier | service à créer + binding + redéploiement |
| **3. Durable Objects** | ✅ **la meilleure** | plus élevée | ❓ **plan à vérifier** | idem + dépendance à un plan |
| **4. KV** | ⛔ **non atomique** | faible | ❓ | ⛔ à écarter |
| **5. Rien côté serveur** | — | nulle | 0 € | ⛔ **interdit par sa propre contrainte** : empêche le 2ᵉ appel *en perdant le débrief* |

⚠️ **Le coût de l'option 1 n'est pas financier, il est en LATENCE.** Aujourd'hui le seul appel
Apps Script du Worker (`_compterIA`) est sous `ctx.waitUntil` — donc **invisible** pour la personne.
Une vérification d'idempotence, elle, est **sur le chemin critique** : Milo répondrait après un
aller-retour Apps Script supplémentaire. ⚠️ **Non mesurable d'ici** (Apps Script est bloqué par le
proxy) — à mesurer avant de s'engager.

---

## 5. LE COÛT DU REMÈDE FACE À L'ÉCONOMIE

**Ce qu'on économise — estimation depuis les tailles MESURÉES en 1bis**, tarifs lus dans
`tests/milo/eval.js` (Sonnet : 3,00 $/M en entrée, 15,00 $/M en sortie) :

| | mesuré / estimé |
|---|---|
| charge utile d'un débrief | **79 272 octets** (mesuré) |
| ≈ jetons d'entrée | ~20 000–22 000 (estimé, ~3,5 car./jeton en français) |
| sortie | ~200–250 jetons |
| **coût d'UN appel évité** | **≈ 0,01 à 0,07 €** selon le taux de cache |

⚠️ **C'est une estimation à partir d'octets, pas une facture.** Le chiffre réel est lisible dans
**Profil → Admin → Santé du système** (`aiUsageLog` enregistre les vrais jetons).

**Ce que coûte le remède** : **0 €** pour l'option 1 (Apps Script est déjà en service et déjà
appelé). Pour D1/DO : inconnu d'ici — **à lire par Michel**.

👉 **Donc, économiquement, l'option 1 gagne sans discussion** : on ne dépense pas 0,02 €
d'infrastructure pour éviter 0,01 € d'IA — on n'en dépense **aucune**. *Le prix à payer n'est pas
de l'argent : c'est de la latence et une ligne de confidentialité.*

---

## 6. CE QUI SE FERAIT SANS RIEN AJOUTER — et ce que ça ne couvre pas

Si Michel refuse le stockage serveur du texte, il reste un lot **borné et gratuit**, mais il faut
dire franchement ce qu'il vaut :

- ✅ `debriefId` + `requestId` + `requestKind: "session_debrief"` transmis explicitement (objectif 2)
  — ⛔ *sans* déduire le débrief en analysant une phrase du prompt ;
- ✅ le Worker cesse d'être aveugle : il **peut** compter, et l'écart devient **mesurable** ;
- ✅ le quota (objectif 8) peut être débité **par `debriefId`** et non par requête — *ça, c'est
  faisable côté Apps Script sans stocker une ligne de texte*, puisque le compteur y vit déjà ;
- ⛔ **mais le 2ᵉ appel Anthropic n'est PAS empêché** : sans résultat persisté, le client rechargé
  n'a d'autre choix que de redemander.

👉 *Autrement dit : on peut faire cesser la double consommation de QUOTA sans rien stocker ; on ne
peut pas faire cesser le double appel MODÈLE sans stocker le résultat.* **Ce sont deux décisions
séparées, et la seconde seule touche à la vie privée.**

---

## 7. CE QUE JE N'AI PAS FAIT

⛔ **Aucun code.** Aucun fichier servi modifié, `sw.js` non incrémenté, aucun test écrit, aucune
mutation, aucune passe — l'arrêt est demandé **avant** cette étape.
⛔ Les **17 scénarios**, le **test à 5 requêtes concurrentes** et l'**avant/après** ne sont pas
joués : ils n'ont pas de sens tant que le mécanisme n'est pas choisi.
⛔ **Chemin Coach (objectif 10)** : non touché. `sendToCoach` est le cœur de la conversation — et
Michel a écrit *« s'il faut toucher profondément `sendToCoach`, STOPPE »*.
⛔ Périmètre interdit intact : Nutrition · scanner · prévu/réalisé · `buildSessionDebriefContext` ·
contexte · blocs C+D · Gardien · Sonnet→Haiku · caches · mémoire Milo · quotas Premium · aucune
nouvelle fonctionnalité utilisateur.

---

## ⭐ 8. CE QUE MICHEL DOIT TRANCHER

1. **Accepte-t-on de persister le TEXTE d'un débrief côté serveur** (durée courte, p. ex. 1 h, puis
   effacement) **pour ne plus payer deux fois ?** — ⚠️ c'est une exception à *« le fil ne quitte
   jamais le téléphone »*. **Sans ce feu vert, le double appel modèle ne peut pas être supprimé.**
2. Si oui : **Apps Script** (0 €, déjà là, atomique, mais latence sur le chemin critique) ou **D1 /
   Durable Objects** (plus propre, coût et plan **à vérifier par lui**) ?
3. Si non : veut-il quand même **le lot gratuit** du §6 — identifiants explicites + **quota débité
   une seule fois par débrief logique** — en acceptant que le 2ᵉ appel modèle subsiste ?

⛔ **Je ne choisis pas à sa place** : la question n°1 n'est pas technique.
