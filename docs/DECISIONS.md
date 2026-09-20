# ⚖️ Le registre des décisions — qui a tranché quoi, et ce que ça a écarté

> **Créé le 19/09/2026**, sur une demande de Michel : *« il faut trouver une solution pour éviter
> que la direction de Force Tracker et Milo ne me convienne pas »*.

---

## ⛔⛔ LE DÉFAUT QUE CE FICHIER FERME, ET IL A ÉTÉ MESURÉ

Le journal des versions enregistrait **les décisions que Claude n'a PAS prises**, jamais celles
qu'il a prises. Compté dans `CLAUDE.md` le 19/09 :

| | occurrences |
|---|---|
| « non tranché » · « décision rendue à Michel » · « appartient à Michel » | **5** |
| un choix nommé comme **pris par Claude seul** | **0** |

Les trois « de moi-même » du fichier sont tous des **refus** de décider (*« je ne le pose pas de
moi-même »*). 👉 ***Ce qui était visible, c'était ce qu'on rendait à Michel. Ce qui restait
invisible, c'était ce qu'on tranchait parce que ça paraissait évident.***

**Et c'est exactement comme ça qu'une direction dérive : pas par grandes décisions — par petites
décisions que personne n'a vues passer.**

---

## 🧩 UN SEUL MÉCANISME, QUATRE USAGES

Michel a retenu quatre protections. Elles ne sont **pas** quatre fichiers : elles sont quatre
lectures du **même tableau**. *Quatre mécanismes séparés auraient quadruplé la charge au lieu de
la réduire* (**R19**), et le projet a déjà un modèle qui marche pour ça — `capacites-ia.js`, avec
sa politique face à son état réel.

| protection demandée | comment elle vit ici |
|---|---|
| ① **nommer les choix pris seul** | la colonne **`origine`** — `Claude` saute aux yeux, et l'**alternative écartée** est écrite à côté |
| ② **le registre des décisions** | ce tableau, qui rend la **règle d'or #15** vérifiable par machine |
| ③ **la question de la Vision** | la colonne **Vision**, obligatoire à chaque ligne — plus la ligne ajoutée à la clôture de `docs/PROCESSUS-DEVELOPPEMENT.md` |
| ④ **le point de cap** | `python3 tools/point_de_cap.py` — une **lecture générée** du tableau, jamais un exercice à refaire à la main |

---

## 🚧 LA FRONTIÈRE — ce qui entre, et surtout ce qui N'ENTRE PAS

**⭐ Le critère est l'IMPACT SUR LA DIRECTION, jamais la taille du diff.** *Une modification de
3 lignes peut être structurante ; une de 500 lignes peut n'être que l'exécution d'une décision
déjà prise.*

**Un choix ENTRE s'il modifie — ou risque de modifier durablement — l'un de ceux-ci :**
comportement utilisateur · philosophie ou identité de Milo · architecture durable · dépendance à
un fournisseur ou une technologie · modèle de données important · propriété et circulation des
données · mémoire de Milo · droits et permissions · sécurité · politique FREE/FREEMIUM/PREMIUM ·
capacité IA · autonomie de Milo · accès à Internet ou à des outils · décision produit · expérience
utilisateur structurante · une **décision déjà actée** · la direction générale du produit.

**⛔ Un choix N'ENTRE PAS** s'il est local, réversible et sans conséquence produit ou
architecturale. **On ne veut pas lire** : *« j'ai choisi ce nom de variable »* · *« j'ai employé
cette fonction »* · *« j'ai ajouté ce test »* · *« j'ai déplacé 20 lignes »*.
👉 ***Le mécanisme protège la direction, il ne fabrique pas de la bureaucratie*** (**R19**).

**⚖️ Et la séparation d'autorité qu'il rend explicite :**

> **Claude décide COMMENT réaliser une direction validée.**
> **Claude ne décide pas seul QUELLE direction prennent Force Tracker et Milo.**

⛔ Ça ne veut **pas** dire demander une autorisation à chaque ligne : l'autonomie de Claude reste
entière sur l'implémentation locale, les noms, l'organisation interne, les tests et les
corrections techniques évidentes. ⛔ **Mais aucun choix significatif ne doit pouvoir devenir
invisible**, et ⛔ **Claude ne présente jamais comme « décision du projet » un choix qu'il a pris
seul.**

---

## 📏 LES RÈGLES DU FICHIER

1. **Une décision y entre quand elle ferme une alternative réelle.** Un choix sans alternative
   n'est pas une décision, c'est une évidence — et remplir de faux choix rendrait le fichier
   illisible, donc inutile (le sort de tout fichier qu'on n'ouvre plus, **R19**).
2. **Il s'AJOUTE, il ne se réécrit jamais** — même discipline que `docs/JOURNAL-ARCHIVE.md`, qui a
   été écrasé une fois (297 entrées perdues, découvertes deux jours après, par hasard).
3. **Une décision ÉCARTÉE reste écrite, avec sa raison** (**R30**) — sinon elle revient dans six
   mois et quelqu'un la « répare ».
4. **⛔ IL RÉFÉRENCE, IL NE RECOPIE PAS.** Quand une décision a déjà une **source de vérité
   spécialisée** (`capacites-ia.js` pour les capacités IA, `BUGS.md` pour les bugs…), la ligne la
   **pointe** au lieu d'en dupliquer le contenu. *Un registre de direction qui recopie un registre
   spécialisé crée une deuxième source de vérité — exactement le défaut que les deux existent pour
   éviter* (**R2**). ⚠️ **Apport de GPT du 19/09, et il a raison contre moi** : `D-006` recopiait
   ce que `capacites-ia.js` possède ; la ligne le référence désormais.
5. ⛔ **Il ne remplace pas le journal** : le journal dit *ce qui a été fait et pourquoi*, celui-ci
   dit *ce qui aurait pu être fait autrement, et qui a choisi*.

**⚠️ ET LE FICHIER COMMENCE AUJOURD'HUI, IL NE PRÉTEND PAS ÊTRE COMPLET.** Les décisions
antérieures vivent dans le journal et dans les docs ; les rapatrier de mémoire fabriquerait des
attributions fausses — *une origine de règle se vérifie dans la transcription, pas dans le
souvenir* (**R36**, payé une fois). Elles remonteront ici **au cas par cas**, quand une décision
ancienne sera citée et vérifiable.

**⚠️ La limite à dire plutôt qu'à masquer** : ce fichier ne décide rien et n'empêche rien. Il rend
**visible ce qui était enterré**, pour que Michel puisse objecter. *La protection, c'est lui ; le
registre ne fait que lui donner de quoi mordre.*

---

## 📋 LE REGISTRE

> **Colonnes** — `id` · `date` · `sujet` · **`origine`** · `décision` · **`alternative écartée`** ·
> **`vision`** · **`statut`**.
>
> **`origine`** — `Michel` · `Claude` · `GPT` · `contrainte technique`. ⭐ *Apport de GPT (19/09) :
> deux valeurs ne suffisaient pas — une idée venue d'ailleurs doit rester traçable jusqu'à sa source.*
>
> **`vision`** — la réponse à *« est-ce que cela renforce l'esprit Force Tracker ? »* :
> `cohérent` · `neutre` · **`cap validé`** (la direction change, **et Michel l'a validé**) ·
> **`écart à soumettre`** (ça tire contre l'esprit du produit — **à relire, pas une faute**).
> ⚠️ *Un registre où tout est « cohérent » ne mesure plus rien.*
>
> **`statut`** — le cycle de vie de la **décision**, distinct de l'état du **code** :
> `VALIDÉ` · `PROPOSÉ` · `À TRANCHER` · `REFUSÉ` · `REMPLACÉE → D-0xx`.
> ⭐ *Apport de GPT, et il corrige un vrai défaut : ma première version confondait « décidé » et
> « appliqué ». C'est exactement la faute que `capacites-ia.js` a payée avec `politique` / `etatCode`.*
> ⚠️ **`REMPLACÉE` porte OBLIGATOIREMENT le lien** vers la décision qui la remplace — sans lui, on
> ne peut pas savoir ce qui est encore actif, et la **règle d'or #15** devient invérifiable.
>
> ⛔ **L'impact et la réversibilité se disent dans la cellule `décision`**, pas dans deux colonnes de
> plus : un tableau de treize colonnes ne se lit pas, et un registre qu'on ne lit plus ne protège
> rien (**R19**).

| id | date | sujet | origine | décision | alternative écartée | vision | statut |
|---|---|---|---|---|---|---|---|
| D-001 | 19/09/2026 | garder la main sur la direction | **Michel** | retenir **les quatre** protections (choix seuls · registre · Vision en clôture · point de cap). *Réversible : ce sont des documents.* | n'en retenir qu'une, comme le recommandait la proposition au nom de la gouvernance légère | cohérent | VALIDÉ |
| D-002 | 19/09/2026 | forme des quatre protections | **Claude** | un **seul** tableau lu de quatre façons. *Impact : la charge de gouvernance reste très inférieure à celle du développement.* | quatre fichiers et quatre gestes distincts — fidèle à la demande, mais quadruplant la charge (**R19**) | cohérent | VALIDÉ |
| D-003 | 19/09/2026 | numéro de version dans le tableau d'architecture de `CLAUDE.md` | **Claude** | **retirer** la copie et renvoyer à `sw.js`. *Réversible en une ligne.* | remettre la copie à jour (`ft-v1224` → `ft-v1226`) — plus simple, mais la dérive serait revenue (**R2**) | neutre | VALIDÉ |
| D-004 | 19/09/2026 | où consigner le cap « Claude n'est pas Milo » | **Claude** | un fichier neuf, `docs/INDEPENDANCE-MOTEUR-MILO.md`. *Impact durable : c'est le cap long terme de Milo.* | étendre `ARCHITECTURE-CERVEAU-CERVELET.md` — moins de fichiers, mais aurait noyé un **cap** dans un document de **frontière technique** | cohérent | VALIDÉ |
| D-005 | 19/09/2026 | la consigne « vérifier les briefs venus de l'extérieur » | **Michel** | en faire une **règle** (**R38**) plutôt que l'appliquer au coup par coup | l'appliquer sans l'écrire — c'était l'état d'avant, et il tenait par habitude, pas par garantie | cohérent | VALIDÉ |
| D-006 | 19/09/2026 | le repli code-barres garde un pot de 25 alors que sa politique est « PREMIUM, 0 » | **Michel** | garder le pot tant que le **verrou serveur** n'existe pas. ⛔ **Source de vérité : `capacites-ia.js`** — l'écart y est écrit, il n'est pas recopié ici | lui retirer son pot tout de suite — l'aurait rendu **illimité et gratuit**, l'exact contraire de la décision | neutre | VALIDÉ |
| D-007 | 19/09/2026 | le choix manuel du repas survit-il à un changement de jour ? | **Michel** | **ne rien décider** — le comportement reste tel quel, observé et non corrigé | inventer une remise à zéro qu'aucun besoin mesuré ne réclamait (**règle d'or #15**) | cohérent | REMPLACÉE → D-011 |
| D-008 | 19/09/2026 | largeur du tableau du registre | **Claude** | garder **8 colonnes** et dire l'**impact** et la **réversibilité** dans la cellule `décision`. *Réversible.* | les colonnes séparées que demandait le brief GPT — treize colonnes, donc un tableau illisible, donc un registre qu'on n'ouvre plus (**R19**) | neutre | VALIDÉ |
| D-009 | 19/09/2026 | vocabulaire du registre (origine · vision · statut) | **GPT** | adopter **4 origines**, **4 réponses Vision** et un **statut de décision** distinct de l'état du code, plus le lien `REMPLACÉE → D-0xx` | garder mes 2 origines et mon `état` unique — *la même confusion « décidé / appliqué » que `capacites-ia.js` a payée avec `politique`/`etatCode`* | cohérent | VALIDÉ |
| D-010 | 19/09/2026 | référencer une source de vérité spécialisée au lieu de la recopier | **GPT** | une décision déjà possédée par un registre spécialisé est **pointée**, jamais dupliquée (**R2**) | ma première version, qui recopiait dans `D-006` ce que `capacites-ia.js` possède — *une deuxième source de vérité, exactement ce que les deux registres existent pour éviter* | cohérent | VALIDÉ |
| D-011 | 20/09/2026 | le choix manuel du repas au **changement de jour** (remplace `D-007`, qui était « ne rien décider ») | **Michel** | **CONSERVER le comportement actuel** — le choix explicite survit à la navigation entre jours. ⛔ **Aucune ligne de code** : le comportement voulu est celui qui est déjà servi. *Mesuré le 20/09 en conduisant l'app (horloge gelée à 09 h) : choix « Déjeuner » → `journalNav(-1)` → repas actif toujours `dejeuner`, et les deux aliments s'écrivent bien en `dejeuner` sur leurs jours respectifs.* ⭐ Le garde-fou UX existe déjà et n'est pas neuf : la confirmation affiche « Ajouté · Déjeuner, **jour consulté** » dès qu'on n'est pas sur aujourd'hui. *Réversible : ~2 lignes si un besoin mesuré apparaissait.* | **réinitialiser au changement de jour** — écartée sur mesure, pas sur goût : la suggestion horaire est celle de **maintenant**, pas du jour consulté, donc remplir hier soir à 9 h proposerait « Petit-déj ». *Elle rendrait la suggestion moins pertinente, pas plus.* | cohérent | VALIDÉ |
| D-012 | 20/09/2026 | le choix manuel du repas doit-il survivre à un **rechargement de la PWA** ? | **Michel** | **NE PAS CORRIGER pour l'instant — observer l'usage réel.** *Mesuré : après rechargement, `_afMeal` retombe à `null`, `_afMealActif()` rend la suggestion horaire, et l'aliment suivant s'écrit dans ce repas-là.* ⛔ **Le motif n'est pas technique, il est méthodologique** : le point vient d'un **audit**, pas du terrain — **R22** dit qu'un retour isolé s'observe avant d'être corrigé, et la Nutrition est justement en phase d'observation. ⭐ **Réouverture sur PREUVE** (règle d'or #15) : une gêne réellement rencontrée. La solution serait alors `localStorage` portant `{repas, jour}`, relu seulement si le jour est aujourd'hui (~6 lignes, aucune couche nouvelle, rien dans `S`, rien au cloud). | **corriger tout de suite** parce que c'était techniquement simple — c'est exactement le motif que **R19** refuse : *une correction dimensionnée pour une gêne qu'on n'a pas est une dette, pas une amélioration*. ⛔ Et `sessionStorage` est écartée **faute de mesure** : son comportement en PWA standalone iOS n'est pas mesurable depuis le conteneur (règle d'or #16 — une supposition ne devient jamais une contrainte) | cohérent | VALIDÉ |
| D-013 | 20/09/2026 | que doit proposer la case « Masse grasse du jour » un jour où rien n'est encore noté ? | **Claude** | ⛔ **NE RIEN CHANGER au chiffre prérempli** — le calcul US Navy reste proposé — mais **dire d'où il vient** et **montrer la dernière valeur réellement enregistrée avec sa date**. *Impact : aucun sur la donnée, uniquement sur ce que l'écran AFFIRME. Réversible en une ligne.* ⚖️ **La décision de fond reste à Michel** (voir l'alternative). | **préremplir la dernière valeur enregistrée** (ce que le brief suggérait) ou **partir vide** — écartées ici parce que **chacune a un piège MESURÉ, pas parce qu'elles sont mauvaises** : ① proposer 19,1 d'hier et laisser appuyer sur ✓ **daterait d'aujourd'hui une mesure d'hier** — c'est exactement ce que le brief interdit dans sa liste « dans tous les cas » ; ② partir vide **casserait le parcours US Navy**, où l'on tape ses centimètres et où le % apparaît prêt à valider. 👉 *Trancher entre les deux, c'est choisir qui de l'utilisateur-balance ou de l'utilisateur-mètre-ruban est le cas normal — et ça, le code ne peut pas le dire.* | cohérent | À TRANCHER |

---

*Lié à : `docs/VISION-FORCE-TRACKER.md` (la question de référence) · `docs/PROCESSUS-DEVELOPPEMENT.md`
(la clôture obligatoire) · `docs/REGLES-ARCHITECTURE.md` (**R19** gouvernance légère, **R30** un retrait
s'écrit, **R38** auditer un brief extérieur) · règles d'or **#12** (tenir les fichiers de suivi) et
**#15** (une décision actée reste actée) · `capacites-ia.js` (le modèle « ce qui DOIT être / ce qui EST »).*
