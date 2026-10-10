# 🔬 Suivi de l'audit — où on en est

> **Créé le 23/08/2026, à la demande de Michel** : *« il faudra que tu écrives les journaux sur ce
> qui a été fait, à faire aussi, et les rapports d'audit pour savoir où on en est »*.

## À quoi sert ce fichier (et à quoi il ne sert pas)

| Question | Où on répond |
|---|---|
| *« Que s'est-il passé, et pourquoi ? »* | le **journal des versions** (`CLAUDE.md`, puis `docs/JOURNAL-ARCHIVE.md`) |
| *« Où en est-on MAINTENANT ? »* | `docs/CONTEXTE-ACTUEL.md` — une page, l'état du jour |
| *« Est-ce que c'est déjà construit ? »* | `docs/INVENTAIRE.md` — généré depuis le code |
| **« Où en est l'AUDIT ? Qu'est-ce qui reste ? »** | **ici** |

⚠️ **Ce fichier ne raconte pas l'histoire, il tient le SCORE.** Un sujet d'audit y entre une fois,
et change d'état — jamais deux entrées pour le même sujet. Quand tout est traité, il se ferme.

**⛔ Et un sujet ÉCARTÉ y reste, avec sa raison** (**R30**) : un point retiré sans trace redevient
un bug, et quelqu'un le « répare » six mois plus tard.

---

## 📍 Où on en est, en une ligne

**Les 3 bloquants de production sont corrigés** (ft-v981 · ft-v982 · ft-v983). **Les trois
priorités post-contre-audit sont livrées** (①② validation unique + bouton allégé `ft-v989`,
③ coût réel `ft-v990`). Ce qui reste n'est plus du **danger**, c'est de la **vérification**
et du **produit** — et deux décisions de fond (④⑤, gated par **R34**) qui attendent un vrai
coût mesuré avant de trancher si elles rapportent quelque chose.

**Niveau recommandé aujourd'hui : 50 à 200 bêta-testeurs.**
Rapport complet : artefact *« Milo face au code »*.

---

## ✅ Ce qui a été FAIT

| Sujet | Version | Ce qui a réellement changé |
|---|---|---|
| **Objectif « équilibre » = +350 kcal** | `ft-v981` | `0\|\|350` rendait 350. « Équilibre » valait **exactement « prise de muscle »** (3 190 kcal). → 2 840, écart 0. **Table dédupliquée** (elle vivait dans `state.js` ET `screens.js`). |
| **Katch lisait `w.bw`, la prod écrit `kg`** | `ft-v981` | La branche « pesée + % de gras → masse maigre » n'avait **jamais** tourné. Repli `bw` conservé pour les vieilles sauvegardes. |
| **2ᵉ lecteur `bw` cassé** *(non vu par l'audit)* | `ft-v981` | `_bilanMois()` — la ligne « Poids de corps » du bilan mensuel ne s'affichait jamais. |
| **Blessure dite à Milo → Gardien** | `ft-v982` | Chemin éteint derrière `__FT_CLONE__`. Mesuré avant : Profil Santé `""`, Gardien `[]`. **Les DEUX moitiés** étaient éteintes (le pont **et** la consigne « nomme la ZONE »). |
| **Le diagnostic médical passait tel quel** | `ft-v983` | Sur les **5 contrôles de sortie, un seul retirait vraiment**. Le diagnostic déclenche désormais un renvoi au médecin — **par ajout, sans réécrire la réponse**. |
| **La course `_saveCoachMemory`** | `ft-v993` | **Prouvée avant correctif** (consigne du suivi) : deux résumés à 20 ms d'écart envoient la même `existingMemory`, le dernier revenu écrase l'autre — un fait mémorisé perdu **sans erreur ni trace**. Corrigée par une **file** (motif du débrief ft-v979, R13/R2) : chaque résumé relit la mémoire au moment de partir. L'appelant n'attend toujours pas le réseau (règle d'or #3), et un échec ne gèle pas la file. |
| **La mémoire à deux vitesses** | `ft-v992` | **Ouverte à tout le monde** après mesure du coût : **auto-dégressive** (0 car. sous 6 séances, 2 622 au plafond) et **zéro impact sur le bloc commun** — ces caractères tombent dans le bloc personnel, la crainte du plafond visait le mauvais bloc. Raison d'avant conservée (**R30**). ⭐⭐ **Trouvé en vérifiant que R34 pouvait juger le changement** : aucun des 21 scénarios n'avait plus d'UNE séance — l'avant/après aurait comparé deux contextes identiques. D'où **EV-022** (mémoire longue). ⚠️ **Le benchmark n'a PAS été joué** (pas de clé API ici) : R34 n'est honoré qu'au prochain lancement. |
| **Le vocabulaire Katch de Milo** | `ft-v991` | Les **trois** provenances de la masse maigre (lue · **déduite** par soustraction · % de gras **tapé au clavier**) donnaient une phrase **identique mot pour mot** : *« MESURÉE … SOLIDE … sans réserve »*. La provenance descend maintenant jusqu'à la donnée (`nature`, **R4**) et Milo reçoit le mot **ESTIMATION** avec sa raison. ⭐⭐ **Le témoin épinglait « MESURÉE », donc il protégeait la mauvaise phrase** — corrigé en premier, comme prévu ici. ⚠️ Le brief annonçait un « motif regex » : **faux**, c'était R4. ⭐ Katch n'est pas dévalué (l'écart chiffré avec Mifflin reste). |
| **Le débrief de séance se perdait** | `ft-v979` | **5 séances sur 36 sans aucun débrief.** File d'attente + jeton « en cours » + rattrapage au démarrage. |
| **Le contrôle d'intensité n'existait pas** | `ft-v980` | `bz()` inversée + coefficient de tenue → le code refait, **à la proposition**, le calcul que Milo ne faisait que si on le questionnait. |
| **La quantité disparaissait à la 2ᵉ saisie** | `ft-v984` | Le bloc était caché sans condition quand on reprend un aliment de son propre journal, `per100` transmis deux lignes plus bas. |
| **Les 4 chemins de code-barres s'enregistraient tous en « scan »** | `ft-v987` | Michel : *« ce n'était pas un scan, j'ai rentré le code-barre manuellement »*. Mesuré sur ses 23 entrées : ses « 6 scans » comptaient des saisies clavier — **la donnée censée trancher les questions produit était fausse**. + `_eanValide()` : le seul mode d'échec de ce chemin est **silencieux** (un chiffre faux donne *le produit de quelqu'un d'autre*). |
| **L'export était tout-ou-rien** | `ft-v988` | Le bouton « Exporter » emportait bilan sanguin, bilan corporel, TRT et profil santé, et la fenêtre n'avertissait que pour les conversations — alors que le fichier existe **pour être donné**. Export restreint à l'entraînement (**liste blanche**), et l'export complet dit désormais ce qu'il contient. |
| **6 fixtures de test calculaient le jour en UTC** | `ft-v986` | L'app calcule en heure **locale**. Deux témoins sont passés au rouge **tout seuls à 00 h 34**, sans qu'aucun code applicatif n'ait bougé. *Verts 22 h par jour, rouges 2 h — un témoin qui dépend de l'heure ne protège rien.* Une seule des six rougissait ; **les cinq autres étaient latentes**. |
| **Le garde-fou de taille ne testait que des profils SAINS** | `ft-v988` | Mesuré : sain **45 362**, blessé **47 118** pour un plafond de 46 500. Le plafond était franchi en production chez toute personne blessée pendant que le témoin restait vert. Seuil **non relevé** ; état épinglé. |
| **« À la main » en premier et en rouge** | `ft-v986` | Demande de Michel. ⚠️ Remplace une décision qui avait sa raison écrite (R30), et **la donnée mesurée allait dans le sens de l'ancien ordre** — arbitrage d'usage assumé, tracé pour pouvoir revenir en arrière. |
| **La confirmation s'ouvrait DERRIÈRE la modale** | `ft-v985` | `#ov-confirm` était à z-index **500**, comme `#ov-edit-food` — à égalité, c'est l'ordre du DOM qui tranche. **19 overlays** au-dessus ou à égalité, pas un seul. |
| **①② Validation unique + bouton allégé** | `ft-v989` | **Priorités n°1 et 2** de Michel, tranchées le 24/08. Posée au seul point que les deux portes traversent (`_appliqueMiloSession`, même raison que ft-v980). Réutilise `_gardienZones`, `_GARDIEN_CONSTRAINTS`, `_EX_SWAP_RAISONS` — rien de réinventé. **② était déjà acquis** : vérifié le même jour, `_startSessionFromMilo` ne fait aucun appel IA au clic. On signale, on ne bloque pas (R24). |
| **③ Instrumentation du coût réel par appel API** | `ft-v990` | **Priorité n°3**, en parallèle de ①②. Capture `data.usage` (déjà renvoyé par l'API, jeté jusqu'ici) au seul point commun (`callClaude`/`callClaudeDiag`) — **ne change rien au comportement de Milo**. Même mécanique bornée que `ai_quota` côté Apps Script (R2/R13). Coût en euros = estimation écrite comme telle (R29), tarifs repris de `tests/milo/eval.js`. **Vérifié fonctionnellement** (vrai Code.js dans un bac à sable Node) ; **pas encore par un appel réel facturé**, indisponible dans cet environnement. |

---

## ✅ Décisions tranchées par Michel — 24/08/2026 au matin

> Après lecture du contre-audit et de la réponse de GPT, Michel a rendu son arbitrage. **Ses mots,
> gardés tels quels** — c'est ce qui doit rester lisible dans six mois, pas un résumé qui les use :

> *« Priorité numéro 1, une validation déterministe unique avant l'activation de la séance :
> blessures, exclusions, doublons. Priorité 2, alléger le bouton « Commencer la séance » pour
> qu'il appelle uniquement cette validation. En parallèle, instrumentation fine du coût réel par
> appel API. Déplacer les 13 000 caractères génériques semble sûr en quantité, mais l'effet sur
> le modèle doit être testé via le benchmark, pas au feeling. Les caches par lieu oui, mais
> seulement quand l'usage réel justifie plusieurs entrées partagées. Les records, on ne touche
> pas pour l'instant ; à terme, sélection côté application avant Milo. Et surtout, chaque
> changement doit passer par un avant-après benchmark. »*

| Décision | Ce qu'elle tranche |
|---|---|
| **① Validation unique, déterministe** — blessures, exclusions, doublons | Devient LA priorité n°1. Remplace le validateur partiel actuel. |
| **② `_startSessionFromMilo` s'ALLÈGE** — n'appelle QUE la validation | ⭐ Précision d'architecture, pas juste une feature : le bouton devient un simple **appelant** de ①, il ne porte plus sa propre logique de contrôle. Un seul endroit qui décide (**R2**). |
| **③ Instrumentation du coût réel** — EN PARALLÈLE, pas après | Michel ne suit pas l'ordre strict proposé par GPT (« B avant C ») : ① et ③ avancent ensemble. |
| **④ Reclassement des 13 452 caractères génériques** — **APPROUVÉ EN PRINCIPE**, gated | *« semble sûr en quantité, mais l'effet sur le modèle doit être testé via le benchmark, pas au feeling »* → **R34** (nouvelle règle, `docs/REGLES-ARCHITECTURE.md`) : état A → benchmark → déplacement → état B → même benchmark → comparaison. Pas de livraison hors de ce rite. |
| **⑤ Caches par lieu (5 variantes)** — **APPROUVÉ, mais PAS construit d'avance** | *« oui, mais seulement quand l'usage réel justifie plusieurs entrées partagées »* → on ne construit PAS les 5 variantes par anticipation (**R19** — coût payé pour un gain qui n'existe pas encore). On instrumente, on observe, on construit si l'usage le demande. |
| **⑥ Records non bornés** — **ON N'Y TOUCHE PAS** | *« on ne touche pas pour l'instant ; à terme, sélection côté application avant Milo »* — rejoint la proposition de GPT (séance en cours + programme + mouvements principaux systématiques, le reste à la demande), mais **différé**, pas urgent. |
| **⑦ RÈGLE DURABLE** — *« chaque changement doit passer par un avant-après benchmark »* | Montée en **R34** dans `docs/REGLES-ARCHITECTURE.md` — s'applique à TOUT changement de contexte, pas seulement à ④. C'est la phrase la plus importante de l'arbitrage : elle ne referme pas une décision, elle en ouvre la méthode pour toutes les suivantes. |

⚠️ **Ce que cet arbitrage ne tranche PAS explicitement** : le plafond dépassé chez un profil
blessé (47 118 pour 46 500, ft-v988) reste **épinglé, non résolu**. Il est probable qu'il se
règle en même temps que ④ (les deux touchent le même bloc commun), mais Michel ne l'a pas nommé
— ne pas le lire comme tranché.

---

## ⏳ Ce qui RESTE — par palier

### 🟠 Avant une ouverture large (50-200 → bêta publique)

| Sujet | Pourquoi ça compte | Difficulté |
|---|---|---|
| **Rejouer le benchmark** | Il existe, il tourne, **il n'a pas encore vu les correctifs de ft-v979→988**. | Faible — ⚠️ demande un vrai appel API |
| ✅ **FAIT (ft-v1086)** — ⚠️ **et cette ligne était PÉRIMÉE** : le contrôle existait déjà (`_validationSeance` → `exclusions`). Le vrai défaut était la comparaison sur le **nom EXACT** — « Developpe Couche » sans accents rendait **0 signalement**. | Faible, une fois ① posée |
| **④ Reclasser les 13 452 caractères génériques** | **Approuvé en principe** (24/08), **gated par R34** : aucun déplacement ne se livre sans un avant/après sur le vrai banc d'essai. → `AUDIT-CONTEXTE-MILO.md` §14.6-14.8, `ECHANGE-GPT.md`. | Moyenne — bloquée tant que ③ (le coût) ET le banc d'essai (un vrai appel API) ne sont pas disponibles |
| **⑤ Caches par lieu (5 variantes)** | ✅ **MESURÉ le 24/08 (ft-v993), et NON construit — c'est la bonne réponse.** Les 5 variantes sont bien distinctes (salle 11 446 · basique 8 544 · maison 6 493 · pdc 2 136 · non renseigné 11 475 car.), mais **aucun gain sous ~6 personnes actives dans la même heure ET sur le même lieu**. Le projet a une poignée de testeurs → gain **zéro** aujourd'hui. | ⏭️ Rouvrir quand l'usage le justifiera — ft-v990 (coût réel) donnera le signal |
| **⚠️ Le plafond dépassé chez un profil blessé reste épinglé, non tranché** | Le témoin (ft-v988) mesure et empêche la dérive, mais l'arbitrage du 24/08 ne le nomme pas explicitement — probablement lié à ④, à confirmer. | **Décision de Michel, en suspens** |

### 🔵 Peut attendre après la mise en production

- ✅ **FAIT (ft-v1086)** — ~~La provenance effacée en rouvrant un bilan~~ — `tracking.js:1459` remet `_bsSource='manuel'` même pour un bilan existant. *Défaut créé par le correctif de ft-v978.*
- ~~**Les textes périmés**~~ → **2 sur 4 FAITS** (ft-v1086) : la phrase de récup annonçait *« ~36 h »* quand le calcul efface sur **48 h** depuis le 02/08 (une seule constante désormais, `RECUP_EFFACE_H`), et la bannière affichait **« Contraception hormonale — Jour null/0 »**. ⚠️ **Les 2 autres ne sont pas des défauts** : le cardio EST bien ajouté au TDEE (vérifié — `coach.js` dit à Milo de ne pas le recompter) ; reste **la phase 2 du parcours débutant**, seule encore ouverte.
- ✅ **FAIT (ft-v1088)** — ~~`projectRM` centré sur le squat~~. **Mesuré** : un soulevé de terre à **180 kg** était projeté à **+10,8 %**, comme un débutant total. `getLevel` (dormante depuis ft-v385, débranchée pour l'AFFICHAGE et non parce qu'elle était fausse — R30) le juge par exercice, par sexe et par âge. L'indice 4 est enfin atteignable. ~~reste~~ — sans squat enregistré, la projection est **la plus optimiste**. Et l'indice 4 de la table est **inatteignable** (la branche rend 0-3).
- ✅ **FAIT à moitié, EXPRÈS (ft-v1088)** — ~~Biais « femme = fessiers »~~. Une priorité **déclarée** décide désormais quel que soit le sexe (un homme qui coche « Fessiers » reçoit enfin le hip thrust). ⏭️ **Ce que reçoit une femme qui n'a RIEN déclaré n'est pas tranché** : le retirer serait décider à sa place dans l'autre sens — arbitrage produit, dans `IDEES-FUTURES.md`. ~~reste~~ — `_beginnerProg` lit `gender` alors que `S.priorities` existe et n'est jamais passé.
- ~~**Sommeil et pas** — reçus dans `healthDaily`, stockés, synchronisés, **jamais lus**~~ → **RÉGLÉ** (ft-v1069/1070/1071) : mesuré le 01/09, `sleep` est lu par le score de récup (`tracking.js:415`) et `steps` par le TDEE et la courbe (`tracking.js:2419/2467`). ⚠️ **Mais les trois versions restent DORMANTES** tant que le raccourci iOS n'envoie pas ces deux champs — c'est la tâche qui attend Michel (`A-FAIRE-SUR-PC.md`). *Le code est branché, la donnée n'arrive pas.*
- ✅ **FAIT (ft-v1086)** — ~~Deux conventions de sexe opposées~~. **Mesuré** : `"Homme"` donnait **TDEE 1524 (femme) + plancher 1500 (homme)**, et le chemin était réel — la **restauration** écrivait `S.gender = d.gender` sans garde. Normalisation à l'entrée (R33) + un seul propriétaire (`sexeAthlete`).
- ⛔ **RÉFUTÉE (ft-v1088)** — ~~La course `_saveCoachMemory`~~. Mesuré : **3 appels concurrents sont sérialisés** (la file de ft-v993 tient), un **échec réseau ne détruit pas** la mémoire, et le jeton a **déjà** deux propriétaires (`_dbfFaits` séparé du Registre) — *« débrief livré » et « mémoire produite » sont deux faits différents, et c'est une décision écrite dans le code*. **Aucune ligne modifiée** ; 3 témoins figent la décision (R30).
- **⭐⭐ INSTRUMENTER LE COÛT RÉEL DE MILO — priorité proposée par GPT le 24/08, et Claude est d'accord.** Relever `input_tokens` · `cache_creation_input_tokens` · `cache_read_input_tokens` · `output_tokens` · modèle · coût pour chaque appel, **sans toucher au comportement de Milo**. Argument de GPT : c'est la **seule** façon de savoir si un chantier de cache rapporte quoi que ce soit — donc ça doit **précéder** le travail sur le cache, pas le suivre. ⚠️ **Réserve de Claude, écrite dans `ECHANGE-GPT.md`** : cette case ne peut pas être cochée par une simple relecture de code — coder l'instrumentation est simple (le Worker a déjà la réponse API sous la main), **la vérifier demande un vrai appel facturé**, qu'aucune des deux sessions d'analyse n'a pu faire (pas de clé API dans l'environnement).

### ⚪ Décisions produit / science (pas des bugs)

- Le **cycle menstruel** : `+150 kcal` en lutéale et le readiness `−10/−5/+2/+4` sont **automatiques** et modifient de vraies calories. Le `+0,2 g/kg` de protéines a une source (DOI `10.1080/15502783.2023.2204066`) ; **le +150 n'en a pas**.
- `calcWorkExtra` : `{bureau:0, debout:200, actif:325, physique:450}` sans source locale.
- Les **repères alimentaires** (macros → assiette).
- Renommer « À la main » et revoir l'ordre des boutons — ⭐ **la donnée pour trancher existe déjà** : `saisie`/`origine` sont enregistrés sur chaque entrée de `foodLog`, il ne manque que l'agrégation.

---

## ⛔ Écarté, avec la raison (R30)

| Sujet | Pourquoi il est écarté |
|---|---|
| **« Le retrait du clone a créé le trou blessure »** | **Faux.** Essai **jamais promu**, listé comme tel le jour du retrait (ft-v976). *Personne n'avait rien cassé — une décision n'avait jamais été prise.* ⭐ Et en la prenant on a découvert **pourquoi** il était parqué : 7 faux positifs sur 9. |
| **« Conflit de moteurs sur les glucides »** | L'audit se corrige lui-même, et il a raison : **aucune variable glucidique n'est modifiée par la phase**. C'est un conflit de *discours*, pas de moteurs. |
| **« OCR local à écarter »** | Livré en **ft-v974**. |
| **« Le PDF de Milo est vide »** | Mesuré intact (81/81, 9 769/9 769). C'était la **livraison** (le `title:` du partage), corrigé en ft-v978. |
| **« `calcWorkExtra` : un 0 neutralisé par `\|\|` »** | Faux positif : `{bureau:0…}[x]\|\|0` rend bien `0`. |
| **Double comptage de l'énergie active** | **Pas un défaut actuel** — rien n'est implémenté. C'est une **mise en garde** à écrire avant d'y toucher, pas une correction. |

---

## 🧭 Ce que cette session a appris — les leçons de méthode

Elles valent plus que les correctifs, parce qu'elles se rappliquent :

1. **⭐⭐ Un test qui n'emploie pas le schéma de la production ne teste rien — il rassure.** Les deux bugs de calcul étaient protégés par des fixtures qui écrivaient `bw` quand l'app écrit `kg`. **Corriger la fixture AVANT le code, et vérifier qu'elle rougit.**
2. **⭐⭐ Avant de PROMOUVOIR un essai parqué, chercher pourquoi il l'était.** Le miroir de R30. Le pont blessure promu tel quel aurait été **pire que rien**. *Un garde d'essai est une question non résolue, pas un interrupteur.* → montée en `docs/REGLES-ARCHITECTURE.md`
3. **⭐ Reproduire dans un navigateur avant de conclure** (`BUGS.md` **12quater**). Appliqué pour la quantité ; **et une fois de plus mon premier essai de mesure n'a rien mesuré** (`_afSuggLoc` est une variable de script, pas `window`) — il lisait un libellé resté de l'étape d'avant.
4. **⭐ Compter les endroits, pas les corriger.** *« Un correctif posé d'un seul côté est un oubli, pas un arbitrage. »* Cinq fois cette semaine : le défilement (1/6), la quantité (1/2), le titre de partage (1/10), le contrôle d'intensité (1/2), la clé `bw` (1/2).
5. **⛔ Un contrôle négatif peut mentir.** Quand un témoin vérifie une *absence* et que la fonction n'existe pas de l'autre côté, il passe tout seul. **Les vrais verts sont ceux qui tournent des deux côtés.**
6. **⭐⭐ Comparer deux mesures suppose que la FRONTIÈRE n'ait pas bougé entre les deux.** J'ai annoncé à Michel *« le bloc personnel a été multiplié par 5 »* : calcul juste, conclusion trompeuse — le point de comparaison (29/07) n'avait pas le même découpage, et une bonne part de l'écart est du texte qui a **changé de côté**, pas du texte **ajouté**. *Un nombre juste peut porter une conclusion fausse* (`BUGS.md` **12quater**, version longue).
7. **⛔ Régler le mauvais champ produit une mesure propre et fausse.** J'ai d'abord classé le catalogue d'exercices « 100 % générique » en réglant `S.place` — le code lit `S.coachQuiz.answers.place`. Le test tournait, ne plantait pas, et donnait **19 541 au lieu de 13 452**. *Avant de conclure d'une mesure, vérifier que le levier qu'on actionne est celui que le code lit.*

---

## 🏗️ AUDIT D'ARCHITECTURE — L'ONGLET SÉANCE (12/09/2026)

> Demande de Michel : *« fais un check de l'architecture de l'onglet séance, vérifie tout ce qui peut
> arriver, vérifie s'il n'y a pas des incohérences, des fonctions en double »*.
> ⛔ **L'AUDIT LUI-MÊME : lecture et mesure uniquement — aucune ligne de production n'a été modifiée.**
> ⛔⛔ **PREMIÈRE DÉCISION DE MICHEL, LE JOUR MÊME** : *« note dans les journaux, on refera un état
> des lieux quand j'aurai fini les bugs de la nutrition »*.
> ✅✅ **PUIS IL L'A LEVÉE LUI-MÊME, DEUX HEURES PLUS TARD** : après avoir lu les trois constats en
> clair, ***« vas-y corrige tout »***. 👉 **LES TROIS SONT CORRIGÉS EN ft-v1195** — le détail est
> dans le journal des versions (`CLAUDE.md`) ; ce qui suit reste le **constat d'origine**, gardé
> intact parce que c'est lui qui dit *pourquoi* c'était un piège (**R30** : on garde la raison,
> pas seulement la décision).
> ⭐ **Ce que la correction a coûté, mesuré** : 19 témoins permanents (bloc CCXCII), 11 mutations
> qui mordent, et un instantané avant/après qui prouve que **rien n'a bougé à l'écran**.

### ✅ Ce qui est SAIN (mesuré)

| ce qui a été compté | résultat |
|---|---|
| fonctions déclarées / noms distincts | **1603 / 1602** → **un seul doublon** |
| le doublon en question | `t`, helper **local imbriqué** dans deux fonctions différentes → portées séparées, **inoffensif** |
| collisions de `const`/`let` de premier niveau | **0** sur 533 noms |
| portes qui **créent** une séance | **7**, toutes identifiées |
| portes qui la **détruisent** | **2** (`clearWkt`, `finishWorkout`) — et elles nettoient le stockage **à l'identique** |
| « la séance est-elle valide ? » | **un seul propriétaire** (`finishWorkout`) |
| « y a-t-il une séance ouverte ? » | **un seul propriétaire** (`_seanceOuverte`), avec replis explicites et documentés |
| le champ `cardio.min` (le faux bug de ft-v1184) | **entièrement disparu** — `duration` partout |
| orphelins de `log.js` | **13 sur 422**, dont **11 avec une trace écrite** |

### ✅ CONSTAT n°1 — CORRIGÉ (ft-v1195) — la fonction écrite pour empêcher une recopie a été recopiée

`_rpeDeRir(n)` porte ce commentaire : *« LA CONVERSION N'A QU'UN SEUL ENDROIT. Elle est triviale, et
c'est justement pour ça qu'elle serait recopiée partout si on ne la nommait pas — **puis un jour l'une
des copies dirait 9**. »*

**Mesuré** : elle est appelée **0 fois**, et la conversion `10-n` est retapée à la main dans **3
fonctions** (`_reserveBoutonTxt` · `_reserveBadgeTxt` · `_rirTxt`), **6 occurrences** au total.
👉 Si `RIR_MAX` ou le barème bougent, il faut corriger **6 endroits** au lieu d'un. *L'avertissement
était écrit juste au-dessus du code qui l'ignore* (**R2**).

### ✅ CONSTAT n°2 — CORRIGÉ (ft-v1195) — une fonction morte en production, vivante dans un témoin

`_rirTxt` n'apparaît **nulle part** dans les 10 fichiers servis ni dans `index.html`, sauf à sa propre
déclaration. Elle n'est appelée que par **un témoin** (`tests/parcours/runner.js`), qui croit vérifier
le libellé d'échec en RPE — or l'écran affiche `_reserveEchecTxt()`.
👉 **`BUGS.md` §58** : *vérifier la fonction n'est pas vérifier l'appel.*

### ✅ CONSTAT n°3 — CORRIGÉ (ft-v1195) — trois valeurs de repli pour le même réglage

`S.defRest` (temps de repos par défaut) a **trois replis différents** selon l'endroit :

| endroit | repli |
|---|---|
| `state.js` (installation) | **130** |
| `app.js` ×2 | **120** |
| `log.js` ×2 (`defForEx`, `_defRestForType`) | **90** |

⚠️ **Dormant aujourd'hui** — `S.defRest` est toujours posé au chargement, donc les replis ne se
déclenchent pas. Mais **cette divergence a déjà mordu une fois** (ft-v1080, le placeholder de l'éditeur
de programmes qui annonçait 90 s quand la séance appliquait 130).

### ⛔ TROIS PISTES ÉCARTÉES PAR LA MESURE (R30 — écrites avec leur raison)

*Elles avaient l'air de vrais défauts. Les laisser sans raison écrite, c'est garantir que quelqu'un
les « répare » dans six mois.*

1. **`startHour` posé par 2 portes sur 7** → **pas un défaut** : `toggleSet` le (re)pose à la 1ʳᵉ série
   validée (règle de Michel du 14/08), et les **4 lecteurs** ont tous un repli sur l'horodatage.
2. **`finishWorkout` n'appelle pas `_syncWakeLock`** → **pas un défaut** : `goScreen` l'appelle à
   **chaque** changement d'écran (`screens.js`), et `finishWorkout` fait `goScreen('home')`.
   *`clearWkt` l'appelle explicitement parce qu'il, LUI, ne change pas d'écran.*
3. **Le repli « étroit » de `state.js`** (qui perdrait le brouillon d'un **cardio seul**) →
   **inatteignable** : vérifié fonction par fonction, **aucun `persist()` ne part avant le chargement
   de `log.js`**.

### ⚠️ ET DEUX FOIS MON PROPRE OUTIL DE MESURE M'A MENTI (`BUGS.md` §61)

- ma 1ʳᵉ liste d'orphelins en annonçait **19** : je ne comptais que `nom(`, donc un gestionnaire posé
  **sans parenthèses** (`el.onmove = _exDragMove`) passait pour mort. **6 faux positifs.**
- mon compteur d'accolades a placé **10 appels de `persist()` « au premier niveau »** — tous étaient en
  réalité dans des fonctions ou dans des **commentaires**.

👉 *Les deux fois, la mesure trop grossière donnait un résultat **plus alarmant** que la réalité.*

---

## 🔁 Comment tenir ce fichier

- Un sujet **change d'état**, il ne se duplique pas.
- Un sujet **fait** garde sa version — c'est ce qui permet de retrouver le pourquoi dans le journal.
- Un sujet **écarté** garde sa raison, sinon il revient.
- **Ce fichier n'est pas un journal** : il ne raconte rien, il dit *où on en est*. Le récit est dans
  `CLAUDE.md`.

*Dernière mise à jour : **24/08/2026 — LES TROIS PRIORITÉS ①②③ LIVRÉES.** ①② (`ft-v989`) :
validation unique avant l'activation d'une séance de Milo, réutilisant `_gardienZones`/
`_GARDIEN_CONSTRAINTS`/`_EX_SWAP_RAISONS`. ③ (`ft-v990`) : instrumentation du coût réel par
appel API, sans toucher au comportement de Milo — vérifiée fonctionnellement (bac à sable
Node), pas encore par un appel réel facturé. ④⑤ (reclassement, caches par lieu) restent
approuvés mais soumis à **R34** : ils attendent maintenant que ③ tourne en production assez
longtemps pour dire s'ils rapportent quelque chose.*

*(historique : 24/08/2026, 08 h 09 — Michel a tranché les décisions ouvertes par le contre-audit.
Priorités ①② posées, ③ en parallèle, ④⑤ soumis à R34 (nouvelle règle d'architecture), ⑥ (records)
différé. Le plafond du profil blessé reste épinglé, non explicitement tranché.
24/08/2026, 02 h 20 — retour de GPT sur le contre-audit intégré (`ECHANGE-GPT.md`) :
les 3 correctifs de la nuit validés sans réserve, une 3ᵉ voie proposée pour le plafond, et
l'instrumentation du coût réel remontée en priorité (avec la réserve de Claude : elle demande un
vrai appel API facturé pour être vérifiée, pas seulement du code).
24/08/2026, 01 h 45 — `ft-v988` en ligne (runs Pages 547 et 548 verts, 549 en cours). Rapport de
synthèse pour relecture extérieure : `docs/CONTRE-AUDIT-2026-08-24.pdf`.*

*(historique : 23/08/2026, nuit — `ft-v985` en ligne. Ajout : le bloc personnel de Milo
mesuré générique à 92 % (`AUDIT-CONTEXTE-MILO.md` §14) et le plafond dépassé chez un profil blessé.*

---

## 🏠📈 AUDIT D'ARCHITECTURE — ACCUEIL + PROGRÈS (12/09/2026)

> Fait **pendant** la passe de ft-v1195, à la demande de Michel (*« ok tu peux bosser en attendant ? »*).
> ⛔ **LECTURE ET MESURE UNIQUEMENT — aucune ligne de production n'a été modifiée.**
> ⛔⛔ **La nutrition est hors périmètre** (consigne du jour) : l'écran Nutrition n'est pas ouvert.
> Même méthode que l'audit de l'onglet Séance : ① règles recopiées · ② deux sources pour la même
> question (**R2**) · ③ code orphelin (**R30** : on cherche la décision avant de conclure).

**Périmètre mesuré** : tout ce qu'appellent `renderHome`, `renderProgress` et `renderChart`, à
**profondeur 2** — **133 fonctions**.

### ✅ Ce qui est SAIN (mesuré)

| ce qui a été compté | résultat |
|---|---|
| orphelins dans le périmètre | **0 sur 133** |
| deux sources pour « combien de séances ce mois-ci ? » | **non** — l'Accueil et le bilan mensuel répondent à **deux questions différentes** (le mois courant · un mois donné) |
| `S.progExos \|\| BIG4` (les exercices suivis) | **4 replis**, même forme que `S.defRest`… mais **aucune divergence** : les quatre disent `BIG4`. *Signalé, pas à corriger* |

### ⭐ CONSTAT A — la règle de RYTHME des questions proactives est écrite 3 fois

*« Au plus une question par semaine, et pas avant 3 séances »* est retapée à l'identique dans
**`_pendingGap`**, **`_pendingEnrich`** et **`_pendingConfirm`** (tracking.js) :

```js
if((S.sessions||[]).filter(s=>s&&(s.date||s.ts)).length<3)return null;
if(last){const dl=(new Date(today())-new Date(last))/864e5;if(dl>=0&&dl<7)return null;}
```

⛔ **Ce n'est pas un détail de style** : c'est la règle qui protège la personne de l'interrogatoire
(**Constitution P-rythme**, `BUGS-DE-PHILOSOPHIE.md`). Trois copies = le jour où l'une passe à 10
jours, **deux autres continuent à 7**, et personne ne le voit — le symptôme serait *« Milo me
demande trop de trucs »*, c'est-à-dire un bug de **comportement**, pas de calcul.
⚠️ **La quatrième `_pending*` n'en est pas une copie** : `_pendingFreqContext` pose une question
**différente** (assez de semaines pour juger une tendance). Vérifié, pas supposé.

### ⚠️ CONSTAT B — un commentaire annonce 3 jours là où le code dit 7

`tracking.js` (dans `skipGap`) : `S.registre.lastObsAt=today();  // respecte le plafond (pas
d'autre question avant 3 jours)` — **le plafond est de 7 jours** dans les trois gardes ci-dessus.
👉 *Un commentaire faux sur le nombre exact que quelqu'un viendra changer est pire qu'aucun
commentaire* (**R23**, appliqué au code).

### ⭐⭐ CONSTAT C — « cette série compte-t-elle pour un record ? » : un propriétaire et deux copies

| endroit | la condition employée |
|---|---|
| `finishWorkout` (log.js) | **`_serieFaitFoiPourPR(s)`** ✅ le propriétaire nommé |
| `saveSessEdits` (setup.js) | `s.done && s.kg && s.reps && s.type!=='É' && s.type!=='W'` — **recopiée à la main**, identique aujourd'hui |
| `finalImportHist` (log.js) | `s.done && s.kg && s.reps` — ⛔ **sans aucun filtre de type** |

**⚠️⚠️ ET J'AI FAILLI ANNONCER UN BUG QUI N'EN EST PAS UN.** La 3ᵉ ligne laisse passer un
**échauffement**… sauf que l'import d'historique **force le type deux lignes plus haut** :
`const type = s.type==='D' ? 'D' : '';`. Aucun `'É'` ne peut donc l'atteindre.
👉 **Le chemin n'est juste que PAR ACCIDENT** — protégé par une contrainte posée ailleurs, pas par
sa propre condition. C'est exactement `BUGS.md` **§62** (*une protection qui ne tient que par
l'absence de ménage*). ⚠️ **Et la bombe est amorcée à côté** : l'import de **programme**, lui,
produit bien des séries `'É'` (`_typeAt` traduit le `W` du backend). Le jour où l'historique
apprendra à lire une colonne de type — ce qui est déjà écrit côté serveur — **un échauffement
créera un record**, en silence.

### 📋 Ce qu'on en fait

**Rien pour l'instant** — c'est une mesure, pas un correctif, et Michel n'a pas demandé de toucher
à ces écrans. Les trois constats sont **promouvables** (leur attendu est vérifiable par du code) et
sont déposés dans `docs/JOURNAL-DE-TEST.md`.

## 🍽️ CONTRE-CHECK NUTRITION (30/09/2026) — deux alertes CONSIGNÉES, NON TRAITÉES

> Audit en lecture seule d'`origin/master` `3146fb9e` (`ft-v1244`) par une autre session (« Claude Nutrition »).
> **Consignées sur décision de Michel, documentation seule** : aucun code, **la Nutrition reste gelée**
> (décision du 13/09), **aucun lot ouvert**. Ce sont des défauts **préexistants**, pas introduits par FP-01.
> ⛔ L'**alerte 1** (macros affichées au-dessus de la cible calorique) n'est **pas** recopiée ici : elle est déjà
> documentée dans `docs/NUTRITION-GLUCIDES-2026-09-24.md`, **cas B3** (R2 : un propriétaire par information).
> ↪️ **30/09/2026 : alerte 1 traitée par le lot Nutrition 1 — l'écart est DÉCLARÉ, les règles macros restent celles de master (D-034)** (branche `claude/nutrition-lot1-b3`, **non publiée**) — détail au §12 du même document. Alertes 2 et 3 : **non touchées**.

### 🟠 ALERTE 3 — risque de PERTE DE DONNÉES : `_applyRestoreData` et `S.foodLog` (priorité la plus haute des deux)
> ✅ **01/10/2026 — DÉMONTRÉE, CORRIGÉE ET PUBLIÉE EN `ft-v1247` — FERMÉE** (lot Nutrition 3 NUT-FOODLOG-RESTORE-01, `claude/nutrition-lot3-foodlog`, checkpoint `dc2ca3a8`). Audit lecture seule : reproduit (même longueur 3/3 → la ligne locale récente disparaissait, par « Restaurer » et au démarrage automatique). Correctif : union par identifiant (`_fusionnerFoodLogRestauration`), version du téléphone à id égal, anciennes lignes sans id reconnues seulement par copie strictement identique (multi-ensemble). Puis C7′ (`b266078a`) : un 2ᵉ exemplaire distinct du même id dans le cloud est préservé (id neuf), une seule fois (idempotent). Témoins 35/0, contrôle négatif 16/16. Passe complète sur `b266078a` : 5 671 ✅ / 0 ❌. Publiée en `ft-v1247`. ⛔ Hors lot, inchangés : `bodyScans`, `bloodTests` (même règle de longueur), `savedFoods`, `_pa_` serveur, texte de l'écran Restaurer (« aucune donnée écrite vers le serveur » alors que `saveProfile`/`cloudSave` partent — toujours observé).
- **Constat rapporté** : à la restauration (`_applyRestoreData`, `setup.js`), le journal alimentaire du cloud
  **remplace intégralement** celui du téléphone dès que son nombre de lignes est **≥** au local — **sans fusion par
  identifiant** (contrairement aux séances, fusionnées par `id` depuis `ft-v1241`).
- **Scénario destructif** : même nombre de lignes mais **contenus différents** → des lignes locales peuvent
  **disparaître**.
- **Pourquoi plus haut que l'alerte 2** : impact **destructif** possible (règle d'or #3, zéro perte).
- **Quand le traiter** : dans un **lot persistance / cloud dédié** — ou plus tôt seulement si un futur chantier
  touche déjà cette zone (alors : STOP et signaler avant toute modification).

### 🔵 ALERTE 2 — dette de robustesse : double source de vérité potentielle sur les totaux Nutrition
- **Constat rapporté** : l'écran calcule ses totaux par `_foodTotals` ; le contexte envoyé à Milo fait son
  **propre regroupement** (`coach.js`). Avec une valeur `kcal` stockée **sous forme de texte** (`'120'`), les deux
  peuvent diverger (écran « 012050 » par concaténation, Milo 170).
- **Portée** : les écrivains actuels produisent des **nombres** → surtout **données anciennes, import, cloud**.
- **Quand le traiter** : seulement lorsqu'un chantier touche déjà les **totaux**, les **imports** ou le **contexte
  Nutrition de Milo** — alors écran et Milo doivent passer par **la même** valeur numérique normalisée, sans créer
  de troisième source de vérité.

### 🟤 DETTE NUTRITION / UI (30/09/2026) — le tableau de bord lit des champs qui n'existent pas
> ✅ **01/10/2026 — PUBLIÉE EN `ft-v1246`, CLOSE** (lot Nutrition 2, `claude/nutrition-lot2-dash1`, checkpoint `0e54eef2`) : la tuile lit `calories` et `prot_g`, le repli `calcTDEE()` est retiré ; sans cible, aucun chiffre. Témoins B-CDXX/B-CDXXI (12/0), contrôle négatif `tools/mut_nutri_dash1.py` 12/12. Passe complète sur `0e54eef2` : 5 636 ✅ / 0 ❌, 4 conditions vertes. Sous-titre « Protéines N g » et cible manuelle sans poids : acceptés par Michel. Publiée en `ft-v1246`.
> Trouvée par la contre-vérification du lot Nutrition 1 (B3). ⛔ **Préexistante, NON corrigée dans ce lot** (décision de Michel).
- **Constat** : `dashboard.js` (tuile « Nutrition ») lit `m.kcal || m.cal` et `m.prot || m.p`, alors que `calcMacros`
  rend `calories` et `prot_g`. Les deux lectures valent donc toujours `undefined` : la tuile retombe sur `calcTDEE()`
  et affiche la **dépense (TDEE)** sous le libellé **« Objectif du jour »**, et n'affiche jamais les protéines.
- **Déjà vu** : c'est le constat **NUT-DASH1** de `docs/NUTRITION-GLUCIDES-2026-09-24.md` (§10 et §11) —
  `dashboard.html` le charge et **est déployé**.
- **Portée** : affichage seulement (aucune donnée écrite) ; la cible et les macros de l'onglet Nutrition ne sont pas
  concernées ; l'incompatibilité B3 n'y est pas affichée non plus.
- **Quand le traiter** : dans un lot séparé Nutrition / UI, avec son propre témoin (la tuile doit lire la cible
  retenue, pas le TDEE).

### 🟤 RETOUR TERRAIN DE MICHEL (01/10/2026, en vacances) — la recherche d'aliments propose le mauvais aliment en premier
> *« Ya un vrai souci, j'ai eu le cas avec les spaghettis bolo et aussi carbonara… la c'est hyper compliqué de faire sa nutrition. »*
> ⛔ **Consigné, NON corrigé** : Nutrition gelée hors lots validés (13/09). Aucun lot ouvert — décision de Michel attendue.
- **Mesuré dans la recherche réelle** (`_ciqualChercher`, master `21eddae3`), premier résultat proposé :
  - « café » → **Café, moulu** (la poudre, 341 kcal/100 g). La boisson (« Café… prêt à boire », 6 kcal/100 g) n'est **pas
    dans les 5 premiers** ; il faut taper « expresso ». Capture de Michel : 25 g → 85 kcal pour un café.
  - « spaghetti bolognaise » / « spaghettis bolo » → **raviolis farcis au bœuf CRUS** (265 kcal/100 g) en 1ᵉʳ ; le plat
    (« Pâtes à la bolognaise », 116 kcal/100 g) n'arrive qu'en 3ᵉ. « pates bolognaise » le met bien en 1ᵉʳ.
  - « carbonara » → **Sauce carbonara** en 1ᵉʳ (160 kcal, 12,8 g de lipides /100 g), le plat en 2ᵉ (161 kcal, 8,7 g).
  - « bœuf bourguignon » → le plat en 1ᵉʳ (correct) ; Michel a choisi « Bœuf, à bourguignon, cuit » = la **viande seule**
    (34 g de protéines/100 g) — juste si la viande est pesée seule, très surestimé pour le plat en sauce.
- **Ce n'est PAS une erreur de chiffres** : les valeurs sont celles de CIQUAL 2025 à l'unité. Le défaut est le **choix
  proposé** (famille « le premier match gagnant » de `BUGS.md`) et un vocabulaire de table (« moulu », « à bourguignon »,
  « préemballé ») qui ne dit pas « boisson », « plat » ou « ingrédient ».
- **Le fond du retour, plus large que la recherche** : en vacances / au restaurant, il faut connaître des **grammes**
  d'un plat qu'on n'a pas pesé, et CIQUAL n'a que des plats **industriels** (« préemballé ») — un plat de restaurant peut
  être bien plus riche. Rejoint l'item déjà séparé « **simplification UX Nutrition** ».
- **Quand le traiter** : dans un lot Nutrition dédié, sur décision de Michel ; pas en passant dans un autre lot.

### 🟤 Deux points relevés par la contre-vérification du lot Nutrition 1 (B3), NON corrigés (hors lot, 30/09/2026)
- **Texte d'intro du réglage manuel en kéto** : « les glucides s'ajustent tout seuls » (texte de master, `index.html`,
  `#ov-kcal-edit`) est faux en kéto, où les glucides sont fixés à 5 % et ce sont les lipides qui s'ajustent.
  Préexistant ; à reprendre dans un lot Nutrition / UI.
- **Branche « glucides et lipides » de `_cibleIncompatible`** (state.js) : le cas où glucides ET lipides sont
  écrêtés ensemble n'est atteint par aucun chemin actuel (le kéto garde 5 % de glucides, le standard garde des
  lipides). Inoffensive ; gardée telle quelle pour ne pas élargir le lot.

### 🥑 NUT-LIPIDES-25-01 — lipides des modes standards à 25 % de la cible (02/10/2026, session-B — ✅ PUBLIÉ EN `ft-v1249`, FERMÉ)
- **Décision de Michel (D-035)** après la simulation NUT-LIPIDES-SIM-01 : `lipides = cible × 25 % / 9` au lieu de
  `poids total × ratio de l'objectif`. Protéines, cible, BMR, TDEE, kéto, low carb inchangés ; D-034 dit l'écart restant.
  ⚠️ 25 % = **convention produit documentée, pas une vérité scientifique**.
- **Mesuré (59 904 profils, master ↔ branche, `tools/diff_nutri_lipides25.js`)** : BMR / TDEE / cible / protéines / kéto /
  low carb : **0 changement** ; lipides standards 24,7 → 25,4 % de la cible (avant : 4,3 % → 270 %) ; glucides à 0 :
  6 794 → 3 489 ; écart D-034 : 7 637 → 3 474 ; aucun profil nouvellement à 0 ou incompatible.
- ✅ **TRANCHÉ PAR MICHEL (02/10) : comportement ACCEPTÉ, `_CYCLE_FAT_MIN` inchangé.** Le plancher du cycle séance/repos (`_CYCLE_FAT_MIN` =
  0,6 g/kg de poids TOTAL, inchangé) **éteint le cycle pour 6 248 profils** (18 432 → 12 184 ; tous lourds ou à cible
  basse : 70 kg → 460, 300 kg → 1 636). Conséquence mécanique : en mode standard, un cycle actif exige une cible ≥ 21,6 ×
  poids, un écart D-034 une cible < ~5,3 × protéines (≤ 14 × poids) — les **écarts « jour de cycle » de B3 deviennent
  inatteignables** (3 126 → 0). Les **10 témoins B3** qui les conduisaient sont devenus chacun un témoin RÉEL (le contrat :
  cycle refusé par le plancher, rien de modifié, aucune fausse mention) et un témoin SYNTHÉTIQUE (sortie du cycle forcée).
  🟤 **DETTE DOCUMENTÉE, CODE CONSERVÉ** (inatteignable par un profil réel tant que le plancher reste à 0,6 g/kg, redeviendrait
  atteignable s'il changeait) : `_incompatibleHTML` (branche « jour par jour »), `_joursIncompatibles` (entrée « autre jour »),
  `_toastIncompatible` (« au repos » / « en séance » / « +a à +b »), la phrase « le cycle ne peut pas conserver… » (screens.js),
  la partie « un jour de repos » de `_incompatibleTxt` (coach.js), l'appel `_cibleIncompatible` sur `m.cycle.autre` (state.js).
- Textes corrigés parce qu'ils décrivaient l'ancienne règle (R4, R23) : aide « ? » Nutrition, intro du réglage manuel,
  aide détaillée « Nutrition — où est quoi », description de l'objectif Force (« lipides élevés »), avertissement D-034
  (« protéines et lipides calculés sur ton poids »).

## 🔬 SESSION-MILO-E2E-01 — audit forensique du parcours réel du 03/10/2026 (✅ AUDIT TERMINÉ — AUCUNE CORRECTION)

> **Date** : 03/10/2026 · **Base** : master `ad172a87` (`ft-v1249`), inchangée · **Diagnostic seulement** :
> **0 appel IA réel** (Milo simulé par interception réseau), **0 modification fonctionnelle**, 0 commit pendant l'audit.
> Synthèse : `docs/SESSION-MILO-E2E-01.md` · rapport complet : Drive (« FORCE TRACKER — SESSION-MILO-E2E-01 — AUDIT
> FORENSIQUE PARCOURS RÉEL 03-10-2026 ») + PDF · doutes de test : `docs/JOURNAL-DE-TEST.md`.
> ⛔ **Aucun correctif n'existe.** État : **PRÊT POUR CORRECTIONS APRÈS DÉCISIONS MICHEL.**

- **11 scénarios** exécutés : **9 reproduits entièrement**, **2 partiellement** (montée en charge 65 → 80 : règle du
  code seulement ; nouvelle discussion : aucune création reproduite).
- ✅ **Causes DÉMONTRÉES** : remplacement d'exercice = renommage seul, séries gardées (**P0**, contamine séance, volume,
  PR, historique, Progrès et contexte de Milo si validé sans corriger) · un seul objet prévu / réalisé · HTTP 200
  `complete:false` « Désolé, réessaie. » accepté comme débrief (**P1**) · débrief enregistré mais non redessiné, sans
  lien `sessionId` (**P1**) · première occurrence = record · `summarizeCoach` après chaque réponse (fil ≥ 4) et chaque
  débrief.
- 🟠 **MÉCANISMES CAPABLES** : montée en charge à seuils fixes + prompt affirmatif · programmes envoyés sans statut actif /
  terminé · aucun délai maximum sur l'appel du débrief · fil local seulement et borné.
- ❓ **NON DÉMONTRÉS** : cause de l'échec réel du débrief à 20:01 · cause de la nouvelle discussion · cause exacte de
  l'ancien J1 · cas exact de la montée en charge terrain.
- ⚖️ **Comportement CONÇU, pas une régression** : carte « Cette séance te convient ? » avant toute séance structurée
  (ft-v1053) ; FP-01 n'a jamais couvert ce cas.
- ⚖️ **Décisions de Michel validées, non implémentées** : **D-043** (« Voir le débrief Milo », `sessionId ↔ débrief`) ·
  **D-044** (export sans / avec débriefs) · **D-045** (première référence ≠ record).
- 📦 **Lots proposés (aucun ouvert)** : DÉBRIEF-PERSISTANCE · REMPLACEMENT (décision Michel) · VÉRITÉ MÉTIER DANS LE
  PAYLOAD MILO · CONVERSATION / CTA · COÛT (mesure d'abord) · panneau maintenance (**chantier séparé**).

### 🛡️ SESSION-INTEGRITY-01 — corrections du cycle séance / débrief (04/10/2026, session-B — ✅ PUBLIÉ en `ft-v1250`)
- **Corrigés sur la branche** (chacun rouge sur master `c3c830ab`, vert sur la branche — banc B-SI01 71/0, contrôle négatif 22/22,
  passe complète 5 833 ✅ / 0 ❌ sur `5b4d0c70`) : remplacement hybride (**P0**) · faux débrief `complete:false` (**P1**) · débrief
  non redessiné et sans lien `sessionId` (**P1**) · première occurrence = record (**D-045**) · séance jugée contre son propre
  record (**N-G2**, constat MILO-GHOST-01). Décisions **D-043 / D-044 / D-045** implémentées sur la branche.
- **Non traités, toujours ouverts** : nouvelle discussion du 03/10 (cause non démontrée) · ancien J1 / programme actif · montée en
  charge (seuils, ton du prompt) · carte « Cette séance te convient ? » avant une séance structurée · utilité de summarizeCoach ·
  panneau maintenance · **N-G1** (MILO-GHOST-01 : le message courant semble partir deux fois vers le modèle — dette
  MILO / TRANSPORT / PAYLOAD, impact non démontré).
- **Limites dites** : débriefs rangés **localement** (comme le fil Coach : pas de cloud, pas de restauration) ; les débriefs d'avant
  le correctif ne sont **pas** rattachés après coup (pas de fausse association) ; anciennes entrées de records sans marqueur
  `premiere` restent des records ; les séances enregistrées avant le correctif n'ont pas de référence figée (`refAvant`).
- **Finition (04/10, après contre-vérification)** : plafond de 200 débriefs **retiré** (D-047) · séance supprimée → son débrief
  part, et lui seul (+ son jeton en file) · export PDF « avec » fidèle aux caractères écrivables (D-044) · remplacement
  sémantique ratifié (D-046). Banc 92/0, contrôle négatif 37/37, passe 5 854 ✅ / 0 ❌ sur `7b13cc9e`.
- **Consignés, sans code (contre-vérification)** : superset non contigu · badge « Premier PR » · import historique / édition
  d'ancienne séance (dont : un import « remplacer » retire une séance sans son débrief) · RIR décalé · bloc technique
  sans backticks non nettoyé. **Observés pendant la finition** : coupure des longs débriefs du PDF un peu courte
  (cosmétique) · « N séances » du PDF compte les jours (préexistant) · téléphone plein : débrief non rangé sans message.
- ✅ **Publié en `ft-v1250` (04/10)** après contre-vérification indépendante : **« B — validé avec réserves non bloquantes »** (passe
  indépendante 5 854 / 0, 21 nouveaux témoins confirmés, mutations de finition 15/15, 1 200 / 1 200 débriefs conservés, stockage
  plein : l'écriture échoue sans effacer, suppression par identifiant prouvée, aucun appel orphelin, PDF corrigé et « sans » = master).
- **Réserves de la contre-vérification — BACKLOG, non bloquantes** (ce sont des limites connues, pas des bugs de production) :
  ① aucun témoin PERMANENT ne protège « stockage plein → ne jamais effacer les anciens débriefs » (vérifié à la main par la
  contre-vérification seulement) · ② K0 et Z0 restent en partie structurels (ils lisent le code source) · ③ PDF : « ≈ » et « ✓ »
  sont retirés sans traduction · ④ quota Safari / iOS non mesuré · ⑤ une séance supprimée PENDANT l'appel de son débrief peut
  encore recréer un orphelin · ⑥ un import « remplacer » peut laisser un débrief orphelin · ⑦ débriefs locaux seulement (D-047,
  limite assumée) · ⑧ téléphone plein : aucun message à l'utilisateur.

### 🔁 E5 — UNE SÉANCE, UN SEUL APPEL DE DÉBRIEF (05/10/2026, session-B — ⚠️ BRANCHE `claude/e5-debrief-idempotence` · ✅ PUBLIÉ en `ft-v1251` le 07/10)
- **Démontré, puis corrigé sur la branche** : rouge sur master `a1e39739` (2 appels `coach` pour la même séance — le rattrapage
  du démarrage remettait en file un appel VIVANT ; au Coach, la séance était repayée). Cause et correctif : `BUGS.md` §28.
  Banc `tools/banc_e5.js` **35/0** (E5-1 → E5-13, dont E5-6c et E5-9d ajoutés après que le contrôle négatif a montré deux
  trous), contrôle négatif `tools/mut_e5.py` **15/15**, bancs voisins verts, passe complète **5 890 ✅ / 0 ❌** sur `ef6b1901`.
- **Ce que ça ferme aussi** : un échec n'est plus marqué « livré » (c'était faux depuis ft-v979) ; une séance dont le débrief est
  déjà rangé n'est plus jamais repayée, même si elle était restée en file (l'état que E5 a laissé sur les téléphones).
- **Ce qui reste ouvert, dit** : rechargement PENDANT l'appel → 2 requêtes reçues par le serveur pour 1 débrief (cas B du 15/09 —
  décision d'idempotence serveur chez Michel, `docs/IDEMPOTENCE-DEBRIEF.md` §8) · deux onglets ouverts en même temps · réserve ⑤
  ci-dessus (suppression pendant l'appel → débrief orphelin au magasin, mesuré par E5-11 : 1 seul appel, mais l'orphelin reste) ·
  **N-G1** hors lot (dette voisine : le message courant part deux fois dans la charge utile — mécanisme Worker / payload
  différent, effet sur le modèle non mesuré).

### 🎯 DEBRIEF-ON-DEMAND-01 — LE DÉBRIEF MILO SE DEMANDE (05/10/2026, session-B — ⚠️ BRANCHE `claude/debrief-on-demand-01` · ✅ PUBLIÉ en `ft-v1251` le 07/10)
- **Décision de Michel (D-052)** : la fin de séance montre le résumé local ; l'avis de Milo part sur « ✨ Analyser cette séance
  avec Milo » (fin de séance ou Progrès). **0 appel IA sans clic** ; un geste = au plus une génération par séance.
- **Retirés (R30, raison écrite dans `coach.js`)** : file `ft4_pending_debrief`, « reçu » `ft4_debrief_recu`, livraisons
  `ft4_debrief_faits`, rattrapage au démarrage, `_maybeAutoDebrief`, branche `debriefSess` de `sendToCoach`, `_recapSeance`,
  `_retrySeDebrief`, et 2 essais réseau cachés du moteur. Les clés des anciennes versions sont oubliées au démarrage ; un
  « reçu » valide (déjà payé) est rangé dans le magasin, pas perdu.
- **Trouvé en route, corrigé** : au rechargement, le navigateur annule la requête ; son rejet s'exécutait pendant le
  déchargement et effaçait « en vol » (mesuré 6/6) — la séance disait « Analyser » au lieu de « Analyse interrompue ». OD-07 ne
  le voyait que sous charge (il a rougi une fois, bancs en parallèle). Garde `_dbfQuitte` (`pagehide`), témoin déterministe
  OD-06c, mutation M-OD15.
- **E5 est absorbé** : son banc (`banc_e5.js`, `mut_e5.py`, `e5_idempotence.js`) est retiré, ses invariants encore vivants
  (identifiant de séance, double clic, A ne libère pas B, `complete:false`, suppression) sont repris par OD-05/09/10/12/13/14.
- **Ce qui reste ouvert, dit** : réponse perdue au rechargement pendant l'analyse (relance = 2ᵉ appel, demandé —
  `docs/IDEMPOTENCE-DEBRIEF.md` §10) · réserve ⑤ (suppression PENDANT l'analyse : la réponse arrivée ensuite est encore rangée
  sous l'identifiant disparu) · débriefs locaux seulement (D-047) · un débrief demandé quand le fil du Coach est illisible
  est rangé et visible dans Progrès, mais n'entre pas dans le fil (plus de rattrapage pour l'y poser) · **N-G1** hors lot ·
  le banc réel de Milo n'a pas tourné (R34) : la consigne « à ma demande » pour une séance ancienne n'est pas mesurée.
- **Générateurs PDF historiques** (`tools/gen_ph2_politique_pdf.py`, `tools/gen_milo_consolidation_pdf.py`) : leurs gardes
  recomptent des faits datés (le jeton, le rattrapage) et **refusent désormais de produire** — c'est leur rôle, le fait est
  tombé. Ni corrigés ni régénérés : ce sont des dossiers d'une date. Hors passe et hors `check_regles`.
- **Contrôles** : banc OD **37/0** · contrôle négatif `tools/mut_debrief_demande.py` **16/16** (13 sur une 1ʳᵉ exécution complète,
  M-OD8/11/12 rejouées après le renfort de OD-12/13 et l'ajout de OD-17b) · bancs voisins verts (fil 39/0, SESSION-INTEGRITY 93/0,
  provenance 24/0, séance C3 35/0, ML-B 60/0) · passe D-031 sur `accfa880` : **5 861 ✅ / 0 ❌**, 4 conditions (② déduite).

### 🎯 DEBRIEF-ON-DEMAND-01 — CORRECTIF CIBLÉ POST CONTRE-AUDIT (06/10/2026, session-B — ⚠️ BRANCHE · ✅ PUBLIÉ en `ft-v1251` le 07/10)
- **F1 (le plus grave)** : une séance ancienne analysée depuis Progrès partait SANS ses données (Milo ne voit le détail que des 5
  séances les plus récentes) alors que la consigne disait « tu les as ». **Corrigé** : `buildCoachContext(instr,{seanceCiblee})`
  ajoute un bloc « SÉANCE À ANALYSER » écrit par le MÊME formateur que « DERNIÈRES SÉANCES » (nommé `_ligneSeance`), lu depuis la
  séance par son identifiant, jamais recopié. Sans l'option, le prompt est **identique au caractère près** (mesuré sur deux copies
  isolées : seule la ligne d'empreinte des fichiers change). Depuis Progrès, la consigne ne parle plus de « douleur du jour ».
- **C1** : la fenêtre « Débrief Milo » est partagée — une réponse tardive de A s'affichait sous C. **Corrigé** : la zone d'affichage
  porte l'identifiant de la séance montrée (`data-dbf-sid`) ; une réponse d'une autre séance est RANGÉE mais pas écrite (`_dbfSlotEst`).
- **Témoins restaurés** : verrou sans minuteur (T1), cardio seul (T2), ancien format `ft4_debrief_encours` (T3), deux analyses en vol
  + rechargement (T4), suppression pendant l'analyse **mesurée** (T5 — limite connue : orphelin rangé), `complete:false` + vrai texte
  (CF-01), ancien reçu d'échec (CF-02), OD-16b réparé (il cherchait un exercice déjà présent dans la fixture).
- **Textes** : `capacites-ia.js` (`milo.debrief` devient `manuel`, plus de « rattrapage 3 s ») + `docs/IA-FREE-PREMIUM.md` régénéré ;
  avantage Premium réécrit (« à ta demande ») — ⚠️ **la politique Premium du débrief (PREMIUM décidé le 19/09, code FREE) reste une
  décision séparée, non ouverte** ; aide Progrès (« pas encore analysée » était faux pour les débriefs d'avant le 04/10) ; titre de
  fin de séance « Ta séance » pour un cardio seul. En plus : la carte de Progrès dit « Milo analyse… » dès le clic.
- **Hors lot, consignés** : orphelin si suppression pendant l'analyse (T5) · `pagehide` en arrière-plan iOS non prouvé ·
  idempotence serveur · cloud des débriefs · Premium · N-G1 · `tools/dump_prompt.js` écrit dans un chemin en dur
  (`docs/PROMPT-MILO-REEL.txt` à régénérer au lot publication) · banc réel de Milo non lancé (R34 : le nouveau bloc n'est pas mesuré
  sur le vrai modèle).
- **Protocole jour** : tests ciblés + 5 mutations ; **D-031 complète NON lancée volontairement** — à faire en qualification nocturne.

### 🚪 ONBOARDING-QUICK-01 — L'INSCRIPTION / PREMIÈRE OUVERTURE NETTOYÉE (06/10/2026, session-B — ⚠️ BRANCHE `claude/onboarding-quick-01` · ✅ PUBLIÉ en `ft-v1251` le 07/10)
- **Corrigé** : `checkAnnouncements` ne s'ouvre plus par-dessus une inscription en cours ; la **première arrivée** (fin
  d'inscription, compte restauré, appareil neuf via le cookie ou la restauration silencieuse) marque vues les nouveautés DÉJÀ
  publiées et leurs points rouges (`_wnPremiereArrivee`) — les conditionnelles (`si`) restent suivies par identifiant ; une
  nouveauté publiée ensuite s'affiche (OBQ-04). Guide de 50 diapos plus ouvert automatiquement (reste dans le Menu). Pop-up
  « Test testeurs — Types de matériel » retirée (R30 : `_eqTestOn()` vaut `true` pour tous depuis le 02/08). Email : facultatif
  et dit « sans email, pas de sauvegarde » ; format manifestement faux refusé avant tout appel. Vérification bornée à 7 s
  (`_fetchRestoreRaw(email, délai)`, aussi pour « Restaurer » de l'inscription).
- **⭐ Trouvé en route, plus grave que le blocage** : sur erreur réseau, l'ancien code terminait l'inscription comme un PROFIL NEUF
  avec cet email → `saveProfile` envoyé sans savoir si le compte existait. Désormais : message clair, « Réessayer » ou « continuer
  sans email » — aucune écriture cloud à l'aveugle (OBQ-15b).
- **Aussi** : ✕ en haut du « Quoi de neuf » (visible à 320×568) ; plus de seconde invitation d'installation quand l'écran
  d'accueil de l'inscription l'a déjà montrée ; un seul envoi même avec double tap / Entrée.
- **Hors lot, consignés** : cookie `ft_email` + profil cloud introuvable → l'inscription est sautée (dette, lot séparé : le
  correctif touche le démarrage) · nouveau Guide de premier jour · instabilité intermittente d'OD-11 (banc débrief : 1 rouge sur
  3 exécutions, « carte introuvable » — même famille que les courses de rendu de Progrès corrigées le 06/10 ; pré-existante,
  hors code de l'app).
- **Contrôles** : banc `tools/banc_onboarding_quick.js` **24/0** · 5 mutations **5/5** · bancs voisins verts · D-031 complète
  NON lancée (règle jour/nuit) — le banc est branché dans la passe complète pour la qualification nocturne.

### 🛡️ COOKIE-PROFILE-01 — UN COOKIE `ft_email` N'EST QU'UN INDICE DE COMPTE (06/10/2026, session-B — ⚠️ BRANCHE `claude/cookie-profile-01` · ✅ PUBLIÉ en `ft-v1251` le 07/10) — P1 intégrité
- **Cause racine** : `index.html` posait `ft4_ob2=1` sur la seule foi du cookie (inscription « faite » sans rien vérifier) ;
  `autoConnect` ne restaurait que si le profil avait **au moins une séance** ; rien n'annulait la décision ; `persist()` lançait
  ensuite `_cloudSync` → un profil PAR DÉFAUT (sexe, objectif, réglages) partait vers le compte existant. Même famille sur le
  chemin IndexedDB (`_autoRestoreFromIDB` → `_silentCloudRestore`, profil sans séance ignoré).
- **Preuve** : P2 synthétique (audit du 06/10 + banc CP). **Aucun incident terrain prouvé** (pas de P3).
- **Correctif** : un état explicite, un propriétaire (`state.js` : `_restauAttendue`/`_restauPoser`/`_restauResolue`,
  clé `ft4_restau_attendue`). Le cookie (format valide seulement) pose l'email + l'attente, plus jamais `ft4_ob2`. `autoConnect`
  tranche : profil trouvé (même sans séance) et local vide → restauré, inscription faite ; « introuvable » explicite → l'indice est
  oublié (email gardé pour pré-remplir l'inscription, cookie effacé) ; erreur / hors ligne / délai / réponse invalide → l'attente
  reste. **Garde central** : `_cloudSync` (profil + miroir) et `syncSheets` (séances, qui restent en file) n'écrivent rien tant que
  l'attente existe. La fin d'inscription tranche aussi (email vidé → l'email du cookie ne reste pas en douce). Même état sur le
  chemin IndexedDB ; `_silentCloudRestore` accepte un profil sans séance.
- **Limite dite** : données locales SANS email + cookie d'un compte qui EXISTE → l'app ne tranche pas seule (deux personnes
  possibles) : l'attente reste et rien ne part — il n'y a pas encore de geste pour la lever (à décider avec Michel).
- **Contrôles** : banc `tools/banc_cookie_profile.js` **16/0** (CP-00 invariant + CP-01 → CP-13) · 3 mutations **3/3** · bancs voisins
  verts · D-031 complète NON lancée (règle jour/nuit) — banc branché dans la passe pour la nuit.

### 🔐 AUTH-SIGNUP-STRICT-01 — INSCRIPTION EN LECTURE STRICTE (06/10/2026, session-B — ⚠️ BRANCHE `claude/auth-signup-strict-01` · ✅ PUBLIÉ en `ft-v1251` le 07/10)
- **Cause racine (mesurée sur le vrai Code.js)** : en lecture stricte (défaut quand `LECTURE_STRICTE` manque), `_lectureAutorisee_`
  passe AVANT `loadUserData_` : un email INCONNU reçoit `needsCode`, jamais `not_found`. Depuis AUTH-NEW-DEVICE-01, l'app (à raison)
  ne traite plus `needsCode` comme un compte neuf — mais disait « Ce compte existe déjà », et après la protection la restauration
  répondait « Aucun profil trouvé » : il fallait appuyer une 2ᵉ fois sur COMMENCER.
- **Correctif (app.js, texte setup.js)** : le texte dit la seule chose vraie dans les deux cas — « Confirme cet e-mail pour continuer »
  (Profil → Restaurer aussi). Après la preuve de possession (code email + code perso, parcours existant), `_reprendreApresProtection`
  relit par le chemin de « COMMENCER » (`obCheckEmailAndFinish`, qui envoie le code) : profil trouvé → restauré, inscription faite ;
  « introuvable » — désormais une absence EXPLICITE, le serveur a vérifié le code → inscription neuve terminée seule, profil de
  bienvenue envoyé AVEC le code. ⛔ Rien ne change avant la preuve : needsCode / erreur / réseau ne créent jamais de compte.
- **Contrôles** : banc `tools/banc_auth_signup_strict.js` **8/0** (vrai Code.js en lecture stricte ; rouge sur `2e4913f4` : AS-01/02/03) ·
  2 mutations **2/2** (M1 faux message + blocage → AS-01/02 · M2 needsCode = compte neuf → AS-01/05) · AN 16/0 (3 témoins réécrits sur le nouveau texte, 1 appui conditionnel : l'inscription se termine seule) ·
  voisins verts (AUTH-CLOUD-CLOSURE 8/0 dont D1 et T-JETON · COOKIE-PROFILE 16/0 · onboarding 25/0 · foodlog_restore 35/0 · profil_atypique 37/0 · registre IA 40/0) · `check_regles` vert · D-031 NON lancée.

### 🔐 AUTH-CLOUD-CLOSURE-01 — D1 + T-JETON (06/10/2026, session-B — ⚠️ BRANCHE `claude/auth-cloud-closure-01` · ✅ PUBLIÉ en `ft-v1251` le 07/10) — P1 intégrité
- **Origine** : contre-vérification indépendante de `6db0ba5c` (AUTH-NEW-DEVICE-01 confirmé, mais deux défauts bloquants).
- **D1 — « continuer sans email »** : `finishOnboarding` ne vidait que `S.email` ; cookie `ft_email` et email IndexedDB restaient,
  `index.html` réinjectait le cookie au rechargement (`ft4_email` vide = absence), A était restauré par-dessus le nouveau profil
  local, puis pesées et séances partaient vers A. **Correctif** : `_oublierEmailLocal()` (app.js, un propriétaire) efface
  `ft4_email`, le cookie et IndexedDB ; appelé quand l'inscription abandonne l'attente sans email, et sur « introuvable »
  (qui n'effaçait pas IndexedDB).
- **T-JETON — jeton d'un compte envoyé pour un autre** (introduit par AUTH-NEW-DEVICE-01 : le passage A → B gardait `ft4_devtoken`
  de A, et `_ftBootstrapJeton` s'arrêtait dès qu'un jeton existait). Le serveur fait gagner le jeton : mesuré sur le vrai Code.js,
  A devient « Bob » et reçoit les 8 séances de B ; Milo et le miroir prennent l'identité A. **Correctif central** (`constants.js`,
  seul propriétaire du jeton) : le jeton est rangé AVEC son compte (`ft4_devtoken_compte`) ; `_ftToken()` ne le rend que pour ce
  compte — et ne l'efface jamais (⚠️ la 1ʳᵉ version l'effaçait, contre MILO-AUTH1 : corrigé pendant la qualification
  nocturne, voir plus bas) — tous les envois (synchro, inscription, Worker via l'injecteur) en héritent sans changer d'appelant ;
  `_ftBootstrapJeton` et la vérification d'email rangent le jeton avec le compte DEMANDÉ. Jeton antérieur au correctif : rattaché
  au compte courant à sa 1ʳᵉ lecture.
- **Trouvé en route, HORS LOT (décision de Michel)** :
  ① **lecture stricte ⇒ un email INCONNU reçoit `needsCode`, jamais `not_found`** (mesuré sur le vrai Code.js : `_lectureAutorisee_`
  passe avant `loadUserData_`). Depuis AUTH-NEW-DEVICE-01, un NOUVEL utilisateur qui tape un email à « COMMENCER » lit « Ce compte
  existe déjà, mais il n'a pas encore de code perso » (faux pour lui) et doit protéger l'email pour continuer avec ; après la
  protection, la restauration dit « Aucun profil trouvé » et il faut appuyer de nouveau sur COMMENCER. Non destructif, mais
  trompeur et bloquant. État réel de `LECTURE_STRICTE` en production NON vérifié (Apps Script injoignable depuis le conteneur).
  ② `_getEmailFromIDB` lit `r.result` sur l'événement au lieu de `r.target.result` : elle rend TOUJOURS null — le repli IndexedDB
  n'a jamais fonctionné (le réparer activerait un chemin de restauration jamais éprouvé).
  ③ `ft4_authcode` n'est pas lié à un compte non plus (un code de A envoyé pour B est refusé par le serveur : non destructif).
- **Contrôles** : banc `tools/banc_auth_cloud_closure.js` **8/0** (vrai Code.js local ; rouge sur `6db0ba5c` : AC-01/02/03/04/06) ·
  2 mutations **2/2** (M1 D1 réintroduit → AC-01 · M2 jeton de A gardé → AC-03) · voisins verts (AUTH-NEW-DEVICE 16/0 · COOKIE-PROFILE 16/0 · onboarding 25/0 · foodlog_restore 35/0 · profil_atypique 37/0 · SESSION-INTEGRITY 93/0 · registre IA 40/0) · `check_regles` vert · D-031 NON lancée.
### 📥 IMPORT-ECH-01 — ÉCHAUFFEMENT + SÉRIES DE TRAVAIL D'UN MÊME EXERCICE = UN EXERCICE (06/10/2026, session-B — ⚠️ BRANCHE `claude/import-echauffement-01` · ✅ PUBLIÉ en `ft-v1251` le 07/10)
- **Terrain** (iPhone, import d'un programme Powerbuilding) : l'écran de vérification montre « Développé Couché » en plusieurs
  blocs (1×5 @50 échauffement, 1×3 @65…, puis le travail) ; après import, autant de cartes d'UNE série, chacune « Déjà présent
  ailleurs dans cette séance ».
- **Cause racine (mesurée)** : l'import passe par le **Worker** depuis ft-v433 (`importDoc`, `PROG_PROMPT`), copie ANCIENNE de la
  consigne d'Apps Script. Elle n'a ni la règle 8 (lignes ECH/TRAV du même exercice = UN exercice, `setTypePerSet`), ni la liste
  du catalogue (ft-v1164), ni la règle des repos (ft-v1176), et elle dit « "échauffement" → NOTE ». Le modèle rend donc une
  ligne = un exercice, au nom NU. Le filet client ft-v1158 (`_mergeImportEchauffements`) ne reconnaît un échauffement qu'à un
  parenthésé en fin de nom (« (ECH) ») : il ne voit rien, et `finalImportProg` construit une carte par ligne. Reproduit sur
  `6db0ba5c` : 9 témoins rouges sur 11 (5 cartes DC d'une série, 5 « Déjà présent »).
- **Correctif (client, `log.js`)** : `_mergeImportBlocsEch`, 2ᵉ passe qui s'AJOUTE au filet ft-v1158, appelée avant le rattachement
  catalogue et l'aperçu. Un BLOC CONTINU du même exercice canonique (clé après rattachement `auto`, donc alias compris), qui
  COMMENCE par une preuve d'échauffement et contient du travail = UN exercice ; chaque série garde reps, charge, type (É/N),
  repos (par série : le repos du travail ne déborde plus sur l'échauffement), indices spéciaux décalés, ordre du document.
  Preuves : `setTypePerSet` W, `setType` W, marqueur dans le nom (fin « (ECH) » ou tête « ECH - »), note qui COMMENCE par
  ECH / échauffement / montée. ⛔ Sans preuve, rien ne bouge ; un autre exercice coupe le bloc ; un échauffement après le
  travail ouvre un autre bloc ; superset et dropset jamais touchés.
- **Hors lot, à décider (Michel)** : la consigne du Worker reste en retard sur celle d'Apps Script (catalogue envoyé par l'app
  mais IGNORÉ par le Worker, repos jamais demandés, `setTypePerSet` jamais demandé). Deux copies du même prompt (R2) — l'aligner
  touche le Worker (déploiement Cloudflare).
- **Limites** : deux lignes identiques SANS preuve d'échauffement restent deux exercices (choix R29 — « Déjà présent » s'affiche
  alors, à juste titre ou non) ; un dropset placé juste après des échauffements laisse ceux-ci à part ; les notes des lignes
  d'échauffement ne sont pas gardées (même choix écrit que ft-v1158).
- **Contrôles** : banc `tools/banc_import_echauffement.js` **11/0** (IMP-WU-00 → 10) · 3 mutations **3/3** · blocs d'import du runner
  (CCLIV, CCLVI, CCLXIV, CCLXVI, CCLXX, CCLXXIII, CCLXXIV, CCLXXVI) **187/0** · SESSION-INTEGRITY 93/0 · ML-B 60/0 · débrief 58/0 ·
  `check_regles` vert · D-031 NON lancée.

### 🔐 AUTH-NEW-DEVICE-01 — `needsCode` N'EST JAMAIS « COMPTE INTROUVABLE » (06/10/2026, session-B — ⚠️ BRANCHE `claude/auth-new-device-01` · ✅ PUBLIÉ en `ft-v1251` le 07/10) — P1 intégrité
- **Origine** : audit « sécurisation des comptes existants » (06/10, lecture seule). Sur un NOUVEL appareil, un compte existant
  SANS code perso : `loadProfile` répond `auth` + `needsCode` (lecture stricte), et « COMMENCER » tombait dans le même `else` que
  `not_found` → inscription d'un compte NEUF → `saveProfile` de bienvenue puis instantanés à l'email seul, que le serveur accepte
  encore (transition S1, `_MIG_FERME_ = false`) et qui REMPLACENT les séances (garde-fou « vide » seulement sous 30).
- **Preuve** : sonde sur le vrai `Code.js` (20 séances en ligne → 1) + banc AN rejoué sur `060d13ad` : AN-01 et AN-09 ROUGES
  (bienvenue + 2 instantanés, 6 écritures portant l'email). **Aucun incident terrain prouvé** (P2, pas de P3).
- **Correctif (client seul)** : seul `not_found` crée un compte ; un refus `auth` garde l'email EN ATTENTE (`_restauPoser`, le
  propriétaire de COOKIE-PROFILE-01 — donc le garde central coupe profil, miroir et séances) et ne termine pas l'inscription ;
  toute autre réponse est traitée comme le réseau. `needsCode` → « ce compte n'a pas encore de code perso » + le parcours EXISTANT
  « Protéger mon compte » (inscription, « Restaurer mes données », Profil → Restaurer) ; un compte AVEC code → le code existant,
  comme avant. Après la pose du code, `_reprendreApresProtection` : jeton tout de suite (`_ftBootstrapJeton`), refus effacé, puis
  restauration par les chemins existants (`obDoRestore` / `doRestoreAccount`), jamais d'envoi avant. Le jeton rendu par
  `verifyConfirmCode` est enfin conservé (`_setFtToken`) — le client le jetait.
- **Hors lot, inchangé** : `_MIG_FERME_`, Code.js, Worker, anti-brute-force, longueur du code, appareil partagé, Lot 2 (textes et
  rappels). Un compte sans code reste écrasable par quelqu'un qui connaît l'email et écrit **hors de l'app** : seul `_MIG_FERME_` le
  fermera (décision de Michel).
- **Contrôles** : banc `tools/banc_auth_new_device.js` **16/0** (AN-01 → AN-10 + 01b, 02b, 03a, 03b, 09b, 10b) · 3 mutations **3/3** (M1 needsCode → compte neuf · M2 jeton de `verifyConfirmCode` jeté · M3 code inexistant redemandé) ·
  bancs voisins verts (COOKIE-PROFILE 16/0 · onboarding 25/0 · foodlog_restore 35/0 · profil_atypique 37/0 · débrief 58/0 · SESSION-INTEGRITY 93/0 · registre IA 40/0) · `check_regles` vert · D-031 complète NON lancée (règle jour/nuit) — banc branché dans la passe pour la nuit.

### 🌙 QUALIFICATION NOCTURNE ft-v1251 (06/10/2026, session-B — branche `claude/ft-v1251-night-qualification` · ✅ PUBLIÉE le 07/10/2026)
- **Périmètre** : les neuf lots ci-dessus (E5 absorbé par DEBRIEF-ON-DEMAND-01 et son correctif · ONBOARDING-QUICK-01 · « Quoi de
  neuf » v76 · COOKIE-PROFILE-01 · AUTH-NEW-DEVICE-01 · AUTH-CLOUD-CLOSURE-01 · AUTH-SIGNUP-STRICT-01 · IMPORT-ECH-01), HEAD fonctionnel
  gelé `3e420bd8`. **Ne contient pas NUT-PUNCH-01** (branche à part). Master inchangé `a1e39739` = `ft-v1250` en ligne.
- **Série hors passe (T1/T2, sur `db8d1ee0`)** : tous les bancs de lot et voisins verts, **sauf un** — `auth_ia` B-CCCLXXV ⑥
  (**MILO-AUTH1 : aucun code client n'efface le jeton**). La 1ʳᵉ version de T-JETON **effaçait** le jeton d'un autre compte ; mesuré,
  A → B → A perdait le jeton de A. **Correctif minimal** (`constants.js`, `4b1983e5`) : jamais envoyé pour un autre compte, jamais
  effacé. Témoin AC-09, mutation M3 ; `tools/mut_auth_ia.py` **8/8** ; contrôle négatif AC **3/3** ; chaos **56/0** (PostgreSQL jetable).
- **Passe complète n°1 sur `4b1983e5`** : **5 964 ✅ / 3 ❌** (① ③ ④ verts, ② rouge). Les trois rouges sont des **témoins périmés** du
  runner, pas des défauts de l'app, et **aucun banc de lot ne les exécutait** : bloc F (annonces de Christophe et d'Eline — la page
  ne posait jamais le repère d'inscription que la garde d'ONBOARDING-QUICK-01 lit désormais) et bloc G (avantage Premium renommé par
  D-052). Causes **prouvées sur copie** (garde retirée → F vert ; ancien libellé → G vert) ; témoins mis à jour sur leur garantie
  (`547e7f40`) ; **6 mutations du témoin conformes** (dont une reformulation qui doit rester verte). `BUGS.md` §24 et §31.
- **Contrôles négatifs sur l'arbre qualifié** : **65 mutations conformes** — DEBRIEF-ON-DEMAND **21/21** (M-OD13, un simple commentaire, a rougi une fois sur OD-16 puis est restée verte au rejeu : instabilité du banc, consignée) · ONBOARDING-QUICK **5/5** · COOKIE-PROFILE **3/3** · AUTH-NEW-DEVICE **3/3** (deux ancres remises à jour : le code visé avait été réécrit par AC et AS) · AUTH-SIGNUP-STRICT **2/2** · IMPORT-ECH **3/3** · AUTH-CLOUD-CLOSURE **3/3** et `tools/mut_auth_ia.py` **8/8** (sur `4b1983e5`, code de l'app identique) · SESSION-INTEGRITY et fil du Coach : les **8 + 3** mutations réécrites par DEBRIEF-ON-DEMAND-01, **11/11** · témoins F/G **6/6**.
- **Outillage remis à jour avant la passe n°2** (aucun fichier de l'app) : ancres M2/M3 de `tools/mut_auth_new_device.py`, qui
  visaient du code réécrit par AC et AS (`b699e5b3`) ; `docs/PROMPT-MILO-REEL.txt` régénéré depuis une copie isolée — blocs commun et
  personnel identiques au caractère près, seules l'empreinte de `constants.js` et l'heure changent (`fddcfde4`).
- **Répétitions** (bancs AN, AC, AS, CP, OBQ, IMP, OD, SESSION-INTEGRITY : 3 tours puis 1 tour en ordre inverse) : **31 exécutions sur 32 vertes** (3 tours puis 1 en ordre inverse) : AN 16/0, AC 9/0, AS 8/0, CP 16/0, OBQ 25/0, IMP-WU 11/0 et SESSION-INTEGRITY 93/0 à chaque tour ; débrief 58/0 trois fois et **57/1 une fois** (tour 2 — le témoin n'a pas été conservé par mon script, faute d'outillage dite). Rejoué 5 fois avec le détail : **5 × 58/0**. Le banc du débrief a donc rougi 2 fois sur ~31 exécutions cette nuit, jamais au rejeu : **instabilité du banc, consignée (`docs/JOURNAL-DE-TEST.md`), NON corrigée** — aucun délai rallongé à l'aveugle.
- **Parcours croisé entre lots** (sonde hors dépôt, vrai `Code.js` local) : **8/0** — cookie A + IndexedDB A + lecture stricte → attente, 0 écriture vers A · « continuer sans email » + rechargement → A oublié · texte honnête, protection → B restauré, jeton de B rangé avec B · import aux noms nus du Worker → une carte Développé Couché de 5 séries · fin de séance → 0 appel de débrief · double clic sur « Analyser » → 1 appel, sous l'identité B · rechargement → débrief gardé, 0 écriture vers A de bout en bout · 0 appel réel.
- **Bloc annexe** (`tools/recette_annexe.py`) : **14 PASS + 1 DÉFAUT CONNU** (`discussions` : taille du prompt — maison 71 733, salle 76 652, partie en cache 68 774 caractères), **valeurs identiques au caractère près sur master `a1e39739`**, mesurées cette nuit : ft-v1251 n'a pas fait grossir le prompt.
- **Passe complète n°2 sur `fddcfde4`** : **5 967 ✅ / 0 ❌**, **4 conditions vertes** (`tools/passe_valide.sh`). Après elle :
  documentation seulement (D-031).
- **Non lancé, dit** : le banc réel de Milo (appels payants — R34 : la consigne « à ma demande » et le bloc « SÉANCE À ANALYSER » ne
  sont pas mesurés sur le vrai modèle) ; **0 appel réel** de toute la nuit.
- **Défauts connus, consignés, NON corrigés** (aucun ne bloque cette version) : consigne d'import du Worker en retard sur Apps Script
  (R2 — catalogue ignoré, repos et `setTypePerSet` jamais demandés ; décision de Michel) · `_getEmailFromIDB` rend toujours `null` ·
  `ft4_authcode` non lié à un compte (un code de A envoyé pour B est refusé : non destructif) · aucun verrou contre les essais répétés de
  code · état réel de `LECTURE_STRICTE` en production non vérifié (Apps Script injoignable d'ici) · `_MIG_FERME_` encore `false` (un
  compte sans code reste écrasable par une écriture faite HORS de l'app) · orphelin si une séance est supprimée pendant son analyse ·
  débriefs locaux seulement · idempotence serveur · N-G1 · politique Premium du débrief (décision séparée).
- **⚖️ Numéro posé, version NON publiée** : après la passe n°2, `sw.js` passe à `ft-v1251` et l'en-tête de `CLAUDE.md` à
  `ft-v1251` (prochaine `ft-v1252`) — c'est ce que demandent le cahier des charges de la nuit et `tools/passe_valide.sh` (« poser le
  numéro de version maintenant »), et c'est ce qui rend le HEAD final publiable **tel quel** (sans nouveau numéro de cache, le
  service worker ne se mettrait pas à jour). ⚠️ Le contrôle 17 de `check_regles` impose que l'unique puce « Version en ligne (live) »
  de `CONTEXTE-ACTUEL` porte le numéro de `sw.js` : elle porte donc `ft-v1251` **avec la mention explicite « NON PUBLIÉE — la production
  reste `ft-v1250` »**. Ce libellé redevient exact à la publication.
- **🚀 Publication (sur feu vert de Michel uniquement)** : ① avance rapide de master sur le HEAD final — **aucun commit de plus**,
  la passe n'est pas à relancer (D-031) · ② vérifier le run Pages et « À propos » = `ft-v1251` · ③ commit documentaire de clôture :
  la puce « en ligne » perd sa mention « NON PUBLIÉE », `ft-v1250` y est rétrogradée en place, `D-052` et les en-têtes de lot
  ci-dessus passent à « publié en `ft-v1251` », ligne au journal de partage. **Aucun fichier backend** (ni `Code.js`, ni `worker.js`) :
  ni Apps Script, ni Worker à déployer.
- **✅ PUBLIÉE le 07/10/2026 (feu vert de Michel)** : master avancé en **fast-forward** de `a1e39739` à `bd0b627c` (aucun merge, aucun
  commit de plus), **Pages run n°1342 SUCCESS** (04:53 UTC), `sw.js` de master = `ft-v1251`. **Aucun backend redéployé** : ni Worker,
  ni Apps Script (`Code.js` et `worker.js` identiques à `a1e39739`, `_MIG_FERME_` inchangé). Audit Nutrition final indépendant : OUI.
  Passe D-031 finale : 5 967 / 0. ⚠️ Site servi **non lisible d'ici** (proxy : `CONNECT tunnel failed, response 403` vers github.io) :
  la version servie est établie par le déploiement Pages et `sw.js` de master, pas par une lecture du site. **Recette terrain iPhone à
  faire par Michel.** Les défauts reportés ci-dessus restent ouverts, comme dettes post-ft-v1251.

---

## 🔒 SEC-ADMIN-01 — S-01 fermée, admin durci (09/10/2026, session-B — ✅ PUBLIÉ en `ft-v1252` le 09/10/2026, déploiement @191)

> **Lot de sécurité ciblé**, indépendant du Lot 1 Import (base : master `6969ce73` = `ft-v1251`). Aucune publication, **aucun
> redéploiement Apps Script**, Worker non touché, 0 appel IA réel. ✅ **Publié le 09/10/2026 en `ft-v1252`** : master `6969ce73` →
> `30525fa7`, workflow Apps Script n°122 SUCCESS (déploiement @191), Pages n°1344 SUCCESS. ⚠️ **Le contrôle anonyme de la route
> S-01 n'a pas pu être fait** depuis la session (réseau : `script.google.com` refusé) — fermée par le code déployé, vérification à faire une fois.

**Le score** (le compte de Michel est protégé par son code perso — contexte produit confirmé ; le code n'est stocké nulle part) :

| Sujet | Avant (master) | Après (branche) |
|---|---|---|
| **S-01** — diagnostic premium appelable sans jeton : liste complète des adresses premium, écrite aussi dans le journal du serveur | ouvert | ✅ **fermé** : jeton admin vérifié côté serveur avant toute lecture, fermé si le secret manque ; réponse réduite à ce que la carte affiche ; aucune adresse au journal |
| **NX-01** — test du garde-fou (diagnostic qui écrit un compte de test) appelable sans jeton | ouvert | ✅ **fermé** (même jeton) |
| **NX-03** — valeur de jeton d'exemple dans deux commentaires de `Code.js` | présente | ✅ retirée. C'était l'**ancien** jeton en dur : mesuré le 04/08, la propriété `BACKUP_TOKEN` ne le contient pas (la route répondait « Unknown GET action ») — **aucune rotation nécessaire** sur cette base |
| **S-02 / B** — le mode admin écrivait l'adresse de l'admin dans l'identité d'un appareil sans e-mail | ouvert | ✅ **fermé** : le mode admin ne change plus l'identité, le champ n'est plus pré-rempli |
| **S-02 / carte « Statut Premium »** — fonctionnait sans jeton | ouvert | ✅ présente le jeton, oublie un jeton refusé, n'affiche aucune liste sans lui |
| **S-02 / libellé** « sans lire aucune donnée personnelle » (la carte affiche des adresses) | faux | ✅ exact |
| **S-02 / verrou admin de l'app** — code public, ou adresse de l'admin tapée | dette | ⚠️ **dette assumée** : verrou d'**interface** seulement — prouvé par le banc, il n'ouvre **aucune** donnée serveur |
| « Cette adresse a-t-elle un code ? » (`authStatus`) répond à tous | décision du 07/08 | inchangé (écran de connexion, workflow de déploiement) |
| Compte **sans code** écrasable sans jeton par qui connaît l'adresse | décision `_MIG_FERME_` | inchangé (constat figé par un témoin) |
| Adresses réelles écrites dans le code public (app + serveur) | dette | inchangé (l'historique git les garde de toute façon) |
| Journal des séances (feuille « Sessions ») : ajout de lignes sans preuve d'identité | **nouveau constat** | inchangé — pollution possible, aucune lecture |
| Le contrôle premium normal écrit adresse + liste brute dans le journal **privé** du serveur | **nouveau constat (mineur)** | inchangé (hors administration) |
| Premium **local** accordé à qui tape une adresse « premium à vie » (miroir côté app, « anti-curieux ») | dette documentée | inchangé — aucun appel Milo sans jeton d'appareil |
| `aiCount` (comptage des appels IA venus du Worker) écrivable sans jeton | dette connue (repli ouvert documenté : le blocage reste désarmé sans le secret du Worker) | **consignée à la publication, non corrigée** |
| `_checkIdeesTok_` juge la longueur du secret **avant** le `trim` : une propriété courte entourée d'espaces passerait le contrôle des 12 caractères | relevé par la contre-vérification indépendante | **consignée à la publication, non corrigée** (le secret réel n'est pas concerné tant qu'il fait ≥ 12 caractères utiles) |

**Les réponses de l'audit S-02** (A → F) :
- **A — Le code admin public donne-t-il un privilège serveur ?** Non. Le serveur ne voit jamais ce code ; chaque route Admin exige
  un secret des Script Properties. Les seules exceptions étaient S-01 et NX-01, **ouvertes même sans le code** : fermées.
- **B — Modifie-t-il l'identité locale ?** Oui, avant ce lot (appareil sans e-mail → adresse de l'admin + sauvegarde). Plus maintenant.
- **C — Lecture ou écriture cloud incorrecte ?** Lecture : non (le compte admin a un code). Écriture du profil : refusée (code).
  Mais des requêtes **partaient** au nom de l'admin (mesuré sur l'arbre d'avant), et le journal des séances accepte n'importe
  quelle adresse. Fermé à la source (B).
- **D — Le code perso protège-t-il côté serveur ?** Oui pour les **données du compte** : lecture (`loadProfile`), écriture
  (`saveProfile`, `pushHealth`), délivrance d'un jeton d'appareil. Non pour les journaux périphériques (séances, idées) ni pour la
  question « a-t-elle un code ? ».
- **E — Un compte testeur sans code est-il plus exposé ?** Oui : écrasable sans jeton par qui connaît son adresse (transition décidée
  par Michel). La lecture est fermée par la lecture stricte (état réel en production **non vérifié** d'ici). Le mode admin n'y ajoute rien.
- **F — D'autres routes avec le même défaut ?** Inventaire complet `doGet` / `doPost` : une seule autre route de diagnostic sans jeton
  (NX-01, fermée). Toutes les autres routes Admin refusent sans leur jeton — **sans donnée ni écriture** (prouvé par le banc, en
  anonyme et avec une identité normale) ; à la lecture du code, le contrôle du jeton est leur première instruction.

**Preuves.** Banc `tools/banc_sec_admin.js` — le vrai `Code.js` exécuté en local par `doGet` / `doPost`, puis la vraie app contre lui ;
adresses fictives `example.test` uniquement, chaque remplacement compté : **23 rouges sur master `6969ce73` → 69/0 sur la branche** (22 au premier essai : le témoin C1 ne voyait que l'adresse de la liste admin, alors que l'app posait l'adresse écrite en dur — durci).
Contrôle négatif `tools/mut_sec_admin.py` : **17/17 conformes** — 16 mutations du vrai code rougissent, chacune sur son témoin (M00 = master : 23 rouges ; M02 « l'adresse seule suffit » n'est attrapée que par SEC-ADMIN-03 ; M07 « fermé par défaut » que par 05b), et la mutation d'un **commentaire** reste verte. ⚠️ M10 a d'abord « rougi » par un **plantage** (son ancre cassait la syntaxe de `setup.js`) : relancée avec une ancre juste, elle rougit sur E4 et E4b ; l'outil refuse désormais une mutation qui casse la syntaxe — *un plantage n'est pas une preuve*. Non-régressions (désignées par `tools/recette_selecteur.py --diff`) : chaos **56/0** (vrai `Code.js` + PostgreSQL local) · lot3 **87/0** · AUTH-NEW-DEVICE **16/0** · AUTH-CLOUD-CLOSURE **9/0** · AUTH-SIGNUP-STRICT **8/0** · COOKIE-PROFILE **16/0** · s2b_bascule **71/0** · annexe complète **14 PASS + 1 défaut connu** (`discussions`, taille du prompt : maison 71 627 · salle 76 546 · avant marqueur 68 779 — **valeurs identiques sur master le même jour**). ⚠️ Un premier passage avait classé `calculs` en « erreur d'infra » : mon commit `e6a9e91d` était tombé pendant la suite (arbre modifié) ; relancée sur arbre stable : PASS. Passe complète (D-031) sur `6738624e` : **6 036 ✅ / 0 ❌, 4 conditions vertes** (`tools/passe_valide.sh` ; 5 967 de ft-v1251 + les 69 témoins SEC-ADMIN) — 57 min. Après elle : documentation seulement. **Aucun numéro de version** : rien n'est publié.

**Ce que le banc ne prouve pas** : le vrai déploiement Apps Script (aucun redéploiement dans ce lot), les vraies Script Properties, Safari iOS.

## 🏷️ IMPORT-MAP-01 — l'identité automatique ne change plus le matériel écrit (10/10/2026, session-B — ⛔ BRANCHE `claude/import-map-01` : CORRIGÉ SUR BRANCHE — QUALIFIÉ — NON PUBLIÉ)

> Base master `b280ea5d` (`ft-v1252`). Aucune version, aucune publication, Worker et Apps Script non touchés, 0 appel IA réel.
> **En production, rien de ce qui suit n'est fermé** tant que la branche n'est pas publiée.

| Sujet | Avant (master) | Après (branche) |
|---|---|---|
| « Squat machine » → Squat à la Barre (AUTO 95) | ouvert | ✅ jamais AUTO (exercice nouveau) |
| « Élévations latérales haltères » → …Câble (AUTO 100) | ouvert | ✅ jamais AUTO (confirmation) |
| même famille : squat / DC / shrug / soulevé de terre « haltères », « Squat guidé » | ouvert | ✅ jamais AUTO vers un autre matériel |
| import : la carte reprend les charges, séances et record d'un autre exercice | ouvert (140 kg du squat barre) | ✅ fermé (vrai chemin d'import conduit) |
| nom sans matériel → variante matérielle en AUTO (« Développé épaules », « Curl biceps »…) | AUTO | ✅ confirmation (D-053) — 51 noms génériques du catalogue concernés |
| grille du catalogue (1 518 variantes) — AUTO inter-matériel | 626 | ✅ 5, tous par alias déclaré (0 par rapprochement) ; 0 rapprochement sain perdu |
| **23 alias déclarés** qui contredisent leur matériel écrit (`dumbbell row` → Rowing Barre…) | dette | ⚠️ **inchangés** (étage conservé) — cliquet G5 ; **décision de Michel attendue** |
| « Presse Zeta » (nom propriétaire inconnu) | suggestion 25 % | inchangé : jamais AUTO ; gardé en exercice perso si la suggestion est refusée |
| suggestion de « Élévations latérales haltères » | — | ⚠️ propose « Élévation Latérale Landmine » (classement fuzzy, hors périmètre) |
| fautes d'orthographe (« Devlopé couché » → nouveau) | — | hors périmètre (jamais d'AUTO faux, mesuré) |
| historique déjà contaminé avant ce lot | — | non migré (hors périmètre) |

**Preuves.** Banc `tools/banc_import_map.js` : **8 rouges sur master → 23/0** ; contrôle négatif `tools/mut_import_map.py` : **12/12**
(M00 = master ; M1/M1b/M1c pas assez strict ; M2/M3 trop strict — DC Barre, Peck deck, Pendulum, alias ; M4 décision retirée ;
M5/M6/M7/M9 déguisées ; M10 commentaire, vert). Voisins : import_echauffement 11/0 · lot3 87/0 · Milo strict C1 29/0 · C3 35/0 ;
annexe : 14 PASS + 1 défaut connu (discussions, préexistant, identique à master). Passe complète sur `755924a0` : **6 059 ✅ / 0 ❌ (4 conditions vertes)**.
