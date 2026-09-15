# 🗄️ Supabase peut-il porter l'idempotence du débrief ?

> **15/09/2026 · AUDIT SEUL.** Aucune table, aucune RPC, aucune RLS, aucune clé, aucun déploiement,
> aucun changement de code servi, **le miroir existant n'est pas touché**, `sw.js` non incrémenté.

## ⭐ RÉPONSE À LA QUESTION FINALE

> **OUI — techniquement, Supabase est la meilleure des quatre options**, et de loin : PostgreSQL est
> le seul des quatre à offrir une atomicité **prouvable en une seule instruction**.
>
> ⚠️ **Mais « Supabase existe déjà » est en partie trompeur** : ce qui existe est un chemin
> **navigateur → Supabase, en écriture seule**. Pour l'idempotence il faut un chemin **Worker →
> Supabase**, qui **n'existe pas** : le Worker ne connaît pas Supabase (0 occurrence), et il faudra
> **une nouvelle clé serveur**. Le projet existe ; l'accès, lui, est à créer.

---

## 1. Architecture Supabase actuelle — lue, pas supposée

| fait | source |
|---|---|
| projet configuré, URL + clé **publiable** en dur | `supabase.js:46-47` |
| table **`ft_comptes`**, fonction **`ft_miroir(p_email, p_data)`** | `supabase.js:62-65` |
| le navigateur appelle **`/rest/v1/rpc/ft_miroir`** | `supabase.js:92` |
| ⛔ **la clé publiée n'a AUCUN droit sur la table** — INSERT/UPDATE retirés ; elle ne peut qu'exécuter la fonction, qui est en `security definer` | `supabase.js:83-91` · ft-v772 |
| ⛔ **aucune lecture possible, par aucun chemin** | idem |
| appelé une seule fois, depuis `_cloudSync` | `setup.js:989` |
| ⛔⛔ **le Worker ne connaît pas Supabase** — **0** occurrence dans `worker.js` | mesuré |
| `supabase.js` est un fichier **frontend**, servi et mis en cache | `index.html:3695`, `sw.js:89` |

**Donc le schéma réel est : App → Supabase.** Ce n'est **pas** `App → Worker → Supabase`, qui est
celui que Michel veut pour le débrief.

### ⚠️⚠️ Et une faiblesse est DÉJÀ documentée — elle décide de la recommandation

ft-v772, écrit noir sur blanc : *« n'importe qui connaissant la clé publiée peut appeler la fonction
avec **l'e-mail de quelqu'un d'autre** et écraser sa ligne miroir »*. C'est sans gravité
aujourd'hui **parce qu'on ne peut rien LIRE**.

👉 **Mais l'idempotence, elle, exige de RELIRE un résultat.** Le jour où une route rend un contenu
en échange d'un identifiant, cette faiblesse cesse d'être théorique. *C'est exactement la question
§4 de Michel : « sans faire confiance à un identifiant fourni librement par le client ».*

---

## 2. Vie privée — et le constat qui change le cadrage

La règle citée est : *« le fil Milo reste uniquement sur le téléphone »*. **Elle est vraie et elle
concerne `ft4_coach_hist`**, le fil brut, qui ne part effectivement nulle part.

⚠️ **Mais le miroir envoie déjà à Supabase beaucoup plus qu'on ne le croit.** Mesuré dans
`setup.js:906-921`, `_corpsSync` — l'objet exact passé à `sbMirror` — contient :

`registre` (faits **et observations** sur la personne) · `adn` · **`coachMemory`** (le résumé
durable que Milo écrit **sur elle**) · nom · poids · âge · sexe · objectif · santé.

👉 **Une caractérisation de la personne écrite par Milo vit donc DÉJÀ en permanence sur Supabase.**
Stocker un débrief **une heure** est donc un pas **plus petit** qu'il n'y paraît — mais c'en est un :
le débrief est plus **granulaire** que le résumé, et c'est du contenu **nouveau**.

*Ce n'est pas un argument pour le faire, c'est une correction de la prémisse : la frontière n'est
pas là où on la croyait.*

---

## 3. Atomicité — la preuve technique (§2 de la demande)

**Oui, et c'est le point fort de Postgres.** Un index `UNIQUE(debrief_id)` rend l'insertion
concurrente sérialisée par le moteur lui-même : sur 5 `INSERT` simultanés, **exactement un**
réussit, les quatre autres entrent en conflit. Il n'y a **pas** de `SELECT` puis `INSERT`, donc
**pas de fenêtre de course**.

Le tout tient en **une seule instruction** qui couvre les quatre états :

```sql
INSERT INTO debrief_idem (debrief_key, status, expires_at)
VALUES (p_key, 'IN_PROGRESS', now() + interval '2 minutes')
ON CONFLICT (debrief_key) DO UPDATE
   SET status = 'IN_PROGRESS', expires_at = now() + interval '2 minutes'
 WHERE debrief_idem.status = 'FAILED'
    OR (debrief_idem.status = 'IN_PROGRESS' AND debrief_idem.expires_at < now())
RETURNING status, result;
```

- **ABSENT** → la ligne est créée, l'appelant est **propriétaire** → 1 appel IA autorisé ;
- **IN_PROGRESS frais** → le `WHERE` refuse la mise à jour, **0 ligne rendue** → l'appelant sait
  qu'il n'est **pas** propriétaire → **aucun appel Anthropic** ;
- **IN_PROGRESS expiré** (orphelin) → repris par **bail** (*lease*) → un seul repreneur ;
- **COMPLETED** → 0 ligne rendue par l'`UPDATE`, un `SELECT` rend le résultat → **0 appel** ;
- **FAILED** → repris → **retry autorisé**.

⚠️ **Le SQL ci-dessus n'a PAS été exécuté** — Supabase est injoignable depuis ce conteneur
(`connect_rejected`). *La primitive est certaine ; cette formulation exacte reste à valider.*

⭐ **Et on ne part pas de zéro** : `ft_miroir` prouve que le motif **`security definer` + RPC**
fonctionne sur ce projet (**R13**).

---

## 4. Schéma minimal proposé

| colonne | rôle |
|---|---|
| `debrief_key` | **clé UNIQUE** — ⛔ *pas* `debriefId` brut (voir §5) |
| `status` | `IN_PROGRESS` · `COMPLETED` · `FAILED` |
| `result` | le débrief — **en clair (variante A) ou chiffré (variante B)** |
| `created_at` · `expires_at` | bail et TTL |

⛔ **Table indépendante. `ft_comptes` et `ft_miroir` ne sont pas touchés**, la source de vérité
reste Apps Script, et l'app ne relit toujours **rien** de son compte depuis Supabase.

---

## 5. Sécurité (§4) — et pourquoi l'identifiant ne peut pas être `sess.id`

⛔ **`debriefId = "debrief:" + sess.id` est un horodatage en millisecondes : il est ÉNUMÉRABLE.**
Si une route rend un contenu contre cet identifiant, deviner devient une attaque.

⭐ **La réponse tient dans un secret que le Worker a déjà** : il dérive lui-même

```
debrief_key = HMAC( secret_serveur , email + ':' + sessionId )
```

- le client **ne voit jamais** cette clé et ne peut pas la fabriquer ;
- deux tentatives pour la même séance donnent **la même** clé (c'est ce qu'on veut) ;
- l'énumération disparaît.

⚠️ **Mais ça ne suffit pas, et il faut le dire** : le Worker reçoit `email` **du client**, sans
authentification. Quelqu'un qui connaît l'adresse **et** la milliseconde d'une séance pourrait faire
calculer la clé par le Worker. **C'est exactement la faiblesse de ft-v772, transposée — sauf qu'ici
elle permettrait de LIRE.**

👉 **Seule la variante B la referme** (§6). ⛔ Et dans tous les cas : **accès serveur uniquement**,
clé **jamais** dans le navigateur, RPC dédiée plutôt que droits de table, `SELECT`/`INSERT` refusés
à la clé publiable — exactement la discipline déjà en place pour le miroir.

---

## 6. Confidentialité — les trois variantes (§5)

| | sécurité | récupération après reload | empêche le 2ᵉ appel | complexité |
|---|---|---|---|---|
| **A — clair, TTL 1 h** | faible : lisible par qui atteint la ligne ; n'empêche pas l'usurpation §5 | ✅ | ✅ | faible |
| **B — chiffré par le client** ⭐ | ✅ **la base ne peut pas lire** ; une clé volée ne rend que du bruit | ✅ | ✅ | moyenne |
| **C — état seul, sans résultat** | ✅ maximale (rien n'est stocké) | ⛔ **non** | ✅ | faible |

**B, en pratique** : le client génère une clé **par débrief** (WebCrypto, **AES-GCM** — ⛔ aucun
chiffrement artisanal), la garde en `localStorage` et l'envoie avec la requête. Le Worker chiffre le
résultat **avant** de l'écrire et **ne stocke jamais la clé**. Au rechargement, le client renvoie sa
clé et déchiffre.

⭐⭐ **B n'est pas seulement « plus privé » : c'est le seul qui referme la faiblesse de ft-v772**,
puisque même en atteignant la ligne on n'obtient rien de lisible. ⚠️ **Honnêteté** : le Worker voit
le texte en clair de toute façon (il relaie Anthropic) — B protège le **stockage**, pas le transit.
C'est précisément le sujet.

⚠️ **C est le repli si Michel refuse tout stockage de texte** : il supprime le 2ᵉ appel mais la
personne perd le jugement de Milo pour cette séance-là. Le socle chiffré local, lui, reste affiché —
donc ce n'est pas une perte **silencieuse**, mais c'en est une.

---

## 7. TTL et nettoyage (§6)

⭐ **La suppression opportuniste suffit et ne dépend d'aucune extension** : la RPC efface les lignes
expirées à chaque appel. Coût ≈ nul, disponible sur **toute** configuration.
`pg_cron` serait plus propre — **`À VÉRIFIER DANS LE DASHBOARD SUPABASE`** (extension et plan).

Volume maximal avec TTL 1 h ≈ *débriefs par heure* × quelques Ko : **négligeable** à toutes les
échelles envisagées.

---

## 8. Latence (§7)

⛔ **NON MESURÉE, et je ne l'invente pas** : Supabase **et** Apps Script sont tous deux injoignables
depuis ce conteneur. Ce qu'on peut dire **sans mesure** :

- **Apps Script** : un aller-retour web-app + un accès Sheet. Le projet en a déjà mesuré la lenteur
  ailleurs, et `LockService` **sérialise** les appels — donc la latence **monte avec la concurrence** ;
- **Supabase** : une requête HTTP vers PostgREST + une instruction indexée. Structurellement plus
  léger, et l'atomicité est **dans le moteur**, sans sérialisation applicative.

⚠️ *Ne pas conclure que Supabase est plus rapide parce que c'est PostgreSQL* — **à mesurer depuis le
Worker déployé**, c'est le seul banc qui compte. **Les deux ajoutent un aller-retour sur le chemin
critique**, là où aujourd'hui le seul appel Apps Script est sous `ctx.waitUntil`, donc invisible.

---

## 9. Coût (§8)

**`À VÉRIFIER DANS LE DASHBOARD SUPABASE`** — le plan, la consommation actuelle et les quotas ne
sont **pas** visibles depuis le dépôt. Aucun chiffre inventé.

Ce qui est certain : **1 à 2 requêtes par débrief** (une prise de propriété, une écriture du
résultat), des lignes de quelques Ko effacées au bout d'une heure. C'est un volume **très faible** —
mais le rapport à la limite gratuite dépend du plan, donc du tableau de bord.

Face à cela, un appel Sonnet évité vaut **≈ 0,01 à 0,07 €** (estimation de la passe précédente).

---

## 10. Résilience (§9) — les fenêtres résiduelles, nommées

| cas | comportement | double appel ? |
|---|---|---|
| Supabase indisponible / timeout | **décider : ouvert** (on appelle quand même) ou **fermé** (on refuse) | ⚠️ **ouvert ⇒ double appel possible** — c'est le prix du « jamais de perte » (règle d'or #3) |
| insertion réussie, réponse perdue | la ligne existe → la tentative suivante voit `IN_PROGRESS` | non |
| ⛔ **Anthropic réussit, écriture `COMPLETED` échoue** | l'appel est **payé** et le résultat **perdu** ; le bail expire, une reprise relance | ⚠️ **OUI — fenêtre résiduelle réelle, non éliminable** |
| `IN_PROGRESS` orphelin | repris **après expiration du bail** | non |
| `COMPLETED` | résultat rendu | non |
| 2 requêtes simultanées | l'index UNIQUE tranche | non |
| 2 séances différentes | 2 clés | 2 appels **légitimes** |
| retry après vrai échec | `FAILED` → repris | 1 appel légitime |

⚠️ **Deux fenêtres restent, et aucune n'est supprimable** : la panne de Supabase (si on choisit
d'échouer **ouvert**) et l'écriture perdue après une réponse d'Anthropic. *Elles sont étroites, mais
les taire serait maquiller une déduplication en garantie.*

---

## 11. Comparaison finale (§10)

| | atomicité | persistance du résultat | latence | vie privée | nouveau coût | complexité |
|---|---|---|---|---|---|---|
| **Apps Script + Sheet** | ✅ `LockService` | ✅ | ⚠️ la plus lourde, **sérialisée** | ⚠️ texte chez Google | **0 €** | moyenne |
| **Supabase existant** ⭐ | ✅✅ **index UNIQUE — la plus forte** | ✅ | ⚠️ à mesurer, *a priori* la plus légère | ⚠️ A : texte · ✅ **B : illisible** | ❓ dashboard | moyenne · **+ 1 clé serveur** |
| **D1** | ✅ | ✅ | ? | idem | ❓ | + service à créer |
| **Durable Objects** | ✅✅ | ✅ | ? | idem | ❓ **plan** | la plus élevée |

---

## 12. RECOMMANDATION

> ### **Supabase, en variante B (résultat chiffré côté client), via le Worker.**

Trois raisons, dans cet ordre :

1. **c'est le seul qui referme une faiblesse déjà écrite** (ft-v772) au lieu de l'étendre à la
   lecture ;
2. **l'atomicité est dans le moteur**, prouvable, sans verrou applicatif ni sérialisation ;
3. **le projet et le motif `security definer` existent déjà** — on enrichit, on ne crée pas (**R13**).

⛔ **Mais ce n'est pas « gratuit parce que Supabase existe »** : il faut **une table**, **une RPC**,
**une policy**, et surtout **une clé serveur dans le Worker** — la seule chose que Michel a
explicitement interdit d'ajouter dans cette passe.

⭐ **Et si Michel veut le geste le moins engageant** : la variante **C** (état seul, sans résultat)
supprime le double appel **sans rien stocker de personnel**, au prix du débrief perdu pour cette
séance-là. *C'est le seul choix qui ne demande aucune décision de confidentialité.*

---

## 13. À VÉRIFIER DANS LE DASHBOARD SUPABASE

1. **Plan** et consommation actuelle ; limites gratuites (lignes, requêtes, stockage).
2. **RLS de `ft_comptes`** : l'état réel des policies (le dépôt n'en garde qu'un récit).
3. Existence d'une **clé `service_role`** et possibilité d'en créer une **restreinte** à la seule
   nouvelle RPC — ⛔ elle ne devra **jamais** être servie au navigateur.
4. Disponibilité de **`pg_cron`**.
5. Que le projet est bien **séparé** de celui de Tatiana (décision du 04/08).

---

## 14. CE QUE CETTE PASSE N'A PAS FAIT

⛔ Aucune table, aucune RPC, aucune RLS, aucune clé, aucun déploiement, **aucun code servi modifié**,
`sw.js` non incrémenté, **miroir intact**. ⛔ Le SQL du §3 **n'a pas été exécuté**. ⛔ Latence et
coût **non mesurés** — Supabase et Apps Script sont injoignables d'ici.
