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
| D-013 | 20/09/2026 | que doit proposer la case « Masse grasse du jour » un jour où rien n'est encore noté ? | **Claude** | ⛔ **NE RIEN CHANGER au chiffre prérempli** — le calcul US Navy reste proposé — mais **dire d'où il vient** et **montrer la dernière valeur réellement enregistrée avec sa date**. *Impact : aucun sur la donnée, uniquement sur ce que l'écran AFFIRME. Réversible en une ligne.* ⚖️ **La décision de fond reste à Michel** (voir l'alternative). | **préremplir la dernière valeur enregistrée** (ce que le brief suggérait) ou **partir vide** — écartées ici parce que **chacune a un piège MESURÉ, pas parce qu'elles sont mauvaises** : ① proposer 19,1 d'hier et laisser appuyer sur ✓ **daterait d'aujourd'hui une mesure d'hier** — c'est exactement ce que le brief interdit dans sa liste « dans tous les cas » ; ② partir vide **casserait le parcours US Navy**, où l'on tape ses centimètres et où le % apparaît prêt à valider. 👉 *Trancher entre les deux, c'est choisir qui de l'utilisateur-balance ou de l'utilisateur-mètre-ruban est le cas normal — et ça, le code ne peut pas le dire.* | cohérent | REMPLACÉE → D-014 |
| D-014 | 20/09/2026 | la case « Masse grasse du jour » doit-elle proposer quelque chose quand aucune MESURE n'a été prise ce jour-là ? (tranche `D-013`) | **Michel** | ⭐ **NON — le champ reste VIDE.** Il n'est prérempli que par une **mesure du jour consulté** ; l'estimation US Navy reste visible **à part**, comme une estimation. Sa phrase : *« s'il n'existe aucune valeur manuelle pour ce jour, ne préremplis pas le champ avec une ancienne mesure de balance »* et *« attention à ne pas créer une nouvelle mesure simplement parce qu'une ancienne valeur était affichée dans un champ »*. *Impact : le parcours US Navy n'est pas perdu — un ✓ sur champ vide enregistre l'estimation, mais ÉTIQUETÉE comme telle.* | **garder le préremplissage par le calcul** (`D-013`, l'état d'avant) — écartée parce qu'un champ prérempli + un ✓ machinal **fabriquent une mesure que personne n'a prise**, et qu'une fois enregistrée rien ne la distinguait d'une valeur de balance. Et **préremplir la valeur d'un autre jour** — écartée pour la raison déjà mesurée en `D-013` : *elle daterait d'aujourd'hui une mesure d'hier*. | cohérent | VALIDÉ |
| D-015 | 20/09/2026 | comment séparer une masse grasse **mesurée** d'une **estimation** US Navy sans migration ? | **Claude** | un champ de **provenance** `bfSrc` s'ajoute **à côté** de `bf` (`mesure` · `estime`, absent = **on ne sait pas**), et une estimation n'écrit que sur un emplacement **vide ou déjà estimé**. *Impact : aucune donnée existante n'est touchée ni reclassée ; le contrat de `weightLog` s'élargit d'une clé facultative, qui part au cloud d'elle-même.* | **remplacer `bf` par deux champs** (`bfMesure`/`bfEstime`) — écartée : elle obligerait à **migrer toutes les lignes existantes** et à deviner laquelle des deux natures leur attribuer, ce que personne ne sait (règle d'or #16). Et **ne rien stocker de l'estimation** — écartée : les courbes de masse grasse perdraient tous leurs points sur les comptes qui n'utilisent que le mètre-ruban. | cohérent | VALIDÉ |
| D-016 | 21/09/2026 | que doit afficher l'app quand elle n'a pas de quoi calculer un plan nutritionnel ? | **Michel** | ⭐ **NE RIEN PRÉSENTER COMME UN PLAN PERSONNALISÉ.** Sa phrase : *« Force Tracker ne doit jamais présenter comme plan personnalisé un résultat calculé avec des informations insuffisantes »* — donc aucun TDEE fabriqué, aucune macro fabriquée, pas de `1 500 kcal` en guise de cible, pas de « TDEE 0 » présenté comme une donnée. L'interface dit simplement que le calcul n'est pas disponible. *Impact : la chaîne calorique rend `null` au lieu d'un nombre ; réversible, aucune donnée n'est touchée.* | **laisser le plancher de sécurité tenir lieu de cible** — c'était l'état d'avant, et il a duré parce qu'il ne plante pas : un compte neuf voyait un plan crédible, et rien ne le signalait. ⛔ Écartée parce que *le plancher est une borne basse sur un calcul, pas un substitut de calcul* | cohérent | VALIDÉ |
| D-017 | 21/09/2026 | faut-il supprimer le `1 500` puisqu'il produit le faux plan ? | **Michel** | ⛔ **NON — `PLANCHER_KCAL` reste intact, H 1500 / F 1200.** Sa consigne : *« ne supprime pas aveuglément toutes les occurrences de 1500 »*. Mesuré : ce n'est pas une valeur en dur mais le garde-fou de ft-v918, qui empêche l'app de **prescrire** une cible qu'elle signalerait elle-même comme dangereuse. *Impact : deux témoins l'épinglent désormais, pour qu'il ne soit pas « nettoyé » par quelqu'un qui ne connaîtrait que le symptôme.* | **retirer le plancher** — écartée sur mesure : elle rendrait une cible de **947 kcal** à une femme de 55 kg en perte (le cas chiffré de ft-v918), c'est-à-dire qu'on remplacerait un faux plan par un plan dangereux | cohérent | VALIDÉ |
| D-018 | 21/09/2026 | un repas décrit à l'IA doit-il être corrigé automatiquement quand l'énergie contredit les macros ? | **Claude** | ⭐ **OUI QUAND UN POIDS EST CONNU, NON SINON.** Avec un poids supposé par l'IA, un vrai pour-100 g existe : la porte se comporte comme les 8 autres écrivains et l'écran **explique** la substitution. Sans poids, on **classe sans réécrire** — la branche qui explique lit `_bcNutr`, absent dans ce cas, et *une correction qu'aucun écran n'explique est une correction silencieuse* (ft-v1207). *Impact : le verdict atteint la donnée dans les deux cas ; réversible, aucune migration.* | **corriger dans les deux cas** — écartée parce qu'elle produirait une correction muette ; et **ne corriger dans aucun** — écartée parce qu'elle laisserait le repas décrit être le seul écrivain hors du résolveur, ce que ce chantier existe pour fermer | cohérent | VALIDÉ |
| D-019 | 21/09/2026 | `ia` doit-elle rejoindre les origines que le résolveur ne réécrit jamais (`manuel` · `reprise` · `historique`) ? | **Claude** | ⛔ **NON.** Ces trois origines sont protégées parce que *la valeur vient de la PERSONNE*. Un modèle qui propose un chiffre n'est pas la personne qui l'a tapé — et la personne garde la main : le champ reste modifiable, et elle voit la valeur avant de valider. *Impact : `NRJ_ORIGINES_UTILISATEUR` n'est pas touchée ; un témoin fige sa composition.* | **protéger `ia` comme une saisie** — écartée : elle aurait désactivé le résolveur sur la porte même qu'on venait d'y brancher, **en silence**, pendant que tout le reste du code aurait eu l'air correct (c'est une des mutations déguisées du contrôle négatif) | cohérent | VALIDÉ |
| D-020 | 24/09/2026 | un niveau d'activité **jamais choisi** peut-il produire un TDEE et des macros ? | **Michel** | ⭐ **NON — D-016 s'applique aussi à l'activité** (après contre-vérification de Claude principal). Absent ou hors des 5 niveaux de l'écran → `null` → *« il manque ton niveau d'activité »* ; le Profil affiche « À choisir » ; aucune autre activité choisie à la place. ⛔ Ne valide **pas** la calibration des multiplicateurs (non touchés). Mise en œuvre : `_activiteValide` (`state.js`), témoins `tests/parcours/activite_provenance.js`. | **garder `1.55` d'office** — écartée : l'absence de choix fabriquait en silence un « Modéré (3-4j) » et un plan présenté comme personnel | cohérent | VALIDÉ |
| D-021 | 24/09/2026 | que faire d'un `ft4_act` **déjà stocké** (souvent `1.55`), puisque `persist()` l'écrivait à chaque sauvegarde, choisi ou non ? | **Claude** | **le GARDER** comme s'il avait été choisi — on ne peut pas prouver qu'il ne l'a pas été, et l'effacer changerait d'un coup le plan de tous les comptes existants. Témoin ⑬ de `activite_provenance.js`. ⚠️ Conséquence : D-020 ne protège aujourd'hui que les profils **neufs**. Faits mesurés la nuit du 24→25/09 (serveur qui garde `1.55`, interface qui ne peut pas l'effacer, population qui grossit tant que B1 n'est pas publié) : `docs/NUTRITION-GLUCIDES-2026-09-24.md` §10. | **l'effacer** (tous les comptes redemandent leur activité) · **demander une confirmation** aux comptes existants — non retenues sans l'avis de Michel : c'est une décision d'écran et d'annonce, pas un correctif | écart à soumettre | À TRANCHER |

---

*Lié à : `docs/VISION-FORCE-TRACKER.md` (la question de référence) · `docs/PROCESSUS-DEVELOPPEMENT.md`
(la clôture obligatoire) · `docs/REGLES-ARCHITECTURE.md` (**R19** gouvernance légère, **R30** un retrait
s'écrit, **R38** auditer un brief extérieur) · règles d'or **#12** (tenir les fichiers de suivi) et
**#15** (une décision actée reste actée) · `capacites-ia.js` (le modèle « ce qui DOIT être / ce qui EST »).*
