# 🪪 DOSSIER S1 — IDENTITÉ SERVEUR MINIMALE · FINAL

> **16/09/2026 · IMPLÉMENTÉ.** Décisions de Michel appliquées : option **B** (transition), jeton
> **opaque 256 bits** sans expiration mais révocable, **N jetons par compte**, bootstrap **et**
> récupération par la **même** preuve, serveur stockant le **haché**, ⛔ pas d'`accountId`,
> ⛔ `Math.random()` hors de la chaîne d'identité.
>
> Départ : `b1177733`, servie `ft-v1215`, arbre propre, 0 concurrent, témoins **10/10**.
> **Banc S1 : 35 ✅ · 0 ❌** sur le **vrai code** (pas des regex).

---

## 1-2. ARCHITECTURE — AVANT ET APRÈS

```
AVANT                                    APRÈS
client ─ email ─────► Apps Script        client ─ jeton ─► Apps Script
         (déclaré = identité)                     (le serveur DÉDUIT le compte)
client ─ Origin ────► Worker ─► IA       client ─ jeton ─► Worker ─(authIdentity)─► Apps Script
         (un en-tête se forge)                              └─► IA, quota et Premium du JETON
```

**Le renversement tient en une phrase** : le client ne choisit plus son identité. Quand un jeton
est présent, c'est **son** compte qui est écrit et **son** quota qui est décompté — l'`email` du
payload devient une donnée, plus une autorité.

---

## 3. BOOTSTRAP — deux preuves, aucune porte ouverte

| situation | preuve exigée | résultat |
|---|---|---|
| compte **avec** code perso | le code (`issueTokenByCode`) | jeton émis ⭐ |
| compte **sans** code | **vérification e-mail** | jeton émis ⭐ |
| e-mail seul | ⛔ **aucune** | ⛔ **aucun jeton** (option C interdite) |
| code faux, expiré, déjà consommé | — | ⛔ aucun jeton |

⭐⭐ **La preuve e-mail est CONSOMMÉE à l'instant même de l'émission** : le code est supprimé de la
table juste avant que le jeton soit posé, donc il ne peut pas être rejoué pour en obtenir un second.
*Mesuré (témoin ㉖), pas supposé.*

⭐ **Côté client, le bootstrap est silencieux MAIS avec preuve** : `_ftBootstrapJeton()` ne demande
un jeton que si l'appareil détient déjà le **code perso**. Sans code, il ne demande rien.
⚠️ Lancé sans `await` : il ne retient jamais le démarrage (règle d'or #4).

---

## 4. `Math.random()` EST SORTI DE LA CHAÎNE D'IDENTITÉ

Tant que ce code ne faisait que confirmer une adresse, sa prévisibilité était bornée. **Il ouvre
maintenant la porte d'un jeton** : il est devenu un maillon de sécurité. Remplacé par
`Utilities.getUuid()` (UUID v4 de qualité cryptographique). ⭐ **Les quatre bornes existantes sont
conservées telles quelles** — 5 essais · 15 min · 60 s · 80/jour : ce sont elles qui bornent
vraiment la force brute, et les toucher aurait été un chantier qu'on ne m'a pas demandé.

---

## 5-7. LE JETON, ET OÙ IL VIT

| | |
|---|---|
| forme | **opaque**, 256 bits, `_jetonNouveau_()` = SHA-256 de **trois** UUID v4 (~366 bits d'entrée) |
| client | `localStorage` (`ft4_devtoken`), à côté de `ft4_authcode` |
| serveur | **uniquement `SHA-256(jeton)`** — ⭐ mesuré : le jeton brut **n'apparaît nulle part** dans le stockage (témoin ④) |
| forme stockée | `tok_{haché}` → `{e:compte, c:date, r:révoqué, d:libellé}` |

⛔ **Pas de bcrypt/PBKDF2, et c'est raisonné** : ces fonctions ralentissent une attaque sur un secret
**choisi par un humain**. Un tirage de 256 bits n'est pas devinable — SHA-256 suffit, et il a
l'avantage d'être une **clé de recherche directe**.

**Limites du stockage client, dites franchement** : une **XSS** le lit · un **vidage du navigateur**
l'efface · un **changement de navigateur** ne le transporte pas · un **téléphone perdu** le laisse
dans la nature **jusqu'à révocation**. Keystore/Keychain plus tard — ⛔ rien de natif ici.

---

## 8-9. MULTI-APPAREILS ET RÉVOCATION

⭐ **N jetons par compte dès le départ.** Mesuré (témoins ⑬-⑰) : deux jetons du même compte sont
valides simultanément ; révoquer T1 **refuse T1 et laisse T2 intact**.
⭐ Un jeton révoqué se distingue d'un jeton **inconnu** (`raison:'revoque'`) — sinon on ne saurait
plus si un appareil a été retiré ou n'a jamais existé.
⛔ **Il faut PRÉSENTER le jeton pour le révoquer** : on ne révoque pas celui d'un autre en
connaissant son adresse — ce serait rouvrir la faille par la sortie.

---

## 10. TRANSITION (option B) — et le levier de fermeture

Sans jeton, l'ancien chemin **passe encore**, il est **compté**, et il est destiné à disparaître :

- `_migCompter_()` tient trois nombres : **avec jeton · sans jeton · jetons au registre** ;
- ⛔ **aucune adresse** n'est journalisée (mesuré, témoin ㉚) ;
- route admin **`migStats`** pour lire l'état ;
- **`_MIG_FERME_ = false`** est l'unique interrupteur : le passer à `true` bascule tout en
  fail-closed. ⛔ **Aucune date calendaire n'est inscrite** — Michel ne l'a pas donnée.

---

## 11-14. APPS SCRIPT, WORKER, QUOTAS, PREMIUM

- **Apps Script** : `saveProfile` et `pushHealth` passent par `_identitePourEcriture_(body)`.
- **Worker** : `_identiteIA(token)` est appelé **avant toute dépense**, et il est **bloquant** —
  contrairement au comptage, qui vit sous `waitUntil`. ⛔ **Fail-closed** : réseau coupé, réponse
  illisible, Apps Script muet → **refus**. *Ici, laisser passer coûte de l'argent réel.*
- **Quota** : décompté sur l'e-mail **du jeton** (témoin ㉞).
- **Premium** : ⭐ **inchangé, parce qu'il était déjà correct** — le serveur ne lit toujours aucun
  `premium` fourni par le client. *On ne casse pas ce qui marche.*

⚠️ **Conséquence à connaître, dite plutôt que masquée** : un compte sans jeton **ne peut plus
appeler Milo**. C'est ce que Michel a demandé (*« Origin correct + aucun token → refus »*), et le
bootstrap automatique l'absorbe pour qui a déjà un code perso.

---

## 15-19. TESTS — 35 ✅ · 0 ❌ sur le vrai code

⭐⭐ **Le banc n'exerce pas des regex** : il charge `Code.js` et `worker.js` et appelle leurs vraies
fonctions, avec des doublures minimales pour ce qu'Apps Script fournit.

| famille | résultat |
|---|---|
| le jeton (256 bits, 500 tirages distincts) | ✅ |
| le brut absent du stockage serveur | ✅ |
| **A/B : jeton A + e-mail B → A, jamais B** | ✅ |
| jeton invalide / inconnu / tronqué → refus | ✅ |
| multi-appareils + révocation sélective | ✅ |
| rejeu : 50 usages, identité stable | ✅ |
| bootstrap (code / e-mail / preuve consommée) | ✅ |
| transition comptée, sans adresse | ✅ |
| **Worker : bon Origin + aucun jeton → 401** | ✅ |
| **quota décompté sur A, jamais sur B** | ✅ |

⚠️ **Ce que le banc NE couvre pas, et c'est dit** : Apps Script **déployé** et Supabase sont
**injoignables depuis ce conteneur**. Il éprouve la **logique servie**, pas le déploiement.
*Michel devra faire un vrai essai iPhone.*

---

## 20. PERFORMANCE — mesurée, pas estimée

| | mesure |
|---|---|
| validation d'un jeton (registre de 200) | **9,9 µs** — 5 000 appels |
| poids d'une entrée | **120 octets** |
| 200 jetons | 24 090 o = **4,7 %** du réservoir 512 Ko |
| **projection 1 000 jetons** | 120 450 o = **23,5 %** |
| taille du jeton transporté | **64 caractères** (32 octets) |
| appels réseau client supplémentaires | **0** — le jeton voyage dans les requêtes existantes |
| Worker | ⚠️ **+1 aller-retour Apps Script BLOQUANT** par appel IA |

⛔⛔ **Les deux coûts réels, nommés** : ① le Worker attend désormais Apps Script avant chaque appel
IA — c'est le prix assumé du jeton **opaque** (la révocation immédiate prime) ; sa latence **n'est
pas mesurable d'ici**, Apps Script étant injoignable. ② **23,5 % du réservoir à 1 000 jetons** — et
ce réservoir est **déjà monté à 102 % le 29/07/2026**. *C'est le point de bascule vers S2, et il est
chiffré plutôt que pressenti.*

---

## 21. MUTATIONS ET TÉMOINS

**Témoins ① à ④ et ⑨ RETOURNÉS, jamais supprimés** (R30) : ils épinglaient les défauts, S1 les a
fermés, donc ils devaient rougir — c'était leur rôle. Ils gardent leur numéro et leur histoire.
⛔ **Le ③ n'est PAS retourné, et c'est voulu** : `p_email` reste libre.

---

## 22-24. CE QUI RESTE OUVERT

> ### ⛔ **V2 RESTE OUVERTE JUSQU'À S2**
> `ft_miroir` reçoit toujours un `p_email` libre, depuis le **navigateur**. Le fermer impose de
> faire entrer le Worker dans ce chemin : c'est S2. **Témoin permanent ③.**

⚠️ **Fenêtre de transition ouverte** tant que `_MIG_FERME_` vaut `false` — par décision.
⚠️ **Latence Worker non mesurée** (Apps Script injoignable d'ici).
⚠️ **Plafond de stockage** à 23,5 % pour 1 000 jetons.
⛔ **Non faits, volontairement** : S3 idempotence · migration Supabase · `deleteAccount` · paiement
· natif · `accountId`.
⛔ **Nutrition : 0 ligne.** Le jeton est injecté par **un seul propriétaire** dans `constants.js`,
précisément pour ne toucher aucun des 5 appels IA nutrition.

---

## QUESTIONS FINALES — réponses mesurées

### 1. Un client connaissant seulement l'e-mail peut-il encore agir comme un autre sur une opération sensible ?
> ## **PARTIEL** — et c'est la décision de Michel, pas un oubli.
> **Avec un jeton : NON** — `jeton A + e-mail B` écrit **A** (témoins ⑧, ⑨).
> **Sans jeton : OUI, pendant la fenêtre de transition** (option B) — c'est exactement ce qui a été
> choisi pour ne pas couper le filet des comptes non migrés. `_MIG_FERME_ = true` ferme tout.

### 2. Peut-on encore consommer l'IA payée par Michel sans credential ?
> ## **NON.**
> Mesuré (témoin ㉛) : bon `Origin` + aucun jeton → **401**. `curl` avec le bon `Origin` ne suffit
> plus. Jeton invalide → 401. Mauvais `Origin` même avec un bon jeton → 403.

### 3. Token A + email B peut-il agir comme B ?
> ## **NON.**
> Témoins ⑧, ⑨ (écriture) et ㉞ (quota décompté sur A). Le payload n'est jamais une autorité.

### 4. Un token révoqué fonctionne-t-il encore ?
> ## **NON.**
> Témoin ⑭ : refus immédiat, avec `raison:'revoque'` distincte d'un jeton inconnu.

### 5. Deux appareils du même compte peuvent-ils avoir deux tokens indépendants ?
> ## **OUI.**
> Témoins ⑬ et ⑮ : T1 et T2 valides ensemble ; révoquer T1 laisse **T2 intact**.

### 6. Peut-on construire S2 puis S3 sans réécrire le modèle d'identité ?
> ## **OUI** — avec un point de bascule chiffré.
> La forme est une **ligne plate** `haché → {compte, date, état}`, qui se transpose telle quelle en
> table Supabase, et le Worker possède déjà **un** point de résolution d'identité (`_identiteIA`).
> ⚠️ Ce qui **devra** bouger en S2 n'est pas le modèle mais son **support** : **23,5 % du réservoir
> à 1 000 jetons**. *C'est une migration de stockage, pas une réécriture de S1.*
