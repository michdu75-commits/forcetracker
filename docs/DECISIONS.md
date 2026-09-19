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
| ① **nommer les choix pris seul** | la colonne **Qui** — `Claude seul` saute aux yeux, et l'**alternative écartée** est écrite à côté |
| ② **le registre des décisions** | ce tableau, qui rend la **règle d'or #15** vérifiable par machine |
| ③ **la question de la Vision** | la colonne **Vision**, obligatoire à chaque ligne — plus la ligne ajoutée à la clôture de `docs/PROCESSUS-DEVELOPPEMENT.md` |
| ④ **le point de cap** | `python3 tools/point_de_cap.py` — une **lecture générée** du tableau, jamais un exercice à refaire à la main |

---

## 📏 LES RÈGLES DU FICHIER

1. **Une décision y entre quand elle ferme une alternative réelle.** Un choix sans alternative
   n'est pas une décision, c'est une évidence — et remplir de faux choix rendrait le fichier
   illisible, donc inutile (le sort de tout fichier qu'on n'ouvre plus, **R19**).
2. **Il s'AJOUTE, il ne se réécrit jamais** — même discipline que `docs/JOURNAL-ARCHIVE.md`, qui a
   été écrasé une fois (297 entrées perdues, découvertes deux jours après, par hasard).
3. **Une décision ÉCARTÉE reste écrite, avec sa raison** (**R30**) — sinon elle revient dans six
   mois et quelqu'un la « répare ».
4. ⛔ **Il ne remplace pas le journal** : le journal dit *ce qui a été fait et pourquoi*, celui-ci
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

> **Colonnes** — `id` · `date` · `sujet` · **`qui`** (`Michel` ou `Claude seul`) · `décision` ·
> **`alternative écartée`** · **`vision`** (`renforce` · `neutre` · `tension`) · `état` (`appliquée`
> · `partielle` · `en attente`).
> ⚠️ **`tension` n'est pas une faute** : c'est un signal que la décision tire contre l'esprit du
> produit et mérite d'être relue. *Un registre où tout « renforce » ne mesure plus rien.*

| id | date | sujet | qui | décision | alternative écartée | vision | état |
|---|---|---|---|---|---|---|---|
| D-001 | 19/09/2026 | garder la main sur la direction | **Michel** | retenir **les quatre** protections proposées (choix seuls · registre · question Vision · point de cap) | n'en retenir qu'une, comme le recommandait la proposition au nom de la gouvernance légère | renforce | appliquée |
| D-002 | 19/09/2026 | forme des quatre protections | **Claude seul** | un **seul** tableau lu de quatre façons, au lieu de quatre mécanismes séparés | quatre fichiers et quatre gestes distincts — fidèle à la demande, mais quadruplant la charge (**R19**) | renforce | appliquée |
| D-003 | 19/09/2026 | numéro de version dans le tableau d'architecture de `CLAUDE.md` | **Claude seul** | **retirer** la copie du numéro et renvoyer à `sw.js` | remettre la copie à jour (`ft-v1224` → `ft-v1226`) — plus simple, mais la dérive serait revenue (**R2**) | neutre | appliquée |
| D-004 | 19/09/2026 | où consigner le cap « Claude n'est pas Milo » | **Claude seul** | un **fichier neuf**, `docs/INDEPENDANCE-MOTEUR-MILO.md` | étendre `ARCHITECTURE-CERVEAU-CERVELET.md` — moins de fichiers, mais aurait noyé un **cap** dans un document de **frontière technique** | renforce | appliquée |
| D-005 | 19/09/2026 | la consigne « vérifier les briefs venus de l'extérieur » | **Claude seul** | en faire une **règle** (**R38**) plutôt que l'appliquer au coup par coup | l'appliquer sans l'écrire — c'était l'état d'avant, et il tenait par habitude, pas par garantie | renforce | appliquée |
| D-006 | 19/09/2026 | le repli code-barres garde un pot de 25 alors que sa politique est « PREMIUM, 0 » | **Michel** | garder le pot tant que le **verrou serveur** n'existe pas | lui retirer son pot tout de suite — l'aurait rendu **illimité et gratuit**, l'exact contraire de la décision | neutre | partielle *(écart écrit dans `capacites-ia.js`)* |
| D-007 | 19/09/2026 | le choix manuel du repas survit-il à un changement de jour ? | **Michel** | **ne rien décider** — le comportement reste tel quel, observé et non corrigé | inventer une remise à zéro, qu'aucun besoin mesuré ne réclamait (**règle d'or #15**) | renforce | en attente |

---

*Lié à : `docs/VISION-FORCE-TRACKER.md` (la question de référence) · `docs/PROCESSUS-DEVELOPPEMENT.md`
(la clôture obligatoire) · `docs/REGLES-ARCHITECTURE.md` (**R19** gouvernance légère, **R30** un retrait
s'écrit, **R38** auditer un brief extérieur) · règles d'or **#12** (tenir les fichiers de suivi) et
**#15** (une décision actée reste actée) · `capacites-ia.js` (le modèle « ce qui DOIT être / ce qui EST »).*
