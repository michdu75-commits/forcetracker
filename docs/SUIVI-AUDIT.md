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

**Les 3 bloquants de production sont corrigés** (ft-v981 · ft-v982 · ft-v983). Ce qui reste
n'est plus du **danger**, c'est de la **vérification** et du **produit**.

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
| **Le débrief de séance se perdait** | `ft-v979` | **5 séances sur 36 sans aucun débrief.** File d'attente + jeton « en cours » + rattrapage au démarrage. |
| **Le contrôle d'intensité n'existait pas** | `ft-v980` | `bz()` inversée + coefficient de tenue → le code refait, **à la proposition**, le calcul que Milo ne faisait que si on le questionnait. |
| **La quantité disparaissait à la 2ᵉ saisie** | `ft-v984` | Le bloc était caché sans condition quand on reprend un aliment de son propre journal, `per100` transmis deux lignes plus bas. |
| **La confirmation s'ouvrait DERRIÈRE la modale** | `ft-v985` | `#ov-confirm` était à z-index **500**, comme `#ov-edit-food` — à égalité, c'est l'ordre du DOM qui tranche. **19 overlays** au-dessus ou à égalité, pas un seul. |

---

## ⏳ Ce qui RESTE — par palier

### 🟠 Avant une ouverture large (50-200 → bêta publique)

| Sujet | Pourquoi ça compte | Difficulté |
|---|---|---|
| **Un point de refus unique** avant « Commencer cette séance » | Aujourd'hui `_startSessionFromMilo` ne vérifie que *« la séance existe »*. Les contrôles réels sont partiels : montée en charge, superset interdit sur les mouvements lourds, intensité. **Absents** : exercice refusé (`exSwaps`), zone active, doublon, durée, matériel. | Moyenne — ⚠️ *un validateur trop strict rend Milo inutilisable* : il **signale** par défaut, il ne refuse que sur zone active et exercice refusé |
| **Le vocabulaire Katch de Milo** | *« MASSE MAIGRE MESURÉE … chiffre SOLIDE … sans réserve »* contredit **R32**, et s'applique même à un % de gras **tapé à la main**. | Faible — ⚠️ **corriger le témoin `tests/parcours/runner.js:3273` D'ABORD**, il protège la mauvaise phrase |
| **La mémoire à deux vitesses** | `MEMOIRE_LARGE_EMAILS` = **2 comptes**. Un utilisateur normal n'a pas les séances 6→35 sur 60 jours. **Michel juge Milo sur une mémoire que personne d'autre n'a.** | Faible — c'est une **décision**, pas du code |
| **Rejouer le benchmark** | Il existe, il tourne, **il n'a pas encore vu les correctifs de ft-v979→984**. | Faible |
| **`exSwaps` réellement opposable** | « Ne me remets plus cet exercice » tient tant que le modèle suit sa consigne. Rien ne l'impose. | Faible, une fois le point de refus posé |
| **⛔ Le plafond du bloc commun est DÉPASSÉ chez un profil blessé** | Mesuré 23/08 : **47 119 pour un plafond de 46 500**. Le témoin teste des profils **sans blessure**, donc il reste vert. Annoncé au §3 de `AUDIT-CONTEXTE-MILO.md`, **jamais chiffré comme dépassement effectif**. | Faible — étendre le témoin aux profils blessés |

### 🔵 Peut attendre après la mise en production

- **La provenance effacée en rouvrant un bilan** — `tracking.js:1459` remet `_bsSource='manuel'` même pour un bilan existant. *Défaut créé par le correctif de ft-v978.*
- **Les textes périmés** — récupération 36 h / 48 h · cardio « ajouté au TDEE » · « Jour null » en contraception · la phase 2 du parcours débutant promise et absente.
- **`projectRM` centré sur le squat** — sans squat enregistré, la projection est **la plus optimiste**. Et l'indice 4 de la table est **inatteignable** (la branche rend 0-3).
- **Biais « femme = fessiers »** — `_beginnerProg` lit `gender` alors que `S.priorities` existe et n'est jamais passé.
- **Sommeil et pas** — reçus dans `healthDaily`, stockés, synchronisés, **jamais lus**. Seul `rhr` sert.
- **Deux conventions de sexe opposées** — Mifflin `gender==='H'`, plancher `gender==='F'`. *Un profil abîmé serait calculé comme l'une et plafonné comme l'autre.* Demande de décider ce que « inconnu » veut dire.
- **La course `_saveCoachMemory`** — ⚠️ **à prouver ou réfuter par un test AVANT de toucher au code.**
- **⭐⭐ Le bloc « personnel » de Milo est générique à 92 %** — mesuré le 23/08 sur 3 profils opposés (`AUDIT-CONTEXTE-MILO.md` §14) : sur ~21 200 caractères facturés par personne à chaque message, **13 452 sont identiques chez tout le monde**, ~6 000 dépendent du **lieu** (5 variantes, pas N) et **~1 700 seulement sont vraiment personnels**. ⛔ **Ce n'est PAS un appel à supprimer du texte** : le but est de le **reclasser**, à information constante. ⚠️ Gain réel **non mesuré** (il dépend du nombre de personnes qui discutent dans la même fenêtre de cache) et **aucun outil local ne sait vérifier qu'une règle déplacée est toujours suivie** (§13).

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

*Dernière mise à jour : 23/08/2026, nuit — `ft-v985` en ligne. Ajout : le bloc personnel de Milo
mesuré générique à 92 % (`AUDIT-CONTEXTE-MILO.md` §14) et le plafond dépassé chez un profil blessé.*
