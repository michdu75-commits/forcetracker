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
- ↪️ **11/10/2026 — NUT-D042-01 (branche `claude/nut-d042-01`, NON PUBLIÉE, rien en production)** : FS-01 → FS-03
  portés sur master `b280ea5d` (FS-04 non porté) et **D-042 implémentée** (générique pertinent avant le fast-food,
  intention de marque gardée). Ce retour terrain n'est **pas** clos : il le sera à la publication, après recette.
  Mesures et limites : `docs/FOOD-SEMANTICS.md` §14 ; décision : `docs/DECISIONS.md` D-042.
  ↪️ **11/10 (NUT-D042-CLOSURE-01)** : repositionné sur master `7b75f3c1` (`ft-v1253`), branche `claude/nut-d042-closure-01` —
  **QUALIFIÉ SUR MASTER ACTUEL · NON INTÉGRÉ · NON PUBLIÉ · EN ATTENTE DE CONTRE-VÉRIFICATION**. 6 bancs Food 0 rouge, 117 / 117 mutations conformes, passe complète D-031 **6 661 ✅ / 0 ❌** sur `0407516b` (4 conditions vertes).
  ↪️ **12/10 (NUT-FOOD-VARIANTS-01, branche `claude/nut-food-variants-01` depuis `0407516b`)** : un qualificatif nutritionnel
  tapé est respecté (D-058) — quatre causes corrigées dans `_afNorm` / `_afTrouve` / `_afRang` ; banc `food_variants` 55/19 → 74/0 (74 cas ; 52/19 sur les 71 premiers) ;
  **NON INTÉGRÉ · NON PUBLIÉ · EN ATTENTE DE CONTRE-VÉRIFICATION**. Limites nommées : `docs/FOOD-SEMANTICS.md` §15.
  ↪️ **12/10 (NUT-FOOD-VARIANTS-03, branche `claude/nut-food-variants-03`)** : trous PRÉEXISTANTS fermés — « zéro » hors ligne,
  « cola » ↛ « chocolat », « 1/2 écrémé », « viande hachée », crème fraîche (D-060), taux en fourchette, steak haché 5 % cru ;
  banc 96/26 → 122/0 ; **NON INTÉGRÉ · NON PUBLIÉ** ; dettes : steak haché sans précision hors ligne et « viande hachée » sans précision (crus seuls, FV-164 / FV-165). `docs/FOOD-SEMANTICS.md` §15 ter.

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

## 🏷️ IMPORT-MAP-01 — l'identité automatique ne change plus le matériel écrit (10/10/2026, session-B — ⛔ BRANCHE `claude/import-map-01` : CORRIGÉ SUR BRANCHE — QUALIFIÉ — NON PUBLIÉ · ↪️ INTÉGRÉ MASTER `7d7bb5a8` (11/10, avance rapide) · ✅ PUBLIÉ en `ft-v1253` le 11/10/2026)

> Base master `b280ea5d` (`ft-v1252`). Aucune version, aucune publication, Worker et Apps Script non touchés, 0 appel IA réel.
> ~~**En production, rien de ce qui suit n'est fermé** tant que la branche n'est pas publiée.~~ ↪️ **Publié en `ft-v1253` le 11/10/2026.**

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

## 🏷️ IMPORT-MAP-01B — les alias déclarés ne changent plus le matériel écrit (10/10/2026, session-B — ⛔ BRANCHE `claude/import-map-01` : CORRIGÉ SUR BRANCHE — QUALIFIÉ — NON PUBLIÉ · ↪️ INTÉGRÉ MASTER `7d7bb5a8` (11/10, avance rapide) · ✅ PUBLIÉ en `ft-v1253` le 11/10/2026)

> Correction des alias contradictoires **après contre-vérification Nutrition** d'IMPORT-MAP-01. Base master `b280ea5d` (`ft-v1252`),
> branche `claude/import-map-01` (`1a98fb65` → `bbd6e054`). Aucune version, aucune publication, Worker et Apps Script non touchés, 0 appel IA réel.
> ~~**En production, rien de ce qui suit n'est fermé** tant que la branche n'est pas publiée.~~ ↪️ **Publié en `ft-v1253` le 11/10/2026.**

| Sujet | Avant (`1a98fb65`) | Après (branche) |
|---|---|---|
| « Rowing haltères » / « db row » / « dumbbell row » → Rowing Barre (AUTO, 100 kg + record repris) | ouvert | ✅ jamais AUTO (alias retirés, l'import demande) — ⚠️ cible définitive à Michel (D-055) |
| « Hip thrust haltères » / « db hip thrust » → Hip Thrust Barre (160 kg) | ouvert | ✅ → Hip Thrust Haltère |
| « Thruster haltères » → Thruster barre (60 kg) | ouvert | ✅ → Thrusters Haltères |
| curl machine ×3 → Curl Barre · overhead press machine ×2 → Développé Militaire · triceps machine ×2 → Triceps Poulie · extension nuque poulie → …Haltère | ouvert | ✅ redirigés vers la seule cible du bon matériel |
| leg curl poulie ×3 · step up barre ×2 · low cable knee extension · db lunge · cable kickback | ouvert | ✅ retirés (aucune cible du bon matériel / ambigu) |
| cliquet « ≤ 23 » (battu par échange d'alias, vocabulaire recopié de l'app) | faible | ✅ remplacé par « 0 alias qui CAUSE un AUTO contradictoire » (db / bb / kb) |
| « lat machine » → Tirage Poulie Haute | — | ✅ exception sémantique documentée (seule) |
| **dette MOTEUR** : fentes haltères / dumbbell lunge → Fentes (barre) ; cable hip abduction / adduction, cable leg extension, leg extension poulie → machines | — | ⚠️ **inchangé** : retirer l'alias ne change rien, `_exEquip` ignore le nom anglais (hors périmètre, figé) |
| suggestions faibles après retrait (« DB row » → Rowing Câble, « Rowing haltères » → Landmine) | — | ⚠️ question, jamais AUTO ; le moteur ne lit pas « db » (hors périmètre) |
| doutes d'illustration seulement (cable triceps pushdown, extension triceps poulie, seal barbell row, dumbbell goblet squat) | — | ⚠️ inchangés, à trancher (preuve faible) — **cable triceps pushdown et extension triceps poulie : ✅ tranchés par IMPORT-P0-2** (→ Triceps Poulie, publié en `ft-v1253`) |
| réserve D-053 : noms génériques en confirmation (historique non repris si non confirmé, regroupements ECH générique + TRAV précis) | — | constat seulement — **non traité ici** (IMPORT-ECH-02) |

**Preuves.** Banc `tools/banc_import_map_alias.js` : **10 rouges sur `1a98fb65` → 20/0** ; banc IMPORT-MAP-01 22/0 (G5 retiré, R30) ;
contrôle négatif `tools/mut_import_map.py` : **24/24 conformes** ; CCLXXIII réécrit (R30). Voisins : import_echauffement 11/0 · lot3 87/0 · Milo strict
C1 29/0 · C3 35/0 ; annexe : 14 PASS + 1 défaut connu (discussions, préexistant, même chiffre avec le log.js d'avant). Passe complète sur `bbd6e054` : **6 078 ✅ / 0 ❌ (4 conditions vertes)**.

## 🏷️ IMPORT-MAP-02 — le matériel se lit à sa place (10/10/2026, session-B — ⛔ BRANCHE `claude/import-map-01` : CORRIGÉ SUR BRANCHE — QUALIFIÉ — NON PUBLIÉ · ↪️ INTÉGRÉ MASTER `7d7bb5a8` (11/10, avance rapide) · ✅ PUBLIÉ en `ft-v1253` le 11/10/2026)

> Micro-lot ciblé après l'audit du corpus externe (387 lignes) et le Ghost du Drive. Base master `b280ea5d` (`ft-v1252`), branche
> `claude/import-map-01` (`790932a3` → `8c5a8480`). Un seul propriétaire touché, `_materielDe` (log.js), plus une donnée du catalogue
> (nom anglais de Fentes). Aucune version, aucune publication, Worker et Apps Script non touchés, 0 appel IA réel.
> ~~**En production, rien de ce qui suit n'est fermé** tant que la branche n'est pas publiée.~~ ↪️ **Publié en `ft-v1253` le 11/10/2026.**

| Sujet | Avant (`790932a3`) | Après (branche) |
|---|---|---|
| **P0-1** cible « Polyvalent » invisible : « Lateral Raise (Cable) » / « Cable Lat Raise » → Élévations aux haltères, « Machine Glute Kickbacks » → kickback poulie, « Reverse Fly Machine » / « Oiseau sur poulie » → Oiseau (AUTO, charges reprises) | ouvert | ✅ jamais AUTO vers l'autre matériel ; la cible Polyvalent est lue dans son nom anglais (T2), seulement si `_exEquip` ne sait rien |
| **P1-1** « barre » poignée lue comme charge : « Tirage vertical / poitrine / nuque barre » | NEW | ✅ AUTO Tirage Poulie Haute / Tirage Nuque (historique repris) |
| **P1-2** poulie implicite non lue : « Triceps corde » ×2 (Drive), « Tricep Rope Pushdown », « EZ Preacher Curl » | question D-053 à tort | ✅ AUTO juste (historique repris) |
| corpus externe, faux AUTO dangereux | 6 | ✅ 1 (alias « triceps pushdown », P0-2, hors lot) → **0 avec IMPORT-P0-2** (publié en `ft-v1253`) |
| barre libre (Rowing / Curl / Squat / DC / SdT / Hip thrust barre) | AUTO juste | ✅ inchangé |
| Fentes (P.1) | nom anglais « lunge barbell » | ✅ « lunge » — multi-matériel « les 3 » (**D-056**) ; effet : la recherche vidéo / image se fait sur « lunge » |
| Tirage Menton (P.2) | — | ⏸️ **différé** (Michel) : « Tirage menton barre » peut rester nouveau, aucune rustine |
| Tirage en Rack / Waiter Curl (P.3) | — | ⏸️ **différé** (Michel) : `_exEquip` inchangé |
| « Tirage horizontal barre » (P.4) | question | ✅ ambigu : jamais AUTO (ni Rowing Barre, ni Rowing Câble) |
| dette moteur figée (01B) | 6 clés | ✅ 4 clés (les 2 alias Fentes sont conformes à « les 3 ») |
| alias « triceps pushdown » → Extension Triceps (P0-2), « reverse fly » en double, landmine / T-bar | ouvert | ⚠️ **hors lot**, inchangé — **P0-2 : ✅ corrigé par IMPORT-P0-2** (publié en `ft-v1253` le 11/10/2026) ; « reverse fly », landmine / T-bar toujours ouverts |
| suggestions faibles après exclusion (p. ex. « Cable Lat Raise » → Tirage Poulie Haute), modificateurs (Oiseau poulie 45°) | ouvert | ⚠️ **hors lot** (P1-3, P1-4) — question, jamais AUTO |
| pluriel « poulies », barre de traction, élastique, langues ES/DE/IT/PT, fautes de frappe | ouvert | ⚠️ **hors lot** |
| `docs/export/catalogue-exercices.json` (instantané daté du 02/08) porte encore « lunge barbell » | — | ⚠️ instantané non régénéré (outil `tools/export_catalogue.js`) |

**Preuves.** Banc `tools/banc_import_map2.js` : **24 rouges sur `790932a3` → 43/0** ; oracles adaptés et justifiés : banc 01 22/0
(la grille apprend le rôle de la barre), banc 01B 22/0 (Fentes « les 3 », dette 6 → 4) ; contrôle négatif `tools/mut_import_map2.py` :
**25/25 conformes** ; rejeu du vrai code sur 719 libellés distincts = simulation de la conception (21 changements, 12 nouveaux AUTO tous justes,
0 régression). Voisins : import_echauffement 11/0 · lot3 87/0 · séance C1 29/0 · C3 35/0 · mutations 01 / 01B **24/24 conformes** (oracles adaptés compris) · sélecteur de recette propre (EX_EN rattaché au scénario) · annexe 14 PASS + 1 défaut connu (discussions, préexistant : mêmes chiffres 71 726 / 76 645 / 68 781 avec le log.js d'avant — le lot ne change pas le contexte de Milo) · `check_regles.py` vert. Passe complète : **6 123 ✅ / 0 ❌** sur `972fcce1` (4 conditions vertes).

### 🧾 IMPORT-MAP-INTEGRATION-01 (11/10/2026) — intégré master, NON publié, et les dettes du Ghost final

> Master `b280ea5d` → **`7d7bb5a8`** en **avance rapide** (aucun commit de fusion, aucun conflit, arbre fonctionnel = `972fcce1`
> qualifié : passe complète 6 123 ✅ / 0 ❌, confirmée par le Ghost final indépendant, verdict **B — vert avec dettes non bloquantes**).
> Bancs rejoués sur le master intégré : IMPORT-MAP-02 43/0 · IMPORT-MAP-01 22/0 · 01B 22/0 · import_echauffement 11/0 · `check_regles` vert.
> ⛔ **NON PUBLIÉ** : production = `ft-v1252`. ↪️ *Publié en `ft-v1253` le 11/10/2026, avec IMPORT-P0-2.* ⚠️ Le push sur master a déclenché le déploiement Pages (`on: push: master`) ; il a été
> **annulé avant mise en ligne** (run 38140901833, déploiement `7d7bb5a8` en état `error`, dernier déploiement réussi = `b280ea5d`).
> ⛔⛔ **Tout prochain push sur master redéploiera Pages et servira ce `log.js`** : la prochaine publication doit poser `ft-v1253`
> (`sw.js`) dans le même push. Aucun commit documentaire n'est poussé sur master tant que ce n'est pas décidé.

Les dettes ci-dessous sont **consignées, non corrigées** (constats du Ghost final ; V-4 re-mesuré ici). Aucune ne crée d'AUTO faux ni de
contamination d'historique. ⛔ **P0-2** (« Triceps Pushdown » / « Cable triceps pushdown » / « Extension triceps poulie » → *Extension
Triceps*, alias souverain historique, **préexistant sur master**, seul faux AUTO high restant) est **hors de ce lot** : prochain micro-lot. ↪️ *Traité par IMPORT-P0-2 (section suivante) : **publié en `ft-v1253`** le 11/10/2026.*

| | Dette (Ghost final) | État |
|---|---|---|
| **V-1** | **D-057, listes fermées** : des formes corde / rope / élastique hors liste donnent des questions moins bonnes — jamais d'AUTO, jamais de contamination | ⚠️ ouverte |
| **V-2** | pas de témoin propre aux **pluriels** de D-057 (pushdowns, pulldowns, cordes, ropes) — l'absence d'effet sur les corpus n'est pas une preuve qu'ils sont lus | ⚠️ ouverte |
| **V-3** | oracle de test `MULTI['Fentes']` **trop large** (un témoin, pas l'app) | ⚠️ ouverte |
| **V-4** | recherche d'exercice : « **lunge barbell** » ne retrouve **plus** Fentes (la trouvait sur `b280ea5d`) ; « **barbell** » la trouve **toujours** (via alias) — mesuré le 11/10 par `filterEx` dans la vraie page. La phrase de D-056 qui disait le contraire est corrigée. | ⚠️ ouverte |
| **V-5** | « Tirage nuque barre fixe » peut produire une question vers *Tirage Nuque* | ⚠️ ouverte |
| **V-6** | 5 AUTO **justes** du master devenus prudents / nouveaux depuis 01 / 01B : Tirage vertical machine · Tirage poitrine machine barre · Dips barre · Pull-up barre · Face pull barre | ⚠️ ouverte (perte de confort, pas d'erreur) |
| **V-7** | questions faibles : « Élévations latérales haltères », « Elevation latérales » (la première est déjà notée plus haut : suggestion *Élévation Latérale Landmine*) | ⚠️ ouverte |
| **V-8** | certains bancs officiels tentent encore des connexions réseau (bloquées dans l'environnement du Ghost) | ⚠️ ouverte (outillage de test) |

## 🏷️ IMPORT-P0-2 — les pushdowns poulie ne vont plus vers « Extension Triceps » (11/10/2026, session-B — BRANCHE `claude/p0-2-triceps-pushdown` : QUALIFIÉ → INTÉGRÉ MASTER · ✅ PUBLIÉ en `ft-v1253` le 11/10/2026)

> Micro-lot sur le dernier faux AUTO « high » du corpus externe. Base master `7d7bb5a8` (code d'IMPORT-MAP intégré, **non publié** ;
> production `ft-v1252`). **Trois valeurs** d'alias changées dans `_EX_EQUIV` (log.js) — aucune clé ajoutée, aucune fonction, aucune
> table, aucune persistance. Aucune version, aucun push master, Worker et Apps Script non touchés, 0 appel IA réel.
> ~~**En production, rien de ce qui suit n'est fermé** tant que la branche n'est pas intégrée puis publiée.~~ ↪️ **Intégré master et publié en `ft-v1253` le 11/10/2026.**

| Sujet | Avant (`7d7bb5a8`) | Après (branche) |
|---|---|---|
| « Triceps Pushdown », « Cable triceps pushdown », « Extension triceps poulie » | AUTO **Extension Triceps** (l'extension à l'haltère) : ses charges, ses séances, son record ; l'import d'historique écrivait sous son nom | ✅ AUTO **Triceps Poulie** (programme, historique, pré-saisie, record) |
| « Tricep pushdown », « Triceps pushdowns », « Cable Tricep Pushdown » | AUTO Triceps Poulie | ✅ inchangé |
| corde / rope (« Triceps corde », « Tricep Rope Pushdown ») | AUTO Triceps Corde Poulie | ✅ inchangé |
| élastique (« Banded pushdown », « Pushdown élastique ») | question → Triceps Poulie, jamais AUTO | ✅ inchangé |
| « Extension triceps haltère », « Skull crusher », « Barre au front », « Extension Triceps » exact | AUTO juste | ✅ inchangé |
| corpus externe, AUTO faux « high » | 1 (EXT-0138) | ✅ **0** (EXT-0138 rejoint le cliquet A_fige, 97 → 98 justes) ; AUTO faux toutes confiances 6 → 5 (Rowing T-Bar « medium », Leg Curl ×4 « ambiguous », inchangés) |
| ⚠️ famille « extension triceps + matériel » (« Extension triceps à la poulie », « … câble », « Cable triceps extension », « Extensions triceps poulie », « Extension triceps barre », « Extension triceps machine » — 10 tournures) | AUTO Extension Triceps **par les mots**, pas par un alias | ⚠️ **inchangé — limite connue, nommée et figée** (le banc rougit si elle grandit). Cause : « Extension Triceps » est rangée « Polyvalent » et son nom anglais (« triceps extension overhead ») ne dit aucun matériel, donc le garde-fou d'IMPORT-MAP ne peut pas s'y opposer. **Décision de Michel attendue** : que désigne « Extension Triceps » ? (haltère seulement → lui donner un matériel lisible, précédent Fentes D-056 ; ou alias au cas par cas). **Option recommandée, à soumettre** : « Extension Triceps » représente aujourd'hui l'extension **verticale à l'haltère** (son illustration et son nom anglais le disent) — ⛔ *recommandation, pas un code : rien n'est changé sans décision* (11/10, CLOTURE-CHANTIERS-DOCS-01). Dette **séparée**, non bloquante pour P0-2 |
| « Pushdown corde » | question → Triceps Poulie | ⚠️ inchangé (question, jamais AUTO ; la corde serait plus juste) |

**Preuves.** Banc `tools/banc_p02_triceps.js` (B-P02-A/P/H/∅) : **11 rouges sur `7d7bb5a8` → 23/0** ; contrôle négatif
`tools/mut_p02_triceps.py` : **10/10 conformes** (M00 code d'avant, M1-M3 alias remis, M4 vers la corde, M5 corde → poulie, M6 a/b/c
contamination pré-saisie / nom écrit par l'import d'historique / record, M7 commentaire vert ; chaque rouge est un témoin, aucun plantage).
Non-régressions : IMPORT-MAP-02 43/0 (cliquet 98, faux figés vides) · IMPORT-MAP-01 22/0 · IMPORT-MAP-01B 22/0 · import_echauffement 11/0 ·
`check_regles` vert ; contrôle négatif IMPORT-MAP-02 relancé (oracle modifié) **25/25 conformes**. Passe complète D-031 sur `e4609c16` :
**6 146 ✅ / 0 ❌ (4 conditions vertes)** — +23 = les témoins B-P02. Après elle : documentation seulement (D-031).

### 🧹 CLOTURE-CHANTIERS-DOCS-01 (11/10/2026) — où en est l'Import, en une ligne par sujet

> Consolidation **documentaire** seulement (aucun code), avant le ménage des branches. Les statuts ci-dessous sont mesurés sur le dépôt.

| Sujet | Statut |
|---|---|
| IMPORT-MAP-01 / 01B / 02 | ✅ **PUBLIÉ en `ft-v1253`** (11/10/2026) — recette terrain de Michel à faire |
| IMPORT-P0-2 (Triceps Pushdown) | ✅ **INTÉGRÉ MASTER · PUBLIÉ en `ft-v1253`** (11/10/2026, passe 6 146 / 0) — recette terrain de Michel à faire |
| Dettes Import du Ghost final | ⚠️ **V-1 → V-8**, consignées **une seule fois** (tableau IMPORT-MAP-INTEGRATION-01 ci-dessus), non corrigées |
| Dette « Extension Triceps + matériel » (10 tournures) | ⚠️ **séparée, non bloquante**, préexistante sur master — décision de Michel attendue (section IMPORT-P0-2) |
| IMPORT-ECH-02 (noms génériques en confirmation, regroupements ECH générique + TRAV précis) | ⏳ **futur, non commencé** |
| LOT 1 IMPORT PROGRAMME (branche `claude/import-programme-lot1-client`) | 🟠 **qualifié sur `6969ce73`, NON INTÉGRÉ, qualification périmée** — son détail vit sur sa branche ; ⚠️ collision de numéros de décision (D-053 → D-057), voir `docs/DECISIONS.md` |

## 🔎 AUDIT DELTA — HISTORIQUE / PROGRÈS / STATISTIQUES (14/10/2026, session-B — lecture seule, master `a0eab5b3`, `ft-v1254`)

> ⛔ **Aucune ligne de production modifiée, aucun appel Milo.** Source terrain : l'export réel du 14/10 (63 séances,
> 1 077 séries validées + 50 lignes de cardio). 11 témoins **hors dépôt** sur le vrai code, 7/7 mutations.
> Rapport complet : PDF hors dépôt `AUDIT-DELTA-HISTORIQUE-PROGRES-STATS-2026-10-14.pdf`.

| ID | Classe · gravité | Constat (une ligne) | État |
|---|---|---|---|
| HP-01 | A/E · P2 | Le bouton « échec » enregistre `rir:0` sur une série N → export « 0 », « précédent » ·0r, Milo « RIR0 » = **réussie** (14 séries depuis le 07/09) | ⏳ décision RIR / ÉCHEC |
| HP-02 | D/E · P2 | Une série X compte pour le record et le graphe, sans marque pour Milo (Développé Couché 108 = 105×2 X ; 105,9 sans) | ⏳ décision X / records |
| HP-03 | D/E · P2 | « 1RM actuel » = dernier point, « Progrès » = dernier − premier, axe par rang : 15/57 « Progrès » négatifs, 13 « actuels » > 10 % sous le record | ⏳ décision définitions |
| HP-04 | D · P3 | Graphe et « Charge max soulevée » ne lisent que le 1er bloc (0 effet sur l'export de Michel) | ouvert |
| HP-05 | E · P3 | Le nom de la séance (`progLabel`) n'est jamais exporté ; titres PDF = libellé du cardio (39 « Cardio avant ») | ouvert |
| HP-06 | E · P3 | PDF regroupé par **jour** ; l'en-tête compte des jours et des lignes de cardio (« 1127 séries » = 1 077 + 50) | ouvert |
| HP-07 | E · P3 | Cardio « après » imprimé avant les exercices ; « après » perdu si avant + après | ouvert |
| HP-08 | E · P3 | Trois numérotations (export = position avec non validées et échauffements ; Milo = S1… travail) ; aucun trou n'est une perte | ouvert |
| HP-09 | C/D · P3 | Unilatéral en 2 blocs : volume ×4 (9 920 kg pour 4 960), Milo « 2 exercices » | ⏳ décision unilatéral |
| HP-10 | C · P3 | Recherche de Progrès : catalogue + exercices perso seulement ; un nom présent dans le seul historique est injoignable | ouvert |
| HP-11 | D/E · P3 | Poids du corps (kg = 0) : graphe vide, « Aucune donnée — commence à logger ! » faux | ⏳ décision affichage |
| HP-12 | E · P3 | RIR invisible dans le détail d'une séance passée | ouvert (lot UX-HIST) |
| HP-13 | E · P3 | Débrief d'une séance au-delà des 20 dernières : plus joignable dans l'app (conséquence de NV-01) | ouvert (lot UX-HIST) |

**Légitime ou indéterminable, NE PAS « corriger »** : Dips 09/07 (kg/reps probablement inversés, origine non prouvée) ·
Rowing Haltère (convention total → par bras ; « laisse pour l'instant » tient) · Rowing Hammer / Leg Curl Couché
(machine ou réglage) · 2 blocs identiques du 04/10 (côté ou doublon) · « record personnel » du 04/10 (séance enregistrée
avant `ft-v1250`) · inversions charge / 1RM de la formule de Brzycki (57).
**Toujours présents, déjà connus** : C2, C4, D1, D3, D5 (07/10) · DB-06, NV-01, AR-03, CC-12, AR-02, DN-05 (08/10).
**Identité** : nom exact partout (sauf `refAvant` et l'unilatéral) ; 0 renommage actif chez Michel ; « SDT roumain » et
« Soulevé de Terre Roumain Barre » = deux identités (fusion : décision de Michel, pas prise). **Machine** : aucune identité
dans les données — reporté au benchmark.

**Complément du 14/10 — la structure de l'onglet Progrès** (orientation de Michel, **non décidée** : Progrès → Séances →
Exercices → Corps & santé ; Badges sort de Progrès, destination non décidée ; **rien n'est déplacé**). Mesuré : le panneau
« Exercices » contient **trois** groupes, pas deux — les deux cartes de synthèse (haut), l'analyse d'un exercice (milieu)
et l'historique + 📤 Exporter + filtre + 20 cartes (bas, hors des captures), plus la bannière du **cycle menstruel**
(femmes seulement). Synthèse, volume et liste rendent la même chose quel que soit l'exercice choisi (vrai code). Séparation
**simple dans le code** (4 points de couplage : `switchProgTab`, `renderProgress` qui force « Exercices », `goSessionsHistory`,
`ft4_progAcc`) ; **le travail est autour** : 3 portes d'entrée (Accueil, calendrier ×2), 19 points rouges (un point dont
l'ancrage disparaît n'est jamais posé, sans erreur — screens.js:61), aide / Guide (⚠️ 4 textes disent encore « Poids »
depuis le renommage du 02/09 : screens.js:380/388, coach.js:8487/8494), témoins CLXXII / CLXXIII à réécrire avec leur
raison. L'ordre est cohérent (source → vue par mouvement → autres données ; 3 des 4 portes visent déjà l'historique) ; il
remplacerait la décision de Michel du 30/08 (cartes dans « Exercices ») — à confirmer et à inscrire au registre.

**➡️ État au 14/10 (après-midi) — LOT STRUCTUREL 01 CODÉ, NON PUBLIÉ** (mission de Michel « PROGRÈS → SÉANCES / UX-HIST » :
l'orientation est devenue décision — Séances en premier, volume 14 | 28, 28 par défaut, Milo inchangé). Détail :
`docs/PROGRES-SEANCES-01.md`. Fait : onglet Séances, blocs déplacés, historique Année → Mois **sans plafond de 20**, portes
d'entrée ciblées par la clé `ts‖id`, volume 14 | 28, sous-onglet qui survit, aides / Guide / point rouge, les 4 « Poids »
corrigés. ⛔ **Non fait, faute de décision** : séparation lecture / modification du détail ; mois en cours replié ou ouvert
à l'arrivée par la barre du bas (appliqué à la lettre du contrat : replié) ; destination de **Badges** (reste un onglet) ;
bandeau de cycle (statu quo dans Exercices). Les témoins CLXXII / CLXXIII et 6 autres blocs du runner sont réécrits **dans
un outil** (`tools/integrer_progres_seances.py`) à exécuter après le LOT 0 Nutrition — `runner.js` non touché.

**➡️ État au 14/10 (soir) — INTÉGRÉ AVEC LE LOT 0, QUALIFIÉ, READY_FOR_COUNTERCHECK** (PROGRES-SEANCES-INTEGRATION-01,
feu vert de Michel). Branche `claude/progres-seances-integration-01` depuis master `a0eab5b3` : LOT 0 (`f5c93e63`) puis ce lot
(`7ac0580e`), conflits en documentation seulement ; outil du runner appliqué (ancres trouvées, idempotent). ⭐ **Point 2 ci-dessus
TRANCHÉ par Michel** : le **mois courant s'ouvre seul** en entrée normale s'il existe (sinon aucun mois, aucun inventé) —
`_sessMoisEstOuvert`, miroir de `_sessAnEstOuvert`, aucune clé. Témoins : PS-E10 réécrit (R30), PS-E41 → PS-E44 ; CCXXXIX re-visé
(comparé depuis un état dérangé). Arbre fonctionnel `bd8ae92e` / `80bc98a2` : B-PS01 **52 / 0**, mutations Progrès **37 / 37**,
LOT 0 **36 / 0** et **35 / 35**, 8 bancs voisins verts, contexte Milo **identique** à master (81 018 caractères, avec 32 séances,
écran 14 ou 28), **D-031 7 035 ✅ / 0 ❌** (4 conditions). ⛔ Toujours non tranchés : lecture / modification du détail,
destination de Badges, Milo 14 j vs écran 28 j. Détail : `docs/PROGRES-SEANCES-01.md` §8.

**➡️ Micro-fermeture (14/10, soir) — réserves du contre-check B fermées, READY_FOR_MASTER_INTEGRATION.** Diapo du Guide
« Tes progrès » refaite (4 onglets, Séances d'abord) ; témoins durcis (PS-S8, PS-E41 positif, PS-E43 deux lignes, PS-E45 → PS-E48,
PS-E27 / PS-E29 isolés) ; outil de mutation durci (plantage ≠ attrapée, témoin attendu, MUT_J=1, arbre sain rejoué) ; D-076 / D-077 au
registre. Arbre fonctionnel `efa251b9` / `f3813e86` : B-PS01 **57 / 0**, mutations **44 / 44**, LOT 0 **36 / 0**, **D-031 7 040 ✅ / 0 ❌**.
⛔ Restent consignés, non traités (consigne de Michel) : 14 / 28 / défaut 28 écrits en dur dans `setup.js`, commentaire de
`_ctxVolumeMuscles`, `dump_prompt.js` à chemin absolu.

**➡️ Intégré à master (14/10, nuit) — NON PUBLIÉ.** Avance rapide `a0eab5b3` → `b9e91127` (autorisation écrite de Michel), tête `[skip ci]` :
aucun run Pages, Worker ni Apps Script ; `sw.js` toujours `ft-v1254`. Arbre de master = arbre de la branche ; 0 fichier fonctionnel différent de
l'arbre qualifié `f3813e86` (documentation et handoff seulement). Bancs rejoués sur master : Progrès 57/0 · LOT 0 36/0 · session_integrity 93/0 · debrief_demande 58/0 · debrief_provenance 24/0 · historique_cloud 87/0 · accueil_mini 54/0 · mutations critiques M31/M37/M40 3/3 · git diff --check propre · check_regles vert. Prochaine étape : recette terrain
iPhone, puis décision de publication de Michel.

**➡️ Préparation `ft-v1255` (15/10) — pop-up v77 posée, échec D-031 diagnostiqué, micro-lot TEST-ONLY, D-031 VALIDE, NON PUBLIÉ.** La pop-up « Progrès : Séances d'abord » (v77, `constants.js`) n'était pas dans l'arbre qualifié `f3813e86` : posée avec PS-S9 / PS-E49 et les mutations M44 → M46 (3 / 3). 1ʳᵉ D-031 sur `c6a19763` : **7 040 ✅ · 2 ❌** (OD-07, OD-07b). ⭐ **Cause prouvée : un DÉFAUT DE TEST préexistant, pas un défaut produit** — le banc « avis de Milo à la demande » cherchait l'**id** de la séance dans l'`onclick` de la carte, alors que la carte porte `openSessDetail(ts || id)` ; `finishWorkout` écrit deux `Date.now()` (id et ts diffèrent d'1 ms de temps en temps, plus souvent sous charge). Preuve : 25 rejouages (candidat 1 rouge / 10, master 0 / 10, production `aa808110` 0 / 5, toujours avec id ≠ ts) ; horloge forcée id ≠ ts → **7 rouges identiques sur candidat, master ET production d'avant Progrès** ; id = ts → 0 rouge ; dans tous les cas la carte existe, la relance part, le débrief est rangé et retrouvé. ⛔ **Aucune correction produit** (décision de Michel). Micro-lot OD-CLÉ-CARTE : aides du banc par la clé du produit, OD-07b / OD-12 / OD-14 par la clé, OD-11 déterministe (ts = id + 1 exprès), témoin explicite **OD-18** (id ≠ ts : carte retrouvée, relance, débrief retrouvé après rechargement), deux protections anti-plantage du banc (`js`, C1-04). Mutations `tools/mut_od_cle_carte.py` **12 / 12** ; banc **62 / 0** ×5 + 62 / 0 avec id ≠ ts forcé partout. **D-031 VALIDE `41fa44e8` (arbre `cd25bd25`) : 7 046 ✅ · 0 ❌**, 4 conditions vertes. Bancs Progrès, débrief-provenance, session_integrity : non rejoués séparément (fichiers et produit inchangés, rejoués intégralement par cette D-031 — accord de Michel). Code produit identique à `c6a19763`.

**➡️ PHASE 1 + 2 (15/10, feu vert de Michel) — candidat intégré sur master sans publier, puis BADGES → MENU (D-078), D-031 VALIDE, READY_FOR_PUBLICATION, NON PUBLIÉ.** ① Master `98aa71b8` → `058a1de6` en avance rapide (tête `[skip ci]`, 0 workflow) ; master ne diffère de l'arbre qualifié `41fa44e8` que par 4 docs. ② Décision de Michel : Badges quitte Progrès (D-078). Progrès = Séances · Exercices · Corps & santé ; ligne « Badges » au bout du rayon « Ton suivi » du Menu, ouverte dans la surface commune des contenus du Menu (`openDrawerContent` / `ov-drawer-cnt` : ✕, tap à côté, glissé, bouton retour) ; `openBadges()` (setup.js, 3 lignes) appelle `renderBadges()` **inchangé** (`renderBadges`, `_badgeProgress`, `checkBadges`, `BADGES` : empreintes identiques à master) ; le point rouge `prog-badges` vise `#menu-row-badges` (mécanisme d'ancre existant) ; aides « ? » Progrès / Menu / **Accueil** (la carte des badges récents renvoyait encore à « l'onglet Badges dans Progrès »), aide détaillée, diapo du Guide (capture refaite à 3 onglets), pop-up v77 point ④. Prompt de Milo régénéré : seuls l'heure et les empreintes diffèrent. Banc Progrès **65 / 0** (9 rouges sur master) : PS-S10, PS-E01 réécrit (« Badges joignable depuis le Menu, grille fonctionnelle »), PS-E01b, PS-E25 réécrit (badge débloqué daté + badge en cours « 32/100 »), PS-E50 → PS-E53 (point rouge, aides, trois fermetures + retour au Menu, rien d'écrit, « + » immobile). Runner CLXXII ③ adapté (R30). Mutations **19 / 19** (M22 et M56 : 1ʳᵉ version sans effet mesuré, réécrites — `BUGS.md` §74). **D-031 VALIDE `3ab50f10` : 7 052 ✅ · 0 ❌**, 4 conditions. Règle #17 : 0 donnée persistée · 6 fichiers applicatifs + 1 image · +41 / −23 lignes · 1 ancien chemin supprimé (l'onglet Badges de Progrès : bouton, panneau, entrée `PROG_ONGLETS`, branche `switchProgTab('badges')`). ⚠️ Réserve : le point rouge garde l'id `prog-badges` (redirigé, comme demandé) — quelqu'un qui l'avait déjà vu sur l'ancien onglet ne le reverra pas sur le Menu ; la pop-up v77 ④ le prévient.

**➡️ PETIT LOT UX « PROGRÈS → SÉANCES » (15/10, soir — décisions de Michel D-079 / D-080) — QUALIFIÉ, PRÊT À PUBLIER, NON PUBLIÉ.** Branche `claude/claude-md-docs-ytabnv`, arbre fonctionnel `8a7c5a9f` (tree `c435f3eb`), production `ft-v1255` intacte (master `f8517901`). ① **Filtre compact (D-079)** : les pastilles de muscles passent dans un panneau repliable « Filtrer les séances · Tous ▾ » (`#sess-filter-acc`, le même `<details class="acc">` que les autres panneaux, aucune fenêtre) ; fermé, il tient sur **une ligne** à 390 et à 320 px (38 px, résumé coupé par « … » au lieu de passer à la ligne) ; la liste reste **juste en dessous**, jamais dans le panneau. **Plusieurs zones en logique OU** : `_sessFiltres` (tableau, en mémoire) remplace `_sessFilter` ; une séance qui touche deux zones cochées n'apparaît **qu'une fois** ; « Tous » vide la sélection, décocher la dernière revient à « Tous » ; Accueil, tuile « Séances ce mois » et calendrier remettent « Tous » (`goSessionsHistory`, porte existante) ; résumé « Pectoraux + Triceps », au-delà de deux « X + n autres ». Même moteur qu'avant (`_sessMusclesPresent`, un `some` au lieu d'un `includes`) — **aucun second moteur**. ② **Volume (D-080, option B)** : « Ce que tu travailles, par semaine » est **replié à chaque lancement** ; ouvert, il le reste pendant la session (`_progAccSession`, mémoire seulement) ; il sort de `ft4_progAcc`, qui ne garde plus que « Ce que ton histoire montre » (comportement inchangé) ; une ancienne valeur qui le contenait est ignorée. ③ **Information (#11)** : aide « ? » de Progrès, aide détaillée, légende de la diapo du Guide (capture refaite), point rouge `sess-filtre-multi` ; **pas de pop-up** (v77 reste la dernière). ⛔ **Hors lot, gardé tel quel** : l'asymétrie « pastilles = muscles DOMINANTS, filtre = muscles PRÉSENTS » (une séance peut apparaître sous un muscle qui n'a pas de pastille à elle) — non traitée, sur consigne de Michel. **Tests** : banc Progrès **80 / 0** (14 rouges sur l'arbre de production) — nouveaux témoins PS-S11, PS-E54 → PS-E68 (sans E67 ; une ligne à 390 / 320 px, multi OU contre un oracle indépendant, doublon impossible, Tous / dernière décochée, Accueil / tuile / calendrier, mémoire de session, volume replié après rechargement, ancienne `ft4_progAcc`, aucune clé nouvelle, aides) ; ⚠️ une leçon de méthode : dans un `<details>` FERMÉ, Chromium garde aux pastilles un `offsetParent` et une hauteur — seul `checkVisibility()` dit qu'elles sont cachées (`BUGS.md` §75). Mutations `tools/mut_progres_seances.py` **31 / 31** conformes (M60 → M76 nouvelles : mono-sélection, ET, doublons, dernière décochée, Tous, panneau ouvert, liste dans le panneau, résumé sur deux lignes, volume mémorisé, volume oublié en session, synthèse sans mémoire, filtre persisté, porte calendrier seule, point rouge retiré, ancienne aide, pop-up v78, `includes` équivalent) ; arbre sain 0 rouge avant et après. Bancs voisins : `debrief_demande` 62 / 0, `session_integrity` 93 / 0. **D-031 `7 067 ✅ / 0 ❌ (22:00 → 23:24 UTC)` sur `8a7c5a9f`** (4 conditions vertes). `git diff --check` propre, `check_regles` vert. **Règle #17** : 0 donnée persistée, 0 clé, 0 fonction nouvelle (`setSessFilter` réécrite), +59 / −18 lignes applicatives (7 fichiers + capture), ancien chemin retiré : la mémorisation persistante du volume ; la mono-sélection est remplacée, pas doublée. **Réserves** : le texte de l'ancien point rouge `sess-filter` (« pastilles sous… ») reste tel qu'il a été annoncé ; le glissé du volume n'est pas conduit par un test ; recette iPhone à faire par Michel.

### 📅 SÉANCE S-01 « DATE JUSTE » (16/10/2026, session-B — brief de Michel, P1) — QUALIFIÉ, ↪️ INTÉGRÉ À MASTER LE 16/10 (`99aaaf44`, avance rapide, `[skip ci]`), NON PUBLIÉ

**Le défaut (audit Séance ft-v1255 / ft-v1256), reproduit sur master `3f61e7e2` avant toute correction** : banc B-S01 **18 ✅ / 7 ❌** — séance vide créée le 01/10 (« + » sans rien noter), reprise le 15/10 par le balayage, 1er exercice, série, « Terminer » → **séance enregistrée au 01/10**. Par le « + » central : 15/10 (juste). **Cause** : l'objet de séance vide (`renderLog`, ou `startWorkout` sans rien noter) garde la date de sa naissance et dort dans `ft4_wkt` ; seul `startWorkout` le renouvelle quand la séance n'est pas ouverte, `addExercise` et `lancerTypeSeance` le remplissent tel quel (`BUGS.md` §76).
**Correction (log.js, +21 / −2)** : `_dateSeanceReelle()`, appelée au moment où la séance devient réelle (1er exercice, carte « type de séance ») — si elle n'est **pas encore commencée** (`_seanceOuverte()` faux : ni exercice, ni chrono démarré, ni cardio noté — **la seule définition**, réutilisée telle quelle), elle prend la date du jour, et la barre de date l'affiche (`_setLogDate(d, true)`). **Séance vide vs réellement commencée** : vide = `_seanceOuverte()` faux ; commencée = un exercice posé, OU le chrono parti (1ʳᵉ série validée), OU un cardio noté → **elle garde sa date** (reprise J1 → J2 : J1). `_etatTravailWkt` (RIEN / PRÉPARATION / TRAVAIL) répond à une autre question (« y a-t-il du travail à perdre ? ») et n'est pas utilisé : les deux définitions **s'accordent** sur l'objet vide du défaut ; un exercice posé sans série validée reste « ouvert » et garde sa date (définition inchangée, B-S01-N3). **Date choisie par la personne** sur la séance vide (sélecteur, pour noter une séance passée) : gardée (`_wktDateChoisie`, en mémoire seulement). ⛔ `renderLog`, `runId`, l'identité de séance, `ft4_wkt` / `ft4_wkt_draft` (format), Milo, Nutrition, Progrès : **0 ligne**. 0 clé, 0 migration, aucune séance enregistrée modifiée.
**Tests** : banc `tools/banc_seance_date.js` **25 ✅ / 0 ❌** (7 rouges sur master) — A1 → A5 (cas réel, enregistrement, barre de date, runId, aucune clé nouvelle), P1 → P4 (« + », balayage avec l'app restée ouverte, carte « type de séance », rechargement avant et après le 1er exercice), N1 → N7 (CAS B par le balayage et par le « + », exercice posé sans série, chrono parti puis exercices retirés, date choisie gardée jusqu'à l'enregistrement, jour même, annulation), S1 → S3 (`renderLog` intact pour nut_punch01 O9, une seule définition, `_seanceOuverte` intacte). Contrôle négatif `tools/mut_seance_date.py` **11 / 11 conformes** (M00 code d'avant · M1 renouvellement supprimé · M2 renouvellement trop agressif, une vraie séance change de date · M3 / M4 une seule porte équipée · M5 / M8 date choisie ignorée ou non marquée · M6 barre de date non mise à jour · M7 2ᵉ définition `_etatTravailWkt` · M9 renouvellement après l'ajout · M10 équivalente) ; chaque mutation fait rougir SON témoin attendu, arbre sain 0 rouge avant et après. Bancs voisins : `session_integrity` 93 / 0 · `nut_punch01` 36 / 0 (observation **O9 conforme**, aucune « levée ») · `lot3` (historique_cloud : runId, restauration, brouillon) 87 / 0 · `seance_c3` 35 / 0 · `ml_b` 60 / 0 · annexe 14 PASS + 1 défaut connu `discussions` **identique à master** (mêmes tailles de prompt Milo : 71 630 / 76 549 / 68 781) · sélecteur de recette auto-test 15 / 0 · `git diff --check` propre · `check_regles` vert (avertissement connu : `PROMPT-MILO-REEL.txt` périmé, `coach.js` non touché). **D-031 **7 092 ✅ / 0 ❌** sur l'arbre fonctionnel `04dccc3a` (tree `c760f220`), 4 conditions vertes (07:02 → 08:23 UTC) ; après elle, documentation seulement**.
**Règle #17** : 1 fichier applicatif (`log.js`) · +21 / −2 · 1 fonction ajoutée (`_dateSeanceReelle`) + 1 variable en mémoire (`_wktDateChoisie`) · `_setLogDate` prend un 2ᵉ paramètre · **0 clé · 0 donnée persistée · 0 migration · aucune 2ᵉ source de vérité** (la définition reste `_seanceOuverte`) · ancien chemin : aucun supprimé (le « + » garde son propre renouvellement, inchangé).
**Limites mesurées, consignées (non corrigées)** : ① **la porte cardio** — un cardio noté EN PREMIER sur une vieille séance vide la rend « ouverte » avec sa vieille date, et les exercices suivants la gardent (mesuré : 01/10 sur master ET sur la branche ; `setCardioField`, hors S-01 — le brief exclut le cardio ; **décision de Michel**) ; ② **date choisie puis rechargement** avant le 1er exercice : la date reprend celle du jour (master gardait la date choisie) — c'est le prix du « 0 donnée persistée » ; le « + » central, lui, jetait déjà une date choisie sur une séance vide ; ③ avant le 1er exercice, l'écran d'une séance vide peut encore AFFICHER l'ancienne date (`renderLog`, non touché) — corrigée au 1er exercice.

### 🛡️ CC-01 — UNE SÉRIE VALIDÉE EST DU PASSÉ (16/10/2026, session-B — P0 intégrité) — QUALIFIÉ CIBLÉ, ↪️ INTÉGRÉ À MASTER LE 16/10 (`87464e67`, avance rapide, `[skip ci]`), NON PUBLIÉ

**Défaut, mesuré sur master `1717edc4` (banc B-CC01 : 5 ✅ / 14 ❌)** : `applyDropset` affectait une liste entière (`ex.sets=newSets`) → « 📉 Drop », « 📈 +% » et « ⚙️ Modifier paliers » effaçaient les séries validées (100 × 8 RIR 2 + note, 92,5 × 7 → 3 paliers vides, y compris dans la séance enregistrée) ; **perte supplémentaire découverte en cours de lot** : `removeDropset` (« ✕ Retirer dropset ») remplaçait les paliers faits par une série vide — STOP avant code, puis décisions de Michel (**D-082**). **Correction (`log.js`, +38 / −11)** : tout ce qui précède la dernière série validée (`set.done`, la définition existante) reste intact — mêmes objets, même place ; seule la suite est remplacée (`applyDropset`) ou retirée (`removeDropset`). Base du futur : prochaine série prévue, sinon dernière faite ; « Modifier paliers » = paliers restants depuis la dernière charge faite. Affichage : les paliers sont les `ex.dropset.paliers` dernières séries (`_dropDebut`), une série normale faite avant reste normale ; ancien format (paliers = toutes les séries ou nombre incohérent) : affichage d'avant. **Tests** : banc `tools/banc_cc01_dropset.js` **19 ✅ / 0 ❌** (vraies portes de l'écran : A aucune série faite = comportement d'avant · B/C données riches intactes · D rechargement, `ft4_wkt`, brouillon, séance enregistrée · E +% · F tout fait · G Modifier avec / sans palier fait · H Retirer avec / sans palier fait · I série sautée) ; mutations `tools/mut_cc01_dropset.py` **14 / 14** (protection supprimée, partielle ×2, +% seul destructeur, 1ʳᵉ série seule protégée, Retirer destructeur, bases fausses ×3, nombre de paliers, affichage, série créée, 1 équivalente) ; voisins : ML-A (dropset ↔ programme) 34/0 · ML-B (groupes) 60/0 · intégrité des séances 93/0 · SEANCE-01 25/0 · travail_lot2 48/0 · annexe calculs PASS ; « + » central **immobile** à 390 et 320 px (règle d'or #9, mesuré) ; `git diff --check` propre ; `check_regles` vert (avertissement connu PROMPT-MILO-REEL). **Pas de D-031** (décision de pilotage : une seule passe sur l'arbre final de la passe Séance). **Règle #17** : 1 fichier applicatif · +38 / −11 · 1 fonction ajoutée (`_dropDebut`) · `applyDropset`, `removeDropset`, `_renderExHtml` modifiées · 0 clé · 0 donnée persistée · 0 migration · aucun moteur alternatif (même moteur, mêmes lignes de série). **Hors lot, consigné** : groupes / supersets (SEANCE-02) ; un dropset « modifié » change le % affiché des paliers déjà faits (libellé seulement, la charge enregistrée ne bouge pas) ; la modale garde le libellé « Nombre de paliers » (il compte les paliers restants).

**🔎 Contre-vérification indépendante (16/10, session-A, après intégration — master `42153711`) : A. CONTRE-VALIDÉ, avec une réserve sur le filet de tests.** Sonde hors dépôt qui pilote les vrais boutons (trouvés par leur texte), sur master et sur l'ancien code `1717edc4` : 17 scénarios + 4 chaînes (0 / 1 / plusieurs / toutes faites, ↓ et ↑, série sautée, ancien format, rechargement), 12 enchaînements aléatoires × 24 actions (288 : 22 Drop, 24 +%, 33 Modifier, 38 Retirer, 69 rechargements, 102 validations), 7 scénarios voisins (remplacement, cartes repliées, modale). **Master : 0 perte** — 50 / 50 contrôles d'égalité stricte (objet JSON complet, types É / N / X, RIR, note, repos, horodatage, 1RM, `maxi`, champ inconnu, ordre ; mémoire, `ft4_wkt`, brouillon, après rechargement) ; ancien code : pertes dans les 13 scénarios à séries faites et dans les 12 enchaînements. Leur banc **19 / 0** et leurs mutations **14 / 14** confirmés (M00 rejouée à la main : 5 ✅ / 14 ❌). Voisins : SEANCE-01 25/0 · intégrité des séances 93/0 · ML-A 34/0 · ML-B 60/0 · unicité 12/0 · C1 29/0 · C2 22/0 · C3 35/0 · Progrès → Séances 80/0. **⚠️ Réserve (sévérité moyenne : aucune perte aujourd'hui, mais une rechute passerait au vert)** : sur 14 mutations indépendantes, le banc B-CC01 en attrape 5 et en laisse passer 9, dont **8 vraies pertes** — ses séries faites sont toutes de type N (un échauffement validé effacé par Drop ; É / X réécrits en N : verts), sans champ `maxi` (passé reconstruit, `maxi` perdu : vert), « Modifier » et « Retirer » seulement en ↓ (pyramide effacée : vert), « tout fait » seulement pour Drop (dernière série perdue par « Modifier » ou « Retirer » : vert) ; la 9ᵉ est d'affichage (cas mixte : la série normale faite redevient un palier). 👉 Recommandation, **décision de Michel** : compléter les témoins avant la publication de la passe Séance (séries faites É et X, `maxi`, ↑ pour « Modifier » / « Retirer », « tout fait » pour « Modifier » / « Retirer », cas mixte, rechargement après « Modifier » / « Retirer ») — tests seulement, aucun code applicatif ; chacune des 14 mutations doit rougir. **7 réserves UX (aucune donnée perdue)** : la 1ʳᵉ était déjà consignée ci-dessus (modale « Modifier » : « Nombre de paliers » sans « restants », % remis par défaut → le % affiché des paliers faits change ; mesuré : −30 % → « −20 % ») ; nouvelles : ① après « Remplacer l'exercice », la série normale faite de l'exercice d'origine s'affiche « Charge de départ » (④ ne tient pas sur ce chemin) ; ② ancien format de dropset : après « Modifier », les séries normales faites comptent comme paliers ; ③ tout fait + Drop / +% : le 1ᵉʳ palier ajouté refait la dernière charge (97,5 → 97,5 → 77,5 — détail que D-082 ② ne tranche pas) ; ④ une série sautée validée dans un dropset ↓ ne lance pas de repos ; ⑤ « Retirer » avec 0 série faite recrée une série (comportement d'avant ; à la lettre, D-082 ① dit « ne crée rien ») ; ⑥ cas limite non testé : si la prochaine série prévue est un échauffement, le dropset part de sa charge. Méthode : `BUGS.md` §78. Rapport PDF hors dépôt (`CV-CC01-dropset-2026-10-16.pdf`).

**↪️ Filet complété (16/10, UX SÉANCE, branche `claude/ux-seance-01`, non intégré)** : 12 témoins `B-CC01-FIL-1 → 12` (échauffement et échec validés, `maxi`, « Modifier » / « Retirer » en montée, tout fait + « Modifier » / « Retirer », cas mixte, rechargement après « Modifier » / « Retirer ») — tests seulement, moteur CC-01 inchangé. ⚠️ Les mutations O1 → O14 de la contre-vérification ne sont ni dans le dépôt ni sur le Drive (cherché le 16/10) : `tools/mut_cc01_dropset.py` porte **MF1 → MF11, RECONSTRUITES, équivalentes aux pertes décrites ci-dessus, pas les originales** — **11 / 11 attrapées**, arbre sain stable avant / après ; pour MF1 → MF9, le premier témoin rouge est un nouveau `FIL` ; pour MF10 / MF11 (rechargement), c'est un ancien (D1 / H1) — l'outil ne nomme que le premier rouge, on n'affirme donc rien sur les autres. Banc **31 / 0**.

### 🏋️ UX SÉANCE — L'ÉCRAN SÉANCE EN DEUX ÉTATS (16-17/10/2026, session-B — cadrage validé par Michel, chantier de nuit) — QUALIFIÉ SUR BRANCHE, NON INTÉGRÉ, NON PUBLIÉ

**Ce qui change (présentation seulement, D-083)** : avant la séance, « Séance libre » puis « Programme » (contexte récup / dernière séance, types en carrousel, cardio et import plus bas) ; pendant, la barre haute devient l'en-tête « Séance en cours » (chrono, séries de TRAVAIL faites / prévues, ⋯, « Terminer ») ; menu ⋯ (pause, date, tout dérouler, grouper, programmes, aide | vider, abandonner) ; « Terminer » = porte unique `terminerSeance` (en-tête, bas, « 🔄 Réessayer ») : 0 série de travail restante → enregistre, sinon « Il reste N séries à faire · Terminer quand même ? » ; le « + » ramène à la même séance, pastille verte, immobile (règle d'or #9) ; repos en dock fixe en bas, préréglages dans « Régler » ; cartes repliées allégées (« Monter / Descendre » dans le ⋯ de l'exercice) ; aide « ? », aide détaillée, point rouge `seance-ux`, pop-up v78, diapo du Guide.

**Ce qui ne change pas** : 0 donnée persistée, 0 clé, 0 migration ; `S.wkt`, `S.sessions`, `set.done`, `_seanceOuverte`, `finishWorkout`, records, moteur de repos, groupes, dropset inchangés — différentiel master ↔ branche `tools/diff_seance_ux.js` **7 / 7 scénarios de données identiques** (horloge, hasard et `runId` figés ; il voit une perte volontaire : 6 / 7) ; prompt réel de Milo identique (seule la ligne d'empreinte des sources diffère).

**Tests** : banc B-UXS **69 / 0** (code de master : 23 / 46) ; contrôle négatif `tools/mut_seance_ux.py` **15 / 15** (M4 corrigée — la 1ʳᵉ version cassait la syntaxe — puis rejouée seule ; M18 équivalente : 0 rouge) ; filet CC-01 ci-dessus ; voisins verts ; annexes calculs et hors-ligne PASS ; `nut_punch01` 36 / 0, `nutri_moteur` 28 / 0 ; **D-031 7 192 ✅ / 0 ❌ sur `858423f3` (tree `4e369644`), 4 conditions vertes**. Témoins re-visés (R30, écrits) : CXXXVIII (mesuré à 390 × 844), PS-S11 (« aucune pop-up n'annonce le filtre » au lieu de « la dernière reste v77 ») — `BUGS.md` §79 ; conduites des bancs voisins (`c38146e1`). **Règle #17 — chaque témoin re-visé vu rougir** (17/10, sur copies jetables, hors dépôt, après la passe) : CXXXI (carrousel remis en colonne), CXIX (message d'écran vide revenu · « Séance libre » sans son propriétaire · « + Créer ma séance » revenu) et CXXXVIII à 390 × 844 (barre à 0,6) → **5 / 5 rouges, chacun sur le témoin visé**, arbre sain 17 / 0 ; conduites re-visées : MC_FIN (porte de fin neutralisée) → rouges dans 5 bancs sur 6 (fil_coach_lot1 20, debrief_demande 7, seance_date 3, cc01_dropset 1, historique_cloud 1) et plantage de session_integrity (la passe n'aurait plus de ligne de total) ; MC_PROG (ligne « Programmes » neutralisée) → travail_existant 13 rouges, dropset_programme et groupes_orphelins plantent (même effet sur la passe) ; MC_PAUSE (ligne « Mettre en pause » neutralisée) → historique_cloud ecran3b 2 rouges, mais **ecran3c 0 rouge** : son témoin T3 vérifie que l'identifiant de séance ne change pas, ce qui reste vrai SANS pause — **préexistant, mesuré identique sur master** (18 / 0 ; la même mutation y fait rougir ecran3b 9 / 2, elle casse donc bien la pause), non corrigé (hors brief). Observation : deux témoins « aucune erreur de page, aucun appel Milo » (ml_a T4g le 16/10, groupes_orphelins C1d le 17/10) ont rougi une fois sous 4 bancs en parallèle ; seuls ils sont verts (C1d 23 / 0 deux fois) et la passe séquentielle D-031 est verte — sensibles à la charge, détail non capturé. Mutations exactes : `HANDOFF-UX-SEANCE-01.json`.

**Règle #17** : 0 donnée persistée · 10 fichiers applicatifs · +626 / −151 · retirés ou fusionnés : `_syncLogHdrBtns`, `_pauseBtnHtml`, l'ancien en-tête et sa rangée Pause ✕ Vider Changer, « + Créer ma séance », la rangée « Tout dérouler / Grouper », les préréglages du bandeau de repos, les 3 portes de fin → `terminerSeance`, la règle « séries de travail » sortie de `toggleSet` vers `_bilanTravailEx`.

**Réserves (non bloquantes)** : le compteur de la carte (« 3/4 séries », toutes lignes) ≠ l'en-tête (séries de travail) — à trancher par Michel ; volume de carte avec échauffements (préexistant) ; types de séance masqués dès qu'une séance est ouverte, cardio noté compris ; clavier iOS + dock et zone de sécurité réelle : recette iPhone ; mode clair en pause (inatteignable) ; `translations.js` chargé par aucune page (dictionnaire tenu, sans effet) ; commentaire résiduel `log.js:160` ; les 7 réserves UX du dropset (contre-vérification CC-01) ne sont **pas** traitées (hors brief).

**À faire** : recette iPhone de Michel ; contre-vérification indépendante (`HANDOFF-UX-SEANCE-01.json`) ; feu vert de Michel pour l'intégration, puis la publication.

### 🎨 UX — INTÉGRATION DES DÉCISIONS DU 17/10/2026 (D-085, décisions A→M de Michel, brief « Claude Principal ») — QUALIFIÉ SUR BRANCHE `claude/ux-seance-02`, NON INTÉGRÉ, NON PUBLIÉ

**Base** : `claude/ux-seance-01` @ `1ab2b38f` + fusion de master `4960ce72` (clone D-084, documentation seulement). Production `ft-v1256` non touchée.

**Ce qui change (présentation seulement)** : jeton « Cobalt » DÉDIÉ à la séance (`--sea` #7C95FF, `--sea-fill` #2F5BFF ; teinte foncée en mode clair) — en-tête, exercice et série actifs, coche validée, exercice fini, « Ajouter un exercice », repos (anneau, temps, barre, « Passer », pilule), « Reprendre » (en-tête et Accueil) ; « Terminer » Cobalt (en-tête, bas, « Terminer quand même ») et le rouge gardé pour Vider / Abandonner / Supprimer ; point bleu plein et ENTIER sur le « + » (le bouton central ne rogne plus), point nouveauté déplacé à gauche, « + » de 44 px et même ombre partout (agrandissement ×1,06 retiré) ; « Séance prête » (`_seancePrete`, affichage seul) ; type de série en badge sur le numéro (même `cycleType`), 1RM dans sa colonne, cibles de 44 px ; barre du bas masquée pendant la saisie d'une série (`kbd-serie`), ligne active ramenée au-dessus du clavier ; cartes de type en texte seul ; onglets « Discussion / Espace Milo » (onglet en mémoire) ; courbes Progrès neutres (record or, progrès vert) ; aides corrigées (point bleu, numéro de série, 1RM, ligne « deux onglets » au « ? » du Coach).

**Ce qui ne change pas** : 0 donnée persistée, 0 clé, 0 migration, 0 propriétaire ; `_seanceOuverte`, `finishWorkout`, `cycleType`, moteur de repos, Milo (moteur, appels, quota, mémoire) inchangés — différentiel des données base ↔ branche `tools/diff_seance_ux.js` **7 / 7 identiques**.

**Tests** : nouveau banc B-UXI (`tests/parcours/ux_integration.js`, `tools/banc_ux_integration.js`) **69 / 0** (base `1ab2b38f` : 27 / 42) ; contrôle négatif `tools/mut_ux_integration.py` **27 / 27** (M00 = 42 rouges ; M26 équivalente : 0 rouge ; arbre sain rejoué à la fin : 0) ; banc B-UXS 69 / 0 (témoins D7 et E3 re-visés sur leur garantie, R30, décisions M et C) ; CC-01 31 / 0.

**Règle #17** : 0 donnée persistée · 8 fichiers applicatifs (`app.js`, `coach.js`, `index.html`, `log.js`, `screens.js`, `setup.js`, `style.css`, `tracking.js`) · +212 / −65 · retirés ou fusionnés : la table d'icônes des types, l'agrandissement du « + » sur Séance, la colonne « Type » (fusionnée dans le numéro), le 1RM logé dans le bouton du type.

**Non appliqué (à trancher par Michel)** : « 🔄 Réessayer » (stockage plein) reste rouge (panneau d'erreur) ; une baisse reste chiffrée en rouge dans Progrès ; puces Super / Drop / +% inchangées ; « Séance libre » (avant séance) garde le rouge de marque ; Guide (captures) et pop-up « Quoi de neuf » non refaits — règle d'or #11 au moment d'une publication.

**Résiduel mesuré** : le « + » de nouvelle discussion de l'en-tête de Milo est coupé à 360 px — **identique sur la base** (préexistant, hors périmètre).

**Passe complète n°1 (sur `5cc04fd9`) : 7 260 ✅ / 1 ❌ — NON VALIDE.** Le rouge était un vrai défaut de ce lot : `.ts-h` déclaré deux fois dans `style.css` (témoin CXL, ft-v1036 — « la 2ᵉ gagne, la 1ʳᵉ trompe le suivant »). Corrigé dans le code (une seule déclaration), le témoin n'a pas été touché ; bancs B-UXI et B-UXS rejoués 69 / 0.

**Passe complète n°2 (sur `6d9b6c90`, arbre `70ace6e8`) : 7 261 ✅ / 0 ❌ — VALIDE, 4 conditions** (`tools/passe_valide.sh`). Depuis : documentation seulement (D-031). Aucun numéro de version posé (rien n'est publié).

**À faire** : recette iPhone de Michel (vrai clavier, encoche, point du « + ») ; feu vert de Michel avant toute intégration ou publication.

### 🛠️ D-086 — CORRECTIONS UX APRÈS LA RECETTE IPHONE DE D-085 (18/10/2026, brief « Claude Principal ») — BRANCHE LOCALE `claude/ux-d086`, NON POUSSÉE, NON INTÉGRÉE, NON PUBLIÉE

**Base** : `claude/ux-seance-02` @ `08090b33` = code D-085 `6d9b6c90` + clôture documentaire (4 fichiers, aucun applicatif). Dossier de travail séparé ;
master `dbb50941`, production `ft-v1256` et clone en ligne (`6d9b6c90`) non touchés. ⛔ Aucun push (brief de Michel).

**Les sept corrections (décision D-086)** : ① colonne **Type**, pastille N / É / X sur chaque série, cible 44 × 44, même `cycleType` (remplace le « badge sur le
numéro » de D-085 G) · ② « Précédent » 15 px (14 px sous 375 px), contraste ≥ 7:1, marqueurs É / X à 11 px, jamais rogné (pire cas mesuré : « 10×142.5 X ») ·
③ dock [ −15 s ][ ◔ temps ][ +15 s ][ Passer ], « Régler » = 30 s · 45 s · 1:00 · 1:30 · 2:00 · personnalisée, durée reprise à la série de travail suivante par
`S.exRestPref` (existant, clé `ft4_exRp`) · ④ « Passer » Cobalt en plein écran · ⑤ bandeau de reprise : passe à la ligne, ne déborde plus (538 px → 328 px à 360) ·
⑥ point bleu du commentaire de la dernière fois, sur sa série EXACTE seulement (`BUGS.md` §82), lu avec son origine dans la fenêtre de note · ⑦ date et heure
ENREGISTRÉES de chaque message Milo, « Date indisponible » sinon, dessinées hors du texte des bulles.

**Ce qui ne change pas** : 0 donnée persistée, 0 clé, 0 migration, 0 appel réseau ; `cycleType`, `setRestPreset`, `addRT`, `skipRest`, le décompte des 10 s,
`_seanceOuverte`, `finishWorkout`, les valeurs de « Précédent » (repli compris), le prompt, les quotas, la mémoire et l'ENREGISTREMENT des messages de Milo.

**Tests** : banc B-D086 (`tests/parcours/ux_d086.js`, `tools/banc_ux_d086.js`, 15 points × 360 / 375 / 390 / 430 px) **122 / 0** ; le même banc sur le code D-085
`6d9b6c90` : **61 / 61** (les 61 verts sont les invariants), sans plantage ; contrôle négatif `tools/mut_ux_d086.py` **26 / 26** (M00 + 24 ciblées + 1 équivalente,
arbre sain rejoué à 0). Bancs voisins rejoués : B-UXI 69 / 0 (4 témoins de D-085 G réécrits, R30) · B-UXS 69 / 0 · B-CC01 31 / 0 ; contrôle négatif de D-085
`tools/mut_ux_integration.py` rejoué : **27 / 27** (M19 réécrite pour viser la pastille de la colonne Type, R30 ; arbre sain 0 au début et à la fin).

**Règle #17** : 0 donnée persistée · 4 fichiers applicatifs (`log.js`, `style.css`, `index.html`, `coach.js`) · +209 / −68 · fusionnés ou retirés : le numéro-bouton
de type et son badge (`.set-row .tbtn.snum`, `.snum-n`, `.stype-b`, règle daltonienne associée) ; la note de la dernière fois écrite dans la ligne ; le groupe
`#rest-btns` ; la liste `[60,90,120]` recopiée 5 fois (→ `_REPOS_PRESETS`) ; `getPrev` / `_prevAligne` deviennent les reflets de `_prevSeance` /
`_prevAligneDetail` (un seul propriétaire).

**À trancher par Michel** : ① où afficher la note d'EXERCICE de la dernière fois (« Note perso ») — elle n'est rattachable à aucune série ; ② poser une heure au
débrief et à « continuer dans le Coach » (ils entrent dans le fil sans `ts` : c'est un changement d'enregistrement, donc STOP, proposition à part) ; ③ abdos :
repos fixe de 30 s sans mémoire (règle existante) ; ④ choisir 30 s quand plus de 30 s sont déjà écoulées arrête le repos SANS mémoriser la durée (comportement
existant de `setRestPreset`, non modifié).

**Textes d'aide devenus faux ou incomplets (chantier AIDES-01, non touchés ici)** : `index.html` « Tags de série » — « Touche le numéro de la série… » (FAUX : c'est la
pastille de la colonne Type) et « Normal (défaut, non affiché) » (FAUX : « N » est affiché) ; « 1:00 · 1:30 · 2:00 dans Régler » (incomplet : + 30 s / 45 s) dans
`screens.js` (aide « ? » Séance), `coach.js` (aide détaillée), `constants.js` (point rouge `seance-ux` et pop-up v78) ; rien ne décrit encore le point bleu du
commentaire ni l'heure des messages (règle d'or #11, points 2 à 5, à faire avant la production).

**Résiduels mesurés (préexistants, hors périmètre)** : la liste des discussions rangées de Milo affiche `new Date(c.ts || Date.now())` — une discussion sans date
y prendrait l'heure de consultation ; la définition de X dans « Tags de série » (« menée jusqu'à l'échec musculaire ») diffère de celle de Michel (« répétition
tentée et non réussie »).

**À faire** : passe complète D-031 sur l'arbre fonctionnel final ; recette iPhone de Michel ; feu vert de Michel avant toute régénération du clone, intégration ou
publication.
