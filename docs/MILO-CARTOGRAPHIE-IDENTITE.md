# 🧬 Milo — cartographie de l'identité, du moteur et du contexte

> **Créé le 20/09/2026**, sur l'arbre `a8d5c803` (`ft-v1226`). ⛔⛔ **AUCUNE DÉCISION N'EST PRISE
> ICI.** Ce fichier **mesure** et **sépare** ; il prépare des arbitrages, il n'en rend aucun.
>
> **Il complète `docs/INDEPENDANCE-MOTEUR-MILO.md`, il ne le remplace pas** : celui-là porte le
> **cap** (*« Claude n'est pas Milo »*), celui-ci porte les **chiffres** qui disent où on en est.
> *Mettre les mesures dans le document de cap aurait noyé une direction sous des nombres qui
> changent toutes les semaines* (**R2** : un fichier, un métier).
>
> 🔖 **Chaque chiffre est daté du 20/09/2026** et se recompte. Les mesures du contexte varient de
> quelques caractères d'une exécution à l'autre — l'heure y figure (*« il est 10h34 »*), donc
> **±2 caractères sont normaux** et ne signifient rien.

---

## 1. LA SÉPARATION DEMANDÉE — onze couches, et ce qui survivrait à un changement de moteur

⭐ **La colonne de droite est la seule qui compte pour l'indépendance** : elle répond à
*« si on remplace le moteur demain matin, sans rien réécrire, qu'est-ce qui reste identique ? »*

| # | couche | ce qui la porte **aujourd'hui** | état | survit à un changement de moteur ? |
|---|---|---|---|---|
| **A** | **FAITS** | `computeRegistreFacts()` — 7 faits, **recalcul complet**, 0 appel IA · `S.sessions`, `prs`, `weightLog`, `sleepLog` | **EXISTANT** | ✅ **oui, sans une ligne** |
| **B** | **HISTOIRE / PARCOURS** | `_memoireLongue()` — progression **par médianes**, plus longue coupure, volume cumulé, silence ≥ 14 j. **0 appel réseau** | **EXISTANT** | ✅ **oui, sans une ligne** |
| **C** | **MÉMOIRE VALIDÉE** | `registre.observations` — `{id, key, fact, ask, status, source, proposedAt, validatedAt}` · `pending` / `validated` / **`rejected`** | **EXISTANT** | ✅ **oui** |
| **D** | **MÉMOIRE CONVERSATIONNELLE** | `S.coachMemory` — **résumé Haiku**, persisté au profil cloud, réinjecté à chaque message | **EXISTANT** | ⛔ **NON** — voir §4 |
| **E** | **PROTECTIONS** | `_gardienZones()` (entrée, en **tête** du prompt) · `_gardienSortie()` (sortie, **5 drapeaux**) · `_estHorsSujet` · `_gardienCompter` | **EXISTANT** | ✅ **oui** — c'est du code déterministe |
| **F** | **CAPACITÉS** | `capacites-ia.js` — **21** capacités, `politique` vs `etatCode`, écarts écrits | **EXISTANT** (descriptif) | ✅ **oui** |
| **G** | **DROITS** | `worker.js` : `_identiteIA` (qui) · `_compterIA` (combien) · `Origin` (d'où) · plafond d'abus | **PARTIEL** | ✅ **oui** — ⚠️ mais **21/21** `serveurApplique: false` : la place du verrou existe, le verrou non |
| **H** | **CONTEXTE** | `buildCoachContext()` — **1 339 lignes**, produit **~75 500 caractères** | **EXISTANT** | 🟡 **le CONTENU oui, l'ORDRE non** — voir §5 |
| **I** | **COMPORTEMENT** | **45 366 caractères** de prose · **126 lignes de consigne** · vérifiés par **5** contrôles | **EXISTANT** | ⛔⛔ **NON. C'est le trou.** |
| **J** | **MOTEUR** | Claude via `worker.js` — modèle déjà **variable** (défaut · Michel · liste blanche de banc) | **EXISTANT** | — *c'est lui qu'on remplace* |
| **K** | **INTERFACES** | texte uniquement. **0 occurrence** de `SpeechRecognition`, `speechSynthesis`, `MediaRecorder` | **EXISTANT** | ✅ neutre |

👉 ***Neuf couches sur onze survivraient telles quelles. Les deux qui ne survivent pas sont
`D` (la mémoire conversationnelle) et `I` (le comportement) — et `I` est ce qui fait qu'on
reconnaît Milo.***

---

## 2. 🗂️ LES APPELS AU MOTEUR — 13 sites, mais **deux familles seulement**

**Mesuré le 20/09** : `AI_PROXY_ACTIONS` route **14 actions** vers le Worker, et **les 13 actions
IA d'Apps Script y sont toutes**. ⭐⭐ **Correction importante à l'étude de la veille** : les
**13 adresses en dur de `Code.js` ne sont PAS le chemin vivant** — c'est le **repli**, atteint
seulement si `AI_PROXY_URL` est vide. *Le chemin servi tient l'adresse dans **une** constante et
respecte R2.*

| | `worker.js` (**servi**) | `Code.js` (**repli**) |
|---|---|---|
| adresse du fournisseur | ✅ **1** (`ANTHROPIC_URL`) | ⛔ **13**, dans 13 fonctions |
| `x-api-key` · `anthropic-version` | 3 · 3 | ⛔ **13 · 13** |
| `claude-haiku-4-5` en dur | 12 | 12 |
| `cache_control` / `ephemeral` / `ttl 1h` | **3 / 2 / oui** | — |

### ⭐⭐ Et la mesure qui change la conception : 10 sur 13 ne sont pas des conversations

| famille | combien | ce qu'elle envoie | ce qu'elle attend |
|---|---|---|---|
| **A — extraction structurée** | **10** (`bodyScan`, `foodLabel`, `readBarcode`, `importDoc`, `morpho`, `bodyStudy`, `bloodTest`, `seanceJson`, `estimateFood`, `importMealPlan`) | un document / une image / un texte **+ une consigne fixe** | du **JSON**, revalidé par le code |
| **B — conversation** | **2** (`coach`, `summarizeCoach`) | **système + historique + cache + modèle variable** | du **texte libre** |
| *(hors famille)* | 1 (`generateMealPlan`) | système + contexte, appel direct | JSON |

⛔ **Conséquence, et elle va contre l'intuition** : une abstraction unique couvrant les 13 serait
du sur-dimensionnement (**R19**). **Dix d'entre eux sont déjà quasi portables** — leur contrat
réel est *« voici un document, rends-moi ce JSON »*, et le code **revalide** la sortie de toute
façon. 👉 ***Le format du fournisseur ne « porte » vraiment que dans la famille B — c'est-à-dire
exactement là où vit Milo.***

---

## 3. 📏 LE CONTEXTE, BLOC PAR BLOC (mesuré le 20/09)

**Total : ~75 500 caractères**, envoyés **à chaque message**, quelle que soit la question.

| zone | taille | part | mis en cache |
|---|---|---|---|
| **COMMUN** | **45 366** | **60 %** | oui, **1 h** |
| **« PERSONNEL »** | **27 254** | **36 %** | oui, 5 min |
| **L'INSTANT** | **2 855** | **4 %** | ⛔ **jamais** — plein tarif |

### Les blocs nommés

| zone | car. | % | bloc |
|---|---|---|---|
| COMMUN | 7 463 | 9,9 % | TA MÉTHODE DE COACH |
| COMMUN | **6 669** | **8,8 %** | **NUTRITION** |
| COMMUN | 4 193 | 5,6 % | TA PERSONNALITÉ |
| COMMUN | 3 558 | 4,7 % | RETENIR DURABLEMENT CE QUE TU APPRENDS |
| COMMUN | 3 097 | 4,1 % | SAVOIR RAISONNER — ET SAVOIR S'ARRÊTER |
| COMMUN | 2 833 | 3,8 % | ÉTAT DU JOUR & CHECK-IN |
| COMMUN | 2 752 | 3,6 % | COMMENT UN COACH RAISONNE |
| COMMUN | 2 725 | 3,6 % | SÉANCE À FAIRE MAINTENANT |
| COMMUN | 2 389 | 3,2 % | QUESTION GUIDÉE |
| COMMUN | 2 265 | 3,0 % | APPRENDRE À CONNAÎTRE LA PERSONNE |
| PERSO | **11 508** | **15,2 %** | ⛔ **LE CATALOGUE D'EXERCICES** |
| PERSO | 5 677 | 7,5 % | PROFIL ATHLÈTE |
| PERSO | 4 547 | 6,0 % | DERNIÈRES SÉANCES |
| PERSO | 2 043 | 2,7 % | UNE SÉANCE A UN SUJET |
| INSTANT | 1 461 | 1,9 % | RÉCUPÉRATION & SOMMEIL |
| INSTANT | 803 | 1,1 % | MOMENT PRÉSENT |

⚠️ **Le bloc dit « PERSONNEL » n'est personnel qu'à 58 %** : le catalogue y pèse **42 %** et il est
identique pour tous ceux qui n'ont pas déclaré de lieu. *Le nom du bloc décrit sa **coupure
tarifaire**, pas son contenu.*

⚠️ **Le plafond de 46 500 est TENU** : le bloc commun vaut **45 366**, marge **1 134**.

---

## 4. ⛔ `S.coachMemory` — le seul endroit où une interprétation de modèle devient de l'état durable

| question | réponse mesurée |
|---|---|
| **qui la produit ?** | le **modèle**, pas le code — `summarizeCoach` |
| **avec quel modèle ?** | `claude-haiku-4-5-20251001`, `max_tokens: 250` |
| **avec quelle consigne ?** | *« Résume cette conversation coach/athlète en **2-3 phrases max** (garde : objectifs, conseils clés, décisions, problèmes identifiés) »* |
| **sur quoi ?** | les **16 derniers messages**, tronqués à **400 caractères** chacun |
| **à quelle fréquence ?** | ⚠️⚠️ **à CHAQUE message** dès que le fil atteint **4 messages** (`coachHistory.length >= 4`), **pour tout le monde** — donc ***elle DOUBLE le nombre d'appels IA d'une conversation*** au-delà du 4ᵉ échange. Les appels sont sérialisés (`_memFile`, chaîne de promesses), donc jamais concurrents |
| **est-elle cumulative ?** | ⚠️ **oui** — la consigne commence par *« Mémoire existante : … »*, donc **un résumé de résumé**, indéfiniment. *Personne ne peut dire ce qu'il reste, après cinquante itérations, d'un fait dit au premier échange.* |
| **où vit-elle ?** | `localStorage` `ft4_coach_mem` **+ le profil cloud** (`userData.profile.coachMemory`) |
| **quand est-elle relue ?** | à **chaque message** : `coach()` la reçoit et la place **dans le bloc mis en cache** |
| **taille ?** | bornée seulement par `max_tokens: 250` (~**1 000 caractères**) |
| **porte-t-elle une provenance ?** | ⛔ **non** — ni moteur, ni date, ni statut, ni possibilité de correction |

### La comparaison qui tranche

| | `registre.observations` | `S.coachMemory` |
|---|---|---|
| origine | interface ou conversation | **un modèle** |
| la personne valide ? | ✅ `pending` → `validated` | ⛔ **jamais** |
| un refus est-il gardé ? | ✅ `rejected` | ⛔ **rien à refuser** |
| date | ✅ `proposedAt` / `validatedAt` | ⛔ aucune |
| corrigeable | ✅ | ⛔ |
| structure | objets | **une chaîne plate** |

⭐⭐ **Et elle contredit nommément une décision prouvée de Michel** — la décision 3 du 18/09 :
***« un résumé IA ne devient jamais la source de vérité »***, dont la conséquence écrite était
*« la chaîne plate `coachMemory` cesse d'être le support ; elle devient au mieux une vue »*.

⚠️ **Ce qu'on perdrait en la retirant, et il faut le dire** : c'est **le seul porteur de
continuité conversationnelle longue**. Le fil est borné ; les faits et les observations ne
gardent **pas** *« on a parlé de ta reprise après ta blessure, tu avais peur de forcer »*.
👉 ***La retirer sans la remplacer ferait reculer Milo*** — et `docs/INDEPENDANCE-MOTEUR-MILO.md`
interdit explicitement de dégrader Milo pour obtenir l'indépendance.

---

## 5. 🧊 L'ORDRE DU CONTEXTE EST DICTÉ PAR LE PRIX DU CACHE — la preuve est dans le code

C'est le point le plus important de cette cartographie, et il est **daté et documenté**, pas
déduit.

**04/08/2026** — `_ctxEntrainement()` est créée : elle décide si le catalogue mérite d'être
envoyé. Le commentaire mesure : *« le contexte fait 60 085 caractères et il part EN ENTIER à
chaque message ; le catalogue en pèse 9 507 (16 %) »* et *« sur août : **2 005 554 jetons
entrants pour 47 748 sortants, soit 42 pour 1** — **98 % de la facture, c'est ce qu'on ENVOIE** »*.

**10/08/2026** — elle est **retirée**, et la raison est écrite :

> *« Le raisonnement était juste en CARACTÈRES et faux en PRIX : **un bloc envoyé "parfois" ne
> peut pas être mis en cache**, donc il était payé plein tarif (0,015 $/message) au lieu d'être
> relu (0,0015 $). Le catalogue part désormais TOUJOURS, dans la zone cachée — 10× moins cher. »*

👉 ***La sélectivité du cervelet a été construite, mesurée, puis désactivée — non pas parce
qu'elle était inutile, mais parce que la grille tarifaire du fournisseur la rendait plus chère
que l'envoi systématique.***

⭐ **Et la règle inscrite dans le prompt lui-même généralise ce couplage** : *« ne jamais rendre un
bloc plus haut CONDITIONNEL — un bloc qui apparaît puis disparaît casse le cache exactement comme
une valeur qui change »*. **C'est une contrainte du fournisseur devenue une règle de conception
interne.**

⚠️ **Ce qui changerait avec un autre moteur**, et c'est le cœur de la question : chez OpenAI
l'écriture dans le cache est **gratuite** (le dump du prompt le note lui-même) ; chez Anthropic
elle coûte **1,25×** (5 min) ou **2×** (1 h). Un moteur **sans** cache du tout rendrait l'envoi
systématique **le plus cher de tous les choix**, et l'arbitrage du 10/08 **s'inverserait**.

👉 ***L'ordre sémantique et l'optimisation tarifaire sont aujourd'hui le même objet. Les séparer
n'est pas une optimisation : c'est ce qui rend l'arbitrage re-décidable le jour où le moteur
change.***

### 🩹 Un défaut mesuré, signalé et **non corrigé**

La note de **557 caractères** posée sous le marqueur dit à Milo :

> *« C'est pour ça que le catalogue d'exercices et les blocs de séance sont **ICI, en bas** : ils
> ne partent que quand ils servent, sans jamais toucher à la partie mise en cache. »*

⛔ **Mesuré : c'est faux depuis le 10/08.** Le catalogue est **au-dessus** du marqueur, dans la
zone cachée, et il part **toujours**. ⚠️ **Et cette note est APRÈS le marqueur, donc payée plein
tarif à chaque message.** *Elle est fausse et elle est la partie la plus chère du prompt au
caractère.*

⛔ **Non corrigée ici, et la raison est une règle** : corriger un texte du prompt change **ce que
Milo reçoit** → **R34** exige un banc avant/après, et **aucune passe réelle n'est enregistrée**
(§7). *Changer le prompt sans pouvoir mesurer l'effet, c'est exactement ce que R34 interdit.*

---

## 6. 🌐 LES DESTINATIONS — 12 hôtes, aucun registre, et deux partent à chaque ouverture

**Mesuré** en chargeant l'app servie, réseau sortant coupé, sans aucune action :

| | |
|---|---|
| requêtes sortantes **au simple chargement** | **2** |
| vers `script.google.com` | 1 — le ping d'`autoConnect()`, **attendu et documenté** |
| vers **`api.qrserver.com`** | 1 — ⚠️ **un tiers, inventorié nulle part** |

**Les 12 hôtes que le code servi nomme** (hors commentaires) :

| hôte | où | nature |
|---|---|---|
| `script.google.com` | `constants.js`, `worker.js` | backend Apps Script |
| `dry-field-e931.forcetracker-app.workers.dev` | `constants.js` | le Worker |
| `lervuzqicoevwvdlpocq.supabase.co` | `supabase.js` | le miroir |
| `api.anthropic.com` | `Code.js`, `worker.js` | le fournisseur IA |
| `world.openfoodfacts.org` | `app.js` | base alimentaire |
| `api.github.com` | `app.js` | santé du système (Admin) |
| `michdu75-commits.github.io` | `app.js`, `coach.js`, `worker.js` | l'app elle-même |
| ⚠️ **`api.qrserver.com`** | `app.js`, **`index.html`** | **QR généré par un tiers, part au chargement** |
| ⚠️ **`wger.de`** | `log.js` | **API d'exercices tierce — reçoit le terme TAPÉ par la personne** |
| ⚠️ **`cdn.jsdelivr.net`** | `log.js` | **pdf.js chargé depuis un CDN à l'exécution** |
| `www.youtube.com` · `img.youtube.com` | `log.js` | démonstrations |

⭐ **C'est l'argument mesuré en faveur d'un registre `connections`** : trois de ces destinations ne
sont nommées dans **aucun** document de gouvernance, et l'une d'elles **reçoit du texte tapé par
la personne** (`wger.de`) — ce qui relève directement de **R36**.

⛔ **Ce n'est PAS `capacites-ia.js` en double** : une **capacité** dit *ce que Milo peut faire* ;
une **destination** dit *où une donnée part*. Les deux se croisent (une capacité emploie une
destination) mais ne se recouvrent pas — 10 des 12 hôtes n'ont **aucune** capacité IA associée.

---

## 7. 🧪 LE BANC — ce qu'il mesure, et ce qu'il ne peut pas mesurer

| | valeur mesurée |
|---|---|
| scénarios Tier 2 (vrai Milo) | **57** · **80 vérificateurs** |
| témoins Tier 1 (la règle est *présente* dans le prompt) | **12** |
| juge IA | ⛔ **aucun — décision écrite** |
| dernier rapport **enregistré dans le dépôt** | **02/09/2026**, mode **« à blanc »** (0 appel) |
| passe **réelle** enregistrée dans le dépôt | ⛔ **aucune** |

⚠️ **Nuance obligatoire (règle d'or #16)** : les vraies passes existent, mais elles vivent dans
`ft4_evalPasses` / `ft4_evalHist`, **en `localStorage`, sur l'appareil qui les a lancées**. Elles
ne sont **pas** lisibles depuis le dépôt.

👉 ***Le comportement de référence de Milo n'est nulle part dans la mémoire partagée du projet.***
Le jour d'une bascule de moteur, **il n'y a rien à comparer**.

### Le modèle à trois niveaux — **IDÉE À ÉTUDIER**

| niveau | ce que c'est | ce qui existe déjà |
|---|---|---|
| **1 — définition** | ce que Milo **doit** respecter | 🟡 dispersé : Constitution (25 principes), 126 lignes de prompt, `BUGS-DE-PHILOSOPHIE.md` |
| **2 — comportements observables** | comment ça se voit dans une situation | 🟡 implicite dans les 57 scénarios |
| **3 — tests** | ce qui le vérifie | ✅ 57 scénarios + 80 vérificateurs + `_gardienSortie` + PT-001 |

⛔ **Le niveau 1 n'existe pas comme objet**, et c'est ce qui fait que le banc *ressemble* à la
définition. ⚠️ **Le piège à ne pas refermer trop vite** : un juge IA rendrait mesurable le ton et
le naturel — **au prix de faire juger l'identité de Milo par le moteur qu'on cherche justement à
rendre remplaçable.**

---

## 7bis. 🧬 L'ADN MINIMAL — **IDÉE À ÉTUDIER**, et la mesure retourne la question

Les onze invariants candidats, passés au prompt, au code et au Gardien :

| invariant candidat | prompt | code | Gardien |
|---|---|---|---|
| distinguer un **fait** d'une **interprétation** | oui | ✅ `pending` → `validated` | — |
| **conserver une correction** validée | — | ✅ `rejected` gardé | — |
| conserver un **refus** utilisateur | — | ✅ `rejected` gardé | — |
| **continuité** avec ce qui a été validé | oui | ✅ `registre.observations` | — |
| éviter l'**interrogatoire** | oui | ✅ | ✅ `interrogatoire` |
| ne pas **inventer une source** | oui | ✅ | ✅ `source_fabriquee` |
| ne pas **promettre** une action impossible | — | ✅ | ✅ `promesse_vide` |
| ne pas poser de **diagnostic médical** | oui | ✅ | ✅ `diagnostic` |
| ne pas laisser fuir un **bloc technique** | — | ✅ | ✅ `bloc_technique` |
| **reconnaître son incertitude** | oui | ⛔ | ⛔ |
| ne pas présenter une **inférence** comme un fait | oui | ⛔ | ⛔ |
| **ne pas insister** | oui | ⛔ | ⛔ |
| **dire qu'une information manque** | oui | ⛔ | ⛔ |

### Trois étages apparaissent — et ils ne sont pas classés par importance, mais par **mode de garantie**

| étage | comment c'est tenu | portable ? |
|---|---|---|
| **α — garanti par la DONNÉE** | une interprétation **ne peut pas** devenir un fait : il faut passer par `pending` → `validated`, et un `rejected` reste écrit | ✅ **oui, tel quel** |
| **β — mesuré à la SORTIE** | on n'empêche pas, on **compte** — les 5 drapeaux (dont **4** comptent comme dérive) | ✅ **oui, tel quel** |
| **γ — seulement DEMANDÉ** | de la prose, rien derrière | ⛔ **non, et non mesuré** |

### ⭐⭐ Et voici ce que la mesure retourne, qui n'était pas la question attendue

Les **quatre** invariants de l'étage γ sont : *reconnaître son incertitude* · *ne pas présenter
une inférence comme un fait* · *ne pas insister* · *dire qu'une information manque*.

👉 ***Ce sont exactement ceux qui décrivent la PRÉSENCE de Milo — l'humilité, le rythme, le
courage de dire « je ne sais pas ». Et ce sont les seuls qu'on ne sait ni garantir ni mesurer.***

> **Les invariants qu'on sait tenir disent que Milo ne MENT pas.
> Ceux qu'on ne sait pas tenir disent COMMENT IL EST.**

⚠️ **Conséquence directe sur la question « faut-il formaliser l'ADN ? » — elle change de forme** :
formaliser aujourd'hui reviendrait à mettre par écrit **les neuf qui sont déjà garantis**, et à
**laisser dehors les quatre qui font le caractère**. *On n'y gagnerait pas de portabilité — ces
neuf-là sont déjà portables — et on n'y gagnerait aucune des quatre.*

⭐ **La troisième voie que le brief cherche existe peut-être, et elle est étroite** : rendre les
quatre de l'étage γ **OBSERVABLES sans les rendre PRESCRIPTIFS**. Exemple : *« combien de
questions Milo a-t-il posées dans cette réponse ? »* se compte (le Gardien le fait déjà pour
l'interrogatoire) ; *« a-t-il affirmé un fait absent du contexte ? »* se vérifie contre le
contexte, qui est connu. ⛔ **Mais « est-il agréable ? » ne se compte pas**, et prétendre le
contraire fabriquerait une fausse mesure (**R29**).

⛔ **RIEN N'EST DÉCIDÉ ICI** — ni de formaliser, ni de ne pas formaliser.

---

## 8. ⚡ LA CADENCE — un bus d'événements existe déjà, à un seul nerf

`_dbf*` (le débrief automatique) est **plus complet qu'un embryon** :

| mécanisme | ce qui existe |
|---|---|
| **file** | `ft4_pending_debrief`, JSON, **max 3** (les plus anciennes sortent) |
| **jeton en cours** | `ft4_debrief_encours` = `{id, ts}` — survit à un rechargement |
| ⭐ **reçu** | la réponse **déjà payée** est gardée avant d'être posée — *un plantage ne la repaie pas* |
| **idempotence** | `ft4_debrief_faits`, les 40 dernières séances réellement débriefées |
| **péremption** | **36 h**, un seul seuil pour tout (**R2**) |
| **reprise** | `_dbfRecuperer()` — le reçu passe **avant** le « en cours », et l'ordre est expliqué |
| ⭐⭐ **filet sans jeton** | `_dbfRattraper()` compare `S.sessions` à `registre.sessionLog` — *« qu'est-ce qui aurait dû produire une trace et n'en a pas produit ? »* |
| **échec propre** | le jeton repart **en tête** de file |

**Réponse à la question posée** : ⭐ **oui, c'est un socle raisonnable** — il a déjà les quatre
propriétés difficiles (idempotence, reprise, péremption, échec propre).

⛔ **Ses limites, mesurées** :
- il vit en **`localStorage`** → **par appareil**, non synchronisé, perdu au changement de téléphone ;
- il se déclenche sur **`window load` + `setTimeout`** → ***Milo n'agit jamais sans que l'app soit ouverte*** ;
- **un seul type d'événement** ;
- **0** notification push, **0** cron Cloudflare dans tout le dépôt ; les 2 déclencheurs Apps Script ne servent qu'à la **sauvegarde**.

| type d'événement | compatible avec ce socle ? |
|---|---|
| « une séance vient de finir » · « un import vient d'aboutir » · « une observation attend depuis N jours » | ✅ **oui** — même forme : un fait local, une action à la prochaine ouverture |
| « il est 8 h, rappelle-lui sa séance » · « ça fait 10 jours qu'il n'est pas venu » | ⛔ **non** — exige que **quelque chose tourne sans l'app**, donc une vraie infrastructure (push, cron) |

---

## 9. 🗣️ LA VOIX — une interface, pas une identité

**Mesuré : 0 occurrence** de `SpeechRecognition`, `speechSynthesis`, `webkitSpeech`, `MediaRecorder`
dans tout le code servi. **Rien n'existe.**

```
   audio  →  transcription        ← un moteur interchangeable qui ne sait RIEN de la personne
                  ↓                  (c'est la définition exacte du cervelet)
        le MÊME buildCoachContext · la MÊME mémoire · le MÊME Gardien
                  ↓
   réponse texte  →  synthèse     ← un autre moteur interchangeable
```

**Quatre bornes, chacune tirée d'une règle existante — DIRECTION, rien n'est décidé :**
- ⛔ **aucune mémoire propre à la voix** — sinon c'est un deuxième Milo (**R2**, **R6**) ;
- ⛔ **la transcription n'a pas besoin de savoir QUI** — elle ne reçoit donc pas l'identité ;
- ⛔ **`_gardienSortie` tourne AVANT la synthèse** — *une phrase dite est plus difficile à rattraper qu'une phrase lue* ;
- ⚠️ **la voix change le RYTHME, pas seulement le canal.**

**Ce que la voix imposerait, et qui n'est pas mesuré** : les réponses font aujourd'hui *« maximum
200 mots »* — c'est long à l'oral · l'interruption n'existe pas à l'écrit · la règle « une seule
question à la fois » devient **plus** contraignante, pas moins · et une **erreur de transcription**
crée une classe de faux faits que rien ne gère (« j'ai mal au **dos** » / « au **dos**sier »).
**IDÉE À ÉTUDIER.**

---

## 10. 🎯 RÉVERSIBILITÉ (A) vs MULTI-MOTEURS (B)

| | **A — réversibilité** | **B — multi-moteurs** |
|---|---|---|
| ce que ça veut dire | remplacer le fournisseur **sans reconstruire Milo** | plusieurs moteurs spécialisés **en même temps** |
| famille A des appels (10) | ✅ **presque acquis** — contrat = « document → JSON », revalidé par le code | ✅ acquis par le même geste |
| famille B (`coach`) | 🟡 système + historique + **cache** + modèle | ⛔ demande un routage **par capacité** |
| ce qui manque vraiment | ① l'**ordre** du contexte séparé de l'optimisation tarifaire (§5) · ② une **référence comportementale** (§7) · ③ `S.coachMemory` sans provenance (§4) | tout A, **plus** un registre de routage et une politique de coût |
| **du sur-dimensionnement aujourd'hui ?** | ⛔ non | ⭐ **oui** — *« une abstraction qui anticipe dix moteurs imaginaires »* (**R19**) |

⭐ **Ce qui est déjà compatible avec B sans rien faire** : le modèle est **déjà** une variable
serveur, et `capacites-ia.js` indexe **déjà par capacité** — les deux pièces d'un routage existent,
séparément.

---

## 11. ⚖️ CE QUI RESTE À MICHEL

Aucune de ces questions n'est tranchée ici. Elles sont listées dans le dossier de passation du
20/09 et **restent ouvertes**.

1. **L'ADN** — formalise-t-on quelques invariants comportementaux **en gardant la prose riche** ?
2. **Les décisions manquantes** — 5 des 14 sont introuvables (`docs/DECISIONS-MEMOIRE-LONGUE.md`).
3. **`S.coachMemory`** — garder · **envelopper d'une provenance** · réduire progressivement ?
4. **L'indépendance** — réversibilité d'abord, multi-moteurs possible ensuite ?
5. **Le banc** — vérifie-t-il une définition **située au-dessus de lui** ?
6. **Les destinations** — un registre `connections` entre-t-il dans l'architecture ?
7. **La note fausse de 557 caractères** (§5) — la corriger demande un banc (**R34**).
8. **`api.qrserver.com`** — un tiers reçoit une requête à **chaque ouverture** : voulu ou non ?

---

*Lié à : `docs/INDEPENDANCE-MOTEUR-MILO.md` (le cap) · `docs/DECISIONS-MEMOIRE-LONGUE.md` (les
décisions du 18/09) · `docs/ARCHITECTURE-CERVEAU-CERVELET.md` (la frontière) ·
`docs/MOTEUR-RAISONNEMENT-MILO.md` (le pipeline) · `capacites-ia.js` (les 21 capacités) ·
`docs/PROMPT-MILO-REEL.txt` (le prompt, généré) · **R2**, **R6**, **R9**, **R19**, **R34**,
**R36**, **R37**.*
