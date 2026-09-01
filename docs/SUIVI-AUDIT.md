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
- ✅ **FAIT (ft-v1087)** — ~~`projectRM` centré sur le squat~~. **Mesuré** : un soulevé de terre à **180 kg** était projeté à **+10,8 %**, comme un débutant total. `getLevel` (dormante depuis ft-v385, débranchée pour l'AFFICHAGE et non parce qu'elle était fausse — R30) le juge par exercice, par sexe et par âge. L'indice 4 est enfin atteignable. ~~reste~~ — sans squat enregistré, la projection est **la plus optimiste**. Et l'indice 4 de la table est **inatteignable** (la branche rend 0-3).
- ✅ **FAIT à moitié, EXPRÈS (ft-v1087)** — ~~Biais « femme = fessiers »~~. Une priorité **déclarée** décide désormais quel que soit le sexe (un homme qui coche « Fessiers » reçoit enfin le hip thrust). ⏭️ **Ce que reçoit une femme qui n'a RIEN déclaré n'est pas tranché** : le retirer serait décider à sa place dans l'autre sens — arbitrage produit, dans `IDEES-FUTURES.md`. ~~reste~~ — `_beginnerProg` lit `gender` alors que `S.priorities` existe et n'est jamais passé.
- ~~**Sommeil et pas** — reçus dans `healthDaily`, stockés, synchronisés, **jamais lus**~~ → **RÉGLÉ** (ft-v1069/1070/1071) : mesuré le 01/09, `sleep` est lu par le score de récup (`tracking.js:415`) et `steps` par le TDEE et la courbe (`tracking.js:2419/2467`). ⚠️ **Mais les trois versions restent DORMANTES** tant que le raccourci iOS n'envoie pas ces deux champs — c'est la tâche qui attend Michel (`A-FAIRE-SUR-PC.md`). *Le code est branché, la donnée n'arrive pas.*
- ✅ **FAIT (ft-v1086)** — ~~Deux conventions de sexe opposées~~. **Mesuré** : `"Homme"` donnait **TDEE 1524 (femme) + plancher 1500 (homme)**, et le chemin était réel — la **restauration** écrivait `S.gender = d.gender` sans garde. Normalisation à l'entrée (R33) + un seul propriétaire (`sexeAthlete`).
- ⛔ **RÉFUTÉE (ft-v1087)** — ~~La course `_saveCoachMemory`~~. Mesuré : **3 appels concurrents sont sérialisés** (la file de ft-v993 tient), un **échec réseau ne détruit pas** la mémoire, et le jeton a **déjà** deux propriétaires (`_dbfFaits` séparé du Registre) — *« débrief livré » et « mémoire produite » sont deux faits différents, et c'est une décision écrite dans le code*. **Aucune ligne modifiée** ; 3 témoins figent la décision (R30).
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
