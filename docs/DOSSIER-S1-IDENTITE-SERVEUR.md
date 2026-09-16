# 🪪 DOSSIER S1 — IDENTITÉ SERVEUR MINIMALE

> **16/09/2026 · ÉTAPE 1 TERMINÉE (audit + conception + témoins). ⛔ ARRÊT AVANT MUTATION.**
> Michel : *« SI UNE DÉCISION PRODUIT EST NÉCESSAIRE : STOP. Ne décide pas à la place de Michel »* —
> et il nomme lui-même quatre de ces décisions : **comptes sans code · durée de vie du jeton ·
> multi-appareil · récupération après perte**. Ce sont exactement les quatre paramètres qui
> déterminent le code à écrire. Je ne peux donc pas implémenter sans lui.
>
> Départ : `cb3a90a3`, servie **`ft-v1215`**, arbre propre, **0 commit concurrent**.
> ⛔ **Aucun fichier servi modifié. `sw.js` non incrémenté. Nutrition : 0 ligne.**

---

## ⭐ LA BONNE NOUVELLE D'ABORD : LE POINT BLOQUANT N'EST PAS BLOQUÉ

Michel demandait d'arrêter *« si aucune preuve fiable n'existe pour les comptes sans code »*.

**Une preuve existe, elle est déjà déployée, et elle est correctement bornée** — la vérification
d'adresse e-mail (`sendConfirmCode` / `verifyConfirmCode`), mesurée dans `Code.js` :

| garde-fou | valeur lue dans le code |
|---|---|
| essais avant destruction du code | **5**, puis l'entrée est **supprimée** |
| expiration | **15 minutes** |
| anti-renvoi | **60 s** par adresse |
| plafond d'envois | **80 / jour**, global |

👉 Force brute : ~80 codes/jour × 5 essais = **400 tentatives/jour contre 10⁶** — négligeable.

⚠️ **UNE FAIBLESSE À CORRIGER SI CE CHEMIN DÉLIVRE UN CREDENTIAL** : le code de confirmation est
produit par **`Math.random()`** (`Code.js:1784`) — précisément ce que Michel interdit pour un
credential. Ce n'est pas critique aujourd'hui (les bornes ci-dessus font le travail), mais **le jour
où ce code devient la porte d'entrée d'un jeton, il devient un maillon de la chaîne d'identité** et
doit passer à une primitive cryptographique. *Figé par le témoin ⑨.*

**Donc le bootstrap est possible pour TOUS les comptes.** Ce qui reste à trancher n'est pas
*« peut-on ? »* mais *« qu'arrive-t-il à quelqu'un qui n'a pas encore fait le geste ? »*.

---

## 1-2. ARCHITECTURE ET FAILLES AVANT (relues dans le code servi)

| flux | données envoyées | preuve **réellement** vérifiée | identité côté serveur |
|---|---|---|---|
| **lecture compte** (`loadProfile`) | email + `authCode` | ⭐ **code perso obligatoire** ; sans code → **refus** | l'e-mail, mais **prouvé** |
| **écriture compte** (`saveProfile`) | email + `authCode` + tout le profil | ⛔ **AUCUNE si le compte n'a pas de code** | **l'e-mail déclaré** |
| **santé** (`pushHealth`) | email + `authCode` + bilans | ⛔ **idem** | **l'e-mail déclaré** |
| **miroir** (`ft_miroir`) | `p_email` + payload complet | ⛔ **aucune** (clé publiable) | **l'e-mail déclaré** |
| **appels IA** (Worker) | email + contexte | ⛔ **en-tête `Origin` seul** | **l'e-mail déclaré** |
| **quota IA** | email | ⛔ aucune | **l'e-mail déclaré** |
| **Premium** | — | ⭐ **état serveur uniquement** | serveur |
| **routes admin** | jeton | ⭐ **jeton serveur, fail-closed** | serveur |
| **pose d'un code** (`setAccessCode`) | email + code e-mail | ⭐ **vérification e-mail** | prouvé |

⭐⭐ **Deux propriétés valent d'être notées, parce qu'elles sont DÉJÀ correctes** et que S1 ne doit
pas les casser : le serveur **ne lit jamais** un `premium` fourni par le client (mesuré : 0
occurrence de `body.premium`), et la **lecture** est déjà fermée. *Le test « Free + `premium:true`
→ reste Free » passe donc déjà aujourd'hui.*

---

## 3-4. ARCHITECTURE APRÈS, ET LE CREDENTIAL RETENU

```
CLIENT  (PWA / Android / iOS — à considérer comme ENTIÈREMENT PUBLIC)
   │   deviceToken : 256 bits, crypto.getRandomValues, jamais dérivé de l'e-mail
   ▼
WORKER  vérifie le jeton → déduit lui-même accountId → quota, Premium, autorisation
   ├──► Anthropic
   └──► Apps Script  (qui vérifie le même jeton pour les écritures sensibles)
```

**Credential proposé** — `deviceToken` :

| exigence de Michel | réponse |
|---|---|
| forte entropie, primitive standard | `crypto.getRandomValues(new Uint8Array(32))` — **256 bits** |
| ⛔ jamais `Math.random()` | respecté côté client **et** côté serveur à l'émission |
| non dérivé de l'e-mail | ✅ aléatoire pur |
| individuel, révocable, renouvelable | ✅ une ligne par jeton |
| multi-appareils | ✅ **N jetons par compte**, jamais `1 compte = 1 jeton` |

**Stockage serveur : le HACHÉ, jamais le brut.** `SHA-256(token)` suffit ici — contrairement à un
mot de passe, un jeton de 256 bits n'est pas devinable, donc ni sel ni dérivation lente ne sont
nécessaires. ⭐ Et le haché est **directement une clé de recherche** : `tok_{sha256}` → `{accountId,
créé, dernierUsage, libellé, révoqué}`. **Une fuite de base ne donne aucun jeton utilisable.**

**Stockage client** : `localStorage` aujourd'hui (même famille que `ft4_authcode`, déjà en place).
⚠️ **Limites à dire franchement** : une **XSS** le lit ; un **vidage du navigateur** l'efface ; un
**changement de navigateur** ne le transporte pas ; un **téléphone perdu** le laisse dans la nature
jusqu'à révocation. Plus tard : **Keystore** (Android) et **Keychain** (iOS) — ⛔ rien de natif
maintenant.

---

## 5. IDENTITÉ CANONIQUE — recommandation : **pas d'`accountId` maintenant**

Introduire un `accountId` obligerait à migrer **toutes** les clés existantes (`u_{email}`,
`h_{email}`, `auth_{email}`, `prem_{email}`, le Sheet, le miroir, les sauvegardes Drive). C'est
exactement la *« migration disproportionnée »* que Michel dit de ne pas forcer.

👉 **Le jeton porte l'identité ; l'e-mail reste la clé de stockage, mais cesse d'être une preuve.**
La table des jetons est le point d'indirection : le jour où un `accountId` arrivera, seule elle
changera. *On prépare la transition sans la payer maintenant.*

---

## 6. CE QUE S1 FERME — ET CE QU'IL NE FERME PAS

| | après S1 |
|---|---|
| Worker : `Origin` seul suffit | ⛔ **non** — jeton exigé, `Origin` redevient un contrôle secondaire |
| écriture compte / `pushHealth` avec l'e-mail d'un autre | ⛔ **non** — jeton exigé |
| quota IA indexé sur l'e-mail déclaré | ⛔ **non** — indexé sur l'identité du jeton |
| `premium:true` dans le payload | ⭐ déjà sans effet **aujourd'hui** |
| **`ft_miroir` (`p_email` libre)** | ⚠️ **`V2 RESTE OUVERTE JUSQU'À S2`** |

⛔⛔ **Et je ne prétends pas fermer Supabase.** Le miroir est appelé **depuis le navigateur**, pas
depuis le Worker (0 occurrence de Supabase dans `worker.js`). Le fermer imposerait de faire passer
l'écriture par le Worker — c'est-à-dire **S2**. *Dire « fermé » sans cette mesure serait
exactement ce que Michel interdit.*

---

## 7. ⛔⛔ LES QUATRE DÉCISIONS QUI T'APPARTIENNENT

### Décision 1 — que fait-on des comptes existants **sans code** ? (la seule vraiment lourde)

Le bootstrap existe (vérification e-mail). La question est : **que se passe-t-il entre-temps ?**

| | comportement | risque | coût utilisateur |
|---|---|---|---|
| **A — fail-closed tout de suite** | toute écriture sensible refusée tant que le jeton n'est pas obtenu | ⭐ la faille ferme **le jour même** | ⚠️ la **sauvegarde cloud** s'arrête pour ces comptes jusqu'au geste ; ⭐ **aucune séance n'est perdue** (local-first), mais le filet est suspendu |
| **B — fenêtre de transition** | on accepte encore l'ancien chemin pendant N jours, en le **journalisant** | ⚠️ la faille reste ouverte N jours | ⭐ personne n'est interrompu ; on **mesure** combien de comptes restent à migrer |
| **C — bootstrap silencieux au 1ᵉʳ appel** | le serveur émet un jeton à qui présente l'e-mail | ⛔⛔ **exactement la faille actuelle avec un jeton par-dessus** — Michel l'interdit | — |

⭐ **Ma recommandation : B, avec une date de bascule décidée à l'avance et un compteur.** Raison :
**A oppose S1 à la règle d'or n°3**. Local-first fait qu'aucune séance n'est perdue, mais couper le
cloud à quelqu'un qui ne sait pas encore qu'il doit agir, c'est retirer son filet sans prévenir.
**B ferme la même faille, un peu plus tard, en sachant combien de gens restent dehors.** ⛔ **C est
exclu.**

### Décision 2 — durée de vie du jeton
⭐ **Recommandation : pas d'expiration, mais une révocation.** Un jeton qui expire déconnecte
quelqu'un en pleine salle — pour un gain faible puisqu'il est déjà aléatoire et révocable.
*Alternative si tu préfères : expiration longue (1 an) avec renouvellement silencieux.*

### Décision 3 — multi-appareil
⭐ **Recommandation : N jetons par compte dès le départ** (le schéma le permet sans surcoût), avec un
écran « mes appareils » **plus tard**. ⛔ Ne jamais figer `1 compte = 1 jeton` : ce serait à refaire.

### Décision 4 — récupération après perte du jeton
⭐ **Recommandation : le même chemin que le bootstrap** — vérification e-mail (ou code perso si le
compte en a un) → nouveau jeton, l'ancien restant révocable. ⛔ Pas de second mécanisme : *une
deuxième porte de récupération est une deuxième porte d'entrée.*

---

## 8. TESTS PRÉVUS (écrits, **non exécutés** — ils supposent la mutation)

**A/B** : `token A + email A → A` · `token B + email B → B` · **`token A + email B → JAMAIS B`** ·
`token B + email A → JAMAIS A` · absent / invalide / aléatoire / révoqué → **refus**.
**Worker** : `Origin` GitHub sans jeton → **refus** · faux `Origin` sans jeton → refus · `curl` avec
bon `Origin` → **ne suffit plus** · jeton A + payload B → **jamais B**.
**Premium** : Free + `premium:true` → reste Free (⭐ **passe déjà**). **Données** : A écrit A ✅ ·
A écrit B ⛔ · A `pushHealth` B ⛔.
**Hors interface** : requête HTTP directe, faux `Origin`, faux e-mail, faux jeton, rejeu.

⚠️ **Ces tests demandent deux comptes réels sur le backend déployé.** Depuis ce conteneur, Apps
Script et Supabase sont **injoignables** (proxy) — ils devront tourner ailleurs, ou contre un
déploiement de test. *Le dire maintenant évite de découvrir à la fin qu'on ne peut pas mesurer.*

---

## 9. PERFORMANCE — ce que S1 coûtera, et ce que je ne peux pas encore chiffrer

| | attendu |
|---|---|
| taille du credential | **32 octets** (64 en hexadécimal) — négligeable dans un payload de ~79 Ko |
| appels réseau supplémentaires côté client | **0** — le jeton voyage dans les requêtes existantes |
| Worker → validation | **+1 aller-retour Apps Script** sur le chemin critique, **sauf** si le jeton est validé par un HMAC vérifiable localement |
| Apps Script | +1 lecture de propriété par écriture sensible |

⭐⭐ **Et c'est là que se joue la performance** : un jeton **opaque** impose une consultation à chaque
appel IA ; un jeton **signé** (HMAC avec le secret du Worker) se vérifie **sans aucun aller-retour**
— au prix d'une révocation moins immédiate. ⛔ **Non tranché, et non mesurable d'ici** : Apps Script
est injoignable depuis ce conteneur. *Je ne dirai pas « négligeable » sans chiffre* — la mesure se
fera sur le Worker déployé, avant de figer le choix.

---

## 10. TÉMOINS POSÉS AUJOURD'HUI — bloc `B-CCCXIII`, 10 témoins

Conformément au protocole (*« créer témoins du comportement actuel »*) :

- **① à ④ épinglent les DÉFAUTS** (écriture sans code · Worker sans credential · `p_email` libre ·
  quota sur l'e-mail). ⛔ **Ils DOIVENT rougir le jour où S1 les corrige** — chacun porte la consigne
  de le *retourner*, pas de le supprimer. *Un témoin qui disparaît ne laisse aucune trace de la
  décision* (**R30**).
- **⑤ à ⑦ épinglent des PROPRIÉTÉS À PRÉSERVER** : aucun `premium` client lu, lecture fermée, code
  perso haché+salé. *S1 ne doit pas les casser en chemin.*
- **⑧ et ⑨ épinglent le BOOTSTRAP** et sa faiblesse (`Math.random()`).
- **⑩ épingle le périmètre Nutrition.**

---

## 11. LIMITES RESTANTES ET PROCHAINES ÉTAPES

⚠️ **`V2 RESTE OUVERTE JUSQU'À S2`** — `ft_miroir` garde son `p_email` libre.
⚠️ Le choix **jeton opaque vs jeton signé** attend une mesure de latence réelle.
⚠️ Les tests A/B demandent un backend joignable.
⛔ **Non fait, volontairement** : S2 Supabase · S3 idempotence · `deleteAccount` · migration cloud ·
paiement stores · `accountId`.

**Prochaine étape : tes quatre réponses.** Avec elles, l'implémentation est directe — le schéma, le
credential, le stockage et les tests sont déjà arrêtés ci-dessus.

---

## QUESTIONS FINALES — réponses mesurées

### Question 1 — un client modifié connaissant un e-mail peut-il encore usurper ?
> ## **OUI** — inchangé.
> S1 n'est **pas** implémenté. Mesuré et figé par les témoins ① à ④ : `_authCheck_` rend toujours
> `{ok:true, opted:false}` pour un compte sans code, et `ft_miroir` reçoit toujours un `p_email`
> libre.

### Question 2 — peut-on consommer l'IA payée par Michel sans credential ?
> ## **OUI** — inchangé.
> Le Worker n'exige aucun credential (témoin ②) : `Origin` reste son seul verrou, et un en-tête se
> forge. Borné par le plafond global de **600 appels/jour**.

### Question 3 — pourra-t-on bâtir S2 puis S3 sur cette identité sans réécrire S1 ?
> ## **PARTIEL** — la conception le permet, mais elle n'est pas figée.
> ⭐ Ce qui est déjà sûr : la **table de jetons** est le point d'indirection qui rend un futur
> `accountId` indolore, et **N jetons par compte** évite le cul-de-sac `1 compte = 1 jeton`.
> ⚠️ Ce qui reste ouvert : **opaque vs signé** change la façon dont S2 et S3 vérifieront l'identité.
> *Trancher ce point après la mesure de latence, avant d'écrire la première ligne.*
