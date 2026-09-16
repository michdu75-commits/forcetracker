# 🔐 AUDIT SÉCURITÉ / BACKEND / SUPABASE — Force Tracker

> **15/09/2026 · AUDIT SEUL.** Aucune table, aucune RPC, aucune policy, aucune clé, aucun secret,
> aucun code servi, aucun déploiement, aucune migration. **Miroir intact. Worker intact.**
> `origin/master` au début de l'audit : **`6e6026e7`**.
>
> ⚠️ **Tous les faits ci-dessous sont relus dans le code**, jamais repris des audits précédents.
> Ce qui n'est pas vérifiable depuis le dépôt est marqué **`À VÉRIFIER EN CONSOLE`** et non deviné.

---

## A. RÉSUMÉ EXÉCUTIF

Force Tracker a **déjà fait un vrai travail de sécurité**, et il faut le dire avant les défauts :
la lecture des comptes a été fermée (`LECTURE_STRICTE`, 07/08), les codes persos sont **hachés et
salés**, une **limite anti-force-brute** existe, l'injection de formule Sheets est neutralisée, le
webhook Ko-fi est **fail-closed**, le journal d'usage IA **ne stocke aucun e-mail**, et un **test
permanent** vérifie qu'aucun secret ne part dans les fichiers servis. **Aucun secret réel n'est
présent aujourd'hui, ni dans l'historique Git** (vérifié : les `sk-ant-` trouvés sont un *motif de
détection*, pas une clé).

**Le défaut structurant est unique et il explique presque tous les autres : il n'y a pas
d'identité.** Partout — Apps Script, miroir Supabase, Worker — un **e-mail fourni par le client**
est traité comme une **identité authentifiée**. Conséquences mesurées : n'importe qui connaissant
une adresse peut **écraser** le compte Apps Script d'autrui (si ce compte n'a pas posé de code) et
**écraser sa ligne miroir** Supabase ; et le seul verrou du Worker est un en-tête **`Origin`**,
forgeable en une ligne de `curl` — c'est-à-dire que la porte qui protège le portefeuille de Michel
**n'en est pas une**. Le risque financier reste **borné par le plafond global de 600 appels/jour**,
qui est aujourd'hui la seule protection réelle.

Deux autres points bloqueraient une publication grand public : des **adresses e-mail réelles sont
publiées dans le dépôt public**, et les **sauvegardes Drive s'accumulent sans purge** — donc *« supprime
toutes mes données »* est aujourd'hui **impossible à honorer**.

👉 **Rien de tout cela n'empêche l'app de fonctionner. C'est précisément le piège** : *une fonction
peut marcher parfaitement et être mal sécurisée.*

---

## B. ARCHITECTURE ACTUELLE (flux réels)

```
NAVIGATEUR (PWA, code public)
   │
   ├── saveProfile / loadProfile ─────────────► APPS SCRIPT  (URL publique dans constants.js)
   │        identité = email + authCode OPTIONNEL       └─► Script Properties  u_{email} · h_{email}
   │                                                    └─► Google Sheet (5 onglets)
   │                                                    └─► Drive : backup-AAAA-MM-JJ.json (2 h, quotidien)
   │
   ├── sbMirror(_corpsSync) ──────────────────► SUPABASE  /rest/v1/rpc/ft_miroir
   │        identité = clé PUBLIABLE + p_email libre     └─► ft_comptes  (écriture seule)
   │
   └── actions IA ────────────────────────────► CLOUDFLARE WORKER
            identité = en-tête Origin UNIQUEMENT          ├─► api.anthropic.com
                                                          └─► relais générique vers APPS SCRIPT
```

⛔ **Le Worker ne connaît pas Supabase** (0 occurrence). ⛔ **L'app ne relit rien de Supabase.**

---

## C. DONNÉES STOCKÉES

| donnée | où | hors du téléphone ? | vers qui | durée |
|---|---|---|---|---|
| séances, records, poids, sommeil | `localStorage` + cloud | oui | Apps Script · **Supabase** · Drive | illimitée |
| `registre` (faits **et observations**), `adn` | idem | **oui** | idem | illimitée |
| **`coachMemory`** (ce que Milo retient de la personne) | idem | **oui** | idem | illimitée |
| **fil de conversation Milo** (`ft4_coach_hist`) | téléphone **uniquement** | ⛔ **non** | — | jusqu'au vidage du cache |
| **santé** : bilans sanguins, bilans corporels, cycle, TRT | `h_{email}` (séparé de `u_` depuis le 01/09) | oui | Apps Script · **Drive** | illimitée |
| photos corporelles | téléphone | non (hors envoi ponctuel à l'IA) | — | — |
| journal d'usage IA | Apps Script | — | — | agrégé par jour, **sans e-mail** ⭐ |

⚠️ **Écart entre ce qu'on croit et ce que le code fait** : la règle *« le fil Milo reste sur le
téléphone »* est **vraie** — mais elle ne couvre que le fil brut. **`coachMemory`, `registre` et
`adn` partent déjà** vers Apps Script **et** Supabase **et** Drive. *La frontière n'est pas où on la
croit.*

---

## D. AUTHENTIFICATION — le cœur du sujet

| action | identité vérifiée ? | comment | risque |
|---|---|---|---|
| `loadProfile` (lecture compte) | ✅ **oui** | code perso obligatoire (`_lectureAutorisee_`) ; sans code → **refus** | faible ⭐ |
| **`saveProfile` (écriture compte)** | ⛔ **NON si le compte n'a pas de code** | `_authCheck_` rend `{ok:true, opted:false}` | 🔴 **écrasement inter-comptes** |
| `pushHealth` (santé) | ⛔ idem | `_authCheck_` | 🔴 idem |
| **`ft_miroir` (Supabase)** | ⛔ **NON** | clé publiable + `p_email` **libre** | 🔴 écrasement de la ligne miroir |
| **Worker (tous appels IA)** | ⛔ **NON** | en-tête **`Origin`** seul | 🟠 dépense aux frais de Michel |
| Premium | ⚠️ partiel | serveur = `PREMIUM_HARDCODED_` + propriétés ; **client = `localStorage`** | 🟠 falsifiable côté client |
| quotas IA gratuits | ⛔ **NON** | compteurs **locaux** (`coachFree`, `foodAiUses`) | 🟠 contournables |
| routes admin | ✅ **oui** | jeton serveur, **fail-closed**, jamais dans le code servi | faible ⭐ |

⭐ **Le projet a lui-même écrit le diagnostic**, dans `Code.js` : *« l'email est usurpable »* et
*« un secret distribué avec le client n'est pas un secret »*. **Ces deux phrases résument l'audit.**

---

## E. SUPABASE

| | état lu dans le code |
|---|---|
| table | `ft_comptes` |
| RPC | `ft_miroir(p_email, p_data)`, **`SECURITY DEFINER`** |
| clé servie au navigateur | **publiable** (`sb_publishable_…`), **assumée publique** |
| droits de cette clé | ⭐ **aucun droit sur la table** — elle ne peut qu'**exécuter la fonction** |
| lecture | ⭐ **impossible par tous les chemins** |
| RLS, GRANT, autres tables, vues | ⛔ **non vérifiables depuis le dépôt** → `À VÉRIFIER EN CONSOLE` |

⛔ **`SECURITY DEFINER` est exactement le motif qui mérite une vérification** : la fonction s'exécute
avec les droits de son **propriétaire**. Son `search_path` et les privilèges de ce propriétaire
**ne sont pas lisibles ici** — s'ils sont larges, la fonction est un pont potentiel vers autre chose
que la table prévue. **`À VÉRIFIER EN CONSOLE`.**

**Verdict `ft_miroir` : 🟠 FRAGILE — acceptable aujourd'hui, à ne PAS étendre.**
Sûr sur un point décisif (aucune lecture possible), mais : `p_email` **libre**, **aucune**
vérification d'identité, **aucune** limite de taille ni de structure, **aucun** rate-limit.
👉 *Tel quel, ce motif ne doit jamais servir à une donnée qu'on peut RELIRE.*

---

## F. WORKER

- **Seul contrôle : `Origin === 'https://michdu75-commits.github.io'`.**
  ⛔ **Un en-tête n'est pas une preuve** : `curl -H "Origin: …"` passe. Le commentaire du code dit
  *« Origine absente (curl/scripts) → refus »* — c'est vrai pour un script naïf, **faux pour un
  attaquant**.
- Plafond : `_plafondAtteint()`, **approximatif par construction** (mémoire d'isolat, plusieurs
  isolats) — le code le dit lui-même.
- ⭐ La vraie borne est le **plafond global Apps Script : 600 appels/jour**.
- Le Worker **relaie toute action inconnue** vers Apps Script — surface large, mais l'URL Apps
  Script est déjà publique, donc **pas d'exposition nouvelle**.
- Secrets : `ANTHROPIC_API_KEY`, `FT_COUNT_TOKEN`. ⭐ **Aucun n'est renvoyé au client.**

---

## G. APPS SCRIPT

⭐ **Points forts réels** : lecture fermée par défaut · codes persos **salt + SHA-256**, jamais en
clair · **20 essais ratés/jour/compte** · `_safeCell_` neutralise l'injection de formule ·
routes admin **fail-closed** · Ko-fi **fail-closed**.

⚠️ **Points faibles** : l'écriture reste ouverte (**décision assumée**, règle d'or #3) ·
`_authCheck_` est **fail-open sur exception** (`catch → {ok:true}`) · Script Properties plafonnées à
**512 000 octets**, **déjà atteintes à 102 %** le 29/07 avec **deux jours d'écritures perdues en
silence** — c'est un risque de **disponibilité**, pas de confidentialité, mais il est réel.

---

## H. SAUVEGARDES / RESTAURATION — et le problème de la suppression

**Quatre copies** : téléphone → Apps Script (source de vérité) → Supabase (miroir, écriture seule)
→ **Drive** (`backup-AAAA-MM-JJ.json`, quotidien à 2 h, **tous les comptes dans un seul fichier**).

⛔⛔ **Aucune purge n'existe** : les fichiers de sauvegarde **s'accumulent indéfiniment**.

> ### Réponse à la question de Michel : **NON, nous ne savons pas supprimer toutes les copies.**
> Une suppression devrait couvrir : `localStorage` · `u_{email}` · **`h_{email}`** · les 5 onglets du
> Sheet · **chaque fichier Drive quotidien** · la ligne `ft_comptes` Supabase · les journaux.
> **Tant que les sauvegardes Drive ne sont pas purgées, toute donnée supprimée RESSUSCITE** à la
> première restauration.

⛔ **Aucune route `deleteAccount` n'existe** — vérifié, la suppression est manuelle.

---

## I. IA / ENDPOINTS FINANCIÈREMENT DANGEREUX

| ce qu'un bot peut faire | coûte de l'argent ? |
|---|---|
| appeler le Worker avec un `Origin` forgé | ⛔ **OUI** |
| épuiser les 25 essais gratuits d'un autre | non (compteur **local**) |
| se déclarer Premium (`localStorage`) | non côté serveur — **mais le Worker ne vérifie pas Premium** |
| brûler le quota d'un e-mail usurpé | oui, **jusqu'à 50/jour** |
| brûler le plafond **global** | ⛔ **OUI — 600 appels/jour** |

**Estimation du pire cas** (tarifs lus dans `tests/milo/eval.js`, tailles mesurées en 1bis) :
600 × ~0,01 à 0,07 € ≈ **6 à 40 € par jour**. ⚠️ **Estimation, pas une facture.**

⭐ **Le plafond global est donc la seule chose qui sépare aujourd'hui Michel d'une facture ouverte.**

---

## J. PREMIUM

Serveur : `PREMIUM_HARDCODED_` (immune aux déclencheurs) + propriétés datées + codes + Ko-fi
**fail-closed**. Client : `S.premium` lu dans `localStorage` → **falsifiable**, mais cela ne fait que
retirer un compteur local. ⚠️ **Le Worker ne vérifie Premium nulle part** : l'accès à l'IA ne dépend
donc pas du statut payant. **À reprendre avant toute facturation via les stores.**
⚠️ **Rejeu Ko-fi** : `kofi_transaction_id` **n'est pas utilisé pour dédupliquer** — un webhook valide
rejoué **prolongerait** un abonnement. Impact faible (il faut le jeton serveur), mais réel.

---

## K. SECRETS

✅ **Aucun secret réel dans les fichiers servis.** ✅ **Aucun dans l'historique Git** — les `sk-ant-`
trouvés sont **un motif de détection** dans le banc de tests, pas une clé. ✅ Un **test permanent**
refuse toute fuite (`FT_IDEES_2026`, jeton de sauvegarde, `sk-ant-`, **`service_role`**).
✅ Le jeton admin a été **sorti du frontend** (commit dédié). ⚠️ La clé Supabase publiable est dans le
dépôt — **c'est assumé et correct** (elle n'ouvre que la fonction).
🟠 **Mais des adresses e-mail réelles sont publiées** dans un dépôt public (listes premium, testeurs,
développement). *Ce n'est pas un secret technique, c'est une donnée personnelle — et c'est la
matière première de l'usurpation décrite en D.*

---

## L. LOGS

⭐ **Bonne hygiène, mesurée** : `aiUsageLog` n'enregistre **que** action, modèle et jetons — **aucun
e-mail, aucun contenu**. `mailFails` ne garde qu'un libellé et un message d'erreur.
⚠️ `À VÉRIFIER EN CONSOLE` : les journaux **Cloudflare** et **Apps Script** (`Logger.log`) peuvent
contenir des charges utiles complètes — non vérifiable depuis le dépôt.

---

## M. THREAT MODEL

| scénario | aujourd'hui |
|---|---|
| A lit le compte de B | ✅ **refusé** (lecture stricte) |
| **A écrase le compte de B** | ⛔ **RÉUSSIT** si B n'a pas posé de code |
| **A écrase la ligne miroir de B** | ⛔ **RÉUSSIT** |
| A lit la sauvegarde de B | ✅ refusé |
| A modifie son Premium (serveur) | ✅ refusé |
| A modifie son Premium (affichage) | ⛔ réussit, sans effet serveur |
| **A dépense l'IA aux frais de Michel** | ⛔ **RÉUSSIT**, borné à 600/jour |
| Attaquant sans compte, `curl` + `Origin` forgé | ⛔ **passe le Worker** |
| Attaquant avec la clé publiable | écrit dans le miroir, **ne lit rien** ✅ |
| Client modifié / app décompilée | ⛔ **aucune sécurité ne survit** — tout est côté client |

⭐ **Ce qui tient** : la **lecture**. ⛔ **Ce qui casse** : l'**écriture** et la **dépense**.

---

## N. VULNÉRABILITÉS CLASSÉES

### 🔴 CRITIQUE

**V1 — Écrasement de compte entre utilisateurs (Apps Script).**
*Preuve* : `_authCheck_` rend `{ok:true, opted:false}` quand `auth_{email}` n'existe pas ;
`saveProfile` et `pushHealth` s'arrêtent là. *Scénario* : POST sur l'URL publique avec l'e-mail de
quelqu'un → son compte et ses données de santé sont remplacés. *Impact* : perte de données d'autrui.
*Correctif minimal* : exiger une identité pour toute écriture. *Architectural* : identité serveur (S1).

**V2 — Écrasement de la ligne miroir (Supabase).** Même cause, déjà documentée en ft-v772.
*Impact* aujourd'hui limité (aucune lecture) — ⛔ **mais interdit d'étendre ce motif à une donnée
relisible**, ce qui est exactement ce que l'idempotence du débrief demanderait.

### 🟠 ÉLEVÉ

**V3 — Le verrou du Worker est un en-tête `Origin`.** Forgeable ; le contrôle est **inopérant**.
Risque borné à 600 appels/jour ⇒ **6 à 40 €/jour** estimés. **Devient CRITIQUE le jour où le plafond
monte.**
**V4 — Aucune vérification Premium côté serveur** pour l'accès à l'IA.
**V5 — Adresses e-mail réelles publiées** dans le dépôt public.
**V6 — Suppression de compte impossible à honorer** : sauvegardes Drive sans purge, pas de
`deleteAccount`.

### 🟡 MOYEN

**V14 — ⭐ deux plafonds contradictoires, trouvés par un garde de ce dossier.** `AI_GLOBAL_MAX` a **deux valeurs par défaut différentes** : **600** dans `_aiQuotaBlock_` (la fonction qui **bloque**, `Code.js:1013`) et **1500** dans la route qui **affiche** l'état à l'Admin (`Code.js:633`). Tant que la Script Property n'est pas posée, **le panneau annonce un plafond 2,5× plus haut que celui qui s'applique**. *Ce n'est pas une faille, c'est une source de décision fausse* — et c'est exactement la famille « deux sources qui se contredisent » de `BUGS.md` (**R2**). ⚠️ Le risque concret : lire « 1500 » et croire qu'il reste de la marge.

**V7** — `_authCheck_` **fail-open sur exception**. **V8** — rejeu Ko-fi non dédupliqué.
**V9** — quotas gratuits purement locaux. **V10** — Script Properties 512 Ko, déjà saturées une fois
(disponibilité). **V11** — `search_path` et privilèges du propriétaire de `ft_miroir` **inconnus**.

### ⚪ FAIBLE

**V12** — relais générique du Worker. **V13** — journaux Cloudflare/Apps Script non audités.

---

## O. ARCHITECTURE CIBLE

```
CLIENT (à considérer comme entièrement public, PWA comme natif)
   │  jeton d'appareil signé par le serveur, renouvelable, révocable
   ▼
WORKER  (seul détenteur des secrets ; valide le jeton ; applique quotas et Premium)
   ├──► Anthropic
   └──► SUPABASE via RPC dédiées et bornées (jamais de droits de table)
```

**Moindre privilège** : le **frontend** n'a qu'une clé publique sans droit de lecture ; le **Worker**
détient les secrets et n'en renvoie aucun ; **Supabase** n'expose que des fonctions précises, tables
sensibles inaccessibles en direct, RLS stricte. ⛔ **Pas de `service_role` si une RPC bornée suffit.**

**Options d'authentification**

| | migration | sécurité | multi-appareils | récupération | verdict |
|---|---|---|---|---|---|
| **A — jetons serveur ajoutés à l'existant** | ⭐ **faible, progressive** | bonne | à construire | e-mail existant | ⭐ **recommandé pour démarrer** |
| **B — Supabase Auth** | lourde | **la meilleure** | natif | natif | cible à terme |
| **C — statu quo** | nulle | ⛔ insuffisante | — | — | ⛔ à exclure |

👉 **A puis B** : A ferme les failles sans tout réécrire et **n'est pas jetable** — les jetons
restent utiles sous Supabase Auth.

---

## P. PLAN PAR PETITES PHASES

- **S0** — *décider* : l'écriture doit-elle rester ouverte ? (règle d'or #3 **contre** V1).
- **S1** — **identité serveur minimale** : jeton d'appareil exigé par le Worker **et** pour toute
  écriture. ⭐ *Ferme V1, V2, V3, V4 d'un seul geste.*
- **S2** — Supabase : schéma/tables bornés, RLS vérifiée, RPC dédiées, **pas de `service_role`**.
- **S3** — **idempotence du débrief** (le chantier en attente).
- **S4** — `deleteAccount` + purge des sauvegardes Drive + cycle de vie des données.
- **S5** — durcissement avant Android/iOS · retrait des e-mails du dépôt public.

---

## Q. TESTS À PRÉPARER (non exécutés — ils toucheraient la production)

Deux comptes A et B : A lit/modifie A ✅ · A lit/modifie B ⛔ · A appelle `ft_miroir` avec l'e-mail
de B ⛔ · `anon` lit une table sensible ⛔ · `curl` sans jeton valide sur le Worker ⛔ · rejeu d'une
requête de sauvegarde ⛔ · quota contourné en appelant le Worker directement ⛔.
⚠️ **À jouer sur un projet Supabase de test**, jamais sur la production.

---

## R. DÉCISIONS QUI APPARTIENNENT À MICHEL

1. **L'écriture doit-elle rester ouverte ?** La règle d'or #3 (« zéro perte ») l'a justifiée ; elle
   est aussi la cause de V1. *C'est un arbitrage produit, pas technique.*
2. **Retirer les adresses e-mail du dépôt public** (V5) — touche `constants.js` et `Code.js`.
3. **Purger les sauvegardes Drive** et accepter une rétention bornée (V6).
4. **Premium doit-il devenir une vérité serveur** avant les stores ? (V4)
5. **Relever ou non le plafond de 600/jour** — aujourd'hui c'est le seul pare-feu financier.

## S. À VÉRIFIER DANS LES CONSOLES

**Supabase** : tables du schéma `public` · exposition API · GRANT par rôle · RLS activée table par
table · policies réelles · vues · **`search_path` et privilèges du propriétaire de `ft_miroir`** ·
plan et quotas.
**Cloudflare** : contenu des journaux · secrets présents · plan.
**Google** : contenu de `Logger.log` · taille du dossier de sauvegardes · partage du Drive et du Sheet.

---

## 28. LES CINQ CHOSES QUE JE REFUSERAIS DE PUBLIER EN L'ÉTAT

1. ⛔ **L'écriture de compte sans identité** (V1) — n'importe qui écrase les données de n'importe qui.
2. ⛔ **Le verrou `Origin` du Worker** (V3) — un contrôle qu'une ligne de `curl` traverse, devant une
   dépense réelle.
3. ⛔ **L'impossibilité de supprimer un compte** (V6) — des sauvegardes sans purge font **ressusciter**
   ce qu'on a effacé.
4. ⛔ **Les adresses e-mail réelles dans un dépôt public** (V5).
5. ⛔ **`ft_miroir` avec un `p_email` libre** (V2) — inoffensif tant qu'on ne lit rien, **inacceptable
   dès qu'on relit**.

## LA PREMIÈRE CORRECTION, AVANT DE REPRENDRE L'IDEMPOTENCE

> ### **Une identité serveur minimale — un jeton d'appareil que le Worker exige.**

Ce n'est pas un détour : **l'idempotence du débrief se construit exactement dessus.** Une clé
d'idempotence dérivée d'un `email` que le client fournit librement serait posée sur du sable — on
bâtirait la déduplication sur la faiblesse même que cet audit vient de mesurer. *Et c'est le projet
qui l'a écrit le premier : « l'email est usurpable ».*

⭐ Bonus mesuré : ce même jeton ferme **V1, V2, V3 et V4** — c'est le geste au meilleur rendement de
tout le plan.
