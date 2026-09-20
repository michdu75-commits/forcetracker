# 🧾 `S.coachMemory` — sa provenance, son coût, et ce qu'elle ne résout pas

> **Posé le 20/09/2026**, sur l'arbitrage de Michel : **option B — on la GARDE, on lui ajoute
> une provenance.** ⛔ **Elle n'est pas supprimée, et rien de sa continuité n'est retiré** :
> elle porte une continuité conversationnelle que les faits et `registre.observations` ne
> remplacent pas encore.
>
> ⚠️ **Ce document dit ce qui EST, mesuré.** Les questions qu'il laisse ouvertes le restent.

---

## 1. ⛔⛔ LA DÉCISION DE CONCEPTION : `coachMemory` RESTE UNE CHAÎNE

**Mesuré avant d'écrire une ligne** : `S.coachMemory` traverse **19 sites**, dont deux
contrats qui n'appartiennent pas au client :

| contrat | ce qu'il attend |
|---|---|
| `worker.js` | `const memory = body.coachMemory \|\| ''` — **concaténé dans le prompt de Milo** |
| `Code.js` | `_ps_(body.coachMemory, …)` — le nettoyeur de **chaîne** d'Apps Script |

👉 ***En faire un objet aurait injecté « [object Object] » dans le prompt de Milo*** — c'est-à-dire
exactement le recul que l'arbitrage interdit. **La provenance vit donc À CÔTÉ**, dans un champ neuf.

⭐ **Ce n'est pas une duplication (R2)** : `coachMemory` porte **le texte**, `coachMemoryMeta`
porte **d'où il vient**. Deux informations, deux propriétaires.

---

## 2. L'ENVELOPPE — cinq clés, et pas une de plus

```js
S.coachMemoryMeta = {
  v      : 1,                              // version du schéma
  statut : 'generated' | 'legacy',
  moteur : 'claude-haiku-4-5-20251001' | null,
  date   : '2026-09-20T12:34:56.789Z' | null,
  source : 'summarizeCoach' | null
}
```

### ⚠️⚠️ `statut` N'EST PAS UNE VALIDATION — c'est la borne que Michel a posée

> *« Ne donne surtout pas à `coachMemory` le statut `validated` simplement parce qu'elle
> existe. »*

`registre.observations` porte `validated` **parce que quelqu'un a répondu OUI**. Un résumé
produit par une IA n'a rien à voir. 👉 ***provenance ≠ validation.*** D'où **deux valeurs
seulement**, et aucune qui prétende à l'accord de qui que ce soit :

| statut | ce qu'il dit |
|---|---|
| `generated` | produite par le format actuel — **on sait par quoi, et quand** |
| `legacy` | elle existait avant le 20/09 — **on ne sait pas, et on l'écrit** |

### ⛔ ON N'INVENTE JAMAIS UNE PROVENANCE

Pour une mémoire ancienne : `moteur`, `date` et `source` valent **`null`**, pas une valeur
plausible. *Une fausse précision est pire qu'un trou déclaré* (**règle d'or #16**).

⭐ **Et le moteur est MESURÉ, pas deviné** : le client ne peut pas savoir quel modèle a résumé
sa conversation. `worker.js` **renvoie désormais `_model`** (même patron que `coach()`, qui le
fait déjà), et `Code.js` fait pareil sur son chemin de repli — *sinon la provenance dépendrait
de la route empruntée*. Si le serveur ne le dit pas, le client écrit **`null`**.

---

## 3. LA MIGRATION — une RÈGLE rejouée, jamais un drapeau

`_coachMemProvenance()` (`state.js`) est le **propriétaire unique** de *« cette mémoire a-t-elle
une provenance ? »*. Elle est **idempotente par construction** et rejouée :

- au **chargement** (`load()`) ;
- **après chaque restauration cloud** (`setup.js`).

⛔ **Pas de drapeau « migration faite »**, et la raison est un cas vécu deux fois : une
restauration remplace l'état **APRÈS** le chargement et peut ramener un profil d'**avant** des
mois plus tard (`ft4_stmig1`, ft-v1213 · les trois pots, ft-v1225). *Un drapeau serait faux
exactement le jour où ça arrive.*

### ⭐⭐ LE DÉFAUT TROUVÉ EN ÉCRIVANT — la provenance ne survit jamais au texte

Première version : la restauration reprenait le texte du nuage et **gardait la provenance
locale**. Or si le nuage porte un profil d'avant le 20/09, il n'apporte **pas** de provenance —
et l'ancienne fiche, qui décrivait un texte **qui n'existe plus**, serait restée collée au
nouveau.

👉 ***On aurait fabriqué une fausse provenance avec le mécanisme construit pour l'empêcher.***

La règle est donc : **texte différent → on jette la fiche**, puis celle du nuage la remplace si
elle existe, sinon la règle reclasse en `legacy`. Figé par le témoin `B-CCCXL ⑭` et la
mutation `M11`.

---

## 4. 💰 LE COÛT — mesuré, et la conclusion corrige un rapport antérieur

**Tarifs du dépôt** (`tests/milo/eval.js`, vérifiés le 20/08) · **contexte re-mesuré le 20/09**.

| | Milo (`coach`) | le résumé (`summarizeCoach`) |
|---|---|---|
| modèle | **sonnet-4-6** | **haiku-4-5** |
| entrée | ~20 182 jetons **en cache** + 793 plein tarif | ~2 081 jetons, ⛔ **aucun cache** |
| sortie | ~700 jetons | 250 jetons (plafond) |
| **coût par message** | **0,0189 $** | **0,0033 $** |

### ⚠️ Correction à l'étude du 20/09 au matin

Elle disait que `coachMemory` *« double le nombre d'appels IA »*. **C'est vrai pour les
APPELS** — 2 au lieu de 1 dès le 4ᵉ échange. ⛔ **Mais c'est faux pour le coût** : le résumé
pèse **15 % du prix d'un message**, pas 100 %. *Haiku est bon marché et le contexte de Milo est
énorme : c'est lui qui coûte.*

### ⭐⭐ EN REVANCHE, LE QUOTA COMPTE LES APPELS, PAS LE PRIX — et là, ça double vraiment

Mesuré : `worker.js` compte **toute** action (`_compterIA`), résumé inclus. Le plafond est de
**50 appels/jour/e-mail** (600 au total, 150 pour les comptes de développement).

> 👉 ***Une conversation consomme DEUX unités de quota par message au-delà du 4ᵉ échange :
> les 50 appels quotidiens ne valent donc qu'environ 26 messages, pas 50.***

⛔ **Rien n'est changé ici** — consigne de Michel : *« ne change pas la fréquence uniquement
pour économiser de l'argent, le but principal reste la continuité de Milo »*. **C'est un fait
mesuré, rendu à son arbitrage.**

---

## 5. 🌀 LE RÉSUMÉ DE RÉSUMÉ — mesuré, non résolu

La consigne envoyée au résumeur commence par **`Mémoire existante : …`**, suivie des **16
derniers messages** tronqués à **400 caractères**. Le résultat (**250 jetons max**) **remplace**
la mémoire précédente.

| | |
|---|---|
| itérations sur une conversation de **20** messages | **17** |
| itérations sur **50** messages | **47** |
| fenêtre de messages relus à chaque fois | **16**, les plus récents |
| taille de sortie | **250 jetons**, à chaque itération |

👉 ***Un fait dit au premier message et jamais redit ne survit QUE par la chaîne de résumés —
re-comprimé 17 fois sur une conversation de 20 messages.*** Personne ne peut dire ce qu'il en
reste.

### Ce qui se dégrade, par ordre de vraisemblance

1. **le détail** — un chiffre précis (« 92,5 kg ») devient « ses charges » ;
2. **la nuance** — *« il hésite à reprendre »* devient *« il reprend »* ;
3. **l'ancien** — chaque passe privilégie les 16 messages récents, qui sont **en entier** dans
   la consigne, face à une mémoire déjà comprimée ;
4. ⚠️ **et la dérive est invisible** : aucun témoin ne compare la mémoire à ce qui a été dit.

### ⛔ Aucune correction n'est faite, et une piste est écrite sans être ouverte

**Ce qui la mesurerait** (⚠️ **IDÉE À ÉTUDIER**) : rejouer une conversation connue, poser à la
fin une question dont la réponse a été donnée au **premier** message, et compter. **`PT-001`
fait déjà exactement ce geste** sur les séances — il existe, il est admin, il n'est pas dans le
banc.

**Ce qui la réduirait durablement** : que les faits durables migrent vers `registre.observations`
(structurés, datés, validés) et que `coachMemory` ne porte plus que le **fil de la conversation**.
⛔ C'est le chantier de mémoire longue, **et il n'est pas ouvert**.

---

## 6. 🔄 MULTI-APPAREILS — ce que le nuage fait vraiment

**Mesuré** : la fiche part avec la sauvegarde (`setup.js`) et revient avec `loadProfile`
(`Code.js`, des **deux** côtés : `profile` et top-level). Apps Script la traite avec **`_po_`**
— le nettoyeur d'**objet** — donc un objet vide n'écrase jamais une provenance connue.

⛔ **Ce qui n'est PAS résolu, et qui ne l'était pas avant non plus** : deux téléphones qui
écrivent chacun leur mémoire. Le **dernier qui sauvegarde gagne**, exactement comme pour le
texte. ⚠️ **Aucun tombstone, aucune révision causale** — ce chantier n'est pas ouvert, et la
fiche ne prétend pas le résoudre : elle rend seulement **visible** quel moteur et quelle date
ont produit ce qui est là.

---

## 7. ⚖️ CE QUI RESTE À MICHEL

1. **La fréquence** — un résumé à chaque message dès le 4ᵉ : c'est ce qui **double le quota**.
   Faut-il l'espacer ? *(mesuré, non décidé — et ce n'est pas une question de coût.)*
2. **Le résumé de résumé** — mesure d'abord, ou réduction par la mémoire structurée ?
3. **La suite** — `coachMemory` reste-t-elle le porteur de la continuité longue, ou devient-elle
   une **vue** d'une mémoire structurée ? *C'est la décision 3 du 18/09, toujours non appliquée.*

---

*Lié à : `docs/DECISIONS-MEMOIRE-LONGUE.md` (la décision 3 : *un résumé IA ne devient jamais la
source de vérité*) · `docs/MILO-CARTOGRAPHIE-IDENTITE.md` §4 · `tests/parcours/coach_memoire.js`
(B-CCCXL / B-CCCXLI) · **R2**, **R13**, **R19**, **règles d'or #15 et #16**.*
