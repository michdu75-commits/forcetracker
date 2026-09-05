# 📍 Contexte actuel — Force Tracker

> **Le PREMIER document à lire avant toute nouvelle tâche.** Une page maximum.
> Il donne l'état du projet en un coup d'œil, sans relire tout le reste.
> ⚠️ À tenir à jour EN TEMPS RÉEL (règle d'or #12).

---

- **Version en ligne (live) :** `ft-v1131` — 📐 **LE RATIO POIDS ↔ CENTIMÈTRES : UNE CARTE, PAS UNE COURBE.**
  Michel demande d'abord *« comment intégrer les mensurations sur le graphique du poids et de la
  masse grasse sans que ce soit chargé visuellement ? »* (puis *« surtout la taille et les
  hanches »*), et **trouve lui-même la sortie** : *« ou alors fais un ratio entre la perte de
  poids, la masse grasse et la perte de centimètre »*.
  ⭐⭐ **Son idée règle le problème par construction** : le graphique porte **déjà** des kg (axe
  gauche) et des % (axe droit) — des cm y seraient une **3ᵉ unité**, et c'était ça la surcharge.
  *Un ratio n'a pas d'unité, donc il ne demande aucun axe.* On compare des variations
  **RELATIVES** (−2,6 % de poids · −8,3 % de masse grasse · −5,4 % de tour de taille) : trois
  barres sur **UNE** échelle.
  ⛔⛔ **R8, 7ᵉ fois** : la carte « recomposition » PROMET cette lecture depuis des mois
  (*« ce sont tes charges et **tes mensurations** qui le disent »*) et **rien ne la calculait**.
  ⛔⛔ **Le témoin qui porte la version est un REFUS** : poids en baisse + taille immobile →
  *« on ne peut pas dire ce qui part »*. C'est le seul endroit où il serait facile et **faux**
  d'annoncer du gras (R29). Contrôle négatif : **4 rouges** en remplaçant ce refus par « du gras ».
  ⭐ **État d'attente exprès** : `mensLog` est né la veille, donc avec **une seule** mesure la
  carte s'affiche et **dit à partir de quand** elle parlera — une carte absente 3 semaines se
  lit comme une panne. **Zéro mesure → rien du tout.**
  ⭐ **2ᵉ carte taille/hanches** : elle donne enfin un comportement observable au tour de hanches
  ouvert aux hommes la veille (R3). ⛔ **Aucun seuil de santé** (ce serait un diagnostic).
  ⛔ **R2** : le verdict part aussi à Milo (**226 car., 0,31 %**, partie cachée) — sinon l'écran
  et lui répondraient deux choses différentes à la question la plus posée.
  ⏭️ **Pas d'onglet séparé** (Michel l'avait proposé) : la carte vit dans le bloc existant, zéro
  navigation en plus. **Michel doit vérifier sur Safari/iPhone.**

- **Version précédente :** `ft-v1130` — 🔗 **LE SUPERSET DE MILO N'ATTEIGNAIT JAMAIS LA SÉANCE.**
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#902** sur `0e8550c`, **job `deploy` success**,
  les 7 étapes vertes à 08:43:43 UTC. Suite sur l'arbre **FUSIONNÉ** avec la ft-v1129 de
  session-A : **parcours 2750/2750**, calculs 318/318, dates 9/9, 0 rouge.
  Michel : *« maintenant le seanceJson que l'autre claude m'a laissé »*.
  ⛔⛔ **Le diagnostic relayé ne tenait pas** (vérifié avant de coder) : le cervelet ne part pas
  quand la lecture gratuite échoue, il part quand le **bloc caché manque** — or sa spec a quitté
  le prompt en ft-v919, donc l'étage ① est **structurellement mort**. *Les 5/12 ne sont pas un
  taux d'échec, c'est la part des réponses qui ressemblent à une séance.* Coût mesuré :
  **≈ 0,37 c l'appel, 1,8 % de la facture du jour** — ce n'est pas un sujet de coût.
  ⭐⭐ **Mais un vrai défaut trouvé en chemin, à DEUX couches** : ① `_normalizeMiloSession` —
  seul écrivain en production — **jetait `supersetGroup`** (R4) ; ② et le groupement vivait sur
  **une seule des deux portes**, pas celle du cas normal. **Le correctif du 12/08 n'a donc jamais
  fonctionné**, alors qu'il est **annoncé aux utilisateurs** (`milo-superset`) — et l'annonce nomme
  exactement le bouton cassé. **3ᵉ fois** que `log.js` apprend la leçon des deux portes
  (ft-v980, ft-v995) : le comportement vit désormais dans `_appliqueMiloSession`, *le seul point
  que les deux traversent* (**R2**). Nouvelle famille **§43** de `BUGS.md`.
  ⚠️ **Le témoin du banc était vert** parce qu'il écrivait à la main dans `_pendingMiloSessions`
  une forme que la production ne produit pas, et n'exerçait qu'une porte (§36). Re-visé.
  ⏭️ **Michel doit vérifier sur Safari/iPhone.**

- **Encore avant :** `ft-v1129` — 📏 **LE JOURNAL DES MENSURATIONS.**
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#900** sur `c3e9153`, **job `deploy` success**,
  les 7 étapes vertes à 08:16:55 UTC. ⭐ Suite **sur l'arbre FUSIONNÉ** : parcours **2746/2746**,
  calculs **318/318**, **dates 9/9**, 0 rouge. Trois demandes de Michel dans un message.
- ⛔⛔ **UNE PERTE DE DONNÉES, reproduite avant correction** : dans `saveBodyFat`, le `return`
  qui refuse un % invalide était **AVANT** `S.neck=nk` — donc *les centimètres n'étaient
  enregistrés qu'en effet de bord d'un % réussi*, et taper **le cou seul** jetait la saisie.
  👉 **Règle d'or #3** hors séance : *ce que la personne a tapé ne se perd pas parce qu'un
  CALCUL n'a pas abouti.*
- ⭐ **9 mesures** (3 visibles, 6 dépliables), une par zone et par jour, **bornes par mesure**.
  Les **hanches** deviennent visibles chez l'homme : le calcul ne les consomme pas, mais *un
  homme qui suit son tour de hanches n'avait aucun endroit où le noter.*
- ⛔⛔ **R8 refermé (6ᵉ fois)** : le prompt promettait déjà *« si tu ajoutes tes mensurations… »*
  sans les recevoir. Milo reçoit la **variation**, pas la liste (**+258 car., 0,35 %**).
- ⛔⛔ **Anti-fuite (5ᵉ cas)** : `mensLog` remis à zéro dans `_vcApplyPersona` — sans ça les
  vraies mensurations partaient dans **chaque persona**. *Trouvé en mesurant, pas en relisant.*
- ⛔ **Import de bilan** : le filet IMC existait dans `saveBodyScan` et **pas** dans
  `_importScaleRows` — *le même document perdait son IMC selon la porte d'entrée* (R2). Un seul
  propriétaire. ⭐ L'**IMC se calcule sans rien supposer** ; le **% de gras** exige des
  mensurations **datées** (fenêtre 21 j), sinon **on se tait** (R29). Ce qui est calculé le dit.
- ⚠️⚠️ **Un témoin a rougi sur mon commentaire** (« −4 cm en 2 mois » pris pour un vieux prix) :
  re-visé sur **« 2 mois près d'un montant »**, **contrôle négatif fait**. §31, encore.
- ⏭️ **Pas de droite/gauche, pas de graphique** : le journal se remplit d'abord — *on ne trace
  pas une courbe sur un point.* ⚠️ **Safari/iPhone à vérifier par Michel.**
- **Version précédente :** `ft-v1128` — 👥 **« ANON » N'EST PAS QUELQU'UN.**
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#894** sur `918ccd8`, **job `deploy` success**,
  les 7 étapes vertes à 23:11:32 UTC. Michel : *« c'est qui anon ? il faut que je sache
  qui utilise Milo »*. ⭐⭐ **Arithmétique exacte** : 25 appels = `michdu75` 16 + `anon` 9, et les
  9 = **5 `seanceJson`** + **4 de la passe A/B**. *Les deux étaient lui* → l'écran disait
  « 2 personnes » pour une seule.
- ⛔ **Deux causes, deux traitements** : mon bouton A/B envoyait un e-mail **vide** (défaut,
  corrigé — `_evRun` passe `S.email` depuis le 29/08) ; **`seanceJson` a RAISON** de ne rien
  envoyer (c'est le cervelet, appel figé à **2 clés** par un témoin). *Le réparer casserait
  l'architecture* — **R30/R28**. L'écran **nomme** le trou au lieu de le boucher.
- ⚠️⚠️ **ET LA SUITE EST PASSÉE DE 0 À 11 ROUGES À MINUIT, SANS QU'AUCUN CODE APPLICATIF BOUGE.**
  ⭐⭐ Tranché en un geste : **rejouer la suite sur le commit d'avant** (`git worktree`) → **mêmes
  11 rouges**. *Avant de chercher ce qu'on a cassé, vérifier que ce n'était pas déjà cassé.*
- ⛔⛔ **Cause : les fixtures dataient en UTC, la page vit à Paris.** À 00 h 34, la page dit 05/09
  et la fixture 04/09 → la « séance d'aujourd'hui » est datée d'hier, `jourSeance()` ne la trouve
  plus, tout le cyclage s'effondre. **La famille la plus documentée du projet, retournée contre le
  banc d'essai** — `tests/dates` interdit ce motif dans l'app, pas dans les runners.
  ⭐ **Pire qu'un test qui échoue : il n'échoue que 2 h par jour** — donc à minuit, celui qui livre
  croit avoir cassé l'app. **§40bis** de `BUGS.md`. **18 fixtures corrigées**, un seul motif qui
  marche dans Node ET dans le navigateur. ⏭️ `tests/dates` ne scanne toujours pas les runners.

- **Version en ligne (live) :** `ft-v1127` — 🔋 **OPTION B DE LA RÉCUP : LA CHARGE S'ADDITIONNE.**
  ⚠️⚠️ **26ᵉ COLLISION, la 2ᵉ de la journée** : session-A avait publié et déployé sa ft-v1126
  (run #887) pendant ma passe de parcours — *même scénario que la 25ᵉ, deux heures plus tôt*.
  ⭐ C'est **structurel** : toute version bump la même ligne de `sw.js`, et une suite complète
  dure plus longtemps que l'intervalle entre deux livraisons. La règle suffit et tient.
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#889** sur `152bc28`, **job `deploy` success**,
  les 7 étapes vertes à 21:28:01 UTC. ⭐ Suite sur l'arbre fusionné : **2720/2720**, calculs
  **310/310**, muscles 241, croisés 50, dates 7, données 0 trou — **0 rouge**.
  Avant, **seule la dernière séance** comptait : 1, 2 ou 3 séances de 12 séries rendaient toutes
  le même facteur (−13). Un forfait « jours enchaînés » (−4 / −8) l'approximait à la louche.
- ⭐⭐ **LE RÉSULTAT EST L'INVERSE DE CE QUE LE CONTRE-AUDIT ANNONÇAIT** — et c'est la leçon :
  sur les **60 jours réels** de Michel, **25 journées MONTENT** (+4,0 moy.), 3 baissent (pire −6),
  32 ne bougent pas, **le plancher reste à 42**. Le forfait mordait 28 jours à −4 quand la vraie
  somme y coûte moins. *Un forfait est faux dans les DEUX sens.*
- ⛔ **Plafond de la somme = 38, décision de Michel sur les chiffres** : le candidat à 48 faisait
  descendre son plancher à 38. ⛔ Le cumul ne s'applique **que** s'il y a plusieurs séances dans
  la fenêtre — sinon on retombe au point près sur le chemin d'origine (**R14**).
- ⛔⛔ **LE FORFAIT AVAIT SIX LECTEURS, PAS UN** : le calcul · le conseil · `projectionRecup`
  (elle prédisait l'expiration du forfait — gardée, elle aurait promis une remontée qui n'arrive
  jamais) · l'aide de l'Accueil · l'écran de projection · **et une pop-up de juillet toujours
  servie aux nouveaux venus**. 👉 *Retirer une règle du calcul ne la retire pas de ce que la
  personne LIT.*
- ⏭️ **LA PARTIE ② (la saturation à 0) N'EST PAS LIVRÉE, et la mesure dit pourquoi** : la
  correction prévue par le contre-audit — borner les ajustements négatifs — **ne marche pas**,
  tout reste à 0. La vraie cause est **en amont** : la pénalité plafonne à **38 dès 23 séries**,
  la FC au repos à **−8 dès +6 bpm**. *24 et 60 séries rendent le même chiffre avant même le
  zéro.* ⚠️ Michel : **on ouvre ce sujet à part**, sur ses chiffres (3 de ses 40 séances y sont
  écrasées ; sa plus grosse fait 24 séries).
- ⚠️ **Et je me suis trompé en route** : j'avais dit que la saturation ne le touchait pas (vrai
  sur 60 jours) — **son profil sature avec une seule mauvaise nuit** (5 h + 20 séries).
- **Version en ligne (live) :** `ft-v1126` — 💰 **« COÛT RÉEL DU JOUR » DIT DE QUEL JOUR.**
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#887** sur `353b2b7`, **job `deploy` success**,
  les 7 étapes vertes à 20:59:17 UTC. Michel : *« on ne sait pas si c'est dans la journée
  ou depuis 1 mois »*. Le titre disait « du jour » — **exact**, mais rien ne le prouvait à l'écran.
  👉 *Un chiffre sans sa période n'est pas un chiffre, c'est une impression.*
  ⭐ **Rien à construire (R5)** : `_aiUsageLire_` renvoyait déjà `u.date`, l'app la jetait.
  ⚠️⚠️ **Piège évité** : `_dateLisible` est **locale à `coach.js`** — l'appeler depuis `app.js`
  aurait fait disparaître **tout le panneau Santé** (le `_esc` de ft-v1114). *Vérifié avant
  d'écrire l'appel.* ⭐ Suite : **parcours 2720/2720**, calculs 298/298, 0 rouge.
- 💶 **LE COÛT D'UN MESSAGE À MILO, REMESURÉ le 04/09** (question de Michel : *« lire la
  nutrition ne va pas me faire gonfler la facture ? »* puis *« combien coûte un message »*).
  **Détail complet : `docs/BRIEFING-GPT-COUT-IA.md` §6.** En bref : **2,4 centimes** par message
  quand le cache est chaud, **16,5** pour le premier d'une conversation.
- ⭐⭐ **Le contexte a grossi de 35 % en un mois** (58 470 → **78 881** car.) **mais la répartition
  s'est AMÉLIORÉE** : le bloc jamais cachable — celui payé plein tarif à chaque message — est passé
  de **17 527 à 4 010** caractères. *Un contexte plus gros peut coûter moins cher qu'un plus petit
  mal découpé.*
- ⛔⛔ **Le piège à retenir** : le 1ᵉʳ message coûte **PLUS cher que sans cache** (16,5 contre 10,3)
  — *écrire un cache d'1 h se paie ×2*. **Le cache ne rapporte que s'il est RELU.**
- ⚠️⚠️ **Et j'ai annoncé deux chiffres faux avant de relire ce document** (8,5 / 1,9 centimes) :
  j'avais pris le tarif du cache 5 min pour le cache 1 h, et le ratio caractères/jeton de l'anglais
  pour un texte bourré d'emoji (**+53 % de jetons**). *Les deux constantes justes étaient à quinze
  lignes l'une de l'autre dans le fichier que je n'avais pas ouvert* (**R23**).
  👉 ***Le chiffre le plus dangereux n'est pas celui qu'on ignore, c'est celui qu'on calcule avec
  la mauvaise constante : il a l'air d'une mesure.***
- 🍽️ **La nutrition n'est PAS un sujet de facture** : 890 car. (**1,2 %**), **plafonnés à 7 jours en
  dur** — trois ans de repas notés n'ajoutent pas une ligne. **20 à 80 centimes sur mille messages.**
  ⭐ Et Milo reçoit bien la nutrition depuis ft-v1014 : les **totaux par jour**, jamais les noms
  d'aliments (13 126 car. bruts → 890, **59× moins**), plus ses cibles (TDEE, kcal, macros).
- 🛣️ **LES DEUX COULOIRS, rappelés par Michel le 04/09** : *« il ne faut pas que ça fasse obstacle
  à l'autre Claude, au départ je t'avais rajouté pour la **nutrition** »*. ⭐ **Le rappel était
  mérité et il est mesurable** : sur mes 8 versions du jour, **6 en nutrition** et **2 hors couloir**
  (`ft-v1118` le cardio, `ft-v1123` le banc A/B) — *les deux dans `coach.js`, et les deux jours de
  collision*. 👉 **session-A = nutrition & aliments · session-B = Milo, récup, séance.** Détail et
  nuances dans `docs/JOURNAL-DE-PARTAGE.md` (un couloir n'est pas un mur ; `sw.js` collisionnera
  toujours, le second qui fusionne monte).
- ✅ **LA PASSE A/B A TOURNÉ POUR DE VRAI** (Michel, 04/09 ~19:47, 4 appels).
  ⭐⭐ **AB-2 est sans appel** : avec la mémoire, **aucune** presse au-dessus de la tête sur l'épaule
  douloureuse et couché **allégé à 75 kg** ; sans elle, le **développé militaire à 80 kg devient
  l'ANCRE**. Poussée : **4 séries contre 9**. *La différence est DANS la séance, pas dans une phrase.*
  ⚠️ **AB-1 est faible, et c'est dit** : sans mémoire Milo tombe sur 80×4 — plausible **par hasard**
  pour un gars de 85 kg confirmé. Ce qui diffère vraiment : **B pose des questions**, A agit.
  ⛔⛔ **Et la passe a trouvé un défaut DANS MA FIXTURE** : `_abHistoDC` annonce « des charges qui
  PROGRESSENT » et fait l'inverse — j'ai **inversé le sens du temps** (`i=0` = la plus récente ET la
  plus légère). *Le résultat tient, mais la fixture ne teste pas ce qu'elle annonce.*
  ⏭️ **Les 2 suites sont PASSÉES À session-B** (leur couloir) : corriger le sens du temps, et
  **promouvoir AB-2 au banc** — *« épaule douloureuse → aucune presse au-dessus de la tête »* est
  vérifiable par du CODE, donc gratuit à chaque passe au lieu d'un test manuel à 0,26 €.
- **Version en ligne (live) :** `ft-v1125` — 🤝 **LES 2 SUITES DU RELAIS DE SESSION-A** (Michel :
  *« il a fini »*, puis il choisit le relais). ⛔ **① `_abHistoDC` ne faisait pas ce qu'elle
  annonçait** : commentaire « des charges qui PROGRESSENT », barème qui **descendait** — la séance
  la plus récente était la plus légère (80 kg la veille) pour un record de 95 kg il y a 9 jours.
  ⭐ Les **dates** étaient justes, c'est le **kg** qui descendait. *Une fixture qui ne fait pas ce
  qu'elle annonce ne rate pas le test : elle le fait passer sur autre chose* — et rien ne pouvait
  rougir, ce qui l'a rendue durable deux semaines.
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#883** sur `621816f`, **job `deploy` success**,
  les 7 étapes vertes à 19:26:21 UTC.
- ⭐⭐ **② AB-2 promu au banc d'essai (EV-056)** — il vient de la passe RÉELLE : avec la mémoire
  Milo retire toute presse au-dessus de la tête, sans elle le militaire à 80 kg devient l'**ancre**
  (**4 séries de poussée contre 9**). Vérifiable par du code → **gratuit à chaque passe** au lieu
  d'un test manuel à 0,26 €.
- ⛔⛔ **③ ET LA PROMOTION A TROUVÉ QUE `EV-050` NE TESTAIT PAS CE QU'IL ANNONÇAIT** : sa fixture
  écrivait `{zone:'épaule droite', etat:'actif'}`, **deux champs qui n'existent pas** (l'app écrit
  `status` et des **codes** de zone). Mesuré : la zone restait **inactive**, et le scénario passait
  grâce à ses `notes` en texte libre — la blessure **structurée** était inerte (`BUGS.md` §36).
  ⛔ **La production n'a jamais été touchée**, vérifié avant de rien changer : les codes réels de
  l'écran Santé activent tous la zone.
- ⚠️⚠️ **④ J'ai collisionné un id en écrivant ce travail** (EV-055 était déjà pris, rangé hors
  séquence) et **rien n'a protesté** — or le rapport suit les scénarios **par id**. Renuméroté
  EV-056, garde-fou posé : *il aurait coûté une seconde, c'est le genre qu'on n'écrit que le jour
  où on tombe dedans* (R17).
- ⛔ **Contrôle négatif : 4 rouges** sur l'ancien code. Suite : **2712/2712**, calculs 298/298,
  **0 rouge**. ⚠️ **Michel doit vérifier sur Safari/iPhone.**
- **Version en ligne (live) :** `ft-v1124` — ⚡ **« CETTE SÉANCE TE CONVIENT ? » NE S'AFFICHE PLUS
  SOUS UN REPROCHE.** Michel, enregistrement d'écran à l'appui : il écrit *« pourquoi tu me donnes
  la séance à faire ? »* et l'app propose **« ⚡ Oui, on démarre »** sous une réponse de Milo qui dit
  le contraire.
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#881** sur `5115965`, **job `deploy` success**,
  les 7 étapes vertes à 18:17:11 UTC. ⭐ Suite mesurée sur l'arbre fusionné : **2699/2699**,
  calculs **298/298**, muscles 241, croisés 50, dates 7, données 0 trou — **0 rouge**.
  ⚠️⚠️ **25ᵉ COLLISION DE VERSION, la 3ᵉ en deux jours** : session-A a publié **et déployé** sa
  propre ft-v1123 pendant que ma suite de parcours tournait. **Le premier publié garde le numéro** —
  ma version devient **ft-v1124**. ⭐ *Ma ligne de partage était pourtant posée dès 17:10 UTC* :
  **un panneau d'affichage évite le doublon de TRAVAIL, il n'empêche pas de choisir le même numéro.**
  *Seul git l'attrape, et il l'a attrapé.*
- ⛔ **La cause n'est PAS Milo** : la carte est posée par un filet déterministe du code
  (`_demandeUneSeance`), dont la règle ② acceptait n'importe quel « la/ma séance » **sans verbe de
  demande**. *Durcir le prompt aurait été corriger le mauvais cerveau (R7).*
- ⭐⭐ **Mesuré avant de coder : sur six phrases, QUATRE déclenchaient à tort** — dont trois qui sont
  l'exact contraire d'une demande (« était trop longue », « ne compte pas », « je viens de finir »).
- ⚠️⚠️ **ET MON PREMIER JET NE MORDAIT PAS** : `\b[é]tait\b` — **`\b` est ASCII en JavaScript**,
  il n'y a aucune frontière entre l'espace et le « é ». *Une expression régulière qui a l'air juste
  et qui ne mord jamais est pire qu'une absence de garde : on la croit posée.* On teste désormais
  sur une copie sans accents.
- ⛔ **Trous connus épinglés, non corrigés (R30)** : « on fait quoi ce soir » et « on s entraîne
  quoi » **sans apostrophe** ne déclenchent pas — ratés **pré-existants**, sans rapport avec ce
  correctif qui ne fait que **retirer** des déclenchements.

- **Version en ligne (live) :** `ft-v1123` — 🧠 **LE TEST A/B MÉMOIRE REÇOIT SA PORTE D'ENTRÉE.**
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#878** sur `7d1bc06`, **job `deploy` success**,
  les 7 étapes vertes à 17:43:22 UTC. ⭐ Suite **sur l'arbre FUSIONNÉ** : parcours **2699/2699**,
  calculs **290/290**, muscles 241, croisés 50, dates **7/7**, données 0 trou — *c'est l'arbre
  fusionné qui part en ligne, pas le mien seul.*
- ⚠️⚠️ **24ᵉ COLLISION DE VERSION** : session-B a poussé sa **ft-v1122** (le cardio dans la
  récupération) pendant que j'écrivais la mienne. La leur était déjà en ligne → je monte à 1123,
  *on ne fait jamais reculer le cache*. ⭐ **C'est le verrou GIT qui a joué**, pas le journal :
  mon push a été refusé, rien n'a été écrasé.
- ⛔ **Et leur ft-v1122 est en ligne SANS entrée dans `CLAUDE.md`** (R23) — noté pour eux dans le
  journal de partage. *Je ne l'écris pas à leur place : je n'ai pas fait le travail.*
  ⭐ Elle répond d'ailleurs au **barème de récup du cardio** que j'annonçais « en attente de
  Michel » une heure plus tôt — *exactement le doublon que ce journal existe pour éviter.*
- ⛔⛔ **La cause n'était pas le temps de Michel, et elle était de mon côté** : `ab-memoire.js`
  est prêt depuis le 03/09 et n'a jamais tourné parce qu'il était le **seul** test lançable par
  lui **sans bouton**. J'ai écrit « en attente de Michel » pendant deux semaines.
  👉 *Un outil sans porte d'entrée n'est pas un outil en attente, c'est un outil qui n'existe pas.*
- ⭐ **R13/R2 — pas un 2ᵉ chemin** : le bouton appelle `_vcApplyPersona` / `buildCoachContext` /
  `_vcAsk`, les mêmes que le benchmark ; le gel et la restauration sont **copiés** de `_evRun`.
- ⛔ Les cas sont la propriété de l'app (`_AB_CAS`) ; le script node les **lit** et **échoue
  bruyamment** s'ils manquent. ⚠️ Référence **nue** : un `const` global n'est pas sur `window`.
- ⭐⭐ **La mesure du contexte avait DÉJÀ divergé** sans que personne l'ait touchée (un marqueur
  manquait d'un côté) → `_abMesureContexte`, un seul propriétaire. *La duplication n'attend pas
  qu'on la modifie pour nuire : elle naît déjà différente.*
- ⛔⛔ **Aucun verdict automatique, exprès** : « meilleure ? » se juge à l'œil (critère de
  `JOURNAL-DE-TEST.md`). L'écran le dit. **Mesuré à blanc (0 €)** : écart +4 516 et +5 044 car.
- ⚠️⚠️ **J'ai écrit un bug de fuseau horaire en chemin**, le détecteur en a pris 2 sur 3 (le 3ᵉ
  décalait la date **avant** de convertir). Puis il a rougi sur **mon commentaire** (§31) : son
  intention couvrait déjà les `//`, pas les blocs — étendue, **contrôle négatif fait**.
- ⏭️ **La passe n'a PAS encore tourné pour de vrai** (4 appels, ~0,25 € — décision de Michel).
  *On ne sait donc toujours pas si la mémoire rend la séance meilleure : on sait qu'on peut
  enfin le mesurer.* La **mémoire à 2 vitesses** attend ce même avant/après (R34).
- ✅✅ **SAFARI / IPHONE VÉRIFIÉ PAR MICHEL le 04/09** — ft-v1114 → ft-v1120, **tout est bon**.
  ⭐ **Le point qui comptait vraiment : la bande « REPAS » en `position:sticky` TIENT sur Safari
  iOS.** C'était le seul vrai risque de la série — les règles du projet listent `position:sticky`
  dans un conteneur de défilement comme un piège Safari connu, et il n'avait jamais été levé
  depuis ft-v1109. ⭐ Vérifiés aussi : le clavier décimal du champ pour-100 g accepte la
  **virgule**, les nouveaux produits sortent avec leur portion, `coca zero` rend bien la ligne à
  **1 kcal** et non celle à 24, la pop-up v68 et le point rouge s'affichent.
  ⚠️ *La mention « Safari non vérifié » traînait dans six entrées de journal : elle est levée pour
  cette série, pas pour les suivantes.*
- **Version précédente :** `ft-v1122` — 🔋 **LE CARDIO ENTRE ENFIN DANS LA RÉCUPÉRATION** (option A
  du contre-audit, tranchée par Michel sur les chiffres : ancrage 45 min modéré = **6 séries**,
  plancher **2**, rampe **12 h**, `projectionRecup` remis sur `RECUP_EFFACE_H`).
  ⚠️⚠️ **Cette version est partie en prod SANS entrée de journal — R23, entrée écrite après coup le
  04/09.** *La note de `sw.js` était complète ; c'est le fichier qu'on relit à chaque session qui ne
  l'était pas.*
  ⭐⭐ **Rejeu des 60 derniers jours sur les vraies données de Michel** : 27 jours inchangés, 33
  changés, **tous vers le bas**, moyenne **−2,0**, max **−6**, aucune journée absurde.
  ⏭️ **B et C restent entiers** (consigne de Michel : *« ne commence PAS B ou C dans le même
  commit »*).
- **Version antérieure :** `ft-v1121` — 🌮 **O'TACOS SORT DE LA BASE** (128 → 123).
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#873** sur `f26b072`, **job `deploy` success**,
  les 7 étapes vertes à 16:40:45 UTC. ⭐ Suite : **2682/2682, 0 rouge**.
  ⚠️ *Le chiffre annoncé dans l'entrée était d'abord une **prédiction** (2679) : il a été remplacé
  par la mesure. Un total de tests écrit avant la passe n'est pas un résultat.*
- ⛔ Ses 5 lignes étaient **toutes des desserts**, **aucun tacos** → `tacos` rendait une **glace**.
  👉 *Un mot qui ne désigne pas ce qu'on croit est pire qu'un mot qui ne rend rien.*
- ⭐⭐ **Ça rétablit une décision déjà prise** : en ft-v1113, `tacos` n'était **pas** mappé, exprès.
  *La base de marques contredisait cette décision sans qu'on l'ait voulu, et aucun témoin ne
  pouvait le voir — il surveillait `_ciqualChercher`, pas `_marquesChercher`.*
- ⛔ **Ce n'est PAS la règle « il faut tout mettre » qu'on contredit** : celle-là visait des valeurs
  douteuses mais RÉELLES. Ici les chiffres sont justes — *c'est la question à laquelle ils
  répondent qui est fausse.*
- ⛔ **R30** : retrait déclaré dans le générateur avec sa raison, figé par 2 témoins.
- ⚠️ **L'aide de la veille est devenue fausse** (« taper tacos te rendra une glace ») — corrigée
  dans le même mouvement, **3ᵉ cas §31 de la série**.
- **Version en ligne (live) :** `ft-v1120` — 🍔 **LA BASE FAST-FOOD : 27 → 128 PRODUITS.**
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#870** sur `3df7411`, **job `deploy` success**,
  les 7 étapes vertes à 13:12:02 UTC. ⭐ Suite : **2672/2672, 0 rouge**.
- ⭐ **Aller-retour : 0 écart sur 116 vérifiés**, et le Big Mac tombe au chiffre près sur
  l'ancienne table — même source, étendue. *La preuve valait mieux que la confiance : le nom du
  fichier n'était pas celui de la V1.*
- ⛔⛔ **La V2 SEULE aurait fait perdre TOUTES LES FRITES** (elles n'ont que les calories dans ce
  classeur) : **+95 gagnés, −15 perdus**, et personne ne l'aurait vu. 👉 *Remplacer aurait été une
  régression déguisée en enrichissement.* D'où une **FUSION** : 114 lus + 14 hérités.
- ⚠️ **Les 14 hérités sont un pis-aller écrit comme tel** : leur classeur est perdu, la sortie du
  03/09 est leur seule trace. ⭐ **Le garde-fou a servi le jour même** : la pizza 4 Fromages est
  repartie dans la source, le bloc a maigri de 15 à 14. *Il doit rétrécir, jamais grossir.*
- ⭐ **Contrôles sur les 95 nouveaux** (91 sont du Quick, le bloc DÉCALÉ la 1ʳᵉ fois) : **1 seule
  incohérence**, le Korean Whopper — déjà connue, déjà affichée.
- ⚠️⚠️ **À TRANCHER PAR MICHEL : O'Tacos ne contient AUCUN tacos** — 5 desserts (dont des Kinder
  Bueno), donc taper `tacos` rend une glace. Gardé parce que la règle est la sienne (*« il faut
  tout mettre »*), signalé parce qu'il doit le savoir. L'aide le dit en clair.
- ⛔ **N'entrent pas** : 8 Subway (macros absentes), 5 desserts O'Tacos (calories absentes).
- **Version en ligne (live) :** `ft-v1119` — 🔍 **LES 2 DÉFAUTS DE LA RECHERCHE ALIMENTAIRE.**
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#866** sur `726ea99`, **job `deploy` success**,
  les 7 étapes vertes à 08:44:38 UTC. ⭐ Suite : **2653/2653, 0 rouge**.
  ⚠️ La fusion avec session-B n'a apporté que **2 fichiers de doc** (contre-audit récup),
  aucun code — *vérifié avant de conclure qu'il n'y avait rien à re-tester.*
- ⛔ **① la ponctuation restait collée** (`Boulgour, cuit` → RIEN, 4 cas sur 6 ; `Riz blanc, cuit`
  marchait **par coïncidence**) · ⛔ **② les mots-outils étaient exigés** (`filet de bœuf` → RIEN),
  et ça marchait **7 fois sur 8 par accident** (le « de » de « vian**de** »).
- ⭐⭐ **La MESURE a dit où poser le filtre, avant la 1ʳᵉ ligne** : posé en amont, il cassait les
  **99 clés d'alias qui contiennent un mot-outil** (`pomme de terre` retombait sur la CRUE).
  👉 *On retire les mots-outils pour CHERCHER, jamais pour RECONNAÎTRE.*
- ⛔⛔ **Jamais jetés** : `sans`, `avec` (« coca sans sucre » → « coca sucre », le contraire) et
  `the`. ⛔ **La barre `/` est volontairement absente** : l'espacer d'un seul côté rendrait la clé
  `lait 1/2 ecreme` introuvable. ⭐ Un témoin exige que **chaque clé d'alias soit déjà normalisée**.
- ⭐ **Contrôle négatif `git stash` sur 82 requêtes : 10 réparées, 4 améliorées, 0 cassée.**
  `jarret de veau` rendait « Osso buco à la milanaise », il rend « Veau, jarret cru ».
- ⚠️⚠️ **TROU DE MÉTHODE À TRANCHER** : `data/alias.json` **n'est plus régénérable** — le classeur
  source de GPT vivait dans le dossier temporaire et a disparu au redémarrage du conteneur.
  *Un fichier généré dont la source n'est pas versionnée est un fichier figé qui s'ignore.*
  👉 Verser le classeur dans le dépôt, ou accepter que la table soit figée. **Décision de Michel.**
- **Version en ligne (live) :** `ft-v1118` — 🏃 **UNE SÉANCE DE CARDIO SEUL N'EST PLUS INVISIBLE.**
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#861** sur `273a347`, **job `deploy` success**,
  les 7 étapes vertes à 07:47:07 UTC. ⚠️ *Je n'ai PAS pu lire l'URL live moi-même* — le proxy du
  conteneur refuse `github.io` (`CONNECT tunnel failed, 403`), comme il refuse le Worker. La preuve
  disponible est le JOB, pas la page : **Michel confirme par le n° de version dans « À propos »**.
  Suite : **2635/2635, 0 rouge** (parcours ·
  calculs 266 · muscles 241 · croisés 50 · dates 7 · données 0 trou).
- ⭐⭐ **Deux retours de Michel le même jour, UN seul défaut** : *« 45 min de tapis et ma récup n'a
  pas bougé »* et *« on me dit que j'ai pas fait le cardio hier »*. La mesure a tranché : la carte
  « séance manquée » se tait dès qu'une séance existe ce jour-là (vérifié sur les **4** façons de
  noter un cardio) → **aucune séance n'avait été enregistrée le 03/09**.
- ⛔⛔ **Le piège** : « ✓ Enregistrer le cardio » (bloc Cardio) disait *« Cardio enregistré ✅ »* et
  **n'enregistrait rien**. Le vrai bouton, en bas, s'appelait… **« 🏁 Enregistrer le cardio »**.
  *Deux boutons, presque les mêmes mots, tous les deux rouges, un seul enregistre.*
- ⛔⛔ **Et une PERTE DE DONNÉES derrière** (règle d'or #3) : `startWorkout()` repartait de zéro dès
  qu'il n'y avait pas d'exercice → un aller-retour par l'Accueil **effaçait 45 min de cardio en
  silence**.
- ⭐ **Cinq endroits** lisaient « des exercices » là où la question est « une séance ouverte ».
  `_seanceOuverte()` y répondait **depuis le 02/08** : il n'a pas fallu écrire une règle, seulement
  la lire (**R2**). C'est **R8** — les jumelles étaient à chercher le 02/08, pas six semaines après.
- ⭐⭐ **Sa question suivante — « pourquoi le cardio n'apparaît pas dans mon historique ? » — a trouvé
  la même famille un cran plus loin.** Mesuré : **il y EST**, mais affiché *« 💪 jeu. 3 sept. · **0 kg**
  · 45 min · 351 kcal · **—** »*. *Techniquement présent, humainement introuvable.* → titre **« 🏃 Cardio »**,
  le cardio en clair sous la ligne, « 0 kg » retiré **de ce cas seulement**. ⭐ Le calendrier et le compteur
  du mois, eux, marchaient **déjà** (vérifié, pas supposé). Et la clé technique sortait à l'écran
  (« modere ») → `CARDIO_INTENSITES`, un seul propriétaire (**R2**).
- ⏭️ **EN ATTENTE DE MICHEL — le barème de récup du cardio.** Mesuré à nuits identiques : aucune
  séance **76** · 45 min de tapis **71** · 20 min **71** · 4 séries de DC **70**. `_penaliteSeance`
  ne compte que des séries validées → plancher de **6**, alors que `calcCardioKcal` sait dire **351
  kcal** (45 min) contre **156** (20 min). ⚠️ *Combien 45 min de tapis doivent peser face à une
  séance de jambes est un jugement, pas une mesure — on n'invente pas l'échelle* (**R29**).
- ⛔⛔ **ABANDONNÉ, PAS OUBLIÉ — le test A/B mémoire (`tests/milo/ab-memoire.js`)** *(04/09/2026)*.
  Michel : *« le test A/B je peux pas le faire »*. **C'est une impasse des deux côtés, et il faut
  l'écrire** : le conteneur ne peut pas l'exécuter (le Worker est refusé par la politique réseau),
  et Michel non plus — c'est un script **en ligne de commande**, sans bouton dans l'app, donc
  injouable depuis son téléphone. 👉 ***Une tâche que personne des deux ne peut faire n'est pas
  « en attente », elle est bloquée*** — la laisser en attente la faisait revenir à chaque bilan,
  et coûtait une question à Michel à chaque fois pour la même réponse.
  ⭐ **Ce qu'il faudrait pour la débloquer, écrit pour que ce soit une DÉCISION et pas un oubli**
  (**R30**) : lui donner un bouton dans le Laboratoire Milo, comme le benchmark et le comparateur
  Sonnet/Haiku — *tout ce qui est réellement lançable par Michel a un bouton ; ce script est le
  seul qui n'en a pas, et c'est exactement pour ça qu'il n'a jamais tourné.*
  ⚠️ **Ce qu'on perd en attendant** : la mesure avant/après de la **mémoire à 2 vitesses** (R34).
  *On ne construira donc pas cette brique sur une intuition — elle attend son instrument.*
- **Version en ligne (live) :** `ft-v1117` — 🥤 **LE PIÈGE DU COCA : IL Y EN AVAIT NEUF.**
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#859** sur `dd36727`, **job `deploy` success**,
  les 7 étapes vertes à 20:11:20 UTC. ⚠️ Le run est resté marqué `in_progress` plusieurs minutes
  après la fin du job — *l'''état du run retarde sur celui du job, on regarde le JOB*.
  ⭐ Suite : **2604/2604, 0 rouge** (parcours · calculs 266 · muscles 241 · croisés 50 · dates 7).
- ⛔⛔ **9 paires** « sucré + édulcorants » / « sans sucres ajoutés + édulcorants » dans CIQUAL, et
  **« sucré » est toujours le nom le plus court** → le tri prenait la version sucrée à chaque fois.
- ⚠️⚠️ **LE CORRECTIF STRUCTUREL A ÉTÉ REFUSÉ PAR LA MESURE** (R7) : traduire `zero`/`light` en
  « sans sucres ajoutés » corrige 3 cas **et en casse 3** — `yaourt light` ne rend plus rien,
  `soda light` tombe sur « Boisson gazeuse **à la pomme** ». 👉 *« Light » ne veut pas dire « sans
  sucre » : un yaourt light est 0 % MG.* **Un mot à deux sens ne se traduit pas, il se DÉSIGNE.**
- ⛔⛔ **Pire cas, et il dépasse le Coca** : `lait amande` rendait un **chocolat à 559 kcal/100 g**
  pour une boisson qui en fait **36** — **× 15,5**. `lait soja`/`lait avoine` : rien.
- ⛔⛔ **Ce qu'on refuse de fusionner** : le **lait de coco culinaire** (199 kcal) n'est pas la
  **boisson à la noix de coco** (30). ⭐ Et il trouvait **déjà** le bon — *avant d'ajouter une
  porte, vérifier qu'elle n'est pas déjà ouverte.*
- ⭐ **80 boissons mesurées : 28 sans résultat → 9.** Ce qui reste vide est **listé** (powerade,
  gatorade, mojito, whey — aucune boisson isotonique n'existe dans CIQUAL).
- **Version en ligne (live) :** `ft-v1116` — 🥤 **LE COCA ZÉRO ÉTAIT COMPTÉ 24 FOIS TROP.**
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#857** sur `414cdce`, **job `deploy` success**,
  les 7 étapes vertes (« Déployer sur GitHub Pages » comprise) à 19:22:50 UTC.
  ⚠️ **Le RUN était encore marqué `in_progress` quand le JOB était déjà fini** — l'état du run
  retarde sur celui du job. *Regarder le job, pas seulement le run : sinon on croit un
  déploiement en cours alors qu'il est terminé* (et l'inverse est arrivé le 02/09, un run qui
  ATTENDAIT 7 h 52 sans être ni rouge ni vert).
  ⭐ Suite re-passée sur l'**arbre FUSIONNÉ** avec session-B : **2589/2589, 0 rouge**.
- ⛔⛔ `coca zéro` rendait « Cola, **SUCRÉ**, avec édulcorants » (**24 kcal/100 g**) avant « Cola,
  **sans sucres ajoutés** » (**1 kcal**). Sur 50 cl : **120 kcal enregistrées au lieu de 5**.
- ⭐⭐ **La cause n'est pas une faute de la traduction, c'est sa LIMITE** : `zero`/`light` → « édulcorants »
  est exact, mais **les deux lignes portent ce mot** — c'est le tri par nom le plus court qui
  tranche, et il tranche mal. 👉 *Un mot traduit désigne une FAMILLE, pas un aliment.*
  ⭐ C'est **la frontière écrite la veille** entre `FOOD_SYNONYMES` et la table d'alias,
  **vérifiée sur un vrai cas trouvé par l'USAGE** — Michel notait son repas.
- ⛔ **On ne retire pas l'autre ligne** : elle est le bon aliment pour un cola à la stévia, elle
  reste **juste en dessous** (R29). ⛔ Et la variante **sans caféine** garde son entrée propre.
- ⛔⛔ **Les ajouts vivent dans `tools/alias.py`**, jamais dans `data/alias.json` qui est **généré** :
  une retouche à la main y disparaîtrait **sans bruit** (R27). Deux témoins l'épinglent.
- **Version en ligne (live) :** `ft-v1115` — 🥗 **LES MOTS QU'ON EMPLOIE ATTEIGNENT UN ALIMENT.**
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#854** sur `ec64523`, `success` à 18:05 UTC.
  ⭐ Suite re-passée sur l'**arbre FUSIONNÉ** avec session-B : **2578/2578, 0 rouge**.
- ⭐⭐ **569 alias** (`data/alias.json`, 4 Ko gzippés) produits par **GPT à partir de l'export CSV
  de notre propre base** — l'audit livré le matin même. ⛔ **Aucune valeur créée** : vérifié à
  l'import, **0 macro divergente sur 569**.
- ⛔⛔ **Mesuré AVANT de brancher** : 219 mots déjà justes · **153 ne rendaient RIEN** · 135 pas en
  tête · **62 rendaient un AUTRE aliment** — `riz japonais` → **biscuit apéritif**, `patate` →
  **patate douce**, `tradition` → **cidre**.
- ⭐⭐ **Décision de Michel** sur les 13 cas cru↔cuit : ***« les deux, le cuit en premier »***.
  `riz` rend *cuit* (155) puis *cru* (350) juste dessous. **R29**.
- ⛔ **Une erreur trouvée chez GPT** : `tomate` visait « Tomate, séchée », **kcal non déterminées**
  → jamais proposable. *Un alias qui ouvre une porte fermée est pire qu'un alias absent.*
  Corrigé vers l'aliment moyen, **la correction est imprimée** par le générateur.
- 📣 **La pop-up se MÉRITE ici** (`WHATS_NEW` v68) : un chiffre noté tous les jours change **du
  simple au double**. *Le danger n'est pas qu'il le remarque — c'est qu'il ne le remarque pas.*
- ⏭️ **Toujours non corrigés** (audit du matin) : la **ponctuation collée** (`Boulgour, cuit` →
  rien) et les **mots-outils exigés** (`filet de bœuf` → rien). La table les **contourne**, elle
  ne les répare pas. ⚠️ **Safari/iPhone non vérifié.**
- **Version en ligne (live) :** `ft-v1114` — 🍔 **ON MET TOUT ET ON MARQUE LE DOUTE.**
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#849** sur `9b2676d`, `success` à 16:52 UTC.
  ⭐ Suite re-passée sur l'**arbre FUSIONNÉ** avec session-B : **2554/2554, 0 rouge**.
  ⚠️ *Le proxy de ce conteneur bloque `github.io` : je vérifie le RUN, pas la page servie.*
- ⭐⭐ **Une base fast-food France entre dans l'app** : 27 produits (McDonald's, Burger King, KFC,
  Quick, Domino's) dans `data/marques.json`, générés par `tools/marques.py`. **`big mac`**,
  **`whopper`**, **`mcnuggets`**, **`pizza 4 fromages`**, **`frites mcdo`** trouvent le produit
  avec son **enseigne** et le **poids de sa portion**. ⛔ Aucun nouveau mécanisme (R13/R2) : c'est
  le chargeur, la recherche et le remplissage de CIQUAL — seule la table change.
- ⚠️ **La source vient de MICHEL** (le proxy de ce conteneur rend `mcdonalds.fr` en 403). Je ne
  peux pas vérifier ces valeurs moi-même ; l'app **le dit** à chaque ligne.
- ⭐⭐ **LA DÉCISION QUI PORTE LA VERSION EST DE LUI** : ma 1ʳᵉ version **écartait** les 4 lignes
  douteuses. *« Il faut tout mettre sinon autant rien mettre c'est logique. »* Et c'est mesurable
  — **une ligne absente pousse vers l'estimation IA, pire qu'une valeur publiée douteuse** :
  *c'est le mécanisme qui a fabriqué son pot de protéine faux (ft-v1103/1104/1105).* On montre
  la valeur **et** ce qui cloche, avec le chiffre qui permet de juger (**R29**).
- ⛔⛔ **R4, 3ᵉ fois au même endroit** : la liste blanche de `_provFood` laissait tomber `doute` —
  et j'avais écrit *« le doute descend jusqu'à la donnée (R4) »* **juste au-dessus**. *Un
  commentaire n'est pas un garde-fou* ; c'est la mesure de l'entrée sauvegardée qui l'a vu.
- ⛔ **Les 4 pour-100 g sont DÉRIVÉS de la portion**, jamais recopiés des colonnes arrondies :
  **0 écart sur 23 produits**. ⚠️ Mon 1ᵉʳ contrôle (« jamais plus de 1,5 g d'écart ») masquait
  exactement ce défaut — *un seuil choisi pour passer cache ce qu'il devait trouver.*
- ⚠️⚠️ **L'aide de ft-v1113 a dû être CORRIGÉE** : elle promettait *« jamais des marques, tu ne
  verras pas Big Mac »* — **livrée la veille, fausse le lendemain**. **8ᵉ fois pour §31.**
- ⏭️ **Non fait, et c'est écrit** : les **2 défauts de la recherche** trouvés en auditant la base
  pour GPT — la **ponctuation reste collée** au mot tapé (`Boulgour, cuit` → rien) et les
  **mots-outils sont exigés** (`filet de bœuf` → rien, alors que `6116 · Boeuf, filet cru`
  existe). Mesurés, **à décider par Michel**. ⚠️ **Safari/iPhone toujours non vérifié.**
- **Version en ligne (live) :** `ft-v1113` — 🍔 **LES MOTS QU'ON DIT ATTEIGNENT LES ALIMENTS.**
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#845**.
- ⭐ `coca` ne rendait **rien** alors que « Cola, sucré » est dans le fichier — **une lettre**.
  `soda`, `mcdo`, `fast food` non plus. ⚠️ **Trou invisible au bureau, béant à la salle** : en
  ligne, Open Food Facts rattrape ; hors ligne on n'a rien (règle d'or #4).
- ⛔ **On répartit, on n'empile pas** : `mcdo` rendait **six sandwichs** et coupait les frites et
  les nuggets — or qui tape « mcdo » compose un **menu**.
- **Version en ligne (live) :** `ft-v1112` — 🔢 **UNE SEULE PRÉCISION POUR LE POUR-100 g.**
  ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#842** sur `01b1adb`, `success` à 11:35.
  ⭐ Suite re-passée sur l'**arbre FUSIONNÉ** avec session-B : **2514/2514**.
- ⭐ **La question de Michel** (*« ça va être comme ça sur tous les produits ? »*) a une réponse
  chiffrée : **non** — 3 484 aliments embarqués, code-barres, photo d'étiquette ; **la saisie à
  la main est le dernier recours**.
- ⛔⛔ **Mais la vérification a trouvé pire** : **6 endroits** construisent le pour-100 g, **4
  l'arrondissaient**. Le plus coûteux est la base embarquée — `data/ciqual.json` **contient** les
  décimales et l'app les jetait à la lecture. **3 298 aliments sur 3 484** en portent au moins
  une ; **1 159 ont une macro entre 0 et 1 g/100 g**, qui devenait **0 ou 1**.
- ⛔ **La photo d'étiquette est le R4 le plus pur** : le serveur demande « garde 1 decimale si
  presente », et l'app jetait les **calories** à l'arrivée.
- ⚠️⚠️ **R8 pour la 5ᵉ fois cette semaine** : le correctif de la veille (ft-v1111) était posé sur
  **1 endroit sur 6**, et pas sur le plus utilisé.
- ⚠️⚠️ **Deux témoins existants ont rougi, et les deux avaient tort** : leurs attendus étaient
  calés sur le **double arrondi** qu'on venait de retirer (156 → **155** ; 6 → **5**). *Vérifié
  par l'arithmétique sur les vraies données, pas déduit* — le réflexe « j'ai cassé quelque
  chose » aurait annulé une version juste.
- ⚠️⚠️ **LE CONTENEUR : mon clone local s'est REMBOBINÉ TROIS FOIS aujourd'hui**, emportant une
  fois des corrections non commitées. Rien n'a jamais été perdu de ce qui était **poussé**.
  👉 *Committer au fur et à mesure, ne jamais laisser de travail non poussé.*
- ⏭️ **Inchangé** : les lignes déjà enregistrées gardent leur `per100` arrondi (on ne réécrit pas
  l'historique — R29) ; elles se corrigeront à la prochaine reprise du produit. ⚠️ **Safari/iPhone
  toujours non vérifié.**
- **Version en ligne (live) :** `ft-v1111` — 🔢 **LE CALIBRAGE GARDE LA DÉCIMALE DE
  L'ÉTIQUETTE.** ⏳ **POUSSÉ, DÉPLOIEMENT À VÉRIFIER** (R18).
- ⭐ **Le calibrage de ft-v1110 tombe juste sur les vrais chiffres** : l'étiquette de Michel
  (388,5 kcal · 88 g de protéines · 2,8 g de glucides · 3,3 g de lipides / 100 g) rend
  **117 kcal · 26 g** pour ses 30 g, contre 116,6 / 26,4 déclarés.
- ⛔⛔ **Le défaut était dans ce qui est CONSERVÉ, pas dans ce qui est affiché** : `2,8` et `3,3`
  étaient stockés arrondis à **3**. Invisible sur une poudre ; une **huile à 0,4 g/100 g** aurait
  vu sa valeur devenir **0**. 👉 *On transcrit ce que la personne a lu, on ne l'arrondit pas à sa
  place* (leçon de ft-v1100).
- ⭐⭐ **L'étiquette tranche une question ouverte depuis ft-v1105** : elle déclare **elle-même une
  portion de 30 g**. Les 40 g qui produisaient 156 kcal / 35 g ne venaient donc **pas** de la
  fiche produit — c'était une **valeur inventée**. *Mon explication de ft-v1105 décrit un
  mécanisme réel, mais pas celui qui l'a touché ; elle disait déjà ne pas savoir, c'est la seule
  raison pour laquelle il n'y a rien à défaire.*
- ⚠️ **Un rouge venait de MOI** : le témoin réclamait 113 kcal, calé sur un chiffre provisoire ;
  j'avais changé la fixture sans changer l'attendu. *Un rouge qui accuse le code alors qu'il ne
  décrit qu'un chiffre périmé dans le test.*
- ⏭️ **Inchangé** : les lignes **déjà enregistrées** ne se corrigent pas (le calibrage vit dans
  l'écran d'ajout). ⚠️ Et **Safari/iPhone reste non vérifié** (Chromium seulement).
- **Version en ligne (live) :** `ft-v1110` — ⚖️ **UN PRODUIT DEVIENT CALIBRABLE À LA MAIN.**
  ⏳ **POUSSÉ, DÉPLOIEMENT À VÉRIFIER** (R18).
- ⛔⛔ **Michel, 4ᵉ passe sur le même pot** : *« il y a toujours le problème avec ma prot »*. La
  cause est **structurelle**, mesurée : sa ligne porte `per100 = null`, et **aucun champ de
  l'app ne permettait de saisir un pour-100 g à la main**. Un produit dont la fiche est
  incomplète était donc **incalibrable à vie**, et sa vieille ligne fausse revenait **en tête**
  des propositions.
- ⛔⛔ **C'est le procès des trois versions précédentes** : ft-v1103/1104/1105 ont toutes ajouté
  une **alerte**, aucune n'a rendu la personne capable de **réparer** le produit. *Un garde-fou
  dit que c'est faux ; il ne corrige pas.*
- ⭐⭐ **Zéro nouveau calcul (R13/R2)** : on rejoint le chemin de CIQUAL, qui appelle déjà
  `_offRemplirFormulaire` avec un produit vide. *Le trou n'était pas dans la machinerie, il
  était dans la porte d'entrée.*
- ⭐ **Mesuré sur son étiquette** : 88 g/100 g → **30 g rendent 26 g**, le `per100` est enregistré
  (**R4**) et **la fois d'après la proposition le porte** — le produit est réparé, pas le repas.
- ⚠️⚠️ **Un témoin EXISTANT a attrapé un vrai défaut de mon code** : mes 4 champs étaient en
  `type="number"`, qui **filtre la virgule** sur clavier français (« 62,5 » → vide ou « 625 »,
  en silence). 23ᵉ occurrence évitée. *Un garde-fou écrit après un vrai bug vient de servir à
  celui qui l'avait écrit.*
- ⏭️ **Ce que ça ne fait PAS** : les lignes **déjà enregistrées** ne se corrigent pas — le
  calibrage vit dans l'écran d'**ajout**, pas dans la modale de modification. Décision de
  périmètre, pas un oubli. ⚠️ Et **Safari/iPhone non vérifié** (Chromium seulement).
- **Version en ligne (live) :** `ft-v1109` — 📌 **LA LIGNE « REPAS » RESTE À L'ÉCRAN, ET LA
  CONFIRMATION DIT OÙ.** ⏳ **POUSSÉ, DÉPLOIEMENT À VÉRIFIER** (R18).
- ⛔⛔ **Mesuré avant de coder** : les puces de repas sortaient de l'écran dès **236 px**, sur une
  modale qui en défile **951** — or **tout** ce qui sert à saisir l'aliment vit en dessous. 👉
  *Au moment précis de valider, le repas qui reçoit l'aliment n'était **jamais** visible.*
- ⛔⛔ **Et il est le plus souvent DEVINÉ** : `_afMeal` est pré-réglé sur **l'heure qu'il est**.
  Une supposition qu'on ne montre pas est une décision prise à la place de la personne (**R29**).
- ⚠️⚠️ **LE DÉFAUT DE MA 1ʳᵉ VERSION A ÉTÉ TROUVÉ PAR LA CAPTURE, PAS PAR LES CHIFFRES** : avec
  `top:0`, **tous les nombres étaient bons** et l'écran était faux — les aliments défilaient dans
  les 16 px de marge **au-dessus** de la bande. 👉 *Une mesure dit si la règle écrite est
  respectée ; elle ne dit pas ce qui est **peint**.* Un témoin regarde désormais le haut de la
  modale, pas une coordonnée.
- ⛔ **La jumelle était déjà écrite, pour UN seul des 3 chemins (R8)** : « tes repas habituels »
  nommait le moment depuis ft-v1052, les deux autres disaient « Ajouté au journal ». Propriétaire
  unique réutilisé : `_foodMealInfo` (**R2**).
- ⭐ **Coût mesuré et réduit** : la bande prend **98 px sur 775**, et les puces passent de 70 à
  **64 px** pour tenir sur **une** ligne à 390 px (elles se cassaient en 4 + 1 = 114 px). ⛔ Sur
  les grands iPhone, `flex:1` répartit tout : **rien ne change**.
- ⏭️⚠️ **NON VÉRIFIÉ ICI : Safari/iPhone.** Le conteneur n'a que Chromium, et `position:sticky`
  dans un conteneur défilant est justement un point où Safari diffère (`CLAUDE.md`). **C'est à
  Michel d'ouvrir la modale et de descendre.**
- ⏭️ **Question ouverte notée au journal de test** : le repas deviné part dans le contexte de
  Milo — *tire-t-il des conclusions d'une étiquette souvent fausse ?* Non mesuré (coûte des
  appels réels, **R34**).
- **Version en ligne (live) :** `ft-v1108` — ✅ **DÉPLOIEMENT VÉRIFIÉ VERT** (R18) : run **#826**
  sur le commit `ce8a05b`, `success` à 05:12. ⚠️ **Et il a fallu débloquer la file d'abord** :
  le job du run **#820** (session-B) est resté **7 h 52** à l'entrée de l'environnement
  `github-pages` (20:24 → 04:16), et comme les déploiements Pages sont **sérialisés**, les runs
  #821 → #824 ont tous été **annulés** derrière lui — donc **ft-v1107 n'était jamais parti en
  ligne**. Le run **#825** (`workflow_dispatch`, 04:16) a purgé la file ; le #826 a suivi
  normalement. **Rien à corriger côté code à aucun moment.** 👉 *Un déploiement peut rester en
  attente des heures sans qu'aucune alerte ne le dise* — c'est exactement la panne que R18
  décrit, à ceci près qu'ici le run n'était ni rouge ni vert : il **attendait**. ⏭️ Si ça se
  reproduit : annuler le run bloqué depuis GitHub, puis relancer un `workflow_dispatch` sur
  `master` (⛔ **jamais « relancer les jobs échoués »** — mesuré le 01/09, ça produit deux
  artefacts et l'échec en 0 s).
- ⚖️⚠️⚠️ **LA RÈGLE DES JOURNÉES EXPLOITABLES ÉTAIT FAUSSE, corrigée le soir même** (ft-v1108).
  GPT/Michel demandent de **contre-auditer la règle sur le vrai journal exporté avant de coder** ;
  j'avais déjà codé (ft-v1107). J'ai donc fait le **procès de ma propre règle — elle l'a perdu**.
- ⛔⛔ **La médiane nue produit 2 FAUX INVALIDES** sur la structure réelle de Michel : une **vraie
  journée à 3 repas** écartée, et un **changement durable** 4 → 3 repas qui écarte **4 jours sur
  5**. 👉 ***Une médiane exclut par construction ce qui est en dessous*** — elle ne distingue pas
  *« inhabituel »* de *« mal renseigné »*, la distinction même qui était demandée.
- ⭐ **Cinq fractions mesurées** : toutes sauf la médiane nue donnent **0 faux valide et 0 faux
  invalide**, et ne se distinguent **que sur un cas** (2 repas / 402 kcal). **Michel a tranché :
  écartée** → **deux tiers de la médiane** (barre **3** chez lui). ⛔ La fraction reste un
  **choix, pas une mesure** — seul paramètre libre, écrit dans le code.
- ⛔ **Plancher à 1 pour l'OMAD** : sans lui la barre tomberait à 0 et rien ne serait jamais
  écarté chez quelqu'un qui mange une fois par jour.
- ⚠️ **Le CSV n'était PAS dans la session** : travail sur les mesures **relayées** par GPT — ni
  vérifiables, ni complètes (pas de macros par jour, pas de noms de repas). *Dit, pas sous-entendu.*
- **Version précédente :** `ft-v1107` + `ft-v1108`. ✅ **Déploiement vérifié vert** (run **#826**, `ce8a05b`) — c'est ce run qui a aussi mis ft-v1107 en ligne, resté 7 h 52 en file derrière un job bloqué.
- 🍽️⭐⭐ **L'APPORT ENTRE DANS LE MOTEUR DE TRAJECTOIRE** (ft-v1107), après le **contre-audit**
  d'une proposition GPT (`docs/NUTRITION-CONTRE-AUDIT-TRAJECTOIRE.md`). ⭐ **Vingt-huit
  paragraphes réduits à UN trou** : son axe « trajectoire » était **déjà en production**
  (ft-v1102) ; il manquait le **premier** maillon — le moteur **comptait** les jours de repas et
  ne **lisait jamais les calories**.
- ⛔⛔ **Un jour mal noté déformait la moyenne de 269 kcal/j** (1 798 au lieu de 2 067, mesuré).
  ⭐ L'indicateur qui le détecterait, `entreesParJour`, était **calculé depuis ft-v1021 et lu
  nulle part** — donnée morte (**R5**).
- ⛔⛔ **Aucun seuil inventé** : la barre est la **médiane des moments notés par jour de la
  personne**. Chez qui note 2 moments, elle vaut 2 et **rien n'est écarté** — *l'app ne décrète
  pas qu'il note mal.*
- ⛔⛔ **Et la jumelle comptait double (R8)** : la distorsion avait été chiffrée **sur « Ta
  semaine »**, et je la corrigeais **seulement dans la carte neuve**. Un seul propriétaire
  (`_joursAlimComplets`) ; les deux cartes ne diffèrent plus que par leur **fenêtre**.
- ⛔ **L'apport est un FAIT, pas un signal jugé** : ni couleur, ni bascule d'état (**P21**).
- ⚠️ **J'ai failli annoncer une régression inexistante** : 476 px contre 445 « en ft-v1102 » —
  rejoué sur la **même fixture**, 476 des deux côtés. *Deux mesures sur deux fixtures
  différentes ne se comparent pas.* Vraie mesure : carte +22 px, « Noter » **inchangé**.
- ⏭️ **NON FAIT, exprès — la récence de la mémoire alimentaire** : elle change ce que **Milo
  reçoit** (**R34**, décision de Michel). **Mesurée sans être appliquée** : quelqu'un qui a changé
  d'alimentation il y a 4 mois annonce à Milo *« Riz basmati (60×) »* comme déjeuner habituel —
  un aliment qu'il ne mange plus.
- **Version en ligne (live) :** `ft-v1106`. ⏳ **Déploiement à vérifier** (R18).
  ⚠️ Aucun déploiement backend.
- 🧪⛔⛔ **LE BANC D'ESSAI RETROUVE SA MÉMOIRE, ET CESSE DE FUIR** (ft-v1106). Michel :
  *« corrige les 3 lignes du banc et les fuites »*. **Aucun écran, aucun calcul de l'app n'est
  touché — c'est du code de TEST.**
- ⛔⛔ **Trois champs étaient forcés à `null` EN DUR**, au milieu de cinquante qui lisent la
  fixture (`S.wkt`, `S.cycle`, `S.dayState`). Mesuré : un persona *« il est fatigué, il a mal à
  l'épaule ce matin »* était **impossible à écrire** — tout comme un persona en cycle de force
  ou avec une séance en cours. ***Les trois situations où l'app en sait le plus sur la personne.***
- ⛔⛔ **Quatre données de la vraie personne partaient dans chaque persona** : `exSwaps` (les
  exercices qu'elle remplace **et sa raison**), `programmes`, `fasting`, `foodMode`. **3ᵉ fois**
  pour cette famille (`foodLog` ft-v1014, `missedLog`/`nextPlanned` ft-v1050).
- ⚠️⚠️ **Elles étaient CONNUES et épinglées depuis ft-v1014**, laissées en place au nom de
  **R34**. ⭐ Cette raison ne tenait pas, et c'est **mesurable** : `_vcApplyPersona` n'a **aucun
  appelant hors du banc**. ***Un report prudent finit par protéger le défaut lui-même.***
- ⚠️⚠️ **`foodMode` est le cas qui apprend quelque chose** : essayé avec `keto`, il semblait
  propre — parce que son **alias** `S.keto` était bien nettoyé, et que c'est lui que la règle
  cétogène lit. Essayé avec **`paleo`** (lu, lui, via `S.foodMode`), la fuite est grande ouverte.
  ***Une fuite refermée par un alias n'est pas refermée : elle est masquée par la valeur qu'on a
  choisie pour l'essayer.*** Un seul propriétaire depuis (**R2**) : `keto` se **dérive** de
  `foodMode`, comme `load()` le fait.
- ⏭️ **Ce que ça ne fait PAS** : les personas ne sont pas enrichis. **3 scénarios sur 55**
  donnent encore un historique à Milo, 0 un programme, 0 un cycle, 0 un état du jour — alors que
  **20 lui demandent de construire une séance**. *Ce qui change, c'est qu'on PEUT enfin les
  écrire.* L'expérience qui répondrait à la question de GPT (le même sportif, avec et sans sa
  mémoire) reste à lancer : **4 appels, ~0,05 €** — décision de Michel.
- **Version précédente :** `ft-v1105`. ✅ **Déploiement du site vérifié vert** (run **#816**,
  commit `8041baf`) — pas seulement poussé (**R18**).
- ⚖️⛔⛔ **LA PORTION PRÉ-REMPLIE N'EST PAS LA TIENNE** (ft-v1105). Michel envoie l'**étiquette**
  (88 g/100 g, dosette de 30 g) et **corrige mon explication de la veille** : *« pourtant j'ai
  écrit le code barre, je n'ai rien recopié »*. ⚠️⚠️ **Il a raison — §12quater DEUX FOIS dans la
  même journée** : le mécanisme de recopie est réel et mesuré, mais **je ne l'avais pas vérifié
  contre ce qu'il a FAIT**.
- ⛔⛔ **Le vrai chemin, reproduit** : le champ « Quantité » se remplit avec `serving_quantity`,
  **la portion que la fiche produit déclare** — et l'écran n'en disait rien. Mesuré : une fiche
  annonçant **40 g** produit **156 kcal · 35 g** sur ce pot, ***les deux chiffres de sa capture***.
  *Des valeurs justes pour une portion que personne n'a mangée.* ⛔ Le commentaire de
  `_bcProposerDerniere` disait **déjà** « la portion du fabricant » : le code le savait, l'écran
  ne le disait pas (**R32/R33**).
- ⛔ **On ne retire pas le pré-remplissage** (sans lui : 100 g, pire) — **on le nomme**. C'est mot
  pour mot ft-v1051 (*« on donne le choix et pas imposer »*), appliqué alors à la quantité de la
  **dernière fois** et pas à celle-ci : **R8**, 3ᵉ fois en deux jours. Les **deux** chemins sont
  traités (scan et photo d'étiquette).
- ⏭️⚠️ **NON ÉTABLI, et dit plutôt que conclu une 2ᵉ fois** : ***je ne sais pas quel chemin a
  produit SON entrée*** (`q=30` **sans** pour-100 g ≠ un scan réussi). ⭐ Deux hypothèses
  **éliminées par la mesure** : le pour-100 g **survit** au rechargement, et un scan réussi
  enregistre bien `q` **et** `per100`. 👉 **La réponse est dans son export CSV**, colonnes
  `saisie` et `source` (ft-v1097).
- **Version précédente :** `ft-v1104`. ✅ **Déploiement du site vérifié vert** (run **#813**,
  commit `ac782fb`) — pas seulement poussé (**R18**). ⚠️ Aucun déploiement backend.
- ♻️⛔⛔ **UNE VALEUR FAUSSE QUI SE RECOPIE — LE MÉCANISME DU « TOUJOURS »** (ft-v1104). Michel
  envoie **l'étiquette** : 88 g de protéines / 100 g, donc **30 g → 116,6 kcal · 26,4 g**.
  L'app portait **156 / 35** — **1,333× la vérité sur les deux nombres**, et **1,333 = 40/30**
  (des valeurs de dosette de 40 g sur une portion de 30). ⛔⛔ **Le « toujours » a un mécanisme,
  dans le code** : les suggestions ont pour source ① *ce que la personne a déjà noté*, donc une
  estimation fausse **se reprend en un tap, indéfiniment**. ***Une valeur fausse qui se recopie
  coûte plus cher que la valeur fausse d'origine.***
- ⛔ **Le garde-fou de ft-v1103 ne la voyait pas sur ce chemin, pour 2 raisons** : ① `af-bc-grams`
  vaut `"100"` dans le HTML **même caché** — il comparait 37 g à une portion que personne ne voit ;
  ② `e.q` (30 g, bien enregistré) n'était lu que dans la branche `per100` (**R4**).
- ⚠️⚠️ **Et une jumelle manquée par moi la veille (R8)** : `ef-grams` dans la modale,
  **`af-bc-grams`** à l'ajout — le contrôle était **aveugle sur tout le chemin code-barres**,
  là où arrivent justement les valeurs d'un produit emballé. *Le journal ne protège pas de ce
  qu'il documente.*
- ⭐⭐ **Le chemin fiable est MESURÉ** : le pour-100 g de la vraie étiquette sur 30 g rend
  **117 kcal · 26 g · 1 · 1**, au chiffre près et **en silence** (**R33** vérifiée sur son pot).
- ⚠️ **Ce que ça ne prouve pas** : le garde-fou n'attrape ce cas **que parce que la poudre titre
  88 %**. La même erreur de dosette sur du **poulet** ne déclencherait rien — *la règle attrape
  l'impossible, pas le faux*. ⏭️ Et **sa ligne reste fausse** : l'app la signale, ne la corrige pas.
- **Version précédente :** `ft-v1103`. ✅ **Déploiement du site vérifié vert** (run **#810**,
  commit `7a32e26`) — pas seulement poussé (**R18**). ⚠️ Aucun déploiement backend.
- ⚖️⛔⛔ **UNE VALEUR PEUT ÊTRE COHÉRENTE AVEC ELLE-MÊME ET IMPOSSIBLE** (ft-v1103). Michel,
  capture à l'appui : *« encore le souci avec la prot »* — **35 g de protéines + 1 + 1 = 37 g de
  matière dans une portion de 30 g**. ⛔⛔ **Le contrôle qui existait ne pouvait pas le voir, et
  il n'était pas en faute** : il compare les CALORIES aux MACROS, et elles collent (153 contre
  156, 2 % d'écart). 👉 ***Un garde-fou ne protège que de la question qu'il pose*** — il manquait
  la seconde, physique. Nouvelle famille **§39** de `BUGS.md`, suite de **§34**.
- ⭐⭐ **Reproduit par le vrai chemin avant d'écrire une ligne** (**§12quater**, la fois où j'ai
  livré une version entière sur une cause déduite d'un seul nombre) : la réponse du modèle entre
  telle quelle dans `S.foodLog` ; une réponse à 150 P / 80 G / 70 L pour 100 g y entrait aussi
  — **300 g dans 100 g**.
- ⛔ **Un seul propriétaire** (`_masseImpossible`, **R2**) dans la boîte de cohérence existante →
  **3 surfaces d'un coup** : estimation IA, ajout, modification. ⛔ **Grammes seulement** (100 ml
  de miel pèsent ~140 g). ⛔ **Aucun seuil à choisir** : la limite est l'**égalité** — huile et
  sucre sont à 100 % d'une seule macro et restent muets. ⛔⛔ **Et aucun bouton de correction** :
  l'app ne sait pas lequel des deux nombres est faux, et chez Michel c'est la **portion** qui est
  juste (**R29**).
- ⚠️⚠️ **AVEU** : le correctif est parti sur `master` dans un commit intitulé « journal de
  partage » — un `git add -A` a emporté `app.js`, donc **sans bump de cache** et sous un message
  qui ment. Corrigé ici, l'histoire n'est pas réécrite. ***Un `git add -A` ne dit pas ce qu'il
  ajoute.***
- ⏭️ **Non couvert, dit plutôt que sous-entendu** : l'alerte vit dans les **formulaires**, pas
  dans la **liste** du journal — une ligne déjà enregistrée ne se signale qu'à l'ouverture. Et la
  ligne de Michel **reste fausse** : l'app la signale, elle ne la corrige pas.
- **Version précédente :** `ft-v1102`. ✅ **Déploiement du site vérifié vert** (run **#805**,
  commit `cfd0246`) — pas seulement poussé (**R18**). ⚠️ Aucun déploiement backend : `Code.js`
  n'a pas été touché. ⚠️ **Le rendu sur Safari/iPhone n'a PAS pu être vérifié ici** (conteneur
  Chromium uniquement) — c'est à Michel de l'ouvrir sur son téléphone.
- 📏⛔⛔ **UNE PENTE QUI MESURAIT LA BALANCE, PAS LE CORPS** (ft-v1102) — **le vrai défaut du
  jour, et il n'était pas au programme.** `linearRegression` recevait l'**INDEX** du point
  comme abscisse aux **trois** endroits qui l'appelaient, puis le code faisait `slope*7` en
  croyant lire « par semaine ». **Mesuré, à évolution réelle identique (+0,20 kg/sem)** :
  tous les jours **+0,20** · tous les 2 jours **+0,40** · tous les 3 jours **+0,60** · **une
  fois par semaine +1,40 (×7)**. ⛔⛔ Et **ça partait en clair dans le contexte de Milo**.
  ⭐⭐ **ft-v1100 ne l'a pas créé, il l'a RÉVÉLÉ** : tant que le juge disait « ✓ bonne
  direction », une pente ×7 restait invisible. *Un garde-fou juste révèle les mesures fausses
  qu'il consomme.* Nouvelle famille **§38** de `BUGS.md`. ⛔ `linearRegression` **n'est pas
  touchée** (l'index est correct pour TRACER) ; un seul propriétaire `penteKgParSemaine`
  (**R2**) + un témoin qui refuse tout nouveau `slope*7` sur un index.
- 📉 **LA REFONTE DE L'ONGLET NUTRITION** (décision produit en 20 points, relayée par Michel).
  ⛔⛔ *« X kcal restantes »* cesse d'être l'information dominante : **le calcul ne change pas**,
  il est traduit en **aliments réels** juste dessous (*un nombre de calories ne se mange pas*).
  Le **type de journée** prend sa place (*« 🍚 Jour de séance »*), et **rien** sans cyclage ;
  la **cible**, elle, n'est plus écrite qu'**une fois** en en-tête — elle l'était **deux fois**.
  ⚠️ **Défaut attrapé à la CAPTURE** : l'aide `?` et la pop-up nommaient *« cible haute · jour
  de séance »*, un libellé d'une version intermédiaire — l'écran dit *« ↑ jour de séance »*.
  *Une aide qui nomme un repère inexistant est pire qu'une aide absente* (**§31**). Un témoin
  refuse désormais tout libellé cité qui ne sorte pas de `_etatMacro`.
  ⭐ Sous chaque anneau, un mot dit **pourquoi cette cible-là aujourd'hui** (cyclage de
  ft-v1098), et **« atteint »** est le **seul état coloré** — aucun rouge d'échec (**P21**).
  ⛔ **Pas de « pratiquement atteint »** : ce mot exigerait un seuil qu'**aucune source du
  projet ne fournit**.
- 📈 **LA CARTE « TON ÉVOLUTION »** — poids + charges + repas notés sur **14 jours**, **4 états**,
  **0 appel API** (mesuré : 0 requête sortante au rendu dans les 4 états, donc ça marche hors
  ligne). ⛔ Les charges se comparent **à répétitions égales** : un changement de schéma déplace
  le e1RM de **+26 %** à force identique, quand la quantification du matériel n'en produit que
  **1,78 %** — *aucun seuil en pourcentage ne peut trancher, seule la règle de comparaison le
  peut.* ⛔ Dans « données insuffisantes » : **aucune flèche, aucun pourcentage** (*une flèche
  est déjà une conclusion*), et **aucune injonction à remplir**. ⛔ **Milo n'apparaît que dans
  l'état ambigu**, sur appui volontaire, et reçoit les **tendances** — jamais le journal.
- ⭐ **Mesure avant/après, même fixture** : onglet **1 939 → 2 140 px** (plafond posé : ne pas
  revenir à 2 600) · *« Noter ce que je mange »* **525 → 525 px, inchangé au pixel** · carte du
  jour **445 → 445 px**, en portant **4 informations de plus**.
- ⏭️⚠️ **CE QUI N'EST PAS DANS CETTE LIVRAISON, et il faut le lire** : le **journal de
  mensurations** (§10 de la décision) et les **repas habituels** (§16) ne sont **pas**
  construits — pas commencés, pas différés à moitié. ⚠️ **Et une vérification demandée n'a PAS
  pu être faite ici** : *« le déploiement réel sur Safari/iPhone »* — le conteneur n'a que
  Chromium, **c'est à Michel de l'ouvrir sur son téléphone**.
- **Version précédente :** `ft-v1101`. ✅ **Déploiement du site vérifié vert** (run **#793**,
  commit `e94eeae`) — pas seulement poussé (**R18**). ⚠️ Aucun déploiement backend.
- 🏁⭐⭐ **UN CYCLE TERMINÉ NE LE DISAIT JAMAIS — NI À L'ÉCRAN, NI À MILO** (ft-v1101).
  `getCurrentCycleWeek` **plafonne** à `weeks` : juste pour une barre de progression, faux
  pour tout le reste. **Mesuré** : un cycle fini depuis 1 jour, 1 an et **six ans** rend un
  écran **identique** à celui de la dernière semaine — *« Semaine 12/12 — Décharge, 55 % 1RM »*,
  présenté comme la consigne du jour. ⛔⛔ **Et la même valeur partait chez Milo**, qui
  prescrivait donc une décharge sur un fait faux (**R4/R10**). ⭐ Un seul propriétaire
  (`cycleTermine`, **R2**), lu par l'écran **et** par le contexte. ⚠️ **On ne clôture pas tout
  seul** (**R29**) : `S.cycle` porte les 1RM de départ de la personne — on le dit, elle décide.
- ⏭️ **Cinq familles ont rendu du vide** (écrit pour ne pas refaire la chasse, **R23**) : le
  **texte libre** est bien échappé partout · le **timer** de repos s'appuie sur `Date.now()`
  donc résiste au sommeil · les **séries spéciales** comptent pareil partout · la **file** de
  synchro ne renvoie que `synced===false` · le **quota** reste gardé par `_premiumPending`.
- ⚠️ **Et quatre de mes sondes ne mesuraient rien avant d'être réparées**, toujours au même
  signe (*un résultat identique des deux côtés*) : `_demoMode` court-circuite `syncSheets`,
  `S.connected` manquait, la fixture du cycle employait `rm1s` au lieu de `exercises`, et je
  cherchais le **mot** « cycle » dans le contexte de Milo au lieu de ses **valeurs**.
- **Version précédente :** `ft-v1100`. ✅ **Déploiement du site vérifié vert** (run **#791**,
  commit `8e860f3`) — pas seulement poussé (**R18**). ⚠️ Aucun déploiement
  backend : `Code.js` n'a pas été touché.
- ⚖️⭐⭐ **UNE SEULE SOURCE POUR LES PLAGES DE POIDS** (ft-v1100). GPT tranche : *« corriger la
  contradiction des plages AVANT de construire le moteur de tendance »*. **C'était un défaut
  mesuré, donc c'est le seul code touché.** Mesuré : **+1,6 kg/sem** en « prise de muscle »
  partait vers Milo en *« ✓ bonne direction »* pendant que l'écran annonçait *« +0.1 à +0.3 »*.
  ⛔ **Une seule des six bornes était une DONNÉE** ; les cinq autres vivaient en **prose** dans
  une chaîne d'affichage, et `coach.js` appliquait des seuils écrits ailleurs. **R4 + R2.**
  ⛔ Table unique `_GOAL_TREND`, valeurs **transcrites au caractère près** ; texte **et couleur**
  dérivés de la table (avant, +1,6 s'affichait en **vert** sous « +0.1 à +0.3 »).
- ⭐⭐ **ET DEUX DÉFAUTS DE MA CORRECTION ONT ÉTÉ TROUVÉS PAR DES TÉMOINS EXISTANTS** : ① sur une
  plage **négative**, « au-dessus » veut dire **moins** — perdre 0,21 quand on vise 0,3–0,7 est
  plus **lent** ; ② une plage qui **finit à zéro** (recomposition) n'a pas d'axe « plus vite »
  vers le haut — à +0,7 on **prend** du poids. *Le mot ne se lit pas sur le nombre, il se lit
  sur le sens de l'objectif.*
- ⚠️ **CE QUE ÇA NE PROUVE PAS** : le correctif change ce que Milo **reçoit**. Le drapeau est
  vérifié en local ; **ce qu'il en DIT** demanderait une passe payante du banc d'essai (**R34**)
  — décision de Michel.
- 📐 **5 LIVRABLES DE SPÉCIFICATION, ZÉRO CODE** (`docs/NUTRITION-MOTEUR-TENDANCE.md` + PDF) :
  ⭐⭐ **le seuil de bruit du e1RM n'existe pas** — le e1RM ne peut pas varier de moins de
  **1,8 %**, et un simple changement de format de séance le fait bouger de **+26 %** à force
  identique. *Aucun seuil en % ne peut marcher* ; la règle qui marche est de comparer **à
  nombre de reps ÉGAL** (bruit **0,0 %**). ⭐ La proposition visuelle est **l'écran réel**
  (4 états capturés dans l'app). ⭐⭐ **Et la hauteur a été mesurée, pas affirmée** : la carte
  pleine pousse « Noter » de **+220 px**, la compacte de **+85 px** — c'est la compacte.
- **Version précédente :** `ft-v1099`.
- **Version précédente :** `ft-v1099`. ✅ **Déploiement du site vérifié vert** (run **#785**,
  commit `c18e971`) — pas seulement poussé (**R18**). ⚠️ Aucun déploiement backend : `Code.js`
  n'a pas été touché.
- 🚪⭐⭐ **LA TROISIÈME PORTE VERS L'EFFACEMENT — ET LA SEULE QUI NE DEMANDAIT RIEN**
  (ft-v1099). Michel : *« on continue sur les incohérences ? »*. **Charger un programme
  effaçait une séance en cours sans un mot** : mesuré par les vraies fonctions, **3 séries
  faites → 0**, et `ft4_wkt` réécrit sur le **disque** — le rechargement ne les ramène pas.
  **Règle d'or #3.** ⭐⭐ Le témoin de comparaison est à quinze lignes dans le même fichier :
  *« Annuler la séance »* et *« Vider la séance »* détruisent la même chose et **demandent
  toutes les deux** (**R8**) — et le texte de « Vider » dit même *« pratique si tu as chargé
  le mauvais programme »*. ⛔ On ne demande **que** s'il y a du travail fait à perdre
  (**R29/R24**) : le geste de tous les jours reste un seul tap.
- ⚖️⛔ **LE PROFIL RESTAURÉ N'AVAIT AUCUNE BORNE** (ft-v1099), alors que la saisie manuelle en
  a depuis toujours. Mêmes valeurs par les deux chemins : à la main **refusé**, restauré
  **accepté** — âge 500, taille 20 cm, repos 999 999 s → **TDEE = −2 433 kcal**, et Milo
  reçoit « 500 ans ». C'est **§35 pour la 5ᵉ fois**, toujours dans le même sens. ⚠️ Et ça ne
  se voyait pas : le **plancher** de `calcMacros` ramenait la cible affichée à 1 500 kcal.
- 🏅 **Le badge disait « 5 PRs battus »**, le code compte les **exercices ayant un record**
  (ft-v1099). On corrige le **texte** : durcir le code retirerait le badge à ceux qui l'ont
  déjà (**R29**).
- ⏭️ **RESTE OUVERT, mesuré mais pas corrigé** : un **record survit à la suppression de sa
  séance** et atteint Milo. Le recalcul automatique est refusé exprès depuis ft-v1085 (il
  effacerait un record importé). La bonne forme est de **prévenir** à la suppression — c'est
  une décision produit, elle attend Michel. Noté dans `docs/JOURNAL-DE-TEST.md`.
- **Version précédente :** `ft-v1098`. ✅ **Déploiement du site vérifié vert** (run **#781**,
  commit `1849ccd`) — pas seulement poussé (**R18**). ⚠️ Aucun déploiement
  backend : `Code.js` n'a pas été touché.
- 🔭⭐⭐ **LA CIBLE DU JOUR N'EST PAS LA CIBLE DE TOUS LES JOURS** (ft-v1098). Michel :
  *« continue sur la nutrition stp »*. Suite de l'analyse GPT — **et elle commence par me
  corriger moi-même** : mon doc du matin écrivait *« lipides 56 g = plancher »*, **faux** —
  c'est une **cible** (`bw × 0,9` = 76 g), 56 g est la valeur d'un **jour de séance**, le
  plancher vaut 50,4 g. *La décision ④ posée à Michel reposait sur mon erreur : retirée.*
- ⛔⛔ **① LA FRÉQUENCE DIVISÉE PAR DES SEMAINES QUI N'EXISTAIENT PAS.** `cycleGlucides` faisait
  `f = round(somme / 4)`, **toujours**. Mesuré : 2 semaines à 3 séances/sem se lisaient **2**,
  1 semaine à 4 séances/sem se lisait **1**. ⚠️ **Et l'effet est à l'envers** : l'amplitude vaut
  `(7−f)/7`, donc *le pratiquant le plus récent recevait le cyclage le plus agressif* (52 g de
  lipides pour un plancher à 50,4). Son voisin `_pendingFreqContext` se protégeait déjà —
  **R8**. ⛔ Le bon dénominateur n'est pas « les semaines non vides » (une semaine **sautée**
  fait partie de la fréquence) mais **l'étendue de l'historique**, en `ceil` — *un témoin
  existant a attrapé mon `round`* (−67 g sur la neutralité hebdo). Famille **§37** de `BUGS.md`.
- ⛔⛔ **② L'ÉCRAN NE MONTRAIT QU'UN BOUT.** Le moteur prescrit **368 à 478 g** de glucides et
  **56 à 82 g** de lipides à la même personne selon le jour (26 % et 38 %). *Deux valeurs
  justes, une seule affichée* — le défaut de ft-v1027. La carte **nomme** le jour, les **deux
  bouts** vivent dans « comment c'est calculé » (**R25**), calculés par le moteur (**R2**).
- ⭐⭐ **LA « ZONE » DE GPT N'AVAIT AUCUN POURCENTAGE À INVENTER — elle était déjà calculée.**
  Je cherchais un ±5 %/±10 % à faire trancher : *la zone, ce sont les deux bouts de sa propre
  semaine*. **Décision ① tranchée par la mesure.** ⛔ Et les **protéines n'en ont pas**
  (amplitude **0 g**) : on ne leur en invente pas une (**R29**).
- ⏭️ **CE QUI RESTE OUVERT** : les décisions **②** (combien de jours notés avant un verdict) et
  **③** (l'app conclut-elle seule, ou passe-t-elle la main à Milo) — de vrais arbitrages
  produit, que la mesure ne peut pas trancher. Et côté imports : **programme**, **code-barres**,
  **bilan sanguin** ne sont toujours pas instruits.
- ⭐ Au passage : une demi-portion s'écrit **« 1½ »** et non « 1.5 » — trouvé à la **capture**,
  un seul propriétaire du libellé (`_portionLbl`, **R2**).
- **Version précédente :** `ft-v1097`. ✅ **Déploiement du site vérifié vert** (run **#777**,
  commit `51dbf18`) — pas seulement poussé (**R18**). ⚠️ Aucun déploiement backend : `Code.js`
  n'a pas été touché.
- 📤⭐ **DEUX EXPORTS DATÉS — NUTRITION ET POIDS** (ft-v1096). Michel : *« il faudra aussi
  créer un export daté de la nutrition et aussi côté poids »*. Ils **réutilisent le patron**
  de `exportHistoCsv` (**R13**) : `;` + BOM (sans lui Excel FR ouvre le `,` en UNE colonne),
  feuille de partage iOS, toast qui sait dire « je ne sais pas ». ⛔ **Un seul propriétaire
  de l'échappement** (`_csvEchappe`/`_csvFichier`, **R2**). La nutrition exporte aussi
  `saisie` et `source` — sans la provenance, on ne sait plus si une valeur a été **scannée**,
  **tapée** ou **estimée** (**R33**). ⚠️ Le poids lit `kg`, **pas** `bw`.
- 🩹⭐⭐ **LE DOUBLON QUE LE CORRECTIF DE LA VEILLE FABRIQUAIT** (ft-v1096). La fusion
  multi-onglets de ft-v1094 signait une séance `date|nb|volume` — or ***corriger une charge
  change le volume***, donc la version corrigée et celle du disque avaient deux signatures et
  l'union **gardait les deux**. *Le correctif qui répare une perte de séance en fabriquait un
  doublon*, celui que ft-v1083 venait de nettoyer, déclenché par le geste le plus banal.
  ⭐ **Le propriétaire existait déjà, à trois endroits** : `s.ts || s.id` (**R2**).
  ⚠️ **Risque symétrique mesuré AVANT d'écrire** : avec un repli `date|nb`, deux VRAIES
  séances du même jour fusionnaient en UNE — un doublon échangé contre une **perte**, le
  mauvais sens (**R29**). D'où le **nom du 1ᵉʳ exercice** dans le repli : il ne bouge pas
  quand on corrige un poids. Six cas mesurés, six verts.
- 🧭 **L'onglet « Poids » devient « Corps & santé »** (choix de Michel) : il porte aussi les
  corrélations, le bilan corporel et le bilan sanguin. Mesuré à 3 largeurs — identique à 390
  et 375 px, +18 px de haut à 320 px (le libellé passe sur deux lignes, rien ne déborde).
  ⚠️ Ma 1ʳᵉ sonde mesurait **0 partout** en annonçant « ne déborde pas » : `goScreen`
  **préfixe lui-même** par `s-`. Elle vérifie désormais que l'écran est ACTIF avant de mesurer.
- **Version précédente :** `ft-v1096`. ✅ **Déploiement du site vérifié vert** (run **#775**,
  commit `b1e0c1e`) — pas seulement poussé (**R18**). ⚠️ Aucun déploiement
  backend : `Code.js` n'a pas été touché, le correctif vit dans `state.js` et `tracking.js`.
- ⚖️⭐⭐ **LE POIDS LU PAR L'IA A LES MÊMES BORNES QUE LE POIDS SAISI À LA MAIN** (ft-v1096).
  Michel : *« continue avec les autres imports mais regarde ce que j'ai vu avec gpt »*.
  Mesuré par le vrai chemin (la lecture IA remplit le formulaire, puis on Enregistre) : un
  rapport de balance mal lu à **3 000 kg** entrait dans le bilan, **dans le journal de poids**
  et **dans le profil** → **TDEE 47 900 kcal**, et toute la nutrition fausse ensuite. Un **%
  de gras à 300 %** entrait pareil. ⭐⭐ **Le témoin de comparaison est ce qui rend le défaut
  lisible** : la saisie **manuelle** du même chiffre était refusée depuis toujours (20–300 kg).
  *Deux portes vers la même donnée, une seule fermée* — **R8**, 4ᵉ fois cette semaine, et le
  motif est constant : **le chemin automatique est toujours le moins protégé que son équivalent
  manuel**. Nouvelle famille **§35** de `BUGS.md` (les 4 cas en table). ⛔ Un seul propriétaire
  des bornes (`_poidsValide`, `_pctGrasValide` dans `state.js`, **R2**). ⛔ On écarte la
  **valeur** (% de gras) mais on refuse le **bilan** entier sur un poids aberrant — la
  granularité suit le coût de l'erreur (**R29**). ⭐ Et le refus dit **où regarder** : « la
  lecture de la photo s'est trompée » d'un côté, « corrige la valeur » de l'autre.
- ⏭️ **CE QUI RESTE, dit plutôt que sous-entendu** : l'import de **PROGRAMME**, le
  **CODE-BARRES** et le **bilan sanguin** n'ont **pas** été instruits. *La famille n'est pas
  fermée.*
- 🍽️ **ANALYSE NUTRITION DE GPT — un document, zéro code** (`docs/NUTRITION-ANALYSE-GPT.md`).
  Le document demande explicitement de **ne rien implémenter** avant validation. Traité comme
  un audit, donc **mesuré** : son **§3** décrit un défaut corrigé en **ft-v949** (et le défaut
  réel était l'inverse — la séance comptée deux fois) ; ses **§4** et **§10** décrivent un
  écran **antérieur à ft-v1025**. ⛔ Ses **§1, §2 et §9 sont fondés** — ⚠️ ma première mesure,
  faite **sans aliment noté**, disait le contraire ; re-mesurée avec des aliments, les lignes
  sont bien là. Le doc porte la chaîne chiffrée (BMR 1743 → TDEE 2702 → objectif 3152), la
  table du cycle glucidique, les 7 réponses, et **4 décisions qui attendent Michel** (largeur
  de la zone · seuil de tendance · droit de conclure · plancher lipidique).
- ⚠️⚠️ **LEÇON DE SONDE — trois noms de champ inventés dans la même passe** (`ft4_weight` pour
  `ft4_wlog`, `fatPct` pour `bf`, `p/c/f` pour `prot/carbs/fat`). *Chacun rend **zéro**, et
  zéro ressemble exactement à une perte de données.* Nouvelle famille **§36** de `BUGS.md`.
- **Version précédente :** `ft-v1095`. ✅ **Déploiement du site vérifié vert** (run **#772**,
  commit `336c674`) — pas seulement poussé (**R18**). ⚠️ Aucun déploiement backend : `Code.js`
  n'a pas été touché, tout le correctif est dans `state.js`, `log.js` et `coach.js`.
- 📥⭐⭐ **CE QU'UN MODÈLE HALLUCINE N'ENTRE PLUS DANS L'HISTORIQUE** (ft-v1095). Michel :
  *« vas-y attaque les imports »* — 5ᵉ passe, la dernière famille non instruite. Mesuré en
  rendant à l'app, **par ses vraies fonctions**, ce qu'un modèle peut lui renvoyer :
  `500 kg × 50 reps` posait un record de **1 060 kg de 1RM**, une charge négative un record de
  **−90 kg**, les dates `1900`, `2099` et même « le mardi » entraient telles quelles, et un
  `exercises` mal typé faisait **planter** l'import avec une trace technique à l'écran.
  ⭐⭐ **Le cas instructif est `500 × 50`** : chaque valeur passait les bornes existantes — c'est
  la **combinaison** qui est impossible (`bz()` plafonne les répétitions à 20). *Borner les
  entrées ne suffit pas, il faut borner ce qui SORT.* ⛔ Les bornes ont désormais **un seul
  propriétaire** (`_serieValide`), partagé avec `coach.js` **qui les avait déjà** (**R8**).
  ⛔ On écarte la **série**, pas la séance ; une date invalide écarte la séance ; **et on le
  dit**. Nouvelle famille **§34** de `BUGS.md`.
- ⏭️ **Ce que ça ne couvre pas** : seul l'import d'**historique** a été passé au banc. Le
  programme, le bilan sanguin, le bilan corporel et le code-barres partagent la même mécanique
  (une réponse de modèle consommée telle quelle) — **c'est la suite, pas une conclusion**.
- **Version précédente :** `ft-v1094`. ✅ **Déploiement du site vérifié vert** (run **#769**,
  commit `74913bc`) — pas seulement poussé (**R18**). ⚠️ Aucun déploiement backend cette fois :
  `Code.js` n'a pas été touché, le correctif est entièrement dans `state.js`.
- 🪟⭐⭐ **DEUX ONGLETS OUVERTS, ET LE DERNIER QUI ÉCRIT EFFACE L'AUTRE** (ft-v1094). Michel :
  *« on continue avec les incohérences ? »* — 4ᵉ passe, six familles neuves, **une seule a
  mordu** et elle touche la **règle d'or #3**. `persist()` écrit **tout `S`** depuis la mémoire
  de l'onglet qui l'appelle ; or l'app est une **PWA**, très souvent ouverte à deux endroits
  (l'icône de l'écran d'accueil **et** un onglet du navigateur) qui partagent le même stockage.
  Mesuré : l'onglet B termine une séance (1 séance + 1 record sur le disque), l'onglet A règle
  son temps de repos → **0 séance, 0 record**, que le rechargement ne ramène pas. ⚠️ Rien ne
  protégeait — **aucun** écouteur `storage` dans le dépôt. ⛔ Le correctif ne change **rien** au
  cas normal (un seul onglet ⇒ aucune fusion), et la **suppression volontaire** reste possible.
  Nouvelle famille **§33** de `BUGS.md`.
- 📏 **CE QUI N'A RIEN RENDU, écrit pour ne pas refaire la chasse** : hors ligne rien ne se perd ·
  les 8 dates rares (1ᵉʳ janvier, 1ᵉʳ du mois, 29 février, changement d'heure…) ne cassent rien ·
  les « seuils écrits deux fois » étaient tous des nombres égaux **par hasard**. ⏭️ **Les imports
  n'ont pas été instruits** — c'est la famille qui reste pour une 5ᵉ passe.
- **Version précédente :** `ft-v1093`. ✅ **Les DEUX déploiements sont verts** — site
  (run **#764**) et backend Apps Script (run **#104**), vérifiés sur le commit `da33cf1a` et
  pas seulement poussés (**R18**).
- 🔙⭐⭐ **LE BOUTON RETOUR ÉTAIT LA 3ᵉ PORTE, ET LA SEULE ENCORE OUVERTE** (ft-v1093). Michel :
  *« continue à chercher des incohérences »* — 3ᵉ passe. ft-v1091 avait fait passer le glissement
  du doigt par `_closeOverlayProper` ; le gestionnaire `popstate`, lui, faisait
  `classList.remove('open')` en direct. **Sur Android, le retour EST le geste de fermeture.**
  Mesuré : `closeBarcodeScanner` appelée **0 fois** → *la caméra reste allumée* · `ft4_wn_seen`
  toujours `null` → les pop-ups « une seule fois » **reviennent à chaque démarrage** (ft-v629) ·
  les 3 écrans `data-no-dismiss` **fermés quand même** · et il fermait le **mauvais** écran
  (`.pop()` rend le dernier du HTML, or `ov-confirm` porte `z-index:10000` et se trouve **avant**
  `ov-sess-detail` → le détail se fermait et la question « Supprimer ? » restait à flotter).
- 🍽️⭐⭐ **LE RÉGIME ET LE JEÛNE N'ÉTAIENT STOCKÉS NULLE PART** (ft-v1093). Envoyés depuis le
  02/08, attendus au retour — et **aucune ligne de `Code.js` ne les écrivait**. Aller-retour
  mesuré : keto + 16/8 partent, **reviennent vides**, les glucides passent de **39 g à 432 g**.
  Idem `goalLog`, **cassé des deux côtés** : c'est la panne que ft-v1010 disait avoir réparée.
- 📝 **ET 5 TEXTES QUI ANNONÇAIENT UN CHIFFRE QUE LE CODE N'APPLIQUE PLUS** (ft-v1093) :
  « Timer 45 s », « repos 20 s entre chaque palier », « 7 derniers jours » pour une fenêtre de
  14, « 18 badges » pour 19, un bouton « 📉 −10% » qui n'existe plus. + le **contrôle 12** de
  `check_regles.py` : l'archive ne peut plus porter deux fois la même entrée (7 doublons retirés).
- **Version précédente :** `ft-v1092`. ✅ **Les DEUX déploiements sont verts** — backend
  Apps Script (run #102) et site (run **#759**), vérifiés sur le commit et pas seulement poussés
  (**R18**). ⚠️ Il a fallu **trois tentatives** : délai dépassé de 10 min sur Pages, puis une
  relance de ma part qui a **dupliqué l'artefact** — sur ce workflow, on lance un **nouveau run**
  (`workflow_dispatch`), on ne relance jamais les jobs échoués. Détail : `docs/GALERES-ET-LECONS.md`.
- 🔐 **LA SANTÉ VIT DANS SA PROPRE CLÉ** (ft-v1092, go de Michel). ⭐⭐ Son idée est **plus
  forte que la promesse** de la politique : celle-ci dit que les outils ne montrent que le
  nécessaire (garantie de **comportement**) ; deux clés `u_`/`h_` en font une garantie de
  **construction** — l'outil ne l'a pas en main. Le détecteur de séries abîmées en est la
  preuve : il ne lit que `u_`, donc il est **aveugle à la santé sans avoir été modifié**.
  ⛔⛔ **Le garde-fou** : la santé est écrite dans `h_` **et relue** avant d'être retirée de
  `u_` — *aucun ordre ne la retire avant qu'elle soit confirmée ailleurs*. Repli sur l'ancien :
  un compte non migré se charge exactement comme avant (**règle d'or #3**).
  ⛔ **Trois chemins alignés en même temps** : suppression de compte (sinon la séparation
  *créait* une fuite), sauvegarde Drive (sinon perte des bilans dès le lendemain), compression.
  ⚠️ **Ce que ça ne fait pas** : ça ne retire pas l'accès à l'auteur — ça supprime l'exposition
  **incidente**.
  ⏭️ **À surveiller chez Michel** : les comptes migrent **à leur prochaine sauvegarde**, pas
  d'un coup. Tant que `h_` n'existe pas pour quelqu'un, sa santé reste dans `u_` — c'est voulu.
- **Version en ligne (live) :** `ft-v1091`.
- 👆⭐⭐ **CE QU'UNE FERMETURE AU DOIGT EMPORTE — dont la CAMÉRA** (ft-v1091). Michel :
  *« continue à chercher des incohérences »*. Même méthode qu'en ft-v1089 — **des détecteurs,
  pas des avis** — en privilégiant ceux qui **mesurent un comportement**.
  ⛔⛔ **Le plus gros : le scanner de code-barres fermé en glissant laissait la caméra
  ALLUMÉE.** `closeBarcodeScanner()` est la seule chose qui coupe le flux, et `#ov-bc-scan`
  n'était déclaré nulle part dans `_OVERLAY_CLOSERS` (ni fermeture au clic sur le fond).
  L'écran disparaissait, le voyant vert restait allumé, **rien ne le disait**. *4ᵉ fois pour
  la famille R15 (§26 de `BUGS.md`) — et la première qui touche un capteur.*
  ⛔⛔ **Le bandeau « sauvegarde en ligne en pause » était effacé par l'écran qui le porte** :
  deux propriétaires de `#email-verify-card` (**R2**), et `renderSetup()` appelle le mauvais.
  ft-v788 avait rendu ce refus visible ; il redevenait muet au 1ᵉʳ changement d'écran.
  ⭐ Le drapeau `ft4_auth_refus`, **écrit depuis ft-v788 et relu par personne** (R5), sert
  enfin — **avec sa guérison**, sinon on remplacerait un silence par un cri permanent.
  ⛔ La réponse *« comment as-tu dormi ? »* était perdue si on refermait avant la 2ᵉ question —
  et perdue **aléatoirement** (n'importe quel `persist()` ultérieur la rattrapait), ce qui est
  pire qu'une perte franche. ⛔ Le guide fermé au doigt n'enchaînait plus la proposition
  d'installation, **définitivement** (`ft4_guide_shown` est déjà posé).
  ⚠️ **Et un témoin de contrôle a sauvé ma 1ʳᵉ sonde** : elle remplaçait `_bcReader` sur
  `window`, alors que c'est un `let` de portée fichier — *elle mesurait ses propres variables*.
  ⚠️ **Deux faux positifs de mes détecteurs, à savoir avant de refaire la chasse** : un `id=`
  « en double » qui était dans un **commentaire HTML**, et **24 clés `ft4_*`** « jamais
  relues » qui le sont par un **helper** (`_lsJson`) ou une **constante**.
- 🩹 **« null » DANS LE CHAMP KG — et c'est le correctif de la virgule qui avait ouvert le trou**
  (ft-v1090). Capture du compte d'**Eline** : `10 reps × null kg` sur deux séries.
  ⛔⛔ **La cause vient de Michel** : *« Eline avait mis des valeurs, et si je dis pas de bêtises
  c'est en mettant la virgule »*. La chaîne : ① **ft-v1057** fait passer ce champ de
  `type="number"` à `type="text"` **en laissant `+this.value`** — or `type="number"` était la
  **seule** chose qui le protégeait ; ② `+'62,5'` = `NaN` ; ③ `JSON.stringify(NaN)` vaut
  **`null`** ; ④ le mot « null » s'affiche.
  ⚠️ **Sa valeur est PERDUE, pas masquée** — on ne la devine pas à sa place (**R29**).
  ⭐⭐ **La leçon devient la famille §30 de `BUGS.md`** : *un correctif qui retire un garde-fou
  sans mettre le sien fabrique un bug pire que celui qu'il répare* — un champ **oublié** garde
  son comportement, celui-là a été **rendu plus fragile**. ⚠️ Signal d'alerte : se méfier d'un
  correctif qui annonce un **nombre** (« 22 champs ») — *il dit ce qui a été traité, jamais ce
  qui a été manqué*.
  ⏭️ **Reste ouvert** : le champ du **détail de séance** est réparé ; il faudrait vérifier chez
  Eline s'il reste d'autres séries à `null` ailleurs (elles sont réparables à la main, le champ
  fonctionne maintenant).
- 🛡️ **UN RECORD PLUS VIEUX QUE L'HISTORIQUE DE SON EXERCICE EST INTOUCHABLE** (ft-v1087).
  ⛔⛔ **Trouvé par Michel sur ses vraies données**, aperçu à l'appui, deux heures après
  ft-v1085. La règle ③ ne protégeait que *« aucune séance DU TOUT »* — trop étroit : son
  `Développé Décliné` porte un record du **14/06**, or **l'app est née le 17 juin**. La séance
  qui l'a fait ne peut pas être dans l'historique ; mais l'exercice a des séances plus
  **récentes**, donc il échappait à la protection. ***Appliquer aurait effacé un vrai record.***
  👉 Un record **antérieur à la plus ancienne séance de son exercice** — ou **sans date** — est
  invérifiable par construction : gardé tel quel, affiché à part avec les deux dates.
  ⛔ **La protection ne vaut que pour une BAISSE** (une montée est prouvée par l'historique) :
  son `Pec Deck`, tout aussi ancien, monte toujours.
  ⭐ **La leçon** : le garde-fou existait, était nommé et testé — il ne couvrait qu'**un** des
  deux chemins. *C'est l'aperçu montré à quelqu'un qui connaît ses données qui a trouvé
  l'autre* (**R29** : montrer avant d'écrire n'est pas une politesse, c'est un contrôle).
- 🏅 **RECALCULER LES RECORDS DEPUIS L'HISTORIQUE** (ft-v1085, admin). Un faux record **mesuré**
  dans ses données : `Rowing Hammer Strength` portait **exactement les chiffres de son Tirage
  Poulie Haute**, même date — le fantôme du renommage de ft-v1073. Faux **vers le haut**, donc
  jamais battu, donc éternel, et il sert de référence aux charges que Milo propose.
  ⛔⛔ **Ne supprime JAMAIS un record qu'il ne peut pas vérifier** (aucune séance → gardé tel
  quel, listé à part) · **aperçu d'abord**, le bouton rouge naît de l'aperçu (R29) · la règle
  d'éligibilité est **celle de la production** (`_serieFaitFoiPourPR`, R2).
  ⭐ Monter et baisser sont **séparés à l'écran** : une montée est prouvée par l'historique, une
  baisse suppose que la séance qui a fait le record est encore là.
  ⏭️ **Chez Michel** : Profil → Admin → « 🏅 Comparer avec mon historique » — 6 corrections
  attendues (dont 2 vers le haut). Rien n'est écrit avant qu'il confirme.
- ☎️ **LE 429 DE MILO — et j'ai dit une bêtise dessus** (ft-v1085). Michel en séance :
  *« Erreur : HTTP 429. Vérifie ta connexion et réessaie »* en 5G, 97 % de batterie. Le Worker
  écrivait la vraie raison **dans le corps** ; l'app la jetait (**R4**).
  ⚠️⚠️ **J'ai annoncé « ton quota du jour est épuisé » — FAUX**, prouvé par *« il a répondu
  après »*. Le plafond du Worker est un drapeau tenu **en mémoire de chaque isolat** Cloudflare
  (« approximatif par construction », c'est écrit dans `worker.js`) : un isolat avait levé le
  sien pendant les 52 appels du banc d'essai, la requête suivante est tombée sur un autre.
  ⛔ **Ce rouge a produit un garde-fou** : le corps porte aussi des jetons écrits pour le code
  (`quota`, `rate_limit`) — `_phraseServeur` est le seul propriétaire de « ce texte est-il
  adressé à un humain ? », et **en cas de doute on n'affiche rien**.
  ⭐ Avec : le **dénominateur du Gardien** (un numérateur seul n'est pas un taux) et la garde
  `_evRunning` (**une mise à jour ne tue plus une passe de banc d'essai payante**).
- 🦴 **UNE SÉANCE A UN SUJET — MILO EST ENFIN PRÉVENU** (ft-v1084). Michel : *« j'ai pas envie
  que Milo me repropose une séance bizarre »* + *« ça me fait dépenser de l'API en lui disant »*
  + *« si un mec demande une séance et qu'il sort ça, ça fait pas sérieux »*.
  ⛔⛔ **R8 pur** : `_movPattern()` classe le soulevé de terre ET le roumain en `hip-hinge`
  **depuis toujours**, `_validationSeance` le signale depuis ft-v1080 — **mais après coup**.
  *Rien, dans ce que Milo reçoit, ne lui disait de ne pas l'écrire.*
  ⛔ Règle posée dans le **bloc personnel** (hors du plafond de 46 500) → 0 dilution, 0 appel.
  ⭐⭐ La 3ᵉ ligne — **ce qui reste permis** — vient de la mesure sur **140 séances réelles** :
  sans elle, Milo refuserait un dos complet. ⚠️ **2ᵉ fois** (déjà le 22/08) : EV-041 existait,
  mais il mesure l'**ordre** — la séance réordonnée le passerait. D'où **EV-055** (composition).
  ⏭️ **LE BANC D'ESSAI N'A PAS TOURNÉ** : Worker en 403, Apps Script en 403, aucune clé API.
  On sait que la règle **arrive** ; pas qu'elle est **suivie**. **Seul Michel peut lancer la
  passe** (Profil → Admin → 🧪, devis affiché avant confirmation).
- 🔌⭐⭐ **ON A APPUYÉ SUR LES 166 BOUTONS, UN SEUL PLANTAIT** (ft-v1089). Michel : *« trouve
  des incohérences, moi je ne peux pas lire le code »*. ⛔⛔ **On n'écrit pas d'avis, on écrit
  des détecteurs** — la veille, 2 lignes d'audit sur 4 étaient fausses ou périmées.
  ⭐⭐ **Le détecteur qui a tout trouvé n'analyse rien : il APPUIE.** « 🔌 Tester la connexion »
  (Profil → Admin) plantait à sa **première ligne** sur un élément retiré du HTML — donc
  **aucun test, aucun message**. ⚠️ Sa voisine `updSetup()` lit le MÊME élément **avec** une
  garde : *le même trou, deux lectures, une seule protégée* — d'où l'invisibilité totale.
  ⭐⭐ **Le vrai livrable est le balayage devenu PERMANENT** (bloc CXCIV) : les 166 boutons
  rejoués à chaque livraison, avec le NOMBRE épinglé pour qu'il ne puisse pas être vert à vide.
  ⚠️ **Le reste de la chasse a surtout rendu du VIDE, et c'est une bonne nouvelle** : 1473
  fonctions, 1454 atteignables, 19 orphelines dont **5 faux positifs** et **2 retraits
  volontaires** documentés ; **zéro bouton** pointant vers une fonction inexistante ; et les 3
  « données mortes » étaient des faux positifs de mon propre compteur.
- 🧹⭐⭐ **LA SUITE DU LOT D'AUDIT — et l'un des quatre est RÉFUTÉ** (ft-v1088).
  ⛔⛔ **① La projection ne regardait que le squat** : un soulevé de terre à **180 kg** était
  projeté comme un **débutant total** (+10,8 %). `getLevel` (dormante depuis ft-v385) réveillée
  après avoir cherché POURQUOI elle dormait (R30) — l'indice 4 est enfin atteignable.
  ⛔ **② « Femme = fessiers »** : une priorité **déclarée** décide maintenant quel que soit le
  sexe. ⏭️ Ce que reçoit une femme qui n'a **rien** déclaré n'est **pas tranché** — arbitrage
  produit, pas correctif.
  ⭐⭐ **③ La course `_saveCoachMemory` est RÉFUTÉE, aucune ligne touchée** : 3 appels concurrents
  sont sérialisés, un échec réseau ne détruit rien, et le jeton a déjà deux propriétaires. Trois
  témoins figent la décision pour que personne ne la « répare ».
  ⛔ **④ L'étape 1 ne finissait jamais** : `phase` est posée à 1 et rien ne l'avance — Milo
  redemandait de « tenir 3 semaines » à quelqu'un qui s'entraîne depuis douze, et le préparait à
  une suite **qui n'existe pas**. On arrête de promettre ; l'étape 2 reste à concevoir.
  ⚠️⚠️ **Et mon témoin a rougi sur du code juste** : il cherchait « tenir 3 semaines » et
  attrapait **sa propre négation**. *On cherche la CONSIGNE, pas les mots* (3ᵉ fois).
- 🧹⭐⭐ **LES QUATRE PETITS DÉFAUTS DE L'AUDIT** (ft-v1086). Michel : *« lance tout ce que tu
  peux, il faut avancer »*. ⛔⛔ **① Deux conventions de sexe opposées** — mesuré, `"Homme"`
  donnait **TDEE de femme (1524) + plancher d'homme (1500)** ; le chemin est la **restauration**,
  qui écrivait `S.gender` **sans garde**. Normalisation à l'entrée + un seul propriétaire.
  ⛔ **② Rouvrir un bilan lu par l'IA effaçait sa provenance** (et `lmDeduite` avec) — défaut
  **créé** par le correctif qui l'entoure, posé avant qu'on sache quel bilan on ouvre.
  ⚠️⚠️ **③ L'audit était PÉRIMÉ** : le contrôle `exSwaps` existait ; le vrai défaut était la
  comparaison sur le **nom exact** — « Developpe Couche » rendait **0 signalement** (ft-v1035).
  ⛔ **④ L'écran expliquait un calcul abandonné le 02/08** (*« ~36 h »* contre 48 h réelles), et
  la contraception hormonale affichait **« Jour null/0 »**.
  ⚠️⚠️ **Et deux de mes sondes ne mesuraient RIEN** avant d'être réparées : l'une sortait par le
  verrou santé (même résultat des deux côtés = un vert qui ne peut pas rougir), l'autre
  **recopiait les formules** au lieu de lire le comportement. Chacune porte désormais un témoin
  dont le seul rôle est d'empêcher ce vert muet.
- 🧩➡️ **« SÉANCE SANS SUJET » — SUJET PRIS PAR SESSION-B** (01/09). Michel : *« l'autre claude
  s'occupe des séances bizarres »*. ⛔ **session-A n'y touche plus.**
  ⭐ Le volet **sécurité** est livré (ft-v1080) ; le volet **cohérence** est chez eux, rien n'est
  encore construit.
  ⛔⛔ **La mesure décisive est la leur** : les 3 critères passés sur les **39 vraies séances**
  de Michel (export CSV, vraies fonctions de l'app). **A → 11/39 · B → 22/39** — *un avertissement
  qui sonne sur une séance sur deux n'est pas un avertissement* (R19). **Notre E → 2/39, donc PAS
  0 faux positif** : il attrape aussi le 05/07, une journée jambes classique.
  ⭐⭐ **Leur apport** : le discriminant est la **RÉGION**, pas le nombre de familles —
  `squat+charnière` = deux familles du bas (normal), `charnière+tirage` = bas + haut (sa séance).
  **E′ = 1/39.** ⚠️ Et un aller-retour instructif : desserrer « exactement 2 » en « au moins 2 »
  faisait sonner un **full body volontaire** — le fait faux qu'on avait nommé (R29/P4).
  👉 Détail chiffré et limites : `IDEES-FUTURES.md` (§ « une séance sans sujet »).
- ✅ **Les deux déploiements de ft-v1087 sont VERTS** (site + backend
  Apps Script) — la route de nettoyage est réellement en ligne, vérifié dans les Actions.
- ⏭️ **CE QUI ATTEND MICHEL AU RÉVEIL** (rien d'urgent, rien de cassé) :
  ① **le nettoyage des doublons** — Profil → Admin → « 🧹 Voir ce qui partirait », puis le bouton
  rouge. Une **copie de l'onglet** est faite avant ; il la supprimera à la main quand il aura
  vérifié. ② **sa séance du 31/08 est toujours fausse** dans l'historique (Tirage Poulie
  enregistré « Rowing Hammer Strength », 1RM fabriqué de **81,9 kg**) — **rien n'a été touché**,
  c'est **sa** décision (**R29**). ③ Les 2 manips en attente de `A-FAIRE-SUR-PC.md` :
  `installDailyBackupTrigger_` (2 sauvegardes/jour) · **sommeil et pas** dans le raccourci iOS —
  sans quoi ft-v1069/1070/1071 restent **dormantes**.
- 🧾 **Famille §29 de `BUGS.md`** ajoutée : *un garde-fou calibré sur un RATIO refuse le cas qu'il
  vise*. Née de ce soir — mon plafond « plus de la moitié » aurait refusé sa séance écrite 7 fois.
- 🧹 **NETTOYER LES DOUBLONS DU CLASSEUR — la seule route qui SUPPRIME** (ft-v1083). Go de
  Michel **après** avoir vu le constat (**R29**) : sa séance du 31/08 **écrite 7 fois**, celle du
  **28/08 en double** — *donc le défaut de ft-v1077 mordait déjà la semaine dernière*.
  ⛔⛔ **3 garde-fous** : aperçu par défaut (le bouton rouge n'existe pas avant) · **copie de
  l'onglet AVANT** (si elle rate, on s'arrête net) · plafond.
  ⭐⭐ **Et le test a corrigé ma conception** : mon 1ᵉʳ plafond était un **ratio** (« plus de la
  moitié → refus »). Or 6 lignes sur 7 sont des doublons légitimes chez lui — ***le garde-fou
  aurait refusé le seul cas visé***. Devenu **absolu** ; la vraie protection est l'aperçu et le
  fait qu'on ne supprime jamais la 1ʳᵉ occurrence (**par construction**).
  ⚠️ Suppression **par blocs, de bas en haut** — 157 `deleteRow` referaient le bug de ft-v1077,
  et de haut en bas les index deviendraient faux **en silence**.
- 🔥⭐⭐ **LE REPOS D'UN PALIER SUIT SA CHARGE · ET LE PLAFOND DE PALIERS AUSSI** (ft-v1082).
  Document de revue des échauffements relayé par Michel, puis *« vas-y go »*.
  ⛔⛔ **Les 4 cas « priorité haute » du document sont DÉJÀ réparés — rejoués dans un navigateur,
  pas relus dans le journal** : Tirage Poulie Haute 16/08 (l'app n'ajoute plus rien) · Pec Deck
  (**0** palier, *accessoire*) · Développé Épaules (**1** approche, pas 3) · RDL après squat
  (**0 ajout**). 👉 *« Pourquoi 5 chauffes le 16 et 1 le 20 ? » a pour réponse une **DATE** : le
  correctif est sorti le **17/08** (ft-v887).* Un audit sans accès au dépôt date les symptômes,
  pas les correctifs (**R23**).
  ⛔ **Ce qui restait, mesuré** : ① `restByType` rendait **45 s à plat** — `100×2 → 115×1` (88 %
  de la charge du jour) en 45 s ; ② le plafond de `_monteeCompletee` était un **5 en dur**, donc
  **5 paliers / 19 reps de 60 kg à 150 kg à l'identique** — *un squat à 60 kg recevait le
  protocole d'un squat à 150*, pendant que le barème de zéro sait doser (2 à 50 kg, 4 à 130).
  ⭐ **Aucun chiffre neuf** : mêmes zones que les répétitions (`_PALIER_ZONES`), et le plafond
  **appelle le barème** — un seul propriétaire de « combien de paliers cette charge mérite » (R2).
  ⛔ **Deux bornes** : jamais plus court qu'avant, jamais plus long que **son** repos de travail.
  ⚠️ **`startRest()` VIDE `#rest-label`** — « Échauffement », « Récup. à l'échec » et « Abdos »
  sont muets **depuis toujours** sur ce chemin. Non réparé exprès (remplir le libellé ferait
  disparaître « ⏭️ Ensuite : … ») — **c'est un chantier à part** (R30).
  ⏭️ **Non traité, écrit plutôt que corrigé** : à égalité de trous, l'insertion prend toujours le
  plus **bas** (à 90 kg elle bouche 40→60 et laisse 60→80). Comportement d'avant ce chantier.
- **Version en ligne (live) :** `ft-v1081`.
- 🔁 **VOIR LES DOUBLONS DU CLASSEUR, SANS RIEN SUPPRIMER** (ft-v1081). Michel : *« comment
  vérifier si ma séance a été écrite plusieurs fois ? »* ⚠️ **Ces doublons viennent de nous** :
  avant ft-v1077, le téléphone abandonnait à 8 s **pendant que Google finissait d'écrire**, donc
  chaque nouvel essai re-collait les mêmes lignes.
  ⛔⛔ **Le témoin central n'est pas le comptage, c'est que la route n'écrit RIEN** (**R29**) :
  on montre, il décide. Profil → Admin → « 🔁 Chercher les doublons ».
  ⛔ Une **seule** lecture du classeur · les lignes des autres testeurs ne sont pas comptées ·
  celles **sans email** (avant ft-v1018) sont comptées à part et **affichées**, jamais accusées.
  ⏭️ **La suppression n'existe pas** : si Michel veut nettoyer, ce sera un 2ᵉ bouton qui montre
  d'abord **quelles lignes** partiraient.
- 🦴⭐⭐ **DEUX CHARNIÈRES DE HANCHE DANS LA MÊME SÉANCE** (ft-v1080). Michel : *« répare la séance
  bizarre de Milo — soulevé de terre, dos, puis soulevé de terre roumain »*.
  ⛔⛔ **R4 dans sa forme la plus pure** : `_movPattern()` rend **`hip-hinge` pour les deux** (elle
  sert au calcul des calories depuis toujours) et `_validationSeance` rendait **`doublons: []`** —
  *l'information existait, elle n'atteignait pas la validation*, qui ne comparait que des NOMS.
  ⛔⛔ **Mais « deux charnières » aurait crié au loup** : **43 exercices** en `hip-hinge`, la
  famille mélange le soulevé de terre avec le Hip Thrust et les Kickbacks.
  ⭐⭐ **Le discriminant est dans la donnée** (R13) : `lower-back` de `_mscScores` — **24 à 2**,
  **12 non**. *Une liste écrite de mémoire se périmerait ; celle-ci se recalcule.*
  ⛔ **Informe, ne bloque pas, ne corrige rien** : lourd + roumain léger est un schéma classique.
- 🪞 **LE MIROIR DE SAUVEGARDE POUVAIT MOURIR EN SILENCE** (ft-v1079). Michel : *« on a la
  sauvegarde qui fonctionne sur le miroir supabase ? »* — **c'est en vérifiant que le trou est
  sorti**. ⛔⛔ `index.html` sert **10** scripts, `PRECACHE` en portait **9** : `supabase.js`
  était le seul absent, **sans raison écrite** (R8/R30).
  ⚠️ Panne **silencieuse** : app ouverte hors ligne après une mise à jour → le `<script>` échoue
  → `sbMirror` n'existe pas → le `try/catch` de `_cloudSync` avale l'absence → **le miroir est
  mort pour toute la session**. ⭐⭐ *Une sauvegarde dont on ne vérifie jamais qu'elle écrit est
  pire que pas de sauvegarde* — c'est l'en-tête de `supabase.js` lui-même.
  ⛔ Témoin qui protège la **règle** : aucun script servi ne peut être hors cache.
  ⏭️ **Ce que ça ne dit pas** : branché + en cache ≠ **écrit**. Supabase est injoignable depuis
  le conteneur → le seul verdict est **Profil → Admin → 🪞 Tester la copie miroir** (R18).
- 📤 **« LA DERNIÈRE SÉANCE N'APPARAÎT PAS DANS MON EXPORT »** (ft-v1078). ⭐ **Mesuré : elle y
  était — tout en bas.** Le CSV triait du plus **ancien** au plus récent, quand l'écran Historique
  **et** le PDF vont du plus récent au plus ancien. *Une donnée qu'on doit chercher à l'autre bout
  du fichier se lit comme une donnée absente.*
  ⛔⛔ **Le défaut de fond** : **trois propriétaires** du même ordre (l'écran, le PDF, le
  producteur), dont un à l'envers. L'ordre appartient désormais à `_histoLignes` seul (**R2**),
  les deux formats le **suivent**. ⛔ Le tri ne porte que sur les **séances** : les séries restent
  1, 2, 3. ⛔ On réordonne, on ne perd rien (4 lignes des deux côtés, mesuré).
- ☁️⭐⭐ **LA SÉANCE QUI NE PARTAIT PAS, MÊME EN WIFI** (ft-v1077). Michel : *« J'ai testé en
  wifi il fallait que je fasse un truc sur Google ? »* — **non**, rien côté Google n'était en
  cause pour la synchro (la manip en attente concerne les **sauvegardes**).
  ⛔⛔ **Cause** : `handleLogSession_` faisait **un `appendRow` PAR SÉRIE** — mesuré **3 séries
  → 3 écritures · 25 → 25 · 60 → 60**. C'était le **seul endroit de `Code.js` dont la durée
  grandit avec les données**, donc le seul capable de dépasser les **8 s** du téléphone.
  ⭐⭐ **Et l'abandon du téléphone n'arrête pas le script Google** : les lignes s'écrivaient
  quand même, donc **chaque nouvel essai re-collait la même séance**. *Un délai dépassé n'est
  pas un échec — c'est une réponse qu'on n'a pas attendue.*
  👉 Écriture **en bloc** (`setValues`) : 1 séance = 1 écriture. Contenu **identique**, mesuré.
  ⛔ Et « ❌ Sync : Timeout (8s) » annonçait une **perte non constatée** → plus ni croix ni rouge
  pour un réseau lent ; une **vraie** erreur garde les siennes. 🧾 Famille **§28** de `BUGS.md`.
  ⚠️ **Honnête** : sortie réseau bloquée depuis le conteneur → **son serveur n'a pas été
  chronométré**. La cause est établie par le code, pas par un chronomètre chez lui.
  ⏭️ **Son onglet `Sessions` porte probablement des doublons** de cette séance — **rien touché**,
  c'est son classeur (**R29**).
- 🔢 **LES SÉRIES NUMÉROTÉES « 1, 2… 5 »** (ft-v1076). Les séries **non faites sont masquées** mais
  le numéro restait `si+1`, l'index du tableau COMPLET. ⭐ Michel a corrigé ma lecture — *« il ne
  manque rien, j'ai mis exactement ce que j'ai fait »* : les 2 invisibles sont la **montée en
  charge ajoutée par l'app**, proposée et jamais faite. **Le trou était dans le comptage, pas dans
  ses données.** ⛔⛔ **Piège évité** : ce même `si` dit à `updateSessSet` **quelle série écrire** —
  le renuméroter aurait fait corriger la MAUVAISE série. Compteur d'affichage **séparé**, témoin
  sur l'index réel (0, 1, 4).
- 🔁⏱️ **UN RÉCAP N'EST PAS UNE PROPOSITION · LE DÉPASSEMENT S'AFFICHE** (ft-v1075).
  ⛔⛔ ① Le débrief **récapitule** la séance avec exercices et charges → `_extractDaySession` y lit
  une séance → Milo proposait de **refaire celle qu'on vient de finir**. *L'intention ne se lit pas
  dans le texte, mais dans le VOISIN* (une consigne `_silent`). ⚠️ **Ma régression** : ft-v1055
  corrigeait ça sur l'**autre** branche (**R8**).
  ⏱️ ② Le chrono négatif **fonctionnait — l'écran GO le cachait** (« GO » jusqu'au tap). Devenu
  **« C'EST REPARTI · +2 min 15 »**. ⚠️ Position corrigée **à la capture** (il tombait par-dessus
  l'anneau) ; ⚠️ et **mon témoin ⑤ a trouvé** que le libellé n'était repeint que dans la branche
  `left<=0` — un « +2 min » survivait au repos suivant (famille de ft-v1073, à 2 jours d'écart).
- ✅ **Les 4 bugs de sa séance du 31/08 sont corrigés** (ft-v1073 → ft-v1075).
- ⏭️ **RESTE, et c'est sa décision** : sa séance du 31/08 est toujours fausse dans l'historique
  (Tirage Poulie enregistré « Rowing Hammer Strength », 1RM fabriqué de 81,9 kg). **Rien n'a été
  touché** — on ne modifie pas les données de quelqu'un sans son accord (**R29**).
- ⏭️ **2 manips lui restent** (`A-FAIRE-SUR-PC.md`) : activer les **2 sauvegardes/jour**
  (`installDailyBackupTrigger_`) · ajouter **sommeil et pas** au raccourci iOS.
- 🔤⭐⭐ **DEUX COUCHES DE GUILLEMETS, UN SEUL ÉCHAPPEMENT — 2 bugs de Michel n'en font qu'un**
  (ft-v1074). Son journal d'erreurs : **4 × `SyntaxError`**, dont 3 en 11 s.
  ⛔⛔ `'onclick="f('+JSON.stringify(v)+')"'` rend `onclick="f("gene")"` → **l'attribut se referme
  au 1ᵉʳ guillemet**, le navigateur compile `function onclick(e){ f( }`. *JSON.stringify échappe
  pour JS, pas pour HTML.* ⭐⭐ **Le « bug d'image » (`changeExImg`) est le MÊME défaut.**
  ⛔ Coût : depuis le **28/08**, aucune réponse à « Pourquoi ce changement ? » n'a été enregistrée
  → `S.exSwaps` vide → la promesse *« Milo ne te le repropose plus »* n'a jamais tenu.
  ⭐⭐ **R8** : 5 sites, **1 déjà juste** (`oublierExSwap`) — *le dépôt contenait la réponse*.
  Un seul propriétaire désormais, `_argAttr` (R2). 🧾 Famille **§27** de `BUGS.md`.
- 💾 **2 SAUVEGARDES PAR JOUR** (2h et 14h UTC) — demande de Michel. ⭐ Le fichier gérait déjà un
  2ᵉ passage. ⚠️ **À ACTIVER** : un déploiement ne recrée pas les déclencheurs → 1 clic sur
  `installDailyBackupTrigger_` dans l'IDE (`A-FAIRE-SUR-PC.md`). ⚠️ Append-only : ~730 fichiers/an
  pour une alerte de quota à 1000 → **la purge devra être une décision, dans ~16 mois**.
- 🔴⭐⭐ **LE SÉLECTEUR RENOMMAIT AU LIEU D'AJOUTER — il abîmait l'historique** (ft-v1073).
  Michel : *« mon tirage a été remplacé par le rowing hammer »*.
  ⛔⛔ **R15, 3ᵉ fois — mais la 1ʳᵉ qui touche aux DONNÉES** : `mod-ex` n'était pas dans
  `_OVERLAY_CLOSERS` → fermé **au doigt**, `closeExPicker()` n'était jamais appelé → le mode
  restait `'replace'` **avec son index**, et l'ouverture suivante **renommait** au lieu d'ajouter.
  ⛔ Dégât : son Tirage Poulie enregistré comme « Rowing Hammer » avec un 1RM fabriqué de 81,9 kg,
  parti dans ses records, Sheets et le débrief de Milo. **Aucune donnée touchée par le correctif** —
  la réparation de sa séance reste à lui proposer (**R29**).
  ⭐⭐ **Le vrai correctif est le second** : `openExPicker(mode)` **impose** son mode au lieu de
  l'hériter — *quand un état se perd, il doit se perdre du bon côté*. Les 5 modes spéciaux passent
  par le paramètre (R2). 🧾 Famille **§26** de `BUGS.md`.
- 🔒⭐⭐ **ON N'ANNONCE QU'À CEUX QUI PEUVENT S'EN SERVIR** (ft-v1072). Michel : *« sauf que les
  pas ne sont que pour moi attention »*. ⛔⛔ **Le défaut était dans l'ANNONCE, pas le comportement** :
  `WHATS_NEW`/`NEW_FEATURES` n'avaient **aucun filtre par personne** → les pop-ups **v64** (sommeil
  mesuré) et **v65** (pas) partaient chez des testeurs **sans raccourci iOS**. ⭐ Le code était déjà
  correct (carte masquée, TDEE inchangé) — *ce n'est pas la fonctionnalité qui débordait, c'est sa
  publicité.* ⭐⭐ **Défaut DOUBLE, trouvé en cherchant la jumelle (R8)** : ft-v1069 avait le même.
  👉 Prédicat optionnel **`si`** résolu par `_featSi`, seul propriétaire (R2), 8 lecteurs redirigés.
  ⛔ Sans `si`, comportement **strictement** inchangé (121 entrées).
  ⛔⛔ **Piège du marqueur « vu »** : `ft4_wn_seen` est un **plafond numérique** — il aurait enterré
  une conditionnelle jamais affichée. Les conditionnelles se suivent **par id** (`ft4_wn_cond`).
- 🍝 **CARNET DE MESURES CRU/CUIT ouvert** (`docs/MESURES-CRU-CUIT.md`, 30/08) — ⛔ **aucun code,
  aucune version** : c'est une décision produit en cours d'instruction, pas une livraison.
  Michel a mesuré sa propre assiette de bout en bout : **392 · 381 · 368 · 325 g** pour une valeur
  nutritionnelle **constante** (509 kcal, celle des 140 g crus). 👉 *Le poids cuit n'est pas une
  mesure de ce qu'on mange, c'est une mesure de l'heure qu'il est.*
  ⛔⛔ **Ce que ça DÉCIDE : on ne construira PAS de conversion cru↔cuit.** Son facteur est **×2,80**
  quand CIQUAL suppose ×2,18 — le facteur dépend de sa casserole, pas de l'aliment (**R29**).
  ⭐ **Ce qui reste sur la table, et rien de plus** : un rappel *« pèse cru »* au scan d'un féculent
  (un code-barres donne les valeurs du produit **sec**, on pèse souvent dans l'assiette → **2,3×
  trop**). ⛔ Non construit : Michel pèse cru. La question est pour Tatiana, Emma, Christophe —
  **son arbitrage, pas le mien**.
  ⚠️ **Deux prédictions de moi dans ce dossier, une déjà fausse** : j'avais annoncé que l'huile
  freinerait l'évaporation → mesuré **10,0 g/min contre 2,6 à sec, 3,8× plus VITE** (l'huile est un
  conducteur, pas un couvercle). La seconde — *le débit ralentit-il ?* — est posée comme falsifiable.
- 🚶📈 **LA COURBE DES PAS DANS PROGRÈS → POIDS** (ft-v1071). Michel, 10 min après ft-v1070 :
  *« les pas vont s'afficher où ? »*. ⛔⛔ **La réponse honnête était NULLE PART** — le surplus
  n'apparaissait qu'en petit sous le TDEE, les jours de grosse marche ; son nombre de pas nulle
  part. *L'app recevait la donnée, s'en servait, la donnait à Milo, et ne la lui montrait jamais.*
  ⛔⛔ **Piège évité en lisant le code AVANT de coder** : `renderWeightTab` sort par un `return`
  sous 2 pesées → accrochée en bas, la carte n'apparaîtrait **jamais** chez qui ne se pèse pas.
  Elle se rend **en premier**, et un témoin le fige.
  ⛔ **Le trait vert est SON habitude, pas un objectif** : pas de « 10 000 pas » que personne n'a
  choisi (Vision · R29). Les jours sous la base sont **gris**, jamais rouges (R24).
  ⭐ R13 : `_sleepChartHtml` transposé · R2 : `_pasEcart` reste le seul propriétaire du surplus.
- 🚶⭐⭐ **LES PAS COMPTENT, SANS JAMAIS COMPTER DEUX FOIS** (ft-v1070). Michel : *« attention il
  faut que ça soit cohérent — la montre compte aussi les pas si on fait du tapis »*.
  ⛔⛔ **Il a nommé le piège de ft-v949 avant qu'on le trouve, et il est plus large que le tapis** :
  `activityLevel` (« Modéré 3-4j ») contient aussi la **marche ordinaire**. Mesuré : avec les pas
  bruts, une journée à 6 100 pas ajoutait **197 kcal qui n'existent pas, tous les jours**.
  ⭐⭐ **D'où le SURPLUS sur sa propre base** (médiane 30 j · min 7 j · seuil 1 500 · borné 500 kcal) :
  la rando ressort (+9 000 pas → ~290 kcal), le tapis habituel **est dans la base** donc surplus nul.
  ⭐ Un seul propriétaire `_pasEcart` (tracking.js), lu par le TDEE, l'écran Nutrition et Milo (**R2**).
  ⛔ Milo reçoit le surplus **et** l'interdiction d'inventer l'activité (*« des pas ne disent pas ce
  qui a été fait »*).
  ⚠️ **La moitié qui manque est écrite** : on VOIT la dépense, on ne peut toujours pas ENREGISTRER
  la randonnée (le cardio est accroché à `S.wkt`). → `IDEES-FUTURES.md`.
- 😴⭐⭐ **LE SOMMEIL MESURÉ ATTEINT ENFIN LE SCORE ET MILO** (ft-v1069). Michel : *« ah oui les pas
  et le sommeil ça c'est hyper important »*.
  ⛔⛔ **Le défaut était mesuré et écrit depuis 11 jours, dans `Code.js`** : la saisie manuelle
  **aplatit les mauvaises semaines** (r = **−0,96** ; 6 h 43 déclaré contre **5 h 38** réel du 6 au
  12/08). Or `S.sleepLog` est la base du score de récup **et** part chez Milo → *le score était le
  plus optimiste exactement quand la fatigue comptait*. La donnée arrivait depuis **ft-v916** et ⚠️⚠️ **CORRECTION DU 30/08 AU SOIR, ET ELLE EST DE TAILLE.** J'ai écrit que *« la donnée arrivait depuis ft-v916 et rien ne la lisait »*. **C'est FAUX**, et c'est Michel qui l'a dit : *« mais on n'a pas fait le raccourci des pas ni le sommeil »*. Ce qui est vrai : le **serveur ACCEPTE** `sleep` et `steps` depuis ft-v916 (`handlePushHealth_`). Ce qui est faux : **rien ne les a jamais envoyés** — son raccourci iOS ne pousse que la **FC au repos**. 👉 ***Ce n'était donc pas une donnée qui dormait, c'était un TUYAU JAMAIS BRANCHÉ*** — et j'ai bâti trois versions (ft-v1069, 1070, 1071) sur une donnée qui n'est jamais arrivée. ⛔ **Le code reste juste et testé**, il est simplement **DORMANT** tant que le raccourci n'envoie pas les deux champs. *Une vérification que je n'ai pas faite : j'ai lu que le serveur acceptait, et j'en ai déduit que ça arrivait* — c'est **R28** appliqué à l'envers, une capacité prise pour un fait. La recette du raccourci est dans `A-FAIRE-SUR-PC.md`.
  **rien ne la lisait** (seul `rhr` était exploité — **R5**).
  ⭐⭐ **Décision de Michel** : *« la montre gagne, ET l'app le dit »* (**R32**). Un seul
  propriétaire (`_nuit`/`_nuitsRecentes`) lu par le score, les tuiles, la carte, le registre et
  Milo (**R2**). ⛔ La mesure ne gagne que sur la **durée** — la **qualité** reste celle de la
  personne, jamais dérivée.
  ⛔⛔ **Piège évité, chiffré** : `e.quality||2` faisait valoir « Moyen » à une qualité inconnue →
  8 h mesurées seraient tombées à **72 au lieu de 90+**. Une nuit sans qualité est notée sur sa
  **seule durée** (**R29**).
  🚶 **Les pas ne sont PAS dans cette version, exprès.** Michel a donné leurs 2 usages et la
  contrainte : *« la montre compte aussi les pas si on fait du tapis »* — le double comptage de
  **ft-v949**, qu'il a nommé avant qu'on le trouve. Tout est écrit dans `IDEES-FUTURES.md`.
  **⏭️ PROCHAINE ÉTAPE si Michel donne le go.**
- ⚖️⭐⭐ **UN SEUL PROPRIÉTAIRE DE « COMBIEN J'EN AI PRIS ? »** (ft-v1068). Michel : *« il faut
  qu'il y ait une cohérence quand on change la dose, peu importe le produit — même s'il faut
  qu'on crée un algorithme exprès »*. ⭐⭐ **L'algorithme existait déjà, QUATRE fois** :
  `valeurs = base × (saisie / référence)` — *un pour-100 g n'est pas un autre calcul, c'est CE
  calcul avec une référence de 100*. Mesuré : **6 fonctions, 6 champs, 3 états** pour une seule
  question. ⛔⛔ **Le même geste donnait 3 résultats** (vider le champ) : zéro · référence ·
  valeurs orphelines. ⚠️ La dernière était **la jumelle de ft-v1061, encore vivante** — 4ᵉ fois
  du jour, mais cette fois trouvée **par la mesure**, pas par Michel. ⛔ Et `af-bc-grams` était le
  **seul** champ de quantité resté en `type=number` : la route code-barres jetait la virgule
  d'Eline. ⛔⛔ **Nuance rattrapée par le témoin de ft-v966** : *les valeurs se replient sur la
  référence, la phrase « pour tes n g » se TAIT.* ⭐ Le bloc CLXXII vérifie une **égalité de
  comportement**, pas des chiffres — c'est ce qui empêche les 4 routes de re-diverger.
- 🗂️⭐⭐ **LE HAUT DE PROGRÈS : ONGLETS EN TÊTE, CARTES REPLIABLES** (ft-v1067). Michel, capture à
  l'appui : *« ça prend vachement d'espace en haut non ? »*.
  ⭐ **Avant** : 216 + 345 = **561 px** ; onglets à **y=699** sur un écran de 844, recherche à
  **821 (au ras du bord)** → *sa progression commençait hors écran*.
  ⭐ **Après** : onglets **118**, cartes repliées **132 px**, PROGRESSION **347**, recherche **392**.
  ⭐⭐ **2 raisons, la 2ᵉ de fond** : les onglets sont de la **navigation** ; et depuis ft-v1065 ces
  cartes n'appartiennent qu'à Exercices — leur place est DANS son contenu.
  ⛔ **L'état est retenu** (`ft4_progAcc`) : *un accordéon qu'on rouvre à chaque visite est un
  accordéon qu'on n'ouvre plus* (ft-v1024). ⛔ On masque, on ne recalcule pas. ⛔ **R13 : 0 CSS**.
  ⚠️ **Titre DOUBLÉ trouvé à la capture** (le résumé + la carte) — invisible à toute mesure.
  ⚠️ **Liseré de ft-v1047 retiré avec sa raison** (R30) : il distinguait 2 cartes grises, chacune
  a son titre maintenant.
  ⚠️⚠️ **8 témoins ont rougi sans qu'aucun défaut n'existe** — `innerText` sur du replié ·
  `style.display` sur le mauvais élément · et un des miens mesurait un **mouvement** disparu.
- 0️⃣ **UN PROXY QUI DEVIENT FAUX QUAND UNE VALEUR VAUT ZÉRO** (ft-v1066). Michel : *« même quand
  je mets zéro il marque déjà 5 g de prot »*. ⚠️⚠️ **Cas NON reproduit, et c'est écrit** : mesuré
  six chemins, un 0 posé à la main **tient** (survit au rescale, s'enregistre à 0) — 3 témoins le
  figent. *D'où viennent ses 5 g reste inconnu ; l'inventer serait pire que de le dire.*
  ⛔⛔ **Mais la mesure a trouvé autre chose** : le garde testait `base.kcal>0`, donc mettre les
  **calories** à 0 faisait disparaître tout le réglage de quantité, protéines encore à l'écran.
  👉 *Un proxy commode — les calories pour « il y a des valeurs » — devient faux dès qu'une valeur
  légitime vaut zéro.* Touche la boisson zéro **et surtout la frappe** (on efface les kcal pour
  les retaper, le réglage s'évapore). Le garde regarde les **4** valeurs.
- 📊⭐⭐ **LES CARTES D'ENTRAÎNEMENT NE S'AFFICHENT QUE SUR « EXERCICES »** (ft-v1065). Michel,
  vidéo à l'appui : *« sur le poids et le record on s'en fout un peu de ça non ? »*, puis
  *« même les badges »*.
  ⭐ **Raison de fond** : les deux cartes parlent d'**entraînement** ; sur Poids et Badges elles
  ne répondent à aucune question qu'on vient y poser, elles repoussent le contenu hors écran.
  ⭐ **Chiffré** : 216 + 191 = **407 px** ; sur Poids les sous-onglets remontent de **545 → 118**
  (**427 px rendus**) et la pesée du jour de ~600 à **170**.
  ⚠️⚠️ **Retour sur ma décision de ft-v1041** (*« elle survit au changement de sous-onglet »*) :
  l'intention était bonne, la **portée** trop large. *Ne pas clignoter ≠ être partout.* Le témoin
  est **re-visé** — masquée hors d'Exercices **et** revient **intacte**.
  ⚠️ **`CLAUDE.md` corrigé** : `S.weightLog` porte **`kg`**, pas `bw` — la doc mentait, et c'est
  elle qui m'a fait écrire une fixture rendant *« undefined »* dans le champ de pesée (**R23**).
- ⚖️⭐ **LE CHOIX D'UNITÉ DANS « MODIFIER L'ALIMENT »** (ft-v1064). Michel : *« quand j'ajoute il
  ne me donne que le choix de la quantité »*. L'écran de modification n'offrait que des
  multiplicateurs + un cul-de-sac : *« mets la quantité dans le nom »*.
  ⛔⛔ **Cette phrase est celle que ft-v1056 avait supprimée de l'écran d'AJOUT** — même refus,
  l'autre écran, **correctif posé d'un seul côté** (**R8**). ⚠️ **3ᵉ fois du jour** (ft-v1061,
  ft-v1063, celui-ci) : *la leçon n'est pas « corriger mieux », c'est **chercher la jumelle
  AVANT de livrer**.*
  ⭐ **R13** : `_afMajAncre` transposé, pas un 2ᵉ mécanisme. ⭐⭐ **R4, la moitié qui manquait
  depuis ft-v972** : le poids descend jusqu'à `q`/`u` — sinon l'app le redemande à chaque
  ouverture et le cul-de-sac revient. ⛔ Déclarer n'est pas rescaler, et le champ reste **vide**.
- 🍽️⭐ **« J'AI 2 FOIS LA MÊME PROT »** (ft-v1063). Son shaker apparaissait **deux fois** dans
  « Tes repas habituels », deux lignes identiques. ⛔⛔ **La cause tient à un `+`** : la signature
  était `meal + '::' + aliments` — noté 6× en Collation 2 et 2× en Petit-déj, le même shaker
  faisait **deux habitudes**. ⚠️⚠️ **Régression de ft-v1056, la mienne** : tant que la carte
  **appliquait** le moment, il appartenait à l'identité de ce qu'on rejoue ; depuis qu'il **se
  demande au tap**, les deux lignes font la même chose. 👉 ***Un critère de regroupement qui
  survit à la disparition de son motif fabrique des doublons.***
  ⛔ **Coût réel** : la liste est bornée à 3 — un doublon **chasse une vraie habitude**.
  ⭐⭐ **On filtre AVANT de fusionner** : il prend ce shaker le matin **et** l'après-midi ;
  fusionner d'abord lui ferait perdre le tap du 2ᵉ dès qu'il a noté le 1ᵉʳ.
  ⚠️ **Mon propre témoin m'a repris** : le compte doit porter sur **toutes** les variantes —
  *le filtre décide de ce qu'on PROPOSE, jamais de ce qu'on a COMPTÉ.*
- ⚖️⭐⭐ **LA QUANTITÉ ET LES VALEURS NE SE DÉSAPPAIRENT PLUS** (ft-v1061). Michel, 4 captures
  dont **la photo de son étiquette** : *« ça sent le bug »*. Il y en avait **deux**.
  ⛔ ① **Champ vidé** : il tape « 3 », les valeurs tombent à 12 kcal, il efface — et **12 kcal
  restent à côté d'un champ vide**, au-dessus du bouton « Ajouter au journal ». *Le voisinage
  muet*, 4ᵉ fois (ft-v966, v1042, v1056).
  ⛔⛔ ② **Le vrai** : `_afMajAncre` relisait les 4 champs à CHAQUE appel pour en faire la
  nouvelle `base`, même quand elle ne faisait que **redessiner**. Après un rescale ces champs
  portent `base × facteur` → ***la référence devenait une valeur dérivée d'elle-même, et
  l'erreur se figeait***. Mesuré sur son étiquette (116,6 kcal / 26,4 g pour 30 g) : réf 30 g,
  il tape 40 (156 kcal, juste), un geste redessine, `base` devient 156 avec `q` toujours à 30 —
  et 40 g affiche **208 / 47**, *exactement sa capture*, **1,33× l'étiquette** = 40/30.
  ⚠️⚠️ **CORRECTION LE JOUR MÊME — j'ai sur-affirmé la cause.** La mesure établit que sa `base`
  valait **156 / 35** (les « 16 / 4 » du champ vidé ne sortent que de là). ⛔ **Mais DEUX
  histoires donnent cette base et le même écran** : ① l'IA estimait juste (117/26) et mon bug l'a
  désappairée ; ② **l'IA a directement estimé ~156/35**, soit une dose de **40 g**. *Les captures
  ne les départagent pas.* ⭐ Son écran dit *« Référence : 30 g (que tu as indiqué) »* → l'IA n'a
  renvoyé aucun poids exploitable, donc `base` est l'estimation **brute** du modèle : ② est le
  plus probable. 👉 **Le correctif reste justifié** (le bug est réel et reproduit) **mais il ne
  répond pas à la vraie question de Michel**, qui porte sur la **PROVENANCE** des valeurs.
  ⭐ **L'en-tête de la fonction disait déjà la règle** (*« appelée seulement quand la SOURCE
  change »*) : vraie de l'intention, pas du code. `srcChange` la rend **exécutable**.
  ⚠️⚠️ **Défaut de ft-v1056, donc de moi** — et la leçon y était **déjà écrite** pour
  `_provFood`, posée d'un seul côté (**R8**). ⛔ **Mon 1ᵉʳ correctif ratait l'aller-retour
  d'unité** : c'est la **préservation de `base`** qui ferme tous les chemins, pas l'appairage.
  ⏭️ **Non réparé, et écrit** : les entrées **déjà enregistrées** de travers restent fausses
  dans le journal — on ne touche pas aux données de quelqu'un sans son accord (**R29**).
- 👎⭐⭐ **« MILO A RÉPONDU À CÔTÉ » — le pouce COMPTE, il ne RACONTE rien** (ft-v1060).
  Michel : *« j'aimerais savoir si Milo déconne quand les utilisateurs posent une question…
  1 appel API qui sert à rien, et s'il met 2 ou 3 réponses avant de tomber juste. **Là ça me
  coûte de l'argent pour rien.** J'appelle ça améliorer le service. »*
  ⛔⛔ **Et il a écarté la surveillance lui-même** : *« je ne veux pas savoir ce qu'ils disent
  à Milo, je m'en fous »* — c'est cette phrase qui décide de la **forme**, pas seulement du ton.
  ⭐ **Mesuré avant de choisir** : aucun retour de qualité n'existait dans l'app ; en revanche
  chaque message est **horodaté**. Deux pistes — le **pouce** (la vérité dite par la personne)
  et la **relance rapide** (un proxy : une question qui revient en 6 s sur 2 000 caractères).
  **Michel a tranché le pouce d'abord** ; ⏭️ *le proxy reste ouvert, il n'est pas écarté.*
  ⛔⛔ **La confidentialité est MESURÉE** : taper un motif = **0 appel réseau**, et la trace
  locale ne porte que **`motif` et `ts`**. Envoi sans cocher → le motif part, la question et la
  réponse **restent**. La case « joindre l'échange » est **décochée par défaut** (P3).
  ⛔ **Pas de pouce vert, exprès** : un 👍/👎 partout ferait un formulaire de satisfaction, et
  le taux de clic dirait qui est **poli**. *On ne demande que ce dont on fera quelque chose.*
  ⭐⭐ **Ce qui le rend précieux dépasse la mesure** : chaque 👎 donne un **cas réel** → **R35**,
  un bug rencontré devient un scénario permanent du banc d'essai.
  ⚠️⚠️ **Le seul rouge de la livraison était un FAUX rouge**, et sa cause se réplique : le
  témoin anti-fuite (CXXII) mesure une fenêtre de **238 675 caractères / 41 fonctions** pour une
  fonction qui en fait **129 483**. 👉 **4 des 8 « fuites possibles » documentées depuis ft-v1014
  n'en sont pas** — elles vivent chez les voisines. La fenêtre n'est **pas rétrécie** (trop large
  = faux rouges, jamais de faux verts ; rétrécir un filet mérite sa propre mesure, **R34**) ;
  c'est la **liste** qui est corrigée, et 2 témoins figent les deux comptes.
- 📇 **Qui a appelé Milo aujourd'hui** (livré un commit plus tôt, sous le cache ft-v1058) :
  `ai_quota.byEmail` comptait **déjà** les appels par personne et `aiUsage` renvoyait **déjà**
  `topUsers` — **zéro occurrence dans `app.js`** : la donnée arrivait et se perdait (**R5**).
  ⛔ Limite écrite à l'écran : des **APPELS**, pas des euros (`ai_usage` ne porte pas l'email).
- 🪟⭐⭐ **UNE MODALE ENFERMÉE DANS UN ÉCRAN QUI DÉFILE S'OUVRE HORS DE L'ÉCRAN** (ft-v1062).
  Michel : *« ça clique bien mais rien ne se passe »* — **ses 5 mots ont changé le diagnostic** :
  le bouton répond, donc le défaut est **avant** la livraison du fichier.
  ⛔⛔ **Cause mesurée** : `.overlay` est en `position:absolute` → elle se cale sur son ancêtre
  positionné. Un `.screen` est `position:absolute` **et** `overflow-y:auto`, donc `inset:0` y
  désigne le **haut du contenu** : écran Progrès défilé à fond, la modale s'ouvrait à
  **y = −3102**, soit **2 800 px au-dessus**. `open` posée, modale rendue, rien de visible.
  ⚠️⚠️ **Panne SILENCIEUSE et liée au DÉFILEMENT** : une fixture d'une seule séance ne défile pas,
  donc le test passe. ***Mon test de la veille reproduisait le chemin heureux*** — nouvelle famille
  **§24** de `BUGS.md`.
  ⭐⭐ **Sur 63 overlays, 61 étaient déjà à la racine** : les 2 fautives étaient l'exception (R13).
  ⚠️ **Jumelle plus grave (R8)** : `ov-rest-edit` — le réglage du repos **en pleine séance**.
  ⚠️ **Correction que je me dois** : le `;charset` de ft-v1059 était un vrai défaut, **pas celui-là**.
- 📤⭐⭐ **L'EXPORT DE L'HISTORIQUE NE MENT PLUS SUR SA RÉUSSITE** (ft-v1059). Michel : *« le
  bouton exporter dans historique ne fonctionne pas »*.
  ⛔⛔ **Mesuré d'abord** : toute la chaîne marche en Chromium (0 erreur) → c'était **spécifique
  à son iPhone**, et sans cette mesure je cherchais dans la modale.
  ⭐⭐ **Cause mesurable, pas devinée** : sur les **7** endroits de l'app qui livrent un fichier,
  `_donnerFichier` était **le seul** à passer `;charset=utf-8`. *`canShare` d'iOS refuse un type
  paramétré* → repli sur `<a download>`, **qu'iOS n'honore pas** en PWA plein écran.
  ⛔ Le charset était **décoratif** : c'est le **BOM** qui porte l'UTF-8 pour Excel.
  ⛔⛔ **3ᵉ défaut, indépendant d'iOS** : `return true` après `a.click()` → *« 2 séries
  exportées »* alors que rien n'était parti. **Un succès menteur envoie chercher au mauvais
  endroit.** 4 issues distinctes maintenant.
  ⚠️ **Réserve honnête** : je ne peux pas tester iOS d'ici — la cause est fortement étayée,
  **pas prouvée sur son appareil**.
- 🔢⭐⭐ **LA VIRGULE DÉCIMALE — neuf mots d'ELINE, et une corruption de données** (ft-v1058).
  Retour de la fille de Michel : *« impossible de mettre la virgule pour les poids »*.
  ⛔⛔ **Elle décrit un refus ; la mesure dit bien pire** — dans un `type="number"`, `62,5` rend
  **`"625"`** : la virgule est **jetée**, pas le nombre. Mesuré au clavier sur le champ le plus
  utilisé : série enregistrée à **625 kg**, **1RM 776 kg** — qui partait dans ses **records** et
  sa **courbe**. Et ailleurs `parseFloat('62,5')` rend **62**.
  ⭐⭐ **Le mot de la personne décrit le SYMPTÔME, jamais la cause** : s'arrêter à « impossible »
  faisait chercher le clavier et rater les séances déjà fausses. Famille **§23** de `BUGS.md`.
  ⭐ **L'app savait lire une virgule à DIX endroits** — jamais pour ce que la personne **tape**.
  👉 **22 champs** en `type="text"` (le pavé chiffré RESTE) + **41 lectures** par un seul
  `numFR`. ⚠️ Le plus critique (`upSet`, le kg de série) reçoit sa valeur **en argument**, donc
  il échappait à la recherche sur `.value`.
  ⏭️ **En attente de Michel** : les séances **déjà enregistrées** ×10 restent fausses (R29).
- 📊⭐⭐ **LE VOLUME PAR MUSCLE : 14 JOURS, RAMENÉS À LA SEMAINE** (ft-v1058). Michel, capture à
  l'appui : *« c'est super mais ça ne serait pas mieux sur 2 semaines ? »*
  ⭐⭐ **Sa capture porte sa preuve** : la carte du dessus dit **3,4 séances/semaine** sur 78 jours,
  celle du dessous en comptait **2**. *7 jours est un échantillon trop court pour un entraînement.*
  ⛔⛔ **Mais les chiffres bruts ne sont PAS doublés** — `DISC_CADRE.volume` dit « 10 à 20 séries
  par groupe **et par semaine** » : afficher 24 sur 14 jours serait **faux et crédible** face à un
  repère hebdo. 👉 **L'échantillon s'élargit, l'UNITÉ reste la semaine** (12 → **6/sem**).
  ⭐ Arrondi au **demi** (R29 — « 4,3 » serait une fausse précision), tri sur le brut.
  ⛔ **Le nombre de séances reste affiché** : une moyenne noie une semaine à zéro, et lui seul dit
  ce que la moyenne ne dit pas.
  ⛔⛔ **Un seul propriétaire** (`_volumeParMuscle`) : l'écran **et** Milo lisent la même grandeur —
  sinon l'écran dirait 6 et Milo 12 (R2).
  ⚠️ **3 témoins de ft-v1045 re-visés** (ils épinglaient « 7 derniers jours » et « NE LUI REPROCHE
  PAS » — la phrase, pas la règle). **7ᵉ fois cette semaine.**
- ⚖️⏰⭐⭐ **ON PROPOSE, ON N'IMPOSE PAS — la quantité ET le moment** (ft-v1056). La même
  règle trouvée **trois fois le même jour** : le champ en grammes, la quantité de la
  dernière fois, et le **favori qui décidait du moment de la journée à la place de la
  personne**. Un repas habituel est *observé* — donc son moment est un **bon pari**, pas
  un fait : il est désormais marqué « d'habitude » et rien ne part sans un tap.
  ⚠️ **Deux témoins ne pouvaient pas VERDIR** : un échappement doublé par un script, et
  une espace **insécable** (règle ft-v1034) cherchée comme une espace ordinaire — *les
  deux chaînes sont identiques à l'écran*. Miroir du « vert qui ne peut pas rougir ». Michel, capture à l'appui :
  *« il faut que je puisse mettre les grammes »*, puis la correction qui a décidé de la forme :
  *« je ne prends pas toujours le même poids… tu prends la ratatouille, il y a différentes
  boîtes de différent poids »*.
  ⛔⛔ **Ce qui bloquait n'était pas un manque de mécanisme, c'était un REFUS** : `_afMajAncre`
  imposait l'un ou l'autre et affichait *« on ne peut pas inventer un poids »*. ***Vrai, et à
  côté de la question : l'APP ne peut pas l'inventer, la PERSONNE le connaît.***
  ⭐⭐ **Rien n'est réinventé (R13)** : le bloc « portion » posait déjà `_afRef={q:1}` — grammes
  et portions sont le MÊME calcul avec une référence différente.
  ⛔ **Ce qui est retenu est le POUR-100 g, jamais la boîte.** `q` n'est qu'un pré-remplissage.
  ⛔ **Déclarer n'est pas rescaler** : dire « ça pèse 40 g » ne change pas les 4 valeurs.
  ⚠️⚠️ **Le piège était le diviseur** : après avoir déclaré 40 g puis tapé 80, les champs
  affichent le double — diviser par 40 donnerait un pour-100 g **deux fois trop gros**.
  *Les valeurs affichées et la quantité affichée vont toujours ensemble.*
  ⭐⭐ **Et ça rebranche ft-v1042 sans une ligne de plus** : à la reprise, le champ en grammes
  s'ouvre tout seul.
  ⚖️⭐⭐ **Et la même version corrige une incohérence que j'avais introduite**, révélée par une
  question de Michel : ft-v1042 **pré-remplissait** la quantité du dernier repas à la reprise.
  Pour une dose de whey c'est juste ; **pour une boîte de ratatouille, c'est le repas d'HIER
  enregistré comme celui d'aujourd'hui** — l'argument même employé dix lignes plus haut pour
  laisser l'autre champ vide. Sa décision : *« on donne le choix et pas imposer »*.
  ⭐ Champ **vide** + pastille **↩ 250 g (la dernière fois)** : un tap pour ce qui ne change pas,
  rien d'enregistré pour ce qui change. Posé sur les **deux** chemins de reprise (R8).
  ⚠️ **3ᵉ « voisinage muet »** trouvé à la mesure : la ligne verte annonçait « pour tes 250 g »
  alors que le champ était vide — *un total qui devance le choix se lit comme un fait*.
  ⚠️⚠️ **Deux témoins existants ont rougi sur du code correct**, et le second deux fois : il
  lisait le bloc en `.slice(0,60)` et mes boutons d'unité ont poussé « portion » au-delà de la
  coupe. *Un motif cherché dans une chaîne tronquée mesure la longueur de la phrase.*
- 🩹⭐⭐ **UNE CONSIGNE INTERNE N'EST PAS UNE DEMANDE DE LA PERSONNE** (ft-v1055). Capture de
  Michel à 15 h 16 : *« Cette séance te convient ? »* s'affichait **sous un débrief de fin de
  séance** — il venait de terminer, on lui proposait d'en démarrer une.
  ⛔⛔ **La cause est dans mon code de ft-v1053** : le débrief auto envoie une consigne `_silent`
  qui commence par *« Je viens de terminer **ma séance** »*, et mon détecteur y lisait une
  demande. ***Je pairais la réponse de Milo avec un texte que Michel n'a jamais tapé.***
  ⭐ **La règle existait déjà à DEUX endroits** (l'affichage du fil, le bouton « Mes discussions »)
  — c'est moi qui ne l'ai pas reprise. 👉 *Avant d'écrire un nouveau lecteur de `coachHistory`,
  regarder ce que les lecteurs existants filtrent déjà.*
  ⛔ **On abandonne, on ne remonte pas plus haut** : repêcher une demande plus ancienne collerait
  la question sous une réponse qui n'y répond pas (témoin ③).
  🔍 **Jumelle (R8)** : `_convTitle` — une discussion rangée pouvait s'intituler
  *« [DÉBRIEF AUTO] Je viens de terminer ma séance… »*.
- ⏳⭐⭐ **LA SÉANCE D'HIER NE RESSURGIT PLUS** (ft-v1054). Michel, **10 min** après ft-v1053 :
  *« lol il vient de me sortir la séance d'hier »*.
  ⛔⛔ **Le défaut vient de ft-v1051, mesuré des DEUX côtés avant d'être dit** : une séance de
  **26 h** ressurgissait **et s'injectait**, contre ft-v1052 **comme** contre ft-v1053.
  ⭐⭐ **La cause** : la borne était *« au plus 3 messages de Milo »* — un **compte**, donc un
  **proxy de « récent »**. Or le fil du chat **survit aux jours**. → borne en **temps**.
  ⭐ **Fenêtre = union de deux cas** : ① **même jour civil** (demander le matin, ouvrir à la
  salle le soir — le cas de ft-v851, et *perdre le bouton est sa plainte n°1*) ② **< 12 h** (la
  demande de 23 h qui déborde sur la nuit).
  ⚠️⚠️ **Mon 1ᵉʳ jet a eu tort sur le cas « pas de date »** : `ts` n'existe que depuis le **25/08**
  → répondre « non » aurait **retiré le bouton** à tout fil plus ancien, ***une 4ᵉ panne fabriquée
  en réparant la 3ᵉ***. 👉 un message sans date **hérite de l'âge de sa conversation**
  (`ft4_coach_lastts`, qui existait déjà) ; sans rien, on garde le comportement d'hier.
  ⚠️ **Et un de mes témoins mesurait une chose impossible** : « < 12 h mais jour d'avant » n'existe
  que **la nuit**. Horloge épinglée à 01 h 30.
- ⚡⭐⭐ **« CETTE SÉANCE TE CONVIENT ? » — LE LANCEMENT EST FIGÉ** (ft-v1053). Michel, après
  **3 pannes du bouton en 8 jours** : *« il faut absolument figer le fait d'avoir toujours la
  séance lancée quand on lui demande une séance. Explique-moi avant de coder. »* — conception
  discutée et **validée par lui avant** la première ligne de code.
  ⛔⛔ **Les 3 pannes ont la même cause de fond** : la présence du bouton dépendait de la
  **FORME** de ce que Milo écrivait. *On ne peut pas énumérer d'avance toutes les façons dont un
  modèle écrit une séance* → tant que le déclencheur est la **réponse**, il y a une 4ᵉ panne.
  ⭐⭐ **Le déclencheur devient LA DEMANDE DE LA PERSONNE** — une chose qu'on connaît avec
  certitude, puisqu'elle l'a tapée. Aucun modèle ne peut la faire varier.
  ⛔ **Zéro geste en plus** (sa condition) : *« Oui, on démarre »* = le même bouton rouge, même
  place, **pleine largeur** (mesuré). Ce qu'on **gagne** est le *« Non, retravaille »* et ses
  **4 raisons en un tap** — avant, refuser une séance voulait dire la **retaper à la main**.
  ⚠️⚠️ **Vocabulaire corrigé par Michel** : *« un programme c'est une chose et juste la séance en
  est une autre »* → le libellé dit **séance**, un témoin refuse le mot *programme*.
  ⛔ **L'échec se DIT** : séance illisible → l'app le nomme et propose de la faire réécrire,
  jamais un bouton mort. ⛔ Le cervelet n'est appelé **qu'au tap** (0 coût sinon).
  ⚠️ **3 témoins existants ont rougi sans qu'aucun défaut n'existe** : ils comptaient *tous* les
  `<button>` de la carte, qui en porte maintenant deux légitimement. Re-visés sur `.btn-red` —
  ce qu'ils protègent est **un seul lancement**, pas un bouton. *On vise, on ne désarme pas.*
  🧾 **Noté** : l'idée *« chaque séance faite peut induire à un futur programme »* → `IDEES-FUTURES.md`.
- 🎽⭐⭐ **LE REPOS SUIT LA CHARGE, PAS L'OBJECTIF — chez Milo ET à l'écran** (ft-v1052).
  ⛔⛔ **Mesuré** : Milo recevait *« muscle → 8-15 reps, repos 60-90 s »* et le cadre muscu, et
  **rien qui lie le repos à la CHARGE** → sur un **3 reps à 88 %** il prenait les **reps de la
  force** et le **repos de l'hypertrophie**. ⛔ Les nombres ne sont **pas réécrits** dans le
  prompt (R2) : la phrase est **dérivée** de `_INT_LOURD` et `_cadreReposLourd` — change de
  discipline, elle passe toute seule à « 3 à 5 min ».
  ⛔⛔ **Et le contrôle existait déjà, il ne se voyait nulle part** : `_intensiteDefauts` ne
  tournait qu'à l'**application**, dans l'écran Séance. Michel lit le **chat** → pour lui il
  n'existait pas (**R3**). Il s'affiche maintenant **sous la séance proposée**.
  ⭐ **R13** : un seul point de greffe, `_appendStartSessionBtn`, passage obligé des 3 voies.
  ⛔ **Ça informe, ça ne décide pas** : le bouton reste (R24), charge et repos **non retouchés**
  (R29 — *il VOULAIT ses 95 kg*), borné à 3 lignes.
  ⚠️⚠️ **Un témoin m'a repris sur une erreur de CONCEPTION** : ma règle était dans le prompt
  **commun** — elle le faisait dépasser (45 973 → 47 729) **et**, plus grave, elle dépend de
  `S.discipline`, donc elle faisait varier **en silence** un bloc *partagé et mis en cache*.
  Déplacée dans le bloc **personnel** ; le commun est même retombé à **45 363**.
- 🆘⭐⭐ **3ᵉ PANNE DU BOUTON DE LANCEMENT EN 8 JOURS — un `break`** (ft-v1051). Michel :
  *« pk il y a tjrs une couille avec le lancement de la séance »*.
  ⛔⛔ `_renderCoachThread` ne ré-analysait que **le dernier** message de Milo. Chez lui, ce
  dernier message est *« la séance est écrite au-dessus »* — **aucune séance dedans** → plus
  aucun bouton, ***même après ft-v1049***. *Il suffit que Milo dise un mot après la séance.*
  ⭐ L'intention (« pas de vieille séance ») était bonne, la borne fausse : on remonte au plus
  **3 messages de Milo**, et un témoin épingle la borne — sans lui on aurait fait ressurgir
  n'importe quoi.
  ⭐⭐ **La leçon, relayée à session-A à la demande de Michel** : les 3 pannes viennent d'une
  hypothèse sur la **FORME** de ce que Milo écrit, et **il change d'écriture sans prévenir**.
  Un détecteur vérifié sur nos propres exemples ne teste rien.
  ⚠️ Le témoin XVII testait la survie du bouton **avec la séance en dernier message** — le cas
  « séance + un mot par-dessus » n'était couvert par rien.
  ⚠️ Renumérotée 1050 → 1051 : git a refusé mon push, session-A avait pris 1050.
- 📅⭐⭐ **LA SÉANCE PRÉVUE QUI N'A PAS EU LIEU — on DEMANDE ce qui s'est passé** (ft-v1050).
  Méthode de la coach de Michel, dans ses mots : *« si elle est loupée elle est loupée. C'est
  pas grave, sur une semaine. Plutôt elle demande ce qui s'est passé — fatigue, travail,
  empêchement, ça peut arriver. »* ⭐⭐ **Sa réponse nomme un TROISIÈME comportement** : ni
  rattraper (culpabilisant), ni se taire (indifférent) — **poser une question**, avec ses
  réponses déjà légitimées dedans.
  ⛔⛔ **Et l'app faisait PIRE que « ne rien dire », mesuré** : `plannedSession()` rend `null`
  dès que la date est passée, puis l'Accueil exécutait `S.nextPlanned=null; persist()` —
  ***elle effaçait la trace en silence***. Rien pour la personne, rien pour Milo (**R5**).
  ⛔ **« Pas d'IA surtout » (Michel) — et ça se mesure** : zéro appel réseau sortant sur tout
  le bloc de témoins. Déterministe, local, marche hors ligne.
  ⛔ **Jamais de rattrapage · aucun total · jamais deux fois pour la même date** (R24, R12,
  P21). La **croix** vaut « je ne veux pas le dire » : le fait est gardé, aucun motif inventé.
  ⭐ **R13 : zéro CSS ajouté** — la carte de Milo et les pastilles `.ck-opt` du check-in.
  ⚠️ **Défaut trouvé À LA CAPTURE** : « Pas la tête » **débordait** de sa pastille de 47 px,
  invisible dans le texte rendu. Un témoin mesure le débordement (`scrollWidth`), pas la
  longueur des mots.
- 🆘⭐⭐ **BLOQUANT CORRIGÉ — le bouton « lancer la séance » ne sortait plus** (ft-v1049), trouvé
  par Michel **en salle** : Milo écrit la séance, dit *« le bouton devrait apparaître »*, et il
  n'y en a pas.
  ⛔⛔ **Les TROIS voies échouaient pour la MÊME raison** (① bloc caché · ② `_ressembleASeance`
  **false** · ③ `_extractDaySession` **null**) : toutes lisaient `95×3` comme **« 95 séries de
  3 reps »**. 4 lignes jetées, 0 retenue, il en faut 2. ***Pas un chemin cassé : une hypothèse de
  FORMAT partagée par les trois.*** ⚠️ **2ᵉ fois** (20/08, même symptôme, autre format).
  ⭐⭐ **Le préfixe `S1`/`S2` lève l'ambiguïté que les bornes ne pouvaient pas lever** : dans
  « 3×3 » le 1ᵉʳ nombre compte des séries ; dans « S1 : 95×3 » la série est déjà nommée, donc
  c'est la **charge**.
  ⚠️⚠️ **Une série se perdait en silence** (2 au lieu de 3) : `nomAvant` ne remonte que 3 lignes
  et saute celles qui portent des nombres → nom vide sur `S3`. Une ligne `S2`/`S3` **hérite**
  maintenant du nom de la `S1`.
  ⭐⭐ **Témoin de référence** : le même contenu dans les 2 formats donne **exactement** la même
  séance. 📣 Ni pop-up ni point rouge — c'est une réparation.
  ⏭️ **Restent en attente du feu vert de Michel** : la règle du **repos qui suit la CHARGE** chez
  Milo (mesuré : il reçoit *« muscle → 60-90 s »* et l'applique à un **3 reps à 88 %**), et
  l'avertissement d'intensité **visible dans le chat**.
- 📤⭐⭐ **EXPORTER SON HISTORIQUE EN CSV ET EN PDF** (ft-v1048, demande de Michel sur sa vidéo).
  ⚠️⚠️ **R23 a changé le travail avant qu'il commence : l'export EXISTAIT** (Menu → Exporter mes
  données → « mes séances seulement »). ***Le trou n'était pas l'export, c'était le FORMAT*** — il
  sort du JSON. ⛔ Le JSON reste où il est (sauvegarder ≠ regarder son historique).
  ⛔⛔ **Un seul producteur de lignes** (`_histoLignes`) pour les deux formats (R2) · **mêmes
  colonnes que l'onglet `Sessions` du Google Sheet** + nom de séance et RIR · ⛔⛔ **aucune donnée
  de santé** (ni poids de corps, ni âge, ni sexe, ni e-mail).
  ⚠️ **Le CSV tient à deux détails** : séparateur `;` et **BOM UTF-8** — sans eux Excel FR met tout
  dans une colonne et casse les accents ; échappement réel des virgules et guillemets.
  ⚠️⚠️ **Le PDF échouait EN SILENCE** : `lastAutoTable` n'a **pas** de `startY` (que `finalY`) → le
  titre partait à `NaN`. *On vérifie les propriétés, on ne les devine pas* — 3ᵉ fois de la session.
  ⚠️ Et la **capture** a trouvé les en-têtes désalignés, qu'aucune mesure de chaîne ne voit.
  ⛔ Porte dans **Progrès**, à côté de l'historique · R15 (`_OVERLAY_CLOSERS`) · rien à exporter →
  rien ne s'ouvre.
- 🩹⭐⭐ **TROIS ERREURS DES CARTES DE PROGRÈS, TROUVÉES SUR UNE VIDÉO DE MICHEL** (ft-v1047, 10 s
  en production). Périmètre choisi par lui : **mes 2 cartes**, pas tout l'onglet.
  ⛔⛔ **La pire est de moi** : *« sur **37** séances »* puis *« 11 sur **27** »* — **deux
  dénominateurs qui se contredisent, sans un mot**. Cause reproduite : `_calSessMix` ne classe pas
  toutes les séances. ***C'est ft-v1027, refait par moi.***
  ⛔ **On ne répare PAS en comptant sur 37** : les non classées deviendraient des séances « non
  dominées par le haut », un **fait faux** (R29). La ligne **nomme sa fenêtre** et les deux nombres
  apparaissent **ensemble**.
  ⚠️ ② *« le plus souvent dominées »* à **41 %** : c'est le mode, mais ça se lit « la majorité ».
  ⚠️ ③ *« Le tronc domine 1 fois »* : 1 occurrence n'est pas une constante → plancher à 3.
  🎨 **Visuel mesuré** : la barre prend la couleur **« muscle »** de la figurine — ⛔ **toutes de la
  même couleur, seule la LONGUEUR varie**, donc ce n'est pas un statut (R31) ; le rail gris
  disparaît ; un **liseré gris** distingue la synthèse (miroir, pas alerte) ; le pied passe de 2
  lignes à 1 — ⛔ **alléger n'est pas supprimer**, l'exemple survit dans l'aide.
  ⭐ **326 → 309 px** (volume), **286 → 300 px** (synthèse, prix de l'honnêteté), 🔴 bouton central
  identique. 📣 **Ni pop-up ni point rouge** : une correction n'est pas une nouveauté.
  ⏭️ **Ensuite** : l'export CSV + PDF de l'historique (choix de Michel) — ⚠️ **l'export JSON existe
  déjà** (Menu → Exporter mes données → « mes séances seulement »), R23.
- 🎚️⭐⭐ **LE RPE — UN VOCABULAIRE, PAS UN 2ᵉ SYSTÈME** (ft-v1046). Michel l'avait différé, puis
  donné le critère : *« c'est des gens qui connaissent bien qui connaissent le RPE »* — donc il se
  **choisit** (Profil → Échelle d'effort), il ne se demande à personne. **Le RIR reste le défaut.**
  ⛔⛔ **Rien n'est stocké en plus** : `RPE = 10 − RIR`, donc `set.rir` reste le **seul
  propriétaire** et le RPE n'est qu'un **affichage** (R2). Basculer **ne convertit rien et n'efface
  rien** — l'historique se relit dans la nouvelle langue.
  ⭐⭐ **Le témoin central est celui de la donnée** (`set.rir` = 2 des deux côtés), et le plus
  tranchant celui du **vrai tap** : en RPE, taper « 9 » écrit `rir=1`, jamais 9.
  ⭐⭐ **Milo reçoit la PRÉFÉRENCE, pas une donnée traduite** : le contexte garde la mesure en RIR
  (non ambiguë) et ajoute la consigne de langue. Convertir la donnée aurait créé la 2ᵉ source
  qu'on refuse partout. Le bloc n'apparaît **que** si le RPE est choisi.
  ⚠️ **Limite écrite** : **pas de demi-points** (8,5 · 9,5). Ils existent dans le barème, mais on
  ne les **mesure** pas ; descendre le stockage au demi-point abîmerait le RIR pour tout le monde.
  ⏭️ **Arbitrage de Michel** si ça lui manque.
  ⭐ **R13** : les 2 boutons empruntent `goal-btn` — **0 ligne de CSS**.
  ⚠️ Un témoin a rougi sur du code correct : il lisait `innerText`, **vide dans un écran masqué**.
  → `textContent`.
- 📊⭐⭐ **LE VOLUME PAR GROUPE MUSCULAIRE ET PAR SEMAINE** (ft-v1045). Dernier morceau du relais
  de session-A. ⛔⛔ **R8 dans sa forme la plus pure** : `DISC_CADRE.volume` dit à Milo *« 10 à 20
  séries par groupe musculaire et par semaine »* — **il n'a jamais su combien la personne en
  faisait**. Contrôle négatif : `{aLaRegleDuCadre:true, aLaMESURE:false}` contre ft-v1043.
  ⛔ **Rien de neuf n'est inventé (R2/R31)** : `_MG` porte déjà les ~22 **groupes**, `exMuscles`
  la donnée écrite. On crédite le **muscle PRIMAIRE** seulement — compter le secondaire donnerait
  4 séries de triceps pour un développé couché.
  ⛔⛔ **La décision centrale est un SILENCE : aucune cible à l'écran.** Un mercredi, tout le monde
  est sous son cadre — l'afficher serait un **reproche sur une semaine inachevée** (défaut refusé
  en ft-v1022 et ft-v1029). L'écran donne des **faits** ; **Milo** reçoit les deux côtés et sait
  quel jour on est. *Le code compte, Milo juge.*
  ⚠️⚠️ **Sous-comptage silencieux trouvé à la mesure** : *« Traction »*, *« Presse à Cuisses »*
  sont des **préfixes ambigus** qui ne résolvent pas — leurs séries disparaissaient sans un mot,
  donc le total était **plus petit que la réalité et présenté comme un fait**. Comptées à part et
  **nommées**. ⭐ Portée mesurée : **359 exercices du catalogue sur 359** ont leurs muscles écrits
  — la ligne ne peut concerner qu'un nom tapé à la main ou importé.
  ⛔ **Le cadre ne parle de cette grandeur que pour 2 disciplines sur 5** (powerbuilding compte par
  séance, powerlifting par mouvement, haltero n'a rien de chiffrable) — Milo en est prévenu.
  ⏭️ **Personne ne compare encore le volume à quoi que ce soit** : c'est délibéré, et le changer
  serait un arbitrage de Michel.
- 📉⭐⭐ **L'ÉVOLUTION ATTENDUE EN RECOMPOSITION** (ft-v1044). La carte « tendance du poids »
  disait *« l'évolution attendue est **variable** »* pour l'objectif `recomp` — le repli écrit
  pour un objectif **inconnu**, servi à quelqu'un dont l'objectif est parfaitement défini.
  ⛔⛔ **Et le jumeau était pire (R8)** : `onTrack` dans `coach.js` n'avait pas `recomp` non plus
  et retombait sur `Math.abs(x)<0.2` — **mesuré contre l'ancien code, quelqu'un à −0.21 kg/sem,
  PILE dans sa cible, arrivait chez Milo en « ⚠ à ajuster selon objectif »**. Milo lui aurait
  conseillé de corriger une trajectoire correcte : un **fait faux sur la personne** (R29, P4).
  ⭐⭐ **Le chiffre vient de l'app elle-même, pas d'une valeur importée** : `_GOAL_DELTA_KCAL.recomp
  = -250` kcal/j → −1750 kcal/sem → **≈ −0,23 kg** si tout venait du gras. Bande **0 à −0,3
  kg/sem**, un seul propriétaire (`_GOAL_TREND_RECOMP`, `state.js`) que l'écran **et** Milo lisent.
  ⚠️ **Aucun pourcentage à l'écran** — question de Michel (*« tout le monde va comprendre le
  pourcentage ? »*), et elle a un témoin. Le repère en % du poids de corps est celui d'une
  **sèche** (Garthe 2011, norvégien ; Helms 2014) : *une recomposition n'en est pas une.*
  ⛔ **Et la balance est le mauvais instrument ici, l'écran le DIT** : le gras qui part et le
  muscle qui vient s'annulent dessus — sans cette phrase, une balance immobile se lit comme
  *« il ne se passe rien »*, le meilleur moyen d'abandonner un objectif qui marche.
  ⛔ **Les 5 autres objectifs gardent leurs seuils**, exprès et écrit (R30).
- 🎽⭐⭐ **LE CONTRÔLE D'INTENSITÉ CONNAÎT ENFIN LA DISCIPLINE** (ft-v1043). Relais de session-A
  (*« le trou le plus petit et le plus rentable »*), choisi par Michel. ⛔⛔ **Mesuré** :
  `_intensiteDefauts(nom, sets)` ne portait **aucune** occurrence de `discipline` ni de `DISC_` —
  **un seul chiffre, 150 s, pour tout le monde**, quand `DISC_CADRE.repos` dit *« 3 à 5 min »* en
  force athlétique et *« 60 à 120 s »* en bodybuilding. ***L'app affichait un cadre et en
  vérifiait un autre.*** 👉 Un powerlifter à **160 s** entre deux séries à 88 % ne recevait
  **rien** ; il est prévenu, et le conseil cite **sa** plage.
  ⛔⛔ **Le plancher à 150 s reste** : c'est la décision de Michel (*« un 3×5 avec 90 secondes de
  repos c'est IMPOSSIBLE »*) et le bas de plage de `muscu` vaut 90 s — lire le cadre sans
  plancher aurait rendu **son propre cas silencieux**. Le seuil `max(150, bas de plage)` **ne peut
  que resserrer**.
  ⚠️⚠️ **Mon 1ᵉʳ jet se contredisait** : il citait la plage partout, donc en `muscu` quelqu'un
  averti à 100 s se voyait conseiller *« 1,5 à 2,5 min »* — **une fourchette qui contient son
  propre repos**. Le témoin épingle la **règle** : le minimum conseillé ne descend jamais sous le
  seuil.
  ⛔⛔ **Trois idées évidentes vérifiées puis ÉCARTÉES (R30)** : le plafond de charge ne bouge pas
  (Brzycki est de la **physiologie**) · `_INT_LOURD`=0,80 est **déjà juste** pour les 5 · et on
  n'avertit **pas** sur une charge au-dessus du cadre, que les cadres **autorisent eux-mêmes**
  (*« du lourd ponctuel ne se reproche pas »*) — l'app se serait contredite.
  ⏭️ **Le trou suivant est nommé** : `DISC_CADRE.volume` reste de la prose — **rien n'additionne
  les séries × muscle × semaine**.
- ⚖️⭐⭐ **LA QUANTITÉ SUR UN ALIMENT REPRIS — LIVRÉ** (ft-v1042). Michel, 2 captures : *« il faut
  absolument que je puisse mettre le poids sur les aliments réutilisés, qu'ils soient rentrés
  avec le code-barre, ou à la main ou encore avec l'IA »*.
  ⛔⛔ **5ᵉ fois le même oubli**, et le code le dit déjà de lui-même (ft-v973, v975, v984, v999) :
  *le mécanisme existait, posé d'un seul côté*. La reprise depuis le **journal** gérait la
  quantité ; celle depuis **« Mes aliments »** remplissait les macros et s'arrêtait.
  ⛔ **`per100` était jeté deux fois en amont** (R4) — et mettre en **favori** faisait *perdre*
  la quantité. Le défaut n'était pas dans le calcul, il était dans le **transport**.
  ⭐ **Mesuré sur les 3 origines** : code-barres → grammes à la **dernière quantité (150 g)** ·
  à la main → portions · IA → portions. Recalcul juste : 150→200 g = **700 kcal / 154 g**.
  ⚠️ **Défaut trouvé à la capture** : champ à 150 g, ligne verte « pour tes 200 g » — le total de
  l'aliment précédent. **La jumelle** (reprise depuis le journal) l'avait aussi : les deux
  corrigées (R8).
- 🔭⭐⭐ **BRIQUE 8 « SYNTHÈSE » — SA PREMIÈRE PORTE, ET LES 8 BRIQUES SONT BRANCHÉES** (ft-v1041).
  Michel : *« la brique 8 alors »*. ⛔⛔ **État mesuré avant : `signal 1, porte 0`, et le signal
  était un LEURRE** — `briques.py` cherchait `startPt001Test`, un **outil admin**. La brique
  n'avait pas « un socle sans porte », elle n'avait **rien**. ⚠️ 2ᵉ motif supposé corrigé en deux
  jours : *on vérifie les noms, on ne les devine pas.*
  ⭐⭐ **La frontière avec la 7 est écrite dans la Vision** : la 7 dit *« que s'est-il passé ? »*,
  la 8 dit ***« qu'est-ce que cette histoire m'apprend ? »***. Tournures autorisées : *« une
  constante apparaît »* — ⛔⛔ **jamais *« tu devrais »*** (P14, témoin dédié).
  👉 **Trois constantes en local**, en tête de Progrès : rythme réel · l'exercice le plus fidèle ·
  la région **dominante** (via `_calSessMix`, R13/R2 — rien de neuf n'est calculé).
  ⛔ **Chaque ligne nomme sa fenêtre** (défaut de ft-v1027) · **aucune comparaison à une norme** ·
  sous **8 séances / 21 jours** elle **dit qu'elle ne sait pas** (leçon ft-v1021) · aucune séance
  → la section n'existe pas.
  ⚠️⚠️ **Deux noms supposés m'ont coûté une constante chacun** : `m.region` au lieu de `m.reg`
  (silencieux), et *« le tronc revient 0 fois »* — qui se lit *« tu ne le travailles jamais »*,
  et c'est **faux** : `_calSessMix` rend la **dominante**. *Une mesure juste peut produire une
  phrase fausse* (ft-v1035, le lendemain).
  ⚠️ **Un témoin existant a rougi 3 fois, et la cause était la MONTRE** : le bloc CXXXVII lit
  l'**écran rendu**, donc l'horloge réelle — à 20:12 Paris, *« ce qu'il te reste »* se tait
  exprès (ft-v1029). Horloge du navigateur figée à 14 h, aucune exigence affaiblie.
  ⏭️ **Le socle des 8 briques est complet ; ce qui reste est ailleurs** (voir plus bas).
- ⚧⭐⭐ **LE SEXE N'EST PLUS PRÉ-COCHÉ À L'INSCRIPTION — LIVRÉ** (ft-v1040). Michel : *« pas de
  sexe pré coché mais bloquant pour l'inscription sinon c'est n'importe quoi »*.
  ⛔⛔ **Le défaut tenait en une classe CSS** : « ♂ Homme » portait `ob-sel` d'avance et
  `_obGender` valait `'H'`. *L'app ne pouvait pas distinguer « il a choisi homme » de « elle
  n'a pas regardé ».* Aucun des deux n'est coché, et l'étape **bloque** tant qu'on n'a pas
  répondu — l'indice n'apparaît **qu'après une tentative** (R24).
  ⭐ **Le coût, mesuré** : Mifflin diffère de **166 kcal** (+5 / −161) → **+257 kcal/jour** à
  activité 1,55, plus la figurine, la santé, la morphologie, la masse grasse, le ton de Milo et
  le cycle. C'est **R29**. ⭐ Nuance : avec un bilan corporel, l'app passe à Katch-McArdle, qui
  ignore le sexe.
  ⚠️⚠️ **Correction de ce que j'avais annoncé** : « un profil sans sexe renseigné », **ça
  n'existe pas** — `S.gender` vaut toujours H ou F. L'asymétrie du code est réelle mais
  inatteignable, et elle le reste (garde sur les deux écritures).
  ⚠️⚠️ **Et 3 témoins ont rougi, les miens** : le bloc d'alignement Nutrition rendait « 0 ligne »
  parce qu'il était **20 h 15 à Paris** — ma propre bascule du soir de ft-v1029. J'avais épinglé
  l'heure sur les appels de **calcul**, pas sur le **rendu**. *Épingler une moitié du chemin ne
  suffit pas : c'est le contexte entier qu'il faut figer* (`clock.setFixedTime`).
- 🕰️⭐⭐ **BRIQUE 7 « TON HISTOIRE SPORTIVE » — SA PREMIÈRE PORTE** (ft-v1039). Michel :
  *« ah bah oui c'est super important »*. ⛔⛔ État mesuré avant : **socle seul, porte 0** —
  `dayStateLog` existait depuis des mois, **rien ne le relisait**.
  ⚠️⚠️ **Le déclencheur de la fiche était injouable** : l'anniversaire (*« il y a un an »*) ne
  peut pas se produire, l'app est née le **17/06/2026**. → **contextuel** en premier : une douleur
  déjà notée revient. ⭐ Le **Souvenir** est l'objet métier de la fiche, et **la RAISON est
  obligatoire** : sans elle, il ne remonte pas. ⛔ Il **décrit, ne prédit jamais** (P14) et dit sa
  limite (*« parmi ceux que tu avais notés »*). ⛔ **Trois silences** : rien aujourd'hui · première
  fois · moins de 14 jours. ⭐⭐ **La brique passe de 🟠 socle seul à ✅ branchée** — première
  brique à changer d'état depuis le 29/07. ⏭️ ~~Reste la 8 (Synthèse) sans porte.~~ **Faite le
  jour même, ft-v1041 ci-dessus** *(ligne barrée plutôt que réécrite : elle datait la veille du
  jour où elle a cessé d'être vraie — R23)*.
- 💪⭐⭐ **LE RIR — « il t'en restait combien ? » — LIVRÉ** (ft-v1038, demande de Michel).
  ⛔⛔ **R8 dans sa forme la plus pure** : `DISC_CADRE.echec` dit la règle par discipline
  (*« JAMAIS à l'échec »*, *« 1 à 3 en réserve »*) et Milo la reçoit — mais **RIR/RPE n'existaient
  nulle part**. On lui demandait de juger une réserve qu'on ne mesure jamais.
  ⭐ **Le tag `X` = Échec EST un RIR de 0** → un seul propriétaire (`_rirDeSet`), pas de 2ᵉ système.
  ⭐ **Saisie dans la barre de repos** (valider une série démarre le repos — mesuré) ; la ligne de
  série a déjà 6 colonnes sur 430 px. ⛔ **Facultatif, retirable, et `null` n'est PAS 0.**
  ⚠️ **L'ordre m'a piégé** : `startRest` commence par `stopRest()`, qui vide la cible → cible
  « en attente », déposée par `toggleSet`, consommée par `startRest` (il y en a **cinq**).
  ⭐ Restitué dans « précédent » (*8×80·2r*) — c'est là qu'il sert : **avant de refaire la série**.
  ⏭️ **RPE différé**, décision de Michel.
- 🧹 **29 Mo DE PAQUET PYTHON RETIRÉS (27/08, pas de version)** — `imageio_ffmpeg-…-.whl`,
  **21 % du dépôt**, entré par un `git add -A` lors de la session où il fallait lire une vidéo.
  Personne ne le référençait ; il partait sur le **site public**. Dépôt **140 → 111 Mo**.
  ⛔ **Pas une question d'argent** : mesuré, `billable: 0 ms` — un dépôt **public** ne consomme
  aucune minute Actions, donc Force Tracker ne peut pas atteindre le plafond des 2 000. Les
  raisons du retrait : publié, alourdit chaque clone, et **ressemble à une dépendance**.
  ⭐ **Contrôle 9 de `check_regles.py`** : refuse tout paquet (`.whl`/`.tar.gz`) et tout fichier
  **> 5 Mo à la racine** — il mesure la **conséquence**, pas le motif, parce qu'un `.gitignore` ne
  protège que les formes qu'on a pensé à écrire. Éprouvé dans les deux sens.
  ⏭️ **Signalé à session-B** : 2,9 Mo de `cap_*.png` à la racine viennent de leur branche — pas
  touchées, c'est leur décision (**R30**).
- ⛔ **DÉCISION (27/08) — ON NE TOUCHE PAS À `deploy-pages.yml`.** Michel : *« on ne touche pas au
  workflow surtout »*. ⚠️ **À lire avant de reproposer l'optimisation évidente** : mesuré, **17
  déploiements pour 3 livraisons** (les lignes de réservation 🟡 sont du markdown seul et
  redéploient tout), et 9,4 Mo inutiles empaquetés à chaque run. **Un `paths-ignore` a été
  proposé et refusé** : ce workflow existe *parce que* les déploiements se bloquaient **en
  silence** (ft-v600, ft-v616), et un filtre qui empêche un run de partir recrée ce mode de panne
  (**R18**). ⛔ **Et la dépense invoquée n'existe pas** : `forcetracker` est **public**, donc
  Actions y est **gratuit et illimité** ; le relevé affiche **0 $ facturé**.
- 🔤⭐⭐ **125 GRAISSES QUI N'EXISTAIENT PAS — CORRIGÉ** (ft-v1037). Michel : *« fais un check de
  toutes les polices et les tailles »*, puis *« fais les 2 premiers points »*.
  ⛔⛔ **Mesuré en comptant l'ENCRE déposée** : **Manrope** fournit 400→800 (le pas 800→900 dépose
  **+0,0 %**), **Space Grotesk** 500→700 (700→800 et 800→900 : **+0,0 %**). 125 déclarations
  demandaient une graisse absente du fichier. Rien n'était cassé — le navigateur ramène au
  plafond ; le coût est que *`900` pour être plus lourd que le `800` d'à côté ne change **rien***.
  ⛔ **Règle de sûreté** : `900 → 800` est sans effet quelle que soit la famille ; on ne descend à
  700 que là où la règle déclare elle-même `--font-cond`.
  ⚠️⚠️ **Ma 1ʳᵉ mesure était inutilisable** : comparaison de captures, les 9 écrans « changeaient »
  — mais **deux captures du MÊME code différaient aussi**. Remplacée par une mesure déterministe :
  **11 915 éléments** de texte, **1 182 graisses demandées changent · 0 graisse effective**. Une
  erreur injectée est détectée sur 9 écrans. Famille **§21** de `BUGS.md`.
  ⚠️⚠️ **Le point 1 (retirer Pacifico) est ANNULÉ, et l'erreur était de moi** : elle compose le
  prénom de l'**écran d'anniversaire**. `document.fonts` disait `unloaded` parce que cet écran
  n'était pas affiché. Famille **§22** — *« jamais chargé » n'est pas « jamais utilisé »*.
  ⏭️ **Reste ouvert (point 3, non fait)** : tout est en **pixels figés** — quelqu'un qui agrandit
  la police dans les réglages de son téléphone ne voit **aucun changement**. Vrai chantier
  d'accessibilité, à décider.
- 🧹⭐⭐ **18 RÈGLES CSS ÉCRITES DEUX FOIS — NETTOYÉ** (ft-v1036). Michel : *« c'est quoi ça ? »*,
  puis *« vas-y mesure »*. Tout le bloc de la carte « Suppléments » était **recopié 200 lignes
  plus bas**, dont **10 règles avec des valeurs différentes** : la dernière gagnant toujours, la
  première affichait des valeurs que **personne ne voyait** (icône 22 au lieu de 24, dose 15 au
  lieu de 16, barre 8 au lieu de 10).
  ⭐ **L'écran a toujours été juste** — le 2ᵉ bloc est un restylage volontaire. Le vrai coût est
  le **prochain correctif** : modifier la 1ʳᵉ version ne change rien à l'écran. C'est **R2**, et
  c'était déjà arrivé.
  ⚠️⚠️ **Mon analyse de la veille était FAUSSE** : « la première est du code mort » — vérifié
  propriété par propriété, il en restait **une de vivante** (`margin-top:2px`). *Une propriété
  non redéclarée n'est pas écrasée, elle se CUMULE.* **Un doublon se prouve propriété par
  propriété, jamais règle par règle.**
  ⭐⭐ **384 comparaisons, 0 écart** — et le contrôle négatif détecte **34 écarts** sans le report,
  donc la mesure sait rougir. Témoin permanent : plus aucune règle CSS en double (1 tolérance,
  avec sa raison, et un témoin qui refuse une tolérance périmée).
- 📍⭐⭐ **UNE CHARGE PRESCRITE SANS REPÈRE LE DIT — LIVRÉ** (ft-v1035), application du critère
  donné par Michel : *« la coach savait que moi je m'y connais ; tout le monde ne connaît pas ce
  que représente le "lourd" »*. 👉 La question n'était pas *chiffrer ou qualifier*, mais
  **« a-t-on la référence ? »**. ⛔⛔ Trou mesuré : `_intensiteDefauts` se tait **entièrement**
  sans record — Milo pouvait donc chiffrer sur un exercice jamais fait sans un mot (**ft-v980**
  privé de garde-fou). ⛔ **Le nombre n'est pas retiré** (R24) : il est **nommé** pour ce qu'il est.
  ⚠️ Le résolveur de noms **ne suffisait pas** (`exNomCatalogue('Developpe Couche')` rend la chaîne
  telle quelle) → comparaison normalisée, sinon on affirmait un **fait faux sur la personne** (R29).
  ⏭️ **Ce que ça ne fait PAS** : ça n'empêche pas Milo de chiffrer. Le registre qualitatif
  (« lourd ») reste **une décision produit de Michel**, non tranchée.
- 📐⭐⭐ **LES CARTES NUTRITION ALIGNÉES ET JUSTIFIÉES — LIVRÉ** (ft-v1034). Michel, 5 captures :
  *« visuellement c'est pas propre, il faut que tout soit aligné et justifié »*.
  ⛔⛔ **Le défaut était mesurable et sa cause tient en un mot : `min-width`.** Un minimum laisse
  la colonne GRANDIR avec son texte → le contenu démarrait à **116 · 124 · 126 · 126 · 134**, et
  les idées de « ce qu'il te reste » à **125 · 147 · 152** (27 px). Après : **138** et **144**,
  pour toutes les lignes. Colonnes fixes en grille, largeurs **mesurées** sur le plus long
  libellé et épinglées par un témoin.
  ⭐⭐ **Le témoin vérifie une ÉGALITÉ, pas une valeur** : un x en dur deviendrait faux au premier
  changement de police, et il faudrait le corriger sans rien apprendre.
  ⚠️ **« Justifié » a été mesuré avant d'être appliqué** : écart entre mots 3,0 → 7,0-9,6 px,
  **sans changer le nombre de lignes ni la hauteur**. `hyphens:auto` est posé pour Safari et ne
  change rien dans le Chromium des tests — c'est écrit plutôt que présenté comme vérifié.
  ⭐ **Un défaut trouvé à la CAPTURE** que la mesure de position ne voyait pas : *« + 250 / g de
  Steak haché »* — parfaitement aligné, et illisible. Espace insécable partout.
  ⚠️⚠️ **Trouvé au passage, NON corrigé exprès** : `.tip-box` est déclarée **deux fois** dans
  `style.css`, et le bloc qui l'entoure **a déjà divergé** (`.dose-val` 15px/800 vs 16px/900 —
  la première est du code mort). C'est **R2** en vrai. Le nettoyage demande de vérifier chaque
  règle du bloc : à faire à part, pas au milieu d'un correctif d'alignement.
- 🪟⭐ **LA BARRE « SÉANCE » LAISSAIT LIRE CE QUI DÉFILE DESSOUS — CORRIGÉ** (ft-v1032), trouvé sur
  une **vraie vidéo** de l'iPhone de Michel. `#log-hdr` à `rgba(…,.55)` : *« Choisis par quoi tu
  commences 👇 »* se lisait **à travers**, emoji compris. ⛔ **Pas une bizarrerie iOS** — reproduit
  dans Chromium : *un flou adoucit, il ne cache pas.* Opacité → **`.96`**, flou **conservé**.
  ⛔⛔ **Et le CSS n'avait pas bougé** : l'écran Séance **vide** était défilable de **0 px** avant
  ft-v1026, de **224 px** depuis les cartes de types. *Le défaut était inatteignable, pas absent.*
  **3ᵉ fois en deux jours** → nouvelle famille **§21** de `BUGS.md` : *dater la ligne fautive avant
  d'accuser sa propre livraison.*
- ⏳⭐⭐ **LE REPOS EST UN MAXIMUM, PAS UN COMPTE À REBOURS — LIVRÉ** (ft-v1030). Décision de
  Michel : *« on peut repartir avant, c'est autorisé »*, relayée par session-A depuis les 6
  programmes de sa coach (colonne **« Repos maximum »**, valeurs en **plages**).
  ⛔⛔ **Et la mesure d'avant-travail a démenti ce que j'avais annoncé la veille** : le chrono
  **s'arrêtait** à 0:00 (barre masquée, `restIv` vidé), sur les deux chemins.
  👉 **ft-v851 (14/08) avait retiré les bornes `Math.max(0,…)` des deux fonctions d'AFFICHAGE
  sans jamais toucher à `_restTick`**, qui appelait `stopRest()`. *Les afficheurs savaient
  montrer du négatif ; plus personne ne les appelait.* **La fonctionnalité n'avait jamais
  tourné** — 2ᵉ cas de la famille « le correctif posé d'un seul côté » dans `BUGS.md`, et le
  plus coûteux : **le côté oublié était celui qui DÉCIDE**.
  ⛔⛔ **Le défaut que j'ai failli livrer** : mon libellé écrivait dans `#rest-label`, qui porte
  déjà *Échauffement*, *Récup. à l'échec*, *📈 Pyramide +*, *⏭️ Ensuite : …* — `updRest` tournant
  à chaque tick, il les aurait tous effacés **en silence**. Il a son propre `#rest-over` (**R2**).
  ⛔ Le callback superset part **exactement une fois**, le tap sur l'écran GO arrête tout, arrêt
  de sécurité à **15 min** (un seul propriétaire pour ce nombre).
  📣 Règle #11 en entier — la pop-up **se mérite** (un repère a bougé : la barre ne disparaît
  plus) : `WHATS_NEW` **v61** · point rouge `repos-maximum` · aide `?` de l'onglet Séance · aide
  détaillée · diapo du Guide **sans image, exprès** (une capture montrerait l'écran d'avant).
- 🌙⭐⭐ **« CE QU'IL TE RESTE » S'ARRÊTE DE POUSSER À 20 H — LIVRÉ** (ft-v1029). Michel :
  *« alors à 22 h je vais pas bouffer de la ratatouille lol »*, **et c'est lui qui a tranché
  l'heure : 20 h** (une décision, pas une moyenne trouvée dans le code — R29).
  ⛔⛔ **Le défaut n'est pas le chiffre, c'est le VOLUME proposé à une heure où on ne mange plus** :
  les bornes de ft-v1019 (2 portions · 250 g) sont **justes à 14 h** et **absurdes à 21 h**.
  *C'est la BORNE qui dépend de l'heure, jamais le calcul* — `_resteDuJour` rend la même chose
  des deux côtés, et un témoin l'épingle.
  ⛔⛔ **Le vrai garde-fou est ANTI-TCA (P21)**, pas ergonomique : à 21 h, *« il te manque 200 g
  de protéines »* est un **reproche sur une journée qu'on ne peut plus changer**. Donc quand plus
  rien de léger ne couvre le quart du manque, **la ligne se tait** — sans que ce soit « tout
  disparaît » : ce qui reste couvrable est toujours dit.
  ⭐ **Mesuré sur les mêmes données** : plus aucune **combinaison** le soir, bornes à **1 portion
  / 150 g**. Le pied de bloc **nie le rattrapage** au lieu de le suggérer, et une entrée d'aide
  `?` dit pourquoi (R25). ⛔ Pas de pop-up : rien à faire, aucun repère déplacé.
  ⚠️⚠️ **Le piège était dans les TESTS, pas dans le code** : les témoins existants lisaient
  l'horloge réelle — **verts le matin, rouges à 21 h**. Épinglés à 14 h. *Un témoin dont le
  verdict dépend de l'heure du lancement mesure la montre, pas le code.*
  ⚠️ **Et un de mes témoins aurait été un FAUX VERT** : `Math.max(0,…) <= 150` passe aussi quand
  **rien** n'est proposé. Durci avant livraison.
- 🐢⭐⭐ **LE TEMPO DESCEND JUSQU'À LA DONNÉE — LIVRÉ** (ft-v1028). Première suite du relais de
  session-A sur les **6 programmes de la coach de Michel** (2023, `docs/NUTRITION-PROGRAMMES-REELS.md`
  §3bis) : chez elle le **tempo est une COLONNE**.
  ⚠️⚠️ **J'avais dit « le tempo n'existe nulle part » — c'est FAUX** : la consigne libre par
  exercice existe, s'affiche en séance et part chez Milo.
  ⛔⛔ **Le trou est ailleurs, et c'est R4** : le tempo est de la **prose** dans une note et une
  **constante** (`SEC_PAR_REP = 3`) dans le calcul. Mesuré : 10 reps à « 3 s + 2 s » = **60 s**
  de travail, l'app en comptait **40**.
  ⛔ **Le piège est le REPOS** (« 45 sec max » = sa colonne *Repos maximum*) → deux garde-fous +
  borne 1-15 s/rép. **Rien de chiffrable → on se tait**, jamais « 3 par défaut » (R29).
  ⛔⛔ **Et le vrai défaut du jour est un `? :` sans parenthèses** : un exercice qui portait une
  **consigne perdait son bandeau 🛡️ blessure / 🚫 exclusion** — la sortie du Gardien — et ce sont
  justement les exercices venus d'un **programme** qui ont une consigne.
  🧾 **Au passage, une mesure de gouvernance** : `docs/JOURNAL-DE-TEST.md` annonçait **54** entrées
  pour **59** — cinq portaient un `🟠` hors légende, **sauté en silence**. Ramenées à `🟡`, et
  `check_regles.py` **refuse** désormais un état inconnu au lieu de l'ignorer.
  ⏭️ **Deux constats du relais restent OUVERTS, et ils sont pour Michel** : ① le **repos comme
  MAXIMUM** plutôt qu'un compte à rebours (⚠️ écart plus étroit qu'annoncé — le chrono continue
  **en négatif** depuis le 14/08) ; ② **Milo prescrit des kilos** quand une coach écrit *« lourd »*
  — le doc lui-même pose ça en **question ouverte**, pas en défaut.
- 🏋️⭐⭐ **LES TYPES DE SÉANCES REMPLISSENT L'ÉCRAN VIDE — LIVRÉ** (ft-v1026). §2.1 du parcours
  de découverte, et **la plainte d'origine de Michel** : *« quand on arrive c'est vide »*.
  ⛔⛔ **Le vrai travail était R4** : `DISC_CADRE.coeur` dit « SQUAT · DC · SDT » en **prose** —
  exact et **totalement inexploitable**. `DISC_SEANCE` est la descente manquante vers la DONNÉE.
  ⛔ **Aucune 2ᵉ liste de types** (R2) : les 5 viennent de `DISC_LABELS`/`DISC_CADRE`.
  ⭐⭐ Michel a tranché **« les 2 carrément »** : la carte porte la ligne **chiffrée** du cadre
  (option c) et le tap **crée la séance** (option a) ; le cadre complet est au « ⓘ ».
  ⭐ **Les reps et le repos suivent la discipline** — mesuré : powerlifting → 3 reps / 300 s.
  ⚠️ **Réserve écrite** : pas d'arraché complet au catalogue → la séance haltéro est une séance
  de **travail**, pas de compétition.
  ⚠️⚠️ **La capture a montré un défaut invisible au texte** : ma 1ʳᵉ ligne courte tronquait la
  prose et sortait « jusqu'à 15- ». *Une phrase coupée n'est pas une info courte, c'est une info
  FAUSSE.* → extraction du motif chiffré.
  ⏭️ **Le chantier écran Séance est terminé** (5 briques + celle-ci). La suite du parcours de
  découverte : §2.2 les conseils d'échauffement (**le seul vrai trou** selon le cadrage).
- 🧾⭐⭐ **DEUX MOYENNES JUSTES QUI SE CONTREDISAIENT À L'ÉCRAN — CORRIGÉ** (ft-v1027), trouvé sur
  une **vraie capture** de Michel. La carte « ce que l'app a appris » disait *« en moyenne
  1920 kcal »* et, **40 px plus bas**, *« Ta semaine · 2 495 kcal/j »*. **Les deux sont exacts** —
  l'un porte sur **tout le journal**, l'autre sur les **7 derniers jours** — mais rien ne le
  disait. ⛔ **Aucun calcul n'a changé** : la carte **nomme sa fenêtre**, c'est tout.
  ⚠️ + « répartis sur 50 » (nombre nu) → « étalés sur 50 **jours** » · « 1920 » → « **1 920** ».
  ⏭️ **Non tranché, et c'est à Michel** : « ce qu'il te reste » propose 500 g d'aliments pour
  couvrir **27 %** d'un gros manque de glucides. Ce n'est pas un bug (les bornes sont voulues,
  et l'écart est annoncé) — mais sous ~40 % de couverture la ligne cesse d'aider.
- ✅🛡️ **LE PLAFOND DE DÉPENSE EST ARMÉ — plus RIEN en attente sur le PC de Michel** (30/08).
  Vérifié dans l'app : *🛡️ Plafond de dépense — **ARMÉ***, constaté le 30/08 à 12:54. Au-delà du
  plafond, les appels à Milo sont désormais **refusés** ; avant, ils étaient comptés et rien ne
  les arrêtait. ⛔ **Pourquoi ça avait traîné** : l'empreinte du 25/08 était en place, mais la
  clé chez Cloudflare était l'**ancienne** — et Cloudflare **chiffre** ses variables, donc
  personne ne pouvait le voir, *pas même son propriétaire*. ***Deux secrets qu'on ne peut ni
  l'un ni l'autre relire ne se comparent jamais : ils se REFONT ensemble, ou pas du tout.***
  ⚠️ **Et un `git push origin master` lancé depuis une AUTRE branche** a poussé la branche
  locale `master`, pas mon travail — en répondant un message de **succès**. Michel aurait lu
  « DÉSARMÉ » et conclu que sa clé était mauvaise (**R18** : vérifier le déploiement, run #96).
  ⛔ **Le Squat Sumo n'en fait plus partie** : l'exercice a été **supprimé le 25/08** sur
  décision de Michel (*« squat sumo on supprime »*), après 12 jours d'attente d'une figurine
  **à la barre** qui n'est jamais venue. ⚠️ **Je l'ai pourtant reproposé le 26/08** — je lisais
  un état du projet daté du **24/08**, la veille de sa décision. *C'est **R23** : un document
  d'état qu'on ne met pas à jour fait dire des bêtises à celui qui le lit*, et c'est la 3ᵉ fois
  de la journée. ⭐ Son identifiant `squat-sumo` survit dans `EX_IDS` : **les séances déjà faites
  gardent tout** — on a retiré le choix, jamais la mémoire.
- 🍽️⭐⭐ **L'ONGLET MACROS RÉORGANISÉ — LIVRÉ** (ft-v1025). Chantier `docs/MACROS-A.md`
  (variante A), maquette **confrontée au code avant d'écrire une ligne**.
  ⭐⭐ **Le défaut était MESURÉ** : **2 649 px (3,1 écrans)** avant de savoir où on en est, la
  **cible écrite deux fois** à 200 px d'écart, *« noter ce que je mange »* **à 1 783 px** du
  haut, et **647 px de réglages** au milieu du contenu quotidien.
  👉 **Mesure finale : 793 px** pour les 5 premiers blocs (objectif 844), **total 1 439 px
  (−46 %)**, *« noter »* **à 415 px**.
  ⛔ **Rien n'est supprimé** (R30) ; ⛔⛔ **aucun `id` renommé** — un `id` renommé casserait le
  remplissage **en silence** (l'écran resterait sur « — »), d'où le témoin des **11 trous**.
  ⭐ **R13** : l'accordéon `details.acc` existait déjà (Profil, menu admin) → **zéro CSS ajouté**.
  ⚠️⚠️ **Deux erreurs du brief corrigées à la mesure** : l'« anneau de récup » qu'il donnait en
  modèle SVG est en **`conic-gradient`** (le vrai anneau SVG est celui de la bande des 7 jours),
  et `#nu-cycle` n'est **pas** charge/décharge (c'est `.phase-row`).
  ⚠️ **Sa fusion carte-du-jour + semaine a été REFUSÉE par la mesure** : 958 px pour les 5
  premiers blocs, contre 844 annoncés. La semaine reste à part, avec le **rétrospectif**.
  🧠 **« Ce que l'app a appris » déplacée du Journal vers Macros** (décision Michel) —
  **déplacée, pas dupliquée** (R2).
  🔴 **Bouton central « + » : 44×44, cx 166,8, top 792 — identique**, mesuré à trois moments.
  ⏭️ **Hors périmètre, écrit comme tel** : l'onglet **Journal** (qui ne tient plus en un écran),
  l'onglet **Suppléments** (jamais relevé bloc par bloc), le **mode clair**, et surtout **rendre
  le plan de repas réellement personnalisé** — c'est la raison pour laquelle il est replié.
- 🧹⭐ **« SCANNER » ET « IMPORTER UN JOURNAL » RANGÉS — LIVRÉ** (ft-v1024). **5ᵉ et dernière
  brique** du chantier écran Séance : *le chantier en 5 points est TERMINÉ.*
  ⛔⛔ **Mesuré** : 200 px pleine largeur pour deux actions qui servent **une fois dans une
  vie**, contre ~110 px sur une demi-rangée pour « + Créer ma séance ». *La place visuelle
  disait l'inverse de la fréquence d'usage.* → **200 px → 35 px**.
  ⛔ **Rangées, pas supprimées** (R30) — un témoin vérifie qu'elles sont toujours dans le DOM.
  ⭐⭐ **Le rangement suit l'usage** : quelqu'un de vraiment nouveau (0 programme ET 0 séance)
  les voit **dépliées** — c'est sa porte d'entrée (R29).
  ⛔⛔ Le **bouton central « + » n'a pas bougé d'un pixel** : `[152,880,63]` avant et après.
  ⏭️⏭️ **CE QUI RESTE, ET C'EST LA PLAINTE D'ORIGINE DE MICHEL** : le **grand vide** de l'écran
  (~700 px sous les actions) — *« quand on arrive c'est vide »*. Ranger l'a **agrandi**. Ce qui
  doit le remplir est le **§2.1 du cadrage** : proposer des **types de séances** (full body,
  force, bodybuilding, powerbuilding). *Le chantier en 5 briques est fini ; le parcours de
  découverte, lui, commence.*
- 🏗️⭐⭐ **LE GÉNÉRATEUR DE PROGRAMMES SORT DU CADRE « DÉBUTANT » — LIVRÉ** (ft-v1023).
  4ᵉ brique du chantier écran Séance (`docs/SEANCE-DESSAI.md` §5).
  ⚠️⚠️ **Le verrou n'était PAS la porte** : le bouton était déjà visible pour tout le monde.
  Ce qui enfermait le générateur : le **vocabulaire**, le **contenu** (100 % machines), le
  blocage **one-shot**, et `beginnerJourney` posé **même pour un confirmé**.
  ⛔⛔ **Ouvrir sans toucher au contenu aurait été pire que de ne rien faire** (3ᵉ cas de R30) →
  d'où la **3ᵉ question** *« avec quoi tu t'entraînes ? »*, déterministe, aucune IA.
  ⭐ **Une seule liste, traduite à la sortie** (R2) ; les **16 équivalences vérifiées contre le
  catalogue** — 7 de mes cibles n'existaient pas sous le nom que je croyais.
  ⛔⛔ **Un confirmé n'est plus inscrit d'office** en « phase 1 débutant » — c'était un fait faux
  écrit sur lui, sans moyen d'en sortir.
  ⏭️ **Reste du chantier Séance** : ⑤ ranger « Scanner ton programme » et « Importer un journal ».
- 📊⭐⭐ **LE DÉBRIEF CHIFFRÉ EST CALCULÉ EN LOCAL, TOUJOURS — LIVRÉ** (ft-v1022). 3ᵉ brique du
  chantier écran Séance (`docs/SEANCE-DESSAI.md` §4). Michel : *« pas de réseau, il faut
  absolument que la personne puisse avoir un débrief »* **et** *« plus on code, moins on
  consomme d'API »*.
  ⭐⭐ **Les deux faces d'une seule ligne de code** — `ARCHITECTURE-CERVEAU-CERVELET` appliquée
  ici : *« est-ce que ça a besoin de savoir QUI est la personne ? »* Non → le code. Oui → Milo.
  ⛔⛔ **Le défaut était symétrique** : hors ligne on ne rendait que « N exercices · N séries ·
  N kg » (mode dégradé **mutilé**) ; **en ligne `slot.innerHTML=` REMPLAÇAIT** ces chiffres par
  le texte de Milo — donc **le jugement sans les faits**. Désormais les faits **toujours**, Milo
  **ajoute** par-dessus, séparé par un trait.
  ⛔ **Rien de neuf n'est calculé** : `_mscScores`/`_mscFocus`, `_calSessMix`, `_dureeTotaleMin`,
  `_monteeDefauts`, `_intensiteDefauts`, `DISC_CADRE` — tous **rebranchés** (R13/R2).
  ⛔⛔ **`_validationSeance` n'est PAS utilisée**, alors que le doc la listait : elle est écrite
  pour ce que Milo **propose** (mode `add`, séance en cours). Sur une séance **finie** ce serait
  **R14** — un doublon peut être voulu, un exercice « exclu » qu'on a fait est un CHOIX, et
  signaler après coup une zone sensible est un reproche sans action possible (**R29**).
  ⛔ Le cadre de la discipline est **affiché, pas noté** (`DISC_CADRE` est de la prose, pas des
  bornes calculables — prétendre vérifier l'invérifiable serait une fausse précision).
  ⏭️ **Reste du chantier Séance** : ④ sortir le générateur de séances du cadre « débutant » ·
  ⑤ ranger « Scanner ton programme » et « Importer un journal ».
- 📉⭐⭐ **L'HISTORIQUE DU SCORE DE RÉCUP — LIVRÉ** (ft-v1017). Michel : *« j'ai l'impression
  qu'il n'y a pas d'historique ou c'est moi ? »*.
  ⭐⭐ **Sa consigne « vérifie, on l'avait beaucoup travaillé ça » a changé le correctif** :
  l'historique du **sommeil** existe (ft-v449) et il est caché par une **DÉCISION** — celle de
  **ft-v547**, prise sur son propre retour *« ça prend trop de place »*. **Il RESTE caché**
  (confirmé par Michel le 26/08). *J'allais réparer une décision* (**R30**).
  ⛔ Ce qui manquait vraiment : le **score de récup n'a jamais été écrit** (aucune clé
  `ft4_recup*` ; `dayStateLog` ne garde que énergie/moral/douleurs). Cinq modules le lisaient
  en direct, aucun ne le gardait — *il n'était pas inutilisé, il était sans mémoire*.
  ⛔⛔ **On ne stocke rien, on REJOUE** : `calcRecoveryDetail(refTs)` se replace à un instant.
  Un `recupLog` serait une 2ᵉ source de vérité pour un chiffre calculable (**R2**) et ne
  commencerait qu'aujourd'hui ; en rejouant, la courbe est **rétroactive**.
  ⭐⭐ **Tous les points sont pris à la MÊME HEURE** — mesuré **44 à 6 h → 56 à 22 h** le même
  jour (12 points, rien du corps n'a changé). Comparer un matin à un soir montrerait *l'heure
  de la journée*, pas la récupération. L'écran le dit.
  ⛔ Avant la 1ʳᵉ donnée : `null`, jamais la base neutre de 70 (**R29**).
  ⏭️ **Deux limites écrites** : une nuit notée après coup change le score rejoué de ce jour-là ;
  `age`/`level`/`smoker` n'ont pas d'historique (décale toute la courbe pareil, donc ne déforme
  pas une tendance).
- 📇⭐ **L'EMAIL DANS LA LIGNE DU CLASSEUR — LIVRÉ** (ft-v1018). Le « suivi Excel » du tout début
  du projet **existe depuis toujours** (`syncSheets` → onglet `Sessions`, une ligne par série) —
  j'allais proposer de le construire (**R23**). Mais la ligne **ne portait aucun identifiant** :
  les séances de tous les testeurs s'empilaient sans qu'on puisse savoir qui est qui.
  ⛔⛔ **La colonne va à la FIN, jamais au début** : insérer en tête décalerait des milliers de
  lignes d'un cran, et *un tableur ne le signale pas*. Les anciennes lignes gardent une cellule
  **vide** — on ne sait pas de qui elles viennent, on ne l'invente pas (**R29**).
  ⛔ L'email est posé sur l'**enveloppe**, pas sur chaque série (**R2**).
  ⏭️ **Ce que ça ne répare pas** : les lignes déjà écrites restent anonymes.
  ⚠️ **Backend touché** → le déploiement Apps Script part tout seul (`deploy-appsscript.yml`),
  à vérifier (`?test=1` → `online`).
- ⏸️ **LA PASSE PAYANTE DU BANC D'ESSAI ATTEND — décision de Michel, 26/08 : *« j'attends plus de
  nutrition »*.** ⭐ **Le rejeu GRATUIT a déjà fait la moitié du travail** (9 rouges → 4, 0 €) : les
  5 vérificateurs de ft-v1007 sont prouvés, et il a démasqué un 6ᵉ faux rouge (EV-052, ft-v1016).
  ⛔ **Ce qui reste ne peut PAS se juger sans une nouvelle réponse de Milo** : **EV-054** (le journal
  alimentaire n'existait pas au 25/08) et **EV-009** (sa fixture était muette quand la réponse
  gardée a été produite). *Deux scénarios pour une passe : autant attendre que le journal porte
  2-3 jours de plus, et payer une seule fois pour mesurer les deux.*
  ⚠️ **Et ce ne sera pas un avant/après propre au sens de R34** : quatre choses ont bougé depuis le
  25/08 (les 6 vérificateurs · la fixture EV-009 · l'historique d'objectif · le journal
  alimentaire) — un écart de score ne dira pas laquelle. **Rappel du seuil que le banc s'impose à
  lui-même : moins de 3 rouges d'écart = du bruit** (mesuré le 20/08, deux passes identiques → 3
  puis 4 rouges).
  ⛔ **Les 2 arbitrages de Michel restent ouverts** : EV-032 (exercice hors catalogue quand on
  demande de l'originalité) · EV-044 (aucun renvoi à un professionnel sur une prépa d'examen).
- ☁️⭐⭐ **UN ÉCHEC DE SYNC GOOGLE SHEETS ÉTAIT COMPTÉ COMME UN SUCCÈS — CORRIGÉ** (ft-v1015).
  Trouvé en creusant la question de Michel : *« j'ai l'impression qu'il n'y a pas d'historique ou
  c'est moi ? »*.
  ⛔⛔ `syncSheets` **rend un OBJET, pas un booléen** — et un objet est toujours vrai. Le
  `const ok = await syncSheets(sess); if(ok)` de `finishWorkout` prenait `{ok:false,error:…}`
  pour un succès.
  ⚠️⚠️ **Deux dégâts, le second est le vrai** : ① le toast disait *« Séance synchronisée ! »*
  alors que rien n'était parti ; ② `synced=true` était posé, or la file de rattrapage filtre
  `s.synced===false` → **une séance perdue en route n'était JAMAIS reprise**. *Le seul mécanisme
  de secours était désarmé par la ligne censée constater le succès.*
  ⭐ **L'autre appelant lisait `res.ok` correctement depuis toujours** (`_retrySheetQueue`) —
  deux copies du même geste, une juste, une fausse (**R2**), et la fausse était en fin de séance.
  ⭐⭐ **Mesuré par le vrai chemin** (seul `fetch` remplacé) : avant `synced:true` / 0 en file,
  après `synced:false` / 1 en file, non-régression du cas réseau OK vérifiée.
  ⚠️ **Les séances déjà perdues ne reviennent pas** (elles portent `synced:true`). Rien n'est
  perdu côté données — l'historique local est intact et `saveProfile` est un chemin distinct —
  c'est le **classeur Google Sheets** qui peut avoir des trous.
  ⏭️ **Deux suites nommées, non construites** : ① la ligne du Sheet **ne porte aucun email**, donc
  toutes les séances de tous les testeurs s'empilent dans le même onglet `Sessions` ; ② l'**historique
  du score de récup** n'a jamais été écrit — mesuré **44 → 56 dans la même journée** (la fatigue
  s'efface en continu), donc il faudra garder **le score ET l'heure**, jamais un score nu, sinon
  la courbe montrerait l'heure de la journée au lieu de la récupération.
  ⛔ **Et l'historique du SOMMEIL, lui, reste caché exprès** : c'est la décision de ft-v547
  (*« ça prend trop de place »*, Michel), reconfirmée le 26/08 — *ne pas la « réparer »* (**R30**).
- 📋⭐⭐ **CRÉER UN PROGRAMME DEPUIS ZÉRO — LIVRÉ** (ft-v1012). 2ᵉ brique du chantier écran
  Séance (`docs/SEANCE-DESSAI.md` §8) et le vrai besoin de Michel : *« je vais vouloir créer mon
  programme et il va falloir que ce soit rapide »*.
  ⛔⛔ **Aucun chemin ne menait à la création d'un programme** : il fallait monter une SÉANCE
  entière pour en obtenir un. ⭐⭐ **L'éditeur existait pourtant en entier** (`_renderProgEdit`),
  atteignable seulement par le ✏️ d'un programme déjà créé. *Une porte manquait, pas une
  fonctionnalité* (R13).
  ⛔⛔ **Rien n'est écrit tant qu'on n'a pas sauvegardé** : l'index pointe au-delà du tableau,
  donc `saveProgEdit` AJOUTE. Fermer sans sauvegarder ne laisse **rien**.
  ⚠️ **Le nom devient obligatoire** — invisible avant, puisqu'on n'éditait que des programmes
  déjà nommés.
  ⭐⭐ **La capture a révélé une incohérence que je venais de créer** : le sélecteur restait
  ouvert côté séance (ft-v1009) mais refermait encore dans l'ÉDITEUR DE PROGRAMME — *le côté où
  ça gênait le plus*. Corrigé. ⛔ **Le témoin qui compte vérifie que RIEN NE FUIT** : si le mode
  retombait en `workout`, les exercices suivants partiraient silencieusement dans la séance du
  jour.
  ⛔ **Vocabulaire** : « + Ajouter » → « + Créer ma séance », et les messages qui désignaient
  l'ancien nom sont corrigés. *Quand on ouvre une porte, on relit ce que disent les panneaux.*
  ⏭️ **Reste du chantier** : ③ le débrief chiffré en local · ④ sortir le générateur de séances
  du cadre « débutant » · ⑤ ranger Scanner/Importer.
- 🔁⭐ **LE SÉLECTEUR D'EXERCICES RESTE OUVERT — LIVRÉ** (ft-v1009). **Première brique du chantier
  écran Séance** (`docs/SEANCE-DESSAI.md` §8, point 1), et le goulot que Michel a senti en premier :
  *« il va falloir améliorer aussi l'accès aux exercices… et que ce soit rapide »*.
  ⛔ **Une seule ligne coûtait cher** : `addExercise()` appelait `closeExPicker()` à chaque ajout →
  6 exercices = **6 allers-retours**. Désormais les ajouts s'enchaînent, la recherche est vidée et
  prête, et le titre dit combien on a ajouté.
  ⛔⛔ **Seul le mode « workout » reste ouvert** : `replace`/`replaceSess`/`addSess`/`prog`/
  `addToGroup` désignent UNE place et ferment. *Un « remplacer » resté ouvert AJOUTERAIT au lieu de
  remplacer, en silence* — c'est le témoin le plus important du bloc.
  ⚠️ **Le scroll a dû déménager** : `scrollIntoView` défilait DERRIÈRE la modale. Reporté à la
  fermeture, quand l'écran redevient visible.
  ⛔⛔ **Bouton central « + » inchangé au pixel** (règle d'or #9), mesuré et non regardé.
  ⏭️ **Reste du chantier** : ② porte « Créer un programme » + renommer « + Ajouter » en « Créer ma
  séance » · ③ le débrief chiffré en local · ④ sortir le générateur du cadre « débutant » ·
  ⑤ ranger Scanner/Importer.
- 🔴⭐⭐ **LE BOUTON ROUGE DE `showConfirm` DIT ENFIN CE QU'IL FAIT — LIVRÉ** (ft-v1006).
  Michel, capture à l'appui en lançant le benchmark : *« ya marqué annuler ou supprimer lol »*.
  La fenêtre annonçait **« 53 appels au Coach, environ 0,79 € à 3,45 € »** et proposait
  **[Annuler] [SUPPRIMER]**. *On ne supprime rien : on lance, et ça coûte de l'argent.*
  ⭐ **Le mécanisme existait déjà, posé d'un seul côté** (5ᵉ fois de la semaine) : le 4ᵉ argument
  `okLabel` existe depuis toujours, et **10 appels sur 24** ne le passaient pas pour une action
  qui n'était **pas** une suppression (lancer PT-001/VC/le benchmark, rejouer les rouges,
  importer des pesées, fusionner, vider le cache, vider la séance, abandonner la séance,
  refaire l'inscription).
  ⚠️ **Correction de Michel le jour même** : le 10ᵉ (*« Refaire l'inscription »*) est **inatteignable
  en production** — `resetOnboardingTest()` est gardée par `window.__FT_CLONE__`, et **plus personne
  ne pose ce drapeau** depuis le 23/08 (ft-v976). **9 fenêtres réellement visibles + 1 derrière la garde.**
  ⭐ **Et le clone n'est pas SUPPRIMÉ, il est DÉBRANCHÉ** (correction de Michel, mesurée) : `clone/` est
  absent du disque mais **récupérable en une ligne** (`git checkout 2dd5b85^ -- clone/`), les **14 gardes
  sont toutes en place**, et ce qui manque est le **poseur** du drapeau — il vivait dans le shim du clone.
  *La condition de retour est donc écrite* (R30). ⛔ Le code
  reste (**R30** : une garde de clone est une *question non résolue*, pas un interrupteur) et son
  libellé est corrigé avec les autres, pour qu'un essai promu ne reparte pas avec le défaut.
  ⛔⛔ **La jumelle, trouvée en la cherchant (R8)** : *« Fusionner les exercices »* existe à
  **deux endroits** — `log.js` disait « Fusionner », `setup.js` disait **« Supprimer » pour un
  RENOMMAGE** (**R2**).
  ⭐⭐ **Le témoin fige une RÈGLE, pas une liste** : énumérer les 24 appels rougirait au 25ᵉ.
  La règle ne périme pas — *le défaut est « Supprimer », donc un appel sans libellé doit avoir un
  titre qui commence par « Supprimer »*.
  ⚠️ **Mon découpage d'arguments a menti d'abord** : il sautait les chaînes mais pas les
  **commentaires**, et une apostrophe française y ouvrait une fausse chaîne → il accusait 5
  appels déjà corrigés. *Même famille que l'apostrophe courbe de ft-v994.*
- 🔢⭐ **LE BENCHMARK N'ANNONCE PLUS « 16 SCÉNARIOS » ALORS QU'IL EN PORTE 53 — LIVRÉ**
  (ft-v1005). Michel, avant de le lancer depuis l'app : *« oui corrige les libellés avant »*.
  **Quatre libellés écrits en dur** dans le groupe admin « 🛡️ Milo — le mesurer » (*16 messages*,
  *16 pièges*, *16 scénarios*, *2 × 16*) étaient restés à 16 pendant que le banc d'essai passait
  **16 → 21 → 53 en trois semaines** — c'est **R35** au pied de la lettre : *il grandit à chaque
  bug, il n'a pas de taille cible*.
  ⛔⛔ **On n'a pas mis « 53 » à la place** : ce serait la même dette six semaines plus tard, sur
  l'écran même qui sert à décider d'une dépense. **Le nombre est retiré.**
  ⭐ **Le compte et le prix existaient déjà, justes, à deux mètres** : `startEvalBench` calcule
  `SC.length` et `_evPrix(n)` et les annonce dans la **confirmation, avant** le premier appel payé
  — le libellé statique portait une **seconde source de vérité** pour rien (**R2**), et c'est
  elle qui mentait.
  ⭐⭐ **Le témoin INTERDIT le nombre au lieu de l'épingler** : vérifier « 53 » rougirait à la 54ᵉ
  promotion et on l'ajusterait sans réfléchir. Il refuse **tout** nombre à 2-3 chiffres dans ce
  bloc → la prochaine dérive fait **rougir la livraison**.
  ⚠️ **Ma 1ʳᵉ fenêtre de mesure ratait un des quatre** (elle partait du sous-titre, or *« 16
  messages »* vit dans l'intro **au-dessus**) — *une fenêtre qui commence après le mensonge ne le
  voit pas*. Élargie, le contrôle négatif rend `["16 messages","16 pièges","16 scénarios"]`.
- 🧹⭐ **« SQUAT SUMO » RETIRÉ DU CHOIX — LIVRÉ** (ft-v1002). Michel : *« squat sumo on supprime,
  ça me soûle »*. **Même forme que le pull-over** : RETRAIT, jamais fusion — identifiant gardé,
  séances et records **non renommés** (muscles + MET 6,5 intacts), vérifié en navigateur.
  ⭐⭐ **Son histoire était déjà écrite (R30)** : le 13/08 son illustration avait été retirée
  (elle montrait un **haltère** = geste du Squat Gobelet) et on gardait le fichier *« le jour où
  Michel trouve une figurine À LA BARRE »*. Elle n'est jamais venue → il a préféré retirer
  l'exercice. *Un retrait dont la condition de retour est écrite se referme proprement, même
  quand la réponse finit par être « non ».*
  ⭐ **Le fichier orphelin dormait dans le CACHE du service worker** : téléchargé par tout le
  monde pour rien depuis le 13/08. Retiré du dépôt et du cache.
  ⛔ **7 endroits alignés** (2 entrées EXLIB — Jambes *et* Fessiers — · EX_IDS ·
  RETIRES_VOLONTAIREMENT · 2 équivalences · EX_EN · cache SW · `A-FAIRE-SUR-PC` close).
  ⭐⭐ **Le témoin de ft-v1001 a servi dès le cas suivant** : la règle « aucune équivalence
  d'import ne vise un exercice introuvable » est restée verte — R17 paie deux fois en une matinée.
- 🧹⭐⭐ **LE « PULL-OVER » GÉNÉRIQUE RETIRÉ DU CHOIX — LIVRÉ** (ft-v1001). Décision de Michel :
  *« à l'haltère je fais beaucoup mais il y a aussi à la barre, mais le pull over tout seul on
  peut le retirer »*. ⭐⭐ **Ce qui décide de tout est la FORME du retrait** : le projet distingue
  **RETRAIT** et **FUSION** — *« on retire du CHOIX, jamais de la MÉMOIRE »*. Une fusion aurait
  fait migrer l'historique (`state.js:210` **réécrit en dur** les noms stockés) ; or Michel le
  fait **aux deux**, donc renommer aurait écrit un fait faux **et mélangé ses records** (R29).
  👉 **Retrait** : sorti de `EXLIB`, identifiant gardé dans `EX_IDS` + `RETIRES_VOLONTAIREMENT`
  avec sa raison (R30). ⭐ Vérifié en navigateur : séance et record **non renommés**, muscles et
  MET intacts ; bac Barre 2 → 1, les 4 variantes gardent leur vignette.
  ⭐⭐ **Jumelle trouvée en la cherchant (R8)** : 4 équivalences d'import visaient encore
  « Pull-over » — et **c'était déjà faux avant** (elles décrivent la poulie). *Le retrait n'a pas
  créé le défaut, il l'a rendu visible.* 👉 **Une règle générale** interdit désormais toute cible
  d'équivalence introuvable. ⚠️ Calibrée au passage : `leg curl` vise un nom absent du catalogue
  et c'est **valide** (ancien nom déclaré) — j'ai failli réparer ce qui marchait (R28).
  ⚠️ **Un témoin d'hier exigeait l'inverse** (« les 5 entrées restent 5 ») : retourné vers ce
  qu'il protégeait vraiment, raison d'avant conservée.
- 🔁⭐⭐ **LE « PULL-OVER » GÉNÉRIQUE — et un TEST DU PROJET qui m'a repris** (ft-v1000).
  ⛔⛔ **Ma première solution a été REFUSÉE par un test, et il avait raison.** J'avais fait
  **partager** `pullover-haltere.webp` entre le générique et *Pull-over Haltère* — le contrôle
  croisé ② *« deux exercices ne partagent jamais la même ANIMATION »* est passé au **rouge**.
  ⭐⭐ **Cette règle est née du bug du 02/08** (les deux écartés pointaient le même fichier,
  l'app montrait le mauvais mouvement) — et j'avais écrit un témoin **le matin même**, en
  ft-v999, disant *« les deux écartés gardent des fichiers différents »*. *Un test permanent m'a
  empêché de refaire, dans la même matinée, le bug dont je venais d'écrire la leçon* (**R17**).
  👉 **Livré : le BAC seulement.** Le générique n'a pas de matériel ; « barre » venait
  mécaniquement de la règle de classement. Il passe en **poids libre**. Une ligne, 0 octet.
  ⛔ **Il reste SANS vignette, exprès** : *aucune animation vaut mieux qu'une animation qui
  affirme « Pull-over = Pull-over Haltère » sans que ce soit décidé* — la phrase du 02/08,
  appliquée à moi-même. Un témoin garde cette **absence**.
  ⏭️ **LE VRAI DÉFAUT RESTE ENTIER : doublon de catalogue** (5 entrées). Fusionner renommerait
  les séances et records passés, et on ne sait pas s'ils ont été faits à la barre ou à
  l'haltère (**R29**). 👉 **Une seule question débloque tout : « tes Pull-over, c'était barre ou
  haltère ? »**
- 🏋️⭐ **DEUX ANIMATIONS QUI MANQUAIENT — LIVRÉ** (ft-v999). Michel : *« j'ai encore des figurines
  qui n'apparaissent pas »*. ⛔⛔ **Ce n'est PAS le bug de ft-v996/997**, et la différence compte :
  là le fichier existait et l'app ne le trouvait pas ; **ici le fichier n'existe pas**. Mesuré :
  306 images sur disque, 302 rattachées, **4 orphelines** — aucune ne correspondait. **21 exercices
  sur 324** n'ont jamais eu d'animation, et le repli (image du muscle + « Ajouter la photo ») est le
  comportement **prévu**. *Deux symptômes identiques à l'écran, deux causes opposées.*
  ⭐⭐ **Le plus important est un commentaire du 02/08 qui a dit lui-même quand le rebrancher** :
  *« à rebrancher le jour où on a une vraie démo d'écarté à plat »* — un retrait dont la **condition
  de retour** est écrite se referme tout seul le jour venu (**R30**).
  ⛔ Vérifié **image par image** avant de rattacher (R29), et les **4 endroits** tenus alignés
  (fichier · `EX_YT` · cache SW · pas de collision de fichier), avec un témoin qui les épingle.
  ⏭️ **RESTE À TRANCHER — le PULL-OVER** : ce n'est pas une animation manquante mais un **DOUBLON
  DE CATALOGUE**. 5 entrées, dont une générique *« Pull-over »* rangée dans le bac **BARRE** juste
  au-dessus de *« Pull-over Barre »*. Le GIF envoyé est **l'image déjà en place** sur *Pull-over
  Haltère*. Fusionner ou retirer le générique touche l'**historique** → arbitrage de Michel.
  ⏭️ **Et il reste 19 exercices sans animation** (liste dans le journal) : il faut les **fichiers**,
  pas du code.
- ⚠️ **`ft-v998` (banc d'essai sans taille cible, R35) n'a PAS d'entrée ici** — livrée par l'autre
  session, journalisée dans `CLAUDE.md` mais pas reportée dans ce fichier (règle d'or #12). Je ne
  l'écris pas à sa place : je n'en connais pas le détail. **À compléter par session-A.**
- 🧬⭐⭐ **UN NOM ABRÉGÉ LIT LA FICHE ÉCRITE, PLUS LA DEVINETTE — LIVRÉ** (ft-v997). Le **2ᵉ effet
  de la même cause que ft-v996**, laissé ouvert la veille et tranché par Michel **la mesure en
  main** : *« fais la correction des muscles aussi »*. ⛔⛔ `_mscScores` cherchait la fiche au nom
  **EXACT** : un nom abrégé la ratait et retombait sur les règles `_MEX`, qui **devinent** —
  l'inverse exact de ce que le bloc annonce depuis le 02/08. **Mesuré : 55 des 77** abréviations
  rendaient des muscles différents, *« Inclinaison Lombaire »* **aucun** (figurine grise).
  ⭐⭐ **L'exemple qui coûte** : *« Rowing Poitrine Appuyée »* abrégé **recréditait le bas du dos**,
  retiré **exprès** le 02/08 — *une correction anatomique faite à la main, annulée par un nom court*.
  ⭐⭐ **ET SA JUMELLE, TROUVÉE EN LA CHERCHANT (R8)** : `estUnilateral`/`uniLabel` avaient le même
  défaut — **10 exercices** perdaient leur statut unilatéral abrégés, donc **volume non doublé** et
  étiquette « par bras / par jambe » absente. ⛔ **Les calories suivent sans une ligne de plus** (le
  MET dérive des muscles) : 4 MET faux, jusqu'à **±62 %**, et l'un d'eux **surestimait** — *l'erreur
  n'allait pas toujours dans le même sens, donc elle était invisible en moyenne*.
  ⛔⛔ **UN ENDROIT RESTE STRICT, ET C'EST ÉCRIT DANS LE CODE (R30)** : `state.js`, la fusion d'un
  exercice perso avec le catalogue. Y résoudre l'abréviation la rendrait **destructrice** — un
  « Hip Thrust Barre » créé à la main, avec sa photo, **disparaîtrait**. *Une lecture qui se trompe
  coûte une figurine ; une suppression qui se trompe coûte le travail de la personne* (R29).
  ⚠️ **CE QUI CHANGE POUR L'UTILISATEUR** : figurine, couleur du calendrier, calories et volume de
  séances **déjà passées** bougent — prix assumé, tranché par Michel après mesure. ⭐ **Rien n'est
  réécrit en base**, tout est recalculé à l'affichage → **réversible**.
  ⭐ **Vérifié à l'écran** (captures avant/après), pas seulement en données.
- 🏷️⭐⭐ **UN NOM D'EXERCICE ABRÉGÉ RETROUVE SA FICHE — LIVRÉ** (ft-v996). Signalé par Michel
  (*« je n'ai plus la figurine sur ce mouvement-là »*, 2 captures), en repartant d'une vieille
  question sur les adducteurs. ⛔⛔ **Les adducteurs n'étaient PAS en cause** — réglés depuis
  ft-v921, vérifié dans un vrai navigateur avant de coder (`Adduction Cuisses` → `{adductors:2}`).
  *Le symptôme désignait le mauvais coupable.* ⭐⭐ **La vraie cause est le NOM** : sa séance
  portait les noms **COURTS** (« Hip Thrust Barre », « Abduction Cuisses ») quand le catalogue les
  connaît **avec leur parenthèse** — **77 exercices** en portent une, et Milo **abrège** quand il
  prescrit. ⛔⛔ **Défaut SILENCIEUX** : le calcul des muscles s'en sortait (il retombe sur les
  règles `_MEX`, qui devinent), donc rien ne rougissait — seuls les lookups **exacts** (animation,
  tutoriel, silhouette) échouaient. À l'écran : *« Muscle principal deviné »* + *« Ajouter la photo
  de ta machine »*, alors que les deux `.webp` **étaient déjà dans le dépôt**. ***L'app proposait
  d'ajouter une photo qu'elle avait sous la main.*** ⭐⭐ **Le mécanisme existait, posé d'un seul
  côté — 3ᵉ fois après ft-v973/975 (R8/R13)** : `_matchExercise` a une étape *« exact sans la
  parenthèse »* depuis le **09/08**, écrite pour ce cas exact… mais réservée à l'**import**.
  ⛔ **Un seul propriétaire (R2)** : `exNomCatalogue()` (`constants.js`), posé aux **6** lookups de
  `log.js`. ⛔ **Déterministe seulement** (R29 — montrer l'animation d'un AUTRE exercice est pire
  que rien). ⛔⛔ **Zéro-collision MESURÉ, et c'est la CONDITION de la table** : 324 exercices,
  77 parenthèses → 77 bases distinctes, 0 collision ; toute base ambiguë est **retirée** plutôt
  qu'arbitrée — l'abréviation cesse alors d'être résolue, elle ne pointe jamais vers le mauvais
  exercice.
  ⏭️⚠️⚠️ **POINT OUVERT — LE 2ᵉ EFFET DE LA MÊME CAUSE, NON CORRIGÉ EXPRÈS.** `_mscScores`
  appelle `exMuscles(ex.name)` en nom **exact** : un nom abrégé rate donc la **DONNÉE ÉCRITE** et
  retombe sur la **DEVINETTE** — alors que le bloc dit lui-même *« la donnée écrite passe avant
  les règles »*. **Mesuré : 55 des 77** abréviations donnent des muscles **différents**, et
  *« Inclinaison Lombaire »* n'en donne **aucun** (figurine grise). ⭐ **L'exemple qui coûte** :
  *« Rowing Poitrine Appuyée »* abrégé **recrédite le bas du dos**, que la fiche du 02/08 avait
  retiré **exprès**. 👉 **Le correctif tient en une ligne** (`exMuscles(exNomCatalogue(ex.name))`)
  **mais il change la figurine, la couleur du calendrier et les calories de séances PASSÉES** →
  **c'est un arbitrage de Michel**, pas un détail technique (R29 / règle d'or #10). **C'est R31** :
  la figurine est le vocabulaire, l'imprécision se propage jusqu'au contexte de Milo.
- 🏃⭐⭐ **LE CARDIO DE MILO VA DANS SON BLOC, PAS DANS LES EXERCICES** (ft-v995). Michel, **en
  salle**, capture à l'appui. ⭐⭐ **Sa raison décide de tout** : *« si on fait une séance cardio
  toute seule, on veut qu'elle soit comptabilisée. Mais je ne veux pas que la course, le vélo
  elliptique ou peu importe arrive dans un exercice de musculation, ça n'a strictement rien à
  voir. »* ⛔⛔ **Ce n'était pas un défaut de jugement de Milo — les DEUX bouts manquaient** : le
  prompt ne nommait pas le bloc, et `_appliqueMiloSession` ne lisait aucun champ cardio.
  ⭐ **D'où venait l'elliptique ?** *Pas du catalogue* — il n'y est pas (`tier:'new'`). D'une
  **consigne** : *« le cardio LÉGER (… vélo/elliptique tranquille …) est BON »*. **Milo obéissait**,
  sans savoir où le poser. *C'est R8 à l'envers, comme ft-v863.*
  ⛔ **Posé dans `_appliqueMiloSession`**, le seul point que les **deux portes** traversent (JSON
  **et** repli texte) — sinon rien n'aurait changé pour **Eline** (biais R9, cf. le bouton
  « Commencer cette séance »). **Avant ET après** tranchés par position ; au **milieu** ça reste un
  exercice ; **sans durée**, aucune durée inventée ; un cardio **déjà noté n'est jamais écrasé**.
  ⭐⭐ **2 défauts trouvés par la MESURE** : ① la pose écrivait le cardio **avant** que `S.wkt` soit
  reconstruit → il sortait des exercices et **n'arrivait nulle part** (R4) ; ② l'intensité tombait
  sur « modéré » car `_naz()` désaccentue le **nom**, pas la **note** — *même famille que
  l'apostrophe courbe de ft-v994* — soit **50 % d'écart en kcal** (4,0 vs 6,0 MET).
  🗣️ **Et Milo est mis au courant** (2ᵉ moitié) : consigne + **vocabulaire exact de `CARDIO_MET`**
  (6 types, 3 intensités), avec la **durée réclamée** — sans elle l'app rejette en silence.
  ⚠️ **+938 car. dans le bloc PERSONNEL** : le bloc commun **ne bouge pas** (45 362 / 47 118).
- 🧪⭐⭐ **LE BANC D'ESSAI PASSE DE 21 À 50 SCÉNARIOS** (ft-v994). Michel : *« il n'y a pas assez de
  contrôle, on le monte à 50 »*, puis, aussitôt : *« et que les scénarios soient VIABLES hein, pas
  mettre tout et n'importe quoi »*. ⛔⛔ **C'est cette seconde phrase le cahier des charges** — et le
  journal de test le disait déjà : *« remplir pour atteindre le chiffre → des entrées inventées »*.
  Les **29 nouveaux viennent tous du vécu** (`docs/JOURNAL-DE-TEST.md`), aucun inventé.
  ⭐⭐ **Chacun a été éprouvé contre une BONNE et une MAUVAISE réponse avant livraison** — *un
  scénario qui ne peut pas rougir ne mesure rien*. **6 sur 23 ne mordaient pas au 1ᵉʳ jet.**
  ⛔⛔ **Le pire défaut était plus ancien que mes scénarios : l'APOSTROPHE COURBE** (`’`, U+2019),
  celle que Milo écrit naturellement. `normalize('NFD')` ne la convertit pas → un motif écrit
  `c'est noté` **ne matchait jamais**. **8 motifs du fichier** en portent une : *ils ne rougissaient
  pas, ils ne voyaient rien.* Corrigé dans `U.norm`, un seul endroit (**R2**).
  ⭐ **2ᵉ défaut** : 3 vérificateurs comptaient des **lignes**, or Milo écrit souvent la séance
  **sur une seule ligne** — le témoin des « 30 exercices » voyait alors *un* exercice.
  ⚠️ **Et 4 des 6 échecs venaient de mes propres essais**, pas du code (apostrophes, noms tronqués).
  ⚠️⚠️ **Un témoin a rougi à tort, et sa leçon vaut d'être gardée** : il inspectait *« tout ce qui
  suit EV-022 »* — équivalent à EV-022 tant qu'il était le dernier du fichier. *Un témoin borné par
  la fin du fichier se déplace tout seul.* En le corrigeant, **2 vraies péremptions** sont apparues :
  EV-026 posait une date **FUTURE** en dur (périmée en 5 jours) et EV-048 disait *« en ce moment »*
  avec une nuit figée. Les deux sont désormais relatives.
  ⚠️ **Deux coûts, écrits plutôt que tus** : ① **50 appels API par passe** (contre 21) ; ② ces
  vérificateurs mesurent ce qui est mesurable **par du code** — le ton, le naturel, *« est-ce que
  Milo est agréable »* restent au **juge humain**.
  ⏭️ **Le benchmark peut être relancé** : R34 attend une passe réelle (une vraie clé API).
- 🧠⭐⭐ **LA COURSE `_saveCoachMemory` — PROUVÉE PUIS CORRIGÉE** (ft-v993). ⛔⛔ **Prouvée AVANT de
  toucher au code**, comme le suivi d'audit l'exigeait : deux résumés à **20 ms d'écart** envoient
  tous deux `existingMemory:"MÉMOIRE DE DÉPART"`, et **le dernier REVENU écrase l'autre** — « FAIT-B »
  perdu, sans erreur, sans trace. ⭐ Cause : `S.coachMemory` est **lu au départ** et **réécrit au
  retour** ; entre les deux, tout autre appel lit la valeur périmée. ⛔ **Le correctif ne bloque
  rien** (l'UI n'attend jamais le réseau — règle d'or #3) : il **sérialise dans une file**, comme
  le débrief de ft-v979 (**R13/R2**), et chaque résumé **relit la mémoire au moment de partir**.
  ⚠️ **La file ne se casse jamais** : un échec passe la main au suivant — sinon une panne réseau
  gèlerait la mémoire pour toute la session, pire que le bug corrigé.
- 📏⭐⭐ **⑤ CACHES PAR LIEU : MESURÉ, PUIS *NON* CONSTRUIT** (ft-v993) — et c'est la bonne réponse.
  Les 5 variantes sont **réellement distinctes** (salle **11 446** · basique **8 544** · maison
  **6 493** · poids du corps **2 136** · non renseigné **11 475** car.) : elles ne peuvent donc pas
  rejoindre le bloc commun telles quelles, GPT a raison sur le fond. ⛔ **Mais aucun gain sous
  ~6 personnes actives dans la même heure ET sur le même lieu** — le projet a une poignée de
  testeurs, le gain est **zéro aujourd'hui**. **R19/R34** et `SUIVI-AUDIT` disaient déjà *« ne pas
  commencer sans données d'usage »*. ⏭️ **À rouvrir quand l'usage réel le justifiera** — et c'est
  ft-v990 (le coût réel par appel) qui donnera le signal.
- 🧠⭐⭐ **LA MÉMOIRE ÉLARGIE OUVERTE À TOUT LE MONDE — LIVRÉE** (ft-v992). Priorité ④, tranchée
  par Michel **après mesure**. ⛔⛔ **La raison d'avant reste écrite (R30)** : réservée à 2 comptes
  depuis le 03/08 pour *« mesurer le coût réel avant d'ouvrir »* — ce n'était pas un oubli, c'était
  une prudence. ⭐⭐ **Ce coût est AUTO-DÉGRESSIF** (la fonction ne résume que ce qui a été vécu) :
  **3 séances → 0 car. · 5 → 0 · 8 → 665 · 12 → 967 · 20 → 1 551 · 35 → 2 622** (borne 30 lignes).
  ⛔⛔ **Et la crainte du plafond ne tenait pas** : ces caractères tombent dans le bloc **PERSONNEL**,
  le bloc commun est identique **au caractère près** (45 362 des deux côtés) — *ce n'était pas le
  bon bloc*. ⭐ **Pourquoi on ouvre (R9)** : la mémoire longue EST la promesse du produit ; la
  réserver revenait à ce que **Michel juge Milo sur une mémoire que personne d'autre n'a**.
  ⭐⭐ **LA VRAIE TROUVAILLE, hors commande** : en vérifiant que **R34** pouvait juger le
  changement, **aucun des 21 scénarios du banc d'essai n'avait plus d'UNE séance** → l'avant/après
  aurait comparé **deux contextes identiques** (faux vert), et *la promesse centrale du produit
  n'était vérifiée par aucun scénario*. D'où **EV-022** (22ᵉ) : retrouver une séance d'il y a 27 j
  **sans en inventer la charge**, dates relatives et calculées à midi.
  ⚠️⚠️ **CE QUI N'EST PAS PROUVÉ** : le **benchmark n'a PAS été joué** (pas de clé API ici) —
  *on livre de quoi le jouer, pas son résultat.* **R34 n'est honoré qu'au prochain lancement par
  Michel**, et personne ne sait encore si la mémoire élargie **améliore** les réponses.
  ⚠️ **Ma mesure a été fausse 2× avant d'être juste** : `_vcApplyPersona` attend le SCÉNARIO
  entier (elle fait `p.apply`), je lui passais le sous-objet → tout à zéro, sans erreur.
  ⏭️ **Reste : ⑤** (caches par lieu) — et la **course `_saveCoachMemory`**, à prouver ou réfuter
  par un test avant de toucher au code.
- ⚖️⭐⭐ **LE VOCABULAIRE KATCH DE MILO — LIVRÉ** (ft-v991). Priorité ③, dernier point ouvert du
  contre-audit. ⛔⛔ **Mesuré dans un vrai navigateur avant de coder** : les **trois** provenances
  de la masse maigre — **lue** sur un rapport · **DÉDUITE** par soustraction · calculée depuis un
  **% de gras TAPÉ AU CLAVIER** — donnaient une phrase **identique mot pour mot** :
  *« MASSE MAIGRE MESURÉE … chiffre SOLIDE … sans réserve »*.
  ⚠️⚠️ **Le brief annonçait un « motif regex qui capture trop tôt » — c'est faux**, et c'est la
  mesure qui l'a dit : aucun motif ne capture trop tôt, la provenance **n'atteint jamais la
  sortie** (**R4**). Le drapeau `lmDeduite` était écrit par `tracking.js` et `leanMassRecente()`
  ne le transportait pas. ⛔ **R32** : une balance MESURE un poids et une impédance, elle ESTIME
  tout le reste — dire « mesurée » d'un % tapé au clavier est **un fait faux sur la santé de
  quelqu'un**. ⭐⭐ **Et le témoin protégeait la mauvaise phrase** (il épinglait le mot
  « MESURÉE ») : toute correction de R32 le faisait rougir et ressemblait à une régression — d'où
  la consigne de `SUIVI-AUDIT.md` de le corriger **d'abord**. ⭐ **Katch n'est pas dévalué** : le
  prompt garde « un MEILLEUR point de départ » et l'écart chiffré (+180 kcal/j mesurés, ft-v833).
  ⚠️ **Non prouvé, et écrit comme tel** : que Milo *obéisse* à la nuance — `tests/milo` prouve la
  PRÉSENCE d'une règle, jamais son OBÉISSANCE ; seul un A/B sur le vrai modèle le dirait.
  ⏭️ **Reste : ④⑤** (reclassement du contexte, caches par lieu) — gated par **R34**.
- 💰⭐⭐ **INSTRUMENTATION DU COÛT RÉEL PAR APPEL API — LIVRÉE** (ft-v990). Priorité 3 de
  Michel, en parallèle de ①②. Capture `data.usage` (déjà renvoyé par l'API, jeté jusqu'ici)
  au seul point commun (`callClaude`/`callClaudeDiag`). Ne change RIEN au comportement de
  Milo. Même mécanique que `ai_quota` côté Apps Script (borné, remis à zéro chaque jour).
  ⚠️ Vérifié FONCTIONNELLEMENT (bac à sable Node) mais **pas encore par un vrai appel
  facturé** — indisponible dans cet environnement. La première vraie donnée arrivera au
  prochain appel réel de Michel. Lisible dans Profil → Admin → Santé du système.
  ⏭️ **Les trois priorités du contre-audit (①②③) sont livrées.** Reste : ④⑤ (reclassement
  du contexte, caches par lieu) — gated par **R34**, attendent un vrai coût mesuré pour
  juger s'ils rapportent quelque chose.
- 🛡️⭐⭐ **LA VALIDATION UNIQUE AVANT UNE SÉANCE DE MILO — LIVRÉE** (ft-v989). Priorité n°1 de
  Michel après le contre-audit. Posée au SEUL point que les deux portes traversent
  (`_appliqueMiloSession`, même raison que ft-v980). Réutilise `_gardienZones()`,
  `_GARDIEN_CONSTRAINTS` et `_EX_SWAP_RAISONS` — rien de réinventé (R2/R13). **On signale, on
  ne bloque pas** (R24) : seul l'ACTIF/AUJOURD'HUI déclenche une blessure, les raisons
  d'exclusion non durables (« machine prise ») sont ignorées comme dans le contexte de Milo.
  Vérifié à l'écran (capture) ET en données : les charges de Milo restent intactes.
  ⏭️ **Priorité n°2 restante** : rien — `_startSessionFromMilo` était déjà léger (0 appel IA
  au clic, vérifié le 24/08). ⏭️ **Prochaine étape** : instrumenter le coût réel (③, en
  parallèle), ou reprendre un autre point du palier « avant ouverture large ».
- 🔬 **CONTRE-AUDIT ENVOYÉ À GPT (24/08, nuit) — RÉPONSE REÇUE ET INTÉGRÉE.** Rapport PDF
  (`docs/CONTRE-AUDIT-2026-08-24.pdf`) donné pour relecture extérieure. GPT valide les 3
  correctifs de la nuit **sans réserve**, propose une 3ᵉ voie pour le plafond du bloc commun
  (budget « socle critique » / budget « contexte partageable », validé par le **benchmark**
  plutôt que par la seule taille), et remonte **l'instrumentation du coût réel de Milo** en
  tête des priorités — avant tout chantier de cache, pour savoir s'il rapporte quelque chose.
  ⚠️ **Réserve de Claude** : cette instrumentation ne se vérifie pas par une relecture de code,
  elle demande un vrai appel API facturé — indisponible dans cet environnement de session.
  Échange complet : `docs/ECHANGE-GPT.md`. Score à jour : `docs/SUIVI-AUDIT.md`.
- ⚖️⭐⭐ **MICHEL A TRANCHÉ (24/08, 08 h 09).** *« Priorité 1, une validation déterministe unique
  avant l'activation de la séance : blessures, exclusions, doublons. Priorité 2, alléger le
  bouton « Commencer la séance » pour qu'il appelle uniquement cette validation. En parallèle,
  instrumentation du coût réel par appel API. »* Le reclassement du bloc générique et les caches
  par lieu sont **approuvés en principe**, mais soumis à une règle nouvelle : *« chaque
  changement doit passer par un avant-après benchmark »* → montée en **R34**
  (`docs/REGLES-ARCHITECTURE.md`). Les records ne bougent pas pour l'instant.
  ⏭️ **Prochaine étape : construire ① la validation unique**, puis ② alléger le bouton — rien
  n'attend d'autre décision pour ces deux-là.
- 🏋️⭐⭐ **EXPORTER SEULEMENT SES SÉANCES** (ft-v988). Michel : *« oui j'ai vu mes bilans dans
  l'export »*. Le bouton « Exporter » emportait **tout** — bilan sanguin, bilan corporel, TRT,
  profil santé — et la modale n'avertissait que pour les conversations. Or le fichier existe
  **pour être donné**. ⛔⛔ **Liste blanche, pas liste noire** : une donnée ajoutée demain reste
  dehors toute seule (**R29**). ⛔ **Un seul exporteur (R2)** → le retrait des photos perso vaut
  gratuitement pour le nouveau mode. ⚠️ **La question se pose désormais même sans conversation**
  — changement volontaire, raison d'avant conservée dans le témoin. ⛔ Le **poids de corps** n'y
  est pas, et le fichier le dit avec la raison.
- 📐 **LE GARDE-FOU DE TAILLE MESURE UN PROFIL BLESSÉ** (ft-v988, §14.6 de
  `AUDIT-CONTEXTE-MILO.md`). Il testait des profils **sains** : *sain 45 362 · blessé 47 118 ·
  plafond 46 500 → dépassement de 618*. ⛔ **On ne relève pas le seuil**, on épingle le plafond
  blessé à 47 500 pour qu'il ne dérive pas pendant que la décision de fond attend (§14.8).
- 🔢⭐⭐ **« CE N'ÉTAIT PAS UN SCAN, J'AI RENTRÉ LE CODE-BARRE MANUELLEMENT »** (ft-v987).
  Michel avait raison, et l'app se contredisait elle-même : son propre commentaire dit
  *« `saisie` dit COMMENT c'est entré »* et les **quatre** chemins de code-barres
  s'enregistraient tous en `'scan'`. ⭐ **Mesuré sur ses 23 entrées** : ses « 6 scans »
  comptaient des saisies clavier — *la donnée censée trancher les questions produit était
  fausse.* Quatre valeurs : `scan` · `photo-code` · `photo-code-ia` · `code-tape`.
  ⛔⛔ **Le vrai apport est `_eanValide()`** — la clé de contrôle d'un EAN, arithmétique pure,
  zéro réseau. *Le seul mode d'échec de ce chemin est SILENCIEUX : un chiffre faux ne donne pas
  « introuvable », il donne le produit de quelqu'un d'autre.* Un chiffre changé sur Nutella et
  sur Coca-Cola : refusé dans les deux cas. ⛔ **On prévient, on ne bloque pas** (R24).
  ⚠️⚠️ **Mon témoin a attrapé mon propre défaut** : `_provFood` a une liste blanche, le drapeau
  `codeDouteux` n'atteignait pas la donnée — **R4 dans la fonction qui documente R4**, 2ᵉ fois
  au même endroit.
- ✏️ **« À LA MAIN » EN PREMIER ET EN ROUGE** (ft-v986). Michel : *« intervertis, à la main en
  premier et en rouge »*. ⚠️⚠️ **Remplace une décision qui avait sa raison écrite (R30)** — le
  code-barres était premier depuis le 15/08 parce qu'il est **gratuit et pas caché derrière
  l'IA** ; la raison d'avant reste dans le code **et** dans le témoin. ⛔ **Et la donnée mesurée
  va dans le sens de l'ancien ordre** : sur ses 23 entrées réelles, **scan 6 · ciqual 4 ·
  historique 4 · ia-texte 3 · recherche 1 · manuel 1**. *Arbitrage d'usage assumé, pas une
  correction de bug.* ⚠️ **Vrai coût** : « à la main » n'est **pas** gratuit (champ libre →
  estimation IA) — on met en rouge le bouton qui consomme du quota. À surveiller dans `origine`.
- ⏰⭐⭐ **DEUX TÉMOINS ROUGES À MINUIT, SANS QU'AUCUN CODE N'AIT BOUGÉ** (ft-v986). `today()`
  calcule le jour en heure **LOCALE** (`state.js:529`) ; **6 fixtures de test** le calculaient en
  **UTC**. Entre 22 h UTC et minuit, *« demain » en UTC vaut « aujourd'hui » à Paris*.
  ⭐ **L'app est juste, ce sont les témoins qui mentaient** — verts 22 h par jour, rouges 2 h.
  ⛔ **Compter les endroits (6ᵉ fois)** : 5 dans `parcours` + 1 dans `calculs`, **une seule
  rougissait**, les 5 autres étaient latentes. Toutes repartent du `today()` de l'app (**R2**).
- 🧪 **BENCHMARK : 16 → 21 SCÉNARIOS** (ft-v986) — 5 pièges promus depuis `JOURNAL-DE-TEST.md`,
  tous **vécus en salle** : EV-017 (represcrire ce qui a été fait aujourd'hui) · EV-018 (repos
  inexécutable) · EV-019 (charge au-dessus du tenable) · EV-020 (variation BIA lue comme du
  tissu) · EV-021 (récitation du contexte système). Le plancher de 25 entrées est **atteint (49)**.
- 🧠⭐⭐ **LE CONTEXTE DE MILO — MESURE DU 23/08 AU SOIR** (aucun code modifié ;
  `docs/AUDIT-CONTEXTE-MILO.md` **§14**). Michel : *« attends, de 40 000 on est passé à
  70 000 ? »* puis *« on l'a diminué y'a 3 jours exprès, y'a un truc qui va pas là »*.
  ✅ **Le dégraissage du 19/08 a TENU** : bloc commun **46 467 (18/08) → 44 844 (21/08)**,
  soit **−1 623**. Rien n'a été annulé. ⭐ La mesure recoupe le §5 de l'audit du 17/08 à
  **1 caractère près** (44 684 / 44 685).
  ⭐⭐ **Le vrai constat : 92 % du bloc « personnel » n'est pas personnel.** Sur 3 profils
  opposés (dont un **blessé** et un **à la maison**), sur ~21 200 caractères facturés par
  personne à chaque message : **13 452 sont identiques chez tout le monde**, ~6 000 dépendent
  du **LIEU** (5 variantes, pas N — même motif que les 2 variantes admin/non-admin de
  ft-v767), et **~1 700 seulement sont vraiment personnels**.
  ⛔ **Ce n'est PAS un appel à supprimer du texte** — le but est de **reclasser**, à
  information constante. ⚠️ **Gain réel non mesuré** (dépend du nombre de personnes dans la
  même fenêtre de cache) et **aucun outil local ne sait vérifier qu'une règle déplacée est
  toujours suivie** (§13).
  ⛔ **Trouvé au passage** : le plafond du bloc commun **est dépassé chez un profil blessé**
  (**47 119 > 46 500**) — le témoin teste des profils **sains**, donc il reste vert.
  ⚠️⚠️ **Et deux de mes mesures étaient fausses avant d'être bonnes**, c'est écrit au §14 :
  ① *« le bloc personnel a été multiplié par 5 »* comparait **deux découpages différents**
  (le marqueur d'instant n'existait pas au 29/07) ; ② j'avais classé le catalogue « 100 %
  générique » en réglant `S.place`, alors que le code lit `S.coachQuiz.answers.place`.
  *Un nombre juste peut porter une conclusion fausse.*
- 🗑️ **LA CONFIRMATION PASSAIT DERRIÈRE** (ft-v985). Michel : *« le bouton supprimer ne
  fonctionne pas »*. ⛔⛔ **Il fonctionnait** — la question s'ouvrait derrière la fenêtre de
  modification (`elementsFromPoint` → `["EDIT","CONFIRM"]`). ⭐⭐ **Michel l'a confirmé sans le
  savoir** : *« ça a fonctionné après »* — en fermant la modale, la confirmation devient
  visible. ⭐ Cause : `#ov-confirm` **500** = `#ov-edit-food` **500**, et à égalité c'est
  l'ordre du DOM qui tranche. ⛔ **Systémique** : 25 appels à `showConfirm`, **19 overlays**
  au-dessus ou à égalité. Un seul correctif (R2) : la confirmation passe au-dessus de tout.
- ⚖️ **LA QUANTITÉ SUIT L'ALIMENT REPRIS** (ft-v984). Michel : *« comment ça se fait que je ne
  peux pas mettre la quantité, sérieux c'est relou »*. **Reproduit avant de coder** : le bloc
  est là par CIQUAL, absent quand on reprend l'aliment depuis **son propre journal** — alors que
  `per100` y est. `_afSuggPrendreLocale` le cachait sans condition et transmettait `per100` deux
  lignes plus bas (**R4**). ⚠️ Le mécanisme marchait donc **la 1ʳᵉ fois** et disparaissait toutes
  les suivantes. ⛔ Les macros corrigées à la main **ne sont pas écrasées** à l'arrivée.
  ⚠️ **Non couvert et écrit comme tel** : une entrée ancienne sans `per100` (sa ratatouille)
  reste sans quantité — le correctif n'est pas rétroactif.
- 🩺 **LE DIAGNOSTIC MÉDICAL NE PASSE PLUS SEUL** (ft-v983) — 3ᵉ et dernier bloquant.
  **Mesuré : sur les 5 contrôles du Gardien de SORTIE, un seul retirait vraiment quelque
  chose.** Les 4 autres étaient comptés puis affichés. Pour trois, un compteur suffit ; pas
  pour le diagnostic (Constitution P13/P22). ⛔ **On AJOUTE un renvoi au médecin, on ne
  réécrit pas** — le texte de Milo et son `dataset.raw` sont vérifiés intacts.
  ✅ **Les 3 bloquants de la contre-analyse sont traités** (ft-v981 · ft-v982 · ft-v983).
  ⏭️ **Reste pour l'ouverture large** : ① un **point de refus unique** avant « Commencer »
  (exSwaps, zone active, doublon) · ② le **vocabulaire Katch** — ⚠️ *corriger le témoin
  `tests/parcours/runner.js:3273` AVANT la phrase, il protège la mauvaise* · ③ la **mémoire à
  deux vitesses** (`MEMOIRE_LARGE_EMAILS` = 2 comptes) · ④ la **course `_saveCoachMemory`**,
  à prouver ou réfuter par un test avant de toucher au code.
- 🩹 **LA BLESSURE DITE À MILO ATTEINT ENFIN LE GARDIEN** (ft-v982) — le point n°1 de la
  contre-analyse. Le chemin était éteint derrière `__FT_CLONE__` : mesuré, Profil Santé `""`,
  Gardien `[]`. ⚠️ **Ce n'était PAS une régression du retrait du clone** (essai jamais promu).
  ⭐⭐ **Et en le promouvant on a trouvé pourquoi il était parqué** : `_gardienZonesFromText`
  détecte des **noms de muscles** — **7 faux positifs sur 9**. Le promouvoir tel quel aurait
  été *pire* que rien. D'où `_texteDitUneLimitation()` (zone **ET** mot de limitation) → **0
  faux positif, 0 raté sur 17**. La **2ᵉ moitié** (la consigne « nomme la ZONE ») était éteinte
  aussi. ⭐ « talon » ajouté — le mot de Michel, que rien n'attrapait. **Leçon montée en R30 :
  avant de promouvoir un essai parqué, chercher pourquoi il l'était.**
- 🔬 **CONTRE-ANALYSE DE L'AUDIT ft-v978** (23/08, artefact « Milo face au code »). Verdict :
  l'audit est **juste sur ses deux P0**, il **se trompe sur un point de méthode** (le pont
  blessure n'est pas une régression du retrait du clone — c'est un **essai jamais promu**), et
  il **manque deux défauts** trouvés en le vérifiant (2ᵉ lecteur `bw` cassé, table d'objectifs
  dupliquée). ⭐ **Niveau recommandé : 50-200 bêta-testeurs.** Un seul mécanisme l'empêche de
  monter — la blessure dite en conversation n'atteint pas le Gardien — et **à 200 personnes il
  se neutralise par un message**, à 20 000 non.
- 🧮 **LES DEUX BUGS DE CALCUL CORRIGÉS** (ft-v981). « Équilibre » rendait **3 190 kcal, comme
  « prise de muscle »** (`0||350`) → **2 840**, écart 0. Katch lisait `w.bw` quand la production
  écrit `kg` → la branche « pesée + % de gras » n'avait **jamais** tourné. ⭐⭐ **Les deux étaient
  protégés par des fixtures fausses** : corrigées EN PREMIER, elles ont rougi.
  ⏭️ **CE QUI RESTE, dans l'ordre** : ① **le pont blessure** (`__FT_CLONE__`, coach.js:1869 —
  et la consigne « nomme la ZONE » est derrière le même drapeau : **les deux moitiés sont
  éteintes**) · ② **le diagnostic médical détecté mais affiché** (1 seul des 5 contrôles de
  sortie retire vraiment) · ③ **un point de refus unique** avant « Commencer » (exSwaps, zone
  active) · ④ le vocabulaire Katch **et son témoin, à corriger d'abord** · ⑤ la mémoire à deux
  vitesses (`MEMOIRE_LARGE_EMAILS` = 2 comptes — **Milo ne s'évalue pas depuis le compte de
  Michel**).
- ⚡ **LE CONTRÔLE D'INTENSITÉ EN CODE** (ft-v980). Michel : *« 3 séries de 5 reps à 95, c'est
  impossible »*. ⭐⭐ **Milo ne l'avait pas déduit — il l'avait lui-même démenti** (88 % du 1RM,
  « je corrige : 90 kg »), et Michel a maintenu. *Le défaut n'est pas son jugement : son contrôle
  ne se déclenche que si on le questionne.* Le code le fait maintenant **à la proposition** :
  `bz()` inversée + coefficient de tenue 0,93 → **89,5 kg conseillés** là où Milo disait 90.
  ⛔ On **signale**, on ne corrige jamais (R29) · ⛔ sans record connu, **silence** · ⭐ R4 : le
  calcul atteint le contexte de Milo, avec l'auteur nommé.
  ⚠️ **Un témoin m'a fait corriger ma propre pose** (4ᵉ « correctif d'un seul côté » de la
  semaine) et a révélé que `_milo:true` manquait sur la porte « remplacer ».
- 📋 **LE DÉBRIEF NE SE PERD PLUS** (ft-v979). Michel : *« je n'ai pas eu de briefing parce
  qu'il y a eu la mise à jour de l'application »* — **il avait raison**. Le jeton était retiré
  **avant** l'appel et remis seulement `if(!ok)` : un rechargement pendant l'appel le faisait
  disparaître **pour de bon**. Et le moment n'est pas un hasard — la mise à jour attend la fin
  de la séance pour s'appliquer **sur l'Accueil**, où `finishWorkout` dépose la personne.
  **Mesuré : 5 séances sur 36 sans aucun débrief** (08, 10, 15, 18, 23/08), toutes complètes,
  pendant qu'une séance de 3 séries était débriefée. Trois correctifs : jeton **« en cours »**
  au lieu de détruit · **file** au lieu d'une place unique · **rattrapage** au démarrage
  (1 séance, ≤ 36 h — au-delà *« je viens de terminer »* serait faux). ⭐⭐ **Un témoin existant
  a attrapé un défaut de ma conception** : le rattrapage prenait le Registre pour preuve, or il
  n'est écrit que si Milo produit son bloc caché → la même séance aurait été re-débriefée **et
  repayée** à chaque lancement.
  ⏭️ **À TRANCHER AVEC MICHEL, il vient de les signaler (23/08 au soir)** : ① **le repos de
  1 min 30 sur du lourd** — déjà noté au journal de test, *« un 3×5 à 90 s c'est IMPOSSIBLE »* ;
  ② **d'où sort « 3×5 à 95 kg »** alors qu'il tourne à 85×5 (Milo l'avait lui-même calculé à
  88 % du 1RM, proposé 90, puis **laissé 95 quand Michel a insisté**) ; ③ **le superset n'a pas
  fonctionné** dans la séance du jour.
- 🔍 **AUDIT DU DOSSIER DE 200 PAGES + ses 3 premières corrections** (ft-v978). Rapport complet :
  artefact « Le dossier face au code ». ⭐⭐ **Le PDF de Milo n'était pas cassé** — mesuré, le
  texte sort intact (81/81, 323/345, 9769/9769) ; c'est `title:'Conseil de '+coach` que Michel
  recevait, la feuille de partage gardant le titre et jetant le fichier. **Correctif déjà écrit
  le 20/08, posé sur 1 export sur 10** → posé partout (3ᵉ « correctif d'un seul côté » en 2 jours).
  ⛔ La phrase *« on y perd du muscle avant du gras »* est retirée (fausse), sans seuil inventé
  en échange. ⛔ Le marqueur « masse maigre DÉDUITE » n'est plus jeté (R33).
  ⏭️ **La suite proposée, dans cet ordre** : ① le vocabulaire de Milo (*« masse maigre MESURÉE …
  chiffre SOLIDE … sans réserve »*, contredit R32 et s'applique même à un % de gras tapé à la
  main) — **c'est le sujet le plus important, et ce n'est pas un P0** ; ② les repères
  alimentaires ; ③ renommer « À la main » + l'ordre des boutons ; ④ afficher les pas déjà reçus.
  ⛔ **Le cycle menstruel ne se touche pas sans sources** : ses règles modifient réellement des
  calories, des macros et un score de récup.
  ⚠️ **Trouvaille non corrigée (P2)** : les deux défauts de sexe se contredisent — le BMR traite
  un sexe absent en **femme** (`gender==='H'`), le plancher en **homme** (`gender==='F'`). Seule
  porte non validée : `setup.js:2390` (restauration cloud).
- 📐 **HEADER COMPACTÉ PROMU** (ft-v977) — le 1ᵉʳ des 5 essais parqués tranché. ⚠️ **Trois de ses
  quatre règles n'auraient rien fait** : en perdant `html.is-clone` elles perdent leur
  spécificité, et sont redéfinies plus bas dans `style.css` — le témoin lit donc le style
  **calculé**, pas le fichier. 🔴 Bouton central mesuré : **792 → 792**, inchangé. Gain : header
  Milo 83 → 50 px, **+45 px** pour la discussion. ⛔ ft-v611 (« 8 questions » sans « gratuites »)
  **non promu**, raison écrite dans `coach.js`.
- ⚖️ **LA QUANTITÉ SUR UNE PHRASE LIBRE** (ft-v975) — Michel : *« je ne peux pas mettre de
  poids »*. Le rescale par proportion existait depuis ft-v972… **côté modification seulement**.
  ⭐ Le modèle **annonce désormais le poids qu'il a supposé** (`g`) : une estimation aveugle
  devient ancrée (**R4**). ⛔ Sans ancrage, des **portions**, jamais un poids inventé (R29).
- 🧪 **LE CLONE `/clone/` EST RETIRÉ** (ft-v976, décision de Michel) — *« plus besoin des clones,
  ça permettra de gagner du temps »*. Mesuré : sur les **60 dernières versions**, `clone/` a
  changé à chaque fois et **zéro fois tout seul** — il ne servait plus de bac à sable, il
  recopiait. Il coûtait 8 fichiers à dupliquer par version, et il a failli coûter cher le jour
  même (91 lignes du shim d'isolation effacées par un `cp` trop rapide, restaurées).
  ⏭️ **À TRANCHER, et c'est le vrai reste** : cinq essais vivaient derrière `__FT_CLONE__` et
  n'ont plus aucun moyen d'être testés — zones de santé lues dans le texte · header compacté
  (*« à promouvoir si Michel valide »* depuis ft-v610) · promesse d'inscription · consigne de
  mémoire des blessures · outils de test. **Le header compacté est promu** (ft-v977) ; il en
  reste **quatre**. **Les gardes sont conservées exprès** : les retirer
  rendrait ces essais soit universels, soit perdus. Chacun se décide séparément.
- 🔤 **LE RAPPORT DE BALANCE LU SUR LE TÉLÉPHONE** (ft-v974) — décision de Michel : *« on
  construit, parce que je l'utilise souvent »*. Première mise en œuvre de l'**échelle des
  sources** de R33 (OCR local avant l'appel IA, échec propre). Mesuré : **0,3 s** de chargement,
  **3,2-3,7 s** de lecture, **≈ 2 Mo** une seule fois et jamais au démarrage, **14 valeurs sur
  16** lues sur les 5 rapports. ⭐⭐ **Le lecteur vérifie sa propre lecture** — une virgule perdue
  donne un nombre crédible (protéine 13,8 → 18,8), et seule l'arithmétique du rapport
  (`gras+eau+protéine+os = poids`, juste à 0,05 kg) l'attrape. ⛔ **« Poids cible » jamais lu**
  (R32) · **« graisse sous-cutanée » retirée** (mal lue 4 fois sur 5, R30).
  ⏭️ **En attente** : le fichier de son **ancienne balance**, pour l'import CSV/Excel (l'outil
  existe déjà — Profil → « Importer un fichier balance » — et Michel y a accès).
- ⬇️ **DÉFILER JUSQU'EN BAS, SUR TOUS LES ÉCRANS** (ft-v973) — Michel : *« Beug, je ne peux plus
  défiler en bas »*. Safari n'ajoute pas le `padding-bottom` d'un conteneur flex qui défile ;
  le correctif (un vrai **élément**) existait **depuis ft-v670** mais n'était posé que sur
  l'écran Progrès. ⚠️ **Ma 1ʳᵉ hypothèse était fausse** : rejoué sur le code d'avant ft-v968, la
  dernière ligne était **déjà** cachée (827 px pour une nav à 770). ⭐ Un **témoin structurel**
  fait désormais rougir la livraison si un écran futur n'a pas son espaceur.
- ⏸️ **LE BENCHMARK EST EN PAUSE — décision de Michel, 21/08** : *« on met de côté le benchmark,
  on n'a pas assez de "pièges" pour Milo »*, puis *« dès que tu auras marqué **25 questions ou
  pièges** on le relance »*.
  👉 **La priorité est d'ALIMENTER `docs/JOURNAL-DE-TEST.md`** — et sa demande explicite était
  *« il faut que tu fasses en sorte d'alimenter ce fichier **et que tu t'en souviennes** »*.
  ⭐ **« S'en souvenir » ne repose pas sur la bonne volonté d'une session** : c'est branché sur
  la **règle d'or #12** (le seul fichier auto-chargé) **et sur un compteur dans
  `tools/check_regles.py`**, qui affiche l'état à chaque livraison. *Une intention qu'aucun
  outil ne rappelle finit par s'éteindre.*
  ⚠️⚠️ **25 est un PLANCHER, pas une cible** (*« quand je dis 25 c'est **au moins** »*) : on ne remplit
  pas pour atteindre le chiffre, **et on ne s'arrête pas en l'atteignant**.
  ⏭️ **État au 21/08 (soir) : 25 entrées — plancher ATTEINT, 20 à promouvoir.**
  ⭐ **Toutes viennent de cas RÉELS**, remontés des transcriptions du 1ᵉʳ au 21/08 avec les mots
  exacts de Michel. Les plus fortes : *« il n'y a pas l'image du mouvement »* (séance d'**Eline**,
  débutante — elle ne pouvait pas exécuter sa séance) · *« je lui ai **déjà dit** que cet exercice
  ne me convient pas »* · *« presque **la moitié** de ma séance en échauffement »* · *« il prend
  que les dernières séances »* alors qu'une coupure de **3 mois** doit rester visible.
  ⚠️ **Leçon de fouille écrite dans le fichier** : mon filtre cherchait le mot « Milo » et a raté
  le meilleur cas (celui d'Eline) — *les observations les plus utiles ne nomment pas le coach*.
  ⚠️ **Ne pas remplir pour remplir** : le seuil sert à avoir de la matière, pas à faire du
  chiffre. Une entrée doit venir d'un cas RÉEL (les 6 meilleurs scénarios en viennent).
- ⚖️ **QUANTITÉ POUR TOUTES LES ENTRÉES + CALORIES INCOHÉRENTES** (ft-v972) — rescale **par
  proportion** (aucun `per100` requis), référence lue dans le **nom** (« 30g de protéines »), et
  **portions** quand il n'y a aucun ancrage. ⛔⛔ Contrôle `4P+4G+9L` **en direct à 5 moments** :
  sa ligne à **1117 kcal** en valait **117** — 1 000 kcal fantômes que rien ne signalait.
  ⛔ On ne corrige jamais tout seul (R29). ⛔⛔ **L'alcool est exclu** (7 kcal/g sans champ) —
  trouvé en testant les cas limites, pas après coup (R19).
- 📐 **R32 et R33 écrites** — *une donnée peut être exacte dans le rapport et fausse à lire
  littéralement* (mesuré/estimé/propriétaire, r=0,998 eau↔muscle) · *le format du fabricant ne
  devient jamais le format interne* (échelle structuré → PDF → OCR → IA → échec propre, avec la
  mesure qui justifie de ne PAS construire le pipeline OCR aujourd'hui).
- 📷 **LE SCAN DE BILAN PERDAIT LE POIDS À LA 1ʳᵉ ANALYSE** (ft-v971) — Michel : *« mes poids ne
  prennent pas sur la première prise d'analyse… ça fait 4 appels API au lieu de 2 »*.
  ⭐ **Mesuré dans un vrai navigateur** (leçon `BUGS.md` 12quater, appliquée) : 0 champ sur 16 à
  la 1ʳᵉ passe. ⛔⛔ `openBodyScanForm` est `async` depuis ft-v758 et **n'était pas attendue**.
  ⚠️ **Aucune erreur levée**, et « Rapport lu ✅ » s'affichait devant un formulaire vide — *un
  appel vision payé était jeté et l'écran annonçait un succès*. **R14.**
  ⛔ Le message **compte** maintenant les valeurs écrites.
- 📈 **L'ÉVOLUTION DU BILAN CORPOREL ATTEINT MILO** (ft-v970) — 3 bilans antérieurs datés, comme
  le sang depuis ft-v943 (**R13**). Sinon Milo comparait 23/08 à 22/08 : **du bruit**.
  ⚠️⚠️ **Et mon analyse du matin était fausse** : j'avais annoncé « −1,4 kg de gras, 85 % ».
  Mesuré sur ses chiffres, **la tendance est plus petite que le bruit** (maigre : 0,3 kg de
  tendance pour 0,8 kg de bruit). Michel me l'a rappelé — c'était écrit en ft-v323 et ft-v833,
  **je ne l'avais pas relu** (R23). Ce qui tient : **le poids** (−1,65 kg).
- 🧮 **D'OÙ VIENT LE CHIFFRE DE PROTÉINES** (ft-v969) — Michel : *« c'est la portion ou juste le
  nombre de protéine ? »*. ⭐⭐ **La question était le défaut** : le champ ne disait pas qui le
  remplit, et restait vide (placeholder « 0 ») pendant que la barre affichait le total du Journal.
  ⛔ **Même famille que le « 88 g »** de ft-v966 — deux nombres, aucun faux, voisinage muet.
  ⭐ **R2** : la ligne relit `eaten` et nomme sa source, elle ne recalcule rien.
- 📋 **LE JOURNAL RANGÉ PAR REPAS + 2ᵉ COLLATION** (ft-v968) — Michel : *« c'est un peu le foutoir,
  il faut les ranger et créer des lignes déroulantes pour chaque section »* + *« pouvoir rajouter
  une collation, il y en a qui en prennent le matin et le soir »*.
  ⭐⭐ **Le vrai défaut était le TRI, pas l'affichage** : la liste suivait l'heure de **saisie** — on
  note son petit-déj à midi. C'est l'ordre du **repas** qui commande maintenant.
  ⭐ **R13** : `<details>` natif comme le menu admin, zéro JS. Total kcal/protéines par section.
  ⛔ Section vide **masquée** (R24) · état plié **conservé au re-rendu** (sinon un ajout redéplie tout).
  ⛔⛔ **Piège silencieux évité** : le repli valait `FOOD_MEALS[1]` = *déjeuner* ; réordonner en
  faisait la *collation*. Repli désormais **nommé** (**R14**), avec témoin.
  ⚠️ Libellés **neutres** (« Collation 2 », pas « du soir ») — R29.
- 🟡 **PROCHAINE PRIORITÉ — 5 drapeaux en direct, NON LUS** (22/08 23:37, écrans du Gardien) :
  `promesse_vide : 5` entre le 21 et le 22/08. ⚠️⚠️ **J'avais titré « ft-v923 NE TIENT PAS » —
  c'était faux** : Michel a envoyé la réponse exacte d'un de ces drapeaux, et c'était un **faux
  positif** (« je note » + la séance appliquée dans le même message). Motif recalibré en ft-v967.
  ⛔ **Conclure d'un compteur sans lire ce qu'il compte** = `BUGS.md` 12quater, refaite **deux
  heures après avoir écrit la famille qui la décrit**. Tant que les 5 ne sont pas lus, on ne conclut
  ni « ça tient » ni « ça ne tient pas ».
  ⭐ **Vérification croisée réussie** : scan rétro de l'app **et** scan hors-ligne du fichier exporté
  donnent exactement le même historique (4/119 · promesse_vide 3 · source_fabriquee 1).
  ⚠️⚠️ **Mon analyse datée sous-estimait** : « 1 sur 29 » lu dans l'**export**, contre **5** en direct
  — *un export ne contient pas tout ce qui a été généré.*
  ⚠️ **R9** : ces 5 viennent du Milo **débridé** de Michel ; **Eline est à 1 sur 14**, c'est elle
  l'échantillon qui juge le produit.
  ⛔ **R7 — ne pas durcir le prompt en réflexe** (ce serait le 4ᵉ sur ce symptôme). Les cas lus sont
  des **excuses** après correction (« t'as raison, j'ai merdé… je note »), pas des promesses cyniques.
  *Question à trancher d'abord : peut-il POSER un bloc dans ces moments, ou n'a-t-il rien à noter ?*
- 🧮 **« POUR TES 30 G »** (ft-v966) — deux nombres de protéines sur le même écran (88 pour 100 g,
  26 pour lui) et **rien ne disait lequel était le sien**. Une ligne dans la rangée Quantité le dit.
  ⭐⭐ **R2** : elle **relit** les champs, elle ne recalcule pas. ⛔ Jamais la valeur pour 100 g.
  ⭐ **Scan Gardien de ses 119 réponses, DATÉ** (il a prévenu : *« il y a des vieux trucs »*) :
  **22/08 → 1 dérive / 29 réponses** · 19/08 → 1/20 · 09/08 → 2/60 · 28/07 → 0/10.
  ⚠️ **Ne PAS additionner les époques** (règle de ft-v946, que j'avais moi-même enfreinte) :
  seul le 22/08 mesure le Milo d'après les correctifs. ft-v923 tient mieux, **sans fermer**.
- ⚖️ **LA QUANTITÉ ÉTAIT AU-DESSUS DU CHAMP OÙ L'ON TAPE** (ft-v965) — Michel : *« j'ai voulu
  mettre 30 g de POUDRE de protéine, et ça fait 88 g de protéine »*.
  ⚠️⚠️ **CORRIGÉ le soir même : ma cause était FAUSSE.** Sa vidéo montre Quantité **30 g** et des
  champs à **117 kcal / 26 g de protéines** — l'app avait entièrement raison, aucun bug. Le 88 qu'il
  lisait est la **carte produit** (« Valeurs pour 100 g »), en vert vif, loin de ses vrais chiffres.
  **J'ai déduit un mécanisme d'un seul nombre au lieu de demander l'écran** (R28, 3ᵉ fois en 2 jours).
  Le déplacement du champ reste bon ; **la raison affichée était inventée**.
  ⛔⛔ **Le calcul n'a jamais été faux, c'était le PLACEMENT** : le bloc « Quantité » vivait AVANT
  le champ de recherche (logique pour le code-barres, à contresens depuis ft-v956/957).
  ⭐ Déplacé **juste au-dessus des macros qu'il pilote** — il sert les deux chemins.
  ⚠️⚠️ **Coût réel et silencieux** : 100 g de whey au lieu de 30 = +64 g de protéine, ~250 kcal.
  Même famille que le pluriel (ft-v963) : une valeur **plausible** mais fausse. **R14.**
  ⚠️ La valeur par défaut de 100 g **ne bouge pas** : la « corriger » demanderait de deviner une
  portion (30 g de whey ? 250 g de riz ?) — faux-précis, **R29**.
- 🔤 **CES MOTS-LÀ NE S'ÉCRIVENT PAS** (ft-v964) — Michel : *« je voulais mettre coquilette »*
  (**un seul L**) → zéro résultat. ⭐ 6 autres graphies échouaient : spagetti, tagliatele, farfale,
  fusili, linguini, pene — consonnes doublées et h muets.
  ⛔ Tolérance **bornée à la liste fermée de 12 formes**, jamais à la base.
  ⚠️⚠️ **Deux pièges trouvés en mesurant** : ① ma 1ʳᵉ version envoyait **« macaron » sur les pâtes**
  (retrait de la voyelle finale — supprimé) ; ② **« torsade » retiré** (biscuit apéritif chez
  CIQUAL, R30). Seule collision restante : « spaghetti » la courge, **voulue** (elle reste trouvable).
- 🔎 **LE PLURIEL — 97 % DE LA BASE ÉTAIT INATTEIGNABLE** (ft-v963) — Michel : *« j'ai cherché
  les pâtes, j'ai pas trouvé — enfin si, mais pas ce que je voulais trouver »*.
  ⚠️⚠️ **Sa propre explication était fausse** (*« ah c'est pâtes et pas pates lol »*, l'accent) :
  mesuré, les deux rendent la même liste depuis ft-v960. **R28 coupe dans les deux sens.**
  ⛔⛔ **Le vrai défaut** : CIQUAL nomme au **singulier**, on tape au **pluriel** → 97 % des
  3 341 aliments inatteignables. ⭐⭐ **Et le pire n'est pas le vide, c'est le faux** : les plats
  composés emploient le pluriel — « amandes » rendait *Croissant aux amandes*.
  ⛔ **Même trou en vocabulaire pour les pâtes** : penne / macaroni / coquillettes → 0 résultat,
  et « spaghetti » rendait **la courge spaghetti**. 12 formes courantes y mènent désormais,
  **sans fermer** l'accès à la courge.
  ⭐⭐ **Deux essais pour l'ordre** : mon 1ᵉʳ jet rendait *Pâté breton* pour « pâtes » et *Poireau*
  pour « pois ». Classement final : commence-par > forme exacte > nom le plus court.
  **0 régression sur 50 requêtes.**
  ⭐ **R2** : les 3 recherches (CIQUAL, compléments, **son journal**) corrigées au même endroit.
- ⚖️ **MODIFIER LE POIDS D'UNE ENTRÉE DU JOURNAL** (ft-v962) — Michel, sur un « Oeuf cru » :
  *« ya œuf cru (lol) pas cuit. Et on ne peut pas modifier le poids »*.
  ⭐⭐ **Deux questions, une seule est un défaut** (vérifié, R28). ① **L'œuf cru n'est pas un trou**
  de la base : « Oeuf dur » sort **premier** quand on tape « œuf », avec poché / à la coque /
  brouillé / au plat — il a pris le 2ᵉ. Et l'écart est de **12 kcal** sur ses 4 œufs (le cru/cuit
  compte énormément pour les féculents, presque pas ici). **Rien à corriger.**
  ⛔⛔ ② **Le poids, lui, était un vrai défaut** : la modale ne montrait que les 4 macros brutes —
  changer une portion demandait 4 règles de trois à la main.
  ⭐ **R13** : on branche `_bcApplyGrams()` (déjà utilisée à l'ajout) sur `e.per100`.
  ⭐⭐ **C'est R4 qui paye** : ce `per100` était stocké depuis la brique 0 et n'atteignait **aucun
  écran** — rien à collecter, seulement à brancher.
  ⛔⛔ **Le témoin central est un REFUS** : pas de champ si `per100` est absent (une saisie à la main
  n'a pas de pour-100 g — en inventer un serait un faux-précis, R29).
- 📅 **NAVIGUER DANS LE JOURNAL — voir ET modifier un autre jour** (ft-v961) — Michel : *« on ne
  sait pas ce que l'on a mangé dans la journée et on ne peut même pas le modifier »*.
  ⭐ **Vérifié avant de coder** : le Journal était câblé en dur sur `today()`, sans navigation.
  ⭐ **Même repère** que le calendrier de l'Accueil (flèches ‹ ›). ⛔⛔ **Jamais vers le futur**.
  ⭐⭐ **Le témoin central** : un jour passé est **modifiable**, pas juste consultable — édition
  et suppression marchent comme pour aujourd'hui, sans toucher au jour présent.
  ⭐ **Ajouter en consultant le passé DATE sur ce jour-là** (backfill) — sinon on n'aurait résolu
  que la moitié du problème (voir, pas corriger).
  ⚠️ Un jour clos n'a plus de « restantes » (libellé en comparaison simple) ; l'objectif affiché
  reste celui d'aujourd'hui (pas de faux-précis historique, R29).
- 🔤 **MÊME BUG, SUR L'APOSTROPHE** (ft-v960) — Michel : *« faut aller voir aussi les
  caractères spéciaux »*. Vérifié systématiquement sur ~132 000 noms : accents/tréma/cédille
  étaient déjà bons. L'apostrophe avait le même défaut que la ligature — clavier iPhone la
  convertit en courbe à la frappe, 238 aliments CIQUAL en portent une. **Retirée purement**
  (elle ne porte aucun sens pour la recherche), même fonction partagée (R2).
- 🥚 **BUG DE LA LIGATURE ŒUF** (ft-v959) — trouvé en vérifiant un produit d'œuf que Michel
  montrait en photo. `normalize('NFD')` ne décompose que les **accents**, jamais les **ligatures**
  œ/æ — et le clavier iPhone corrige « oeuf » en « œuf » en tapant, pendant que CIQUAL écrit
  « oe » séparé. **Zéro résultat** pour œuf/bœuf sur iPhone, corrigé dans `_afNorm` (R2 : une
  seule fonction pour CIQUAL et les suggestions locales).
  ⚠️ « poulet » (signalé avant) était un faux problème — version pas rafraîchie, rejoué et
  confirmé sain.
- 🔍 **UN AUTRE COMPLÉMENT — identification seulement** (ft-v958) — Michel a fourni **Compl'Alim**
  (5 fichiers, 142 928 déclarations), puis a demandé de **simplifier l'approche**.
  ⛔⛔ **Nom + marque + catégorie déclarée uniquement** — 129 033 produits. **Aucune dose,
  aucune mise en garde** : identification, pas conseil (créatine/whey restent les seules avec
  ce traitement).
  ⚠️ **Corrigé avant de coder** : Compl'Alim n'a **aucune valeur nutritive** — vérifié dans le
  fichier. Pour ça, c'est Open Food Facts (déjà branché).
  ⛔ **Recherche seule, rien n'est journalisé.**
  ⛔⛔ Chargée à la demande (6,5 Mo → 1,58 Mo gzippé), même règle que CIQUAL.
  ⚠️ Licence data.gouv.fr non vérifiée (réseau bloqué) — écrit tel quel.
- 🥗 **LA BASE CIQUAL — brique 1 LIVRÉE** (ft-v957) — Michel a fourni le fichier de l'ANSES.
  **3 484 aliments génériques** : « banane » existe enfin comme aliment, pas comme marque.
  ⚠️ **Licence Ouverte / Etalab** → la source est **citée dans la liste**, ce n'est pas optionnel.
  ⛔⛔ **Chargée à la demande, jamais au démarrage** (250 Ko · 68 Ko gzippés) — **mesuré**, pas
  supposé, comme le dossier l'exigeait. ⛔ Pas dans le PRECACHE du SW (250 Ko à chaque version).
  ⛔⛔ **« - » = NON DÉTERMINÉ, pas zéro** : 143 aliments gardent `null` et sont **écartés de
  l'affichage**, la donnée restant dans le fichier. `traces` et `< 0,55` valent 0.
  ⭐ Protéines **N×6.25** (cohérent avec l'énergie Règlement UE 1169/2011, celle des emballages).
  ⏭️ **Ce qui reste du dossier nutrition** : brique 3 (**générateur** de repas — c'est là que la
  décision « DEUX bases » de `BRIEF-NUTRITION.md` §6.4 joue vraiment : le générateur veut ~300
  aliments `composable` en **liste blanche relue à la main**, pas les 3 484) et brique 4 (les 4
  niveaux de précision).
- 🔎 **DES PROPOSITIONS QUAND ON TAPE UN ALIMENT** (ft-v956) — Michel, après son **premier vrai
  repas noté** : *« il n'y a pas de choix de propositions donc je suis obligé de faire
  fonctionner l'IA »*. **Le trou n°1 du dossier nutrition, remonté par l'usage réel.**
  ⭐ **Deux sources, aucune inventée** : ① ce qu'il a **déjà noté** (instantané, hors ligne,
  dédoublonné, la plus récente gagne) ② la **recherche Open Food Facts** (gratuite, sans quota,
  même serveur que le code-barres).
  ⛔⛔ **Aucun essai IA consommé** — vérifié en COMPTANT les appels réseau réels.
  ⭐ **R2** : un résultat de recherche passe par le **même chemin** que le code-barres, donc
  l'avertissement **cru/cuit** (×2,7) marche aussi pour lui.
  ⚠️ **Limite écrite** : OFF est une base de **produits de marque**. **CIQUAL** (3 484
  génériques) reste le bon outil et **n'est pas là** — je ne peux pas la télécharger depuis la
  session (réseau bloqué), et écrire des valeurs de mémoire serait le faux-précis interdit.
  ⏭️ **La suite si Michel fournit CIQUAL** : brique 1 pour de vrai, avec ⚠️ **DEUX bases** —
  journal (couverture) vs générateur (sûreté), `BRIEF-NUTRITION.md` §6.4.
- 🧹 **LE MÉNAGE DU MENU ADMIN** (ft-v955) — Michel : *« retire ce qui est inutile, mais marque
  dans les journaux pourquoi ils ont été nécessaires »*.
  ⭐⭐ **Rien n'était inutile — R28 payé DEUX FOIS dans la même tâche, par moi.**
  ① **PT-001 n'est PAS remplacé par le benchmark** : il mesure la **mémoire longue** (rejeu de
  tout l'historique), le benchmark teste 16 messages **isolés**. ② **Le recalage n'est pas
  one-shot** : l'import d'historique produit des séances sans heure de séries.
  👉 **On range** : 36 boutons → **6 sections repliables**, seule la Surveillance ouverte.
  ⛔ **19 cartes, 34 boutons, zéro perdu** — témoin central, des deux côtés (app + clone).
  ⭐⭐ **Le vrai nettoyage** : les personas VC portaient les **prénoms de vrais testeurs** pour
  des profils inventés → **profil A/B/C**, prénoms injectés à Milo compris. C'est le piège qui
  m'a fait affirmer une fausseté sur Christophe le 21/08.
  ⏭️ **Rien n'est en attente** sur ce sujet. R30 enrichie d'un 2ᵉ cas réel.
- 🧮 **LE TOTAL DU GARDIEN CONTREDISAIT SON PROPRE DÉTAIL** (ft-v954) — *« oui corrige le total »*.
  ⭐⭐ **PREMIÈRE REMONTÉE RÉELLE DU PARC, et elle a marché** : **Eline — 14 réponses de Milo
  (13/08 → 22/08), 1 promesse de mémoire non tenue.** Elle a ouvert l'app, le scan a tourné, la
  sauvegarde est partie **toute seule** (ft-v948). ⭐ Et c'est le Milo **normal**, pas la version
  débridée du fondateur — l'échantillon qui compte (R9).
  ⛔ Mais le bloc annonçait « TOTAL, tous comptes confondus » en n'agrégeant que le **direct** →
  il contredisait son propre détail. **Deux totaux nommés** désormais, et ⛔ **on ne les
  additionne pas** (deux époques — décision ft-v946), c'est écrit à l'écran.
  ⭐ Le **rendu est sorti de l'appel réseau** → le cas réel de sa capture est **figé dans les
  tests**, chiffres compris.
  ⚠️ Le `bloc_technique : 2` chez Michel est un **résidu d'avant ft-v946**, pas un bug (compteur
  cumulatif ; le code actuel ne le compte plus — vérifié).
  ⏭️ **À suivre** : les autres testeurs à leur prochaine ouverture. Et **1 promesse vide chez
  Eline** — c'est un cas RÉEL à lire, candidat pour `docs/JOURNAL-DE-TEST.md`.
- ⏳ **QUAND SERAI-JE REVENU AU MAX** (ft-v953) — Michel : *« on ne sait pas quand on aura
  récupéré au max »*.
  ⛔⛔ **On donne un MOMENT, jamais un chiffre projeté** : un score futur supposerait de connaître
  des nuits qui n'ont pas eu lieu (R29 · Principe 18).
  ⚠️⚠️ **ET ÇA CORRIGE UNE ERREUR DE ft-v952** : « ton maximum est 93 » était **faux** — le bonus
  de repos (+12 après 4 jours) compense les permanents, donc **100 reste atteignable**, en ne
  s'entraînant pas. Reformulé en *« tant que tu t'entraînes régulièrement »*, l'absolu nommé à
  côté. Témoin qui **mesure** le 100, pas qui le suppose.
  ⚠️ Témoin ayant attrapé un **décalage d'une minute** (`Math.round(0.5)` rend 1).
- 🔋 **OÙ ON ARRIVE À 100 — et pour Michel, 100 n'existe pas** (ft-v952) — son idée du 21/08,
  reprise le jour même : *« ET reprend mon idée aussi pour la recup faut pas l'oublier »*.
  ⭐ **La 1ʳᵉ étape gratuite a répondu oui** : le calcul **gardait déjà** le détail par facteur,
  il n'était pas exploité. Rien à construire, tout à brancher.
  ⭐⭐ **Sa parenthèse était calculable** : âge et tabac sont les deux facteurs **permanents** →
  à 48 ans et fumeur, le maximum atteignable est **93**.
  ⛔⛔ **Mais le score n'est PAS re-barêmé** : « sur 93 » aurait réécrit tout l'historique. On
  garde l'échelle absolue, on **ajoute** le plafond. *L'idée proposait A ou B ; c'était les deux.*
  ⛔ Les permanents **ne comptent pas comme un manque** (ils déplacent la ligne d'arrivée).
  ⛔ **Aucun conseil d'arrêter de fumer** dans le bloc (P13) — vérifié par un témoin sur le texte
  réellement produit.
  ⏭️ **Rien d'ouvert sur cette idée** ; l'entrée d'`IDEES-FUTURES.md` est marquée LIVRÉE (R23).
- 🍚 **LES GLUCIDES PLUS HAUTS LES JOURS DE SÉANCE** (ft-v951) — Michel : *« les glucides plus
  hauts les jours de séance et adaptés »*.
  ⭐⭐ **Le levier n'est pas les glucides, ce sont les LIPIDES** : protéines et lipides sont fixés
  au poids de corps, les glucides sont le **reste**. Ils montent quand les lipides descendent.
  ⛔⛔ **Le total de la semaine ne bouge pas d'un gramme** — compensation calée sur la fréquence
  réelle, somme **exactement nulle**, vérifiée de **1 à 6 séances/semaine**.
  ⚠️ Les **calories du jour** ne bougent pas non plus : l'anneau est stable, seule la
  répartition change (R12).
  ⭐ **« Adaptés »** : jambes > bras (`_calSessRegion`) — facteurs assumés comme un **ordre**,
  pas une mesure. La neutralité tient parce que les jours de repos rendent la **moyenne des
  facteurs de SES séances**.
  ⛔⛔ **Aucun cycling en kéto ni low carb** : le % **définit** le régime.
  ⚠️ Plancher lipidique **0,6 g/kg, écrit comme un CHOIX** — le Gardien n'a aucun seuil lipides.
  ⚠️⚠️ **Défaut trouvé par le témoin** : arrondir les lipides avant d'en déduire les glucides
  injectait ~1 g/jour qui **ne se compensait pas** (jusqu'à 9 g/semaine). Cause supprimée,
  tolérance **pas** élargie.
  ⏭️ **Ce qui reste de `NUTRITION-MOTEUR.md` §3.1** : rien sur cette ligne. Les 2 bullets sont
  faites. Restent les briques 1/3/4 (CIQUAL, générateur, 4 niveaux de précision).
- 🍽️ **LES REPAS D'ENTRAÎNEMENT N'EXISTENT PLUS QUE LES JOURS D'ENTRAÎNEMENT** (ft-v950) —
  Michel : *« ok maintenant le plan de repas les jours de séance »*.
  ⭐⭐ **Le défaut allait dans les deux sens** : muscle/force/endurance affichaient « ⚡ Pré » et
  « 💪 Post » **tous les jours** (jusqu'à **40 %** des calories d'un dimanche de repos), pendant
  que le plan **perte** n'en a **aucun**, même un jour de squat lourd.
  ⛔⛔ **Les calories du jour ne bougent pas d'un kcal** : redistribuées, jamais retirées (R29).
  ⭐ **R2** : c'est la MÊME redistribution que le jeûne intermittent, pas une deuxième.
  ⭐⭐ Un jour de séance, les repas **nomment l'heure réelle** ; heure inconnue → on n'en
  invente pas une. 3 sources : séance **faite** → **en cours** → **annoncée aujourd'hui**.
  ⚠️ **Deux limites écrites et épinglées par un témoin (R30)** : ① `perte`/`recomp` n'ont pas de
  pré/post, donc rien ne change pour eux ; ② la journée **n'est pas réordonnée** selon l'heure
  (une séance à 7 h devrait placer le pré-entraînement avant le petit-déjeuner).
  ⏭️ **Les 2 suites naturelles**, dans `NUTRITION-MOTEUR.md` §3.1 : les **glucides plus hauts
  les jours de séance** (à calories hebdo égales) et la **région travaillée** (jambes lourdes vs
  bras) — ni l'une ni l'autre n'est commencée.
- 🏋️ **LE NIVEAU D'ACTIVITÉ CONTIENT DÉJÀ L'ENTRAÎNEMENT** (ft-v949) — Michel : *« bon la
  nutrition lol ? »*.
  ⭐⭐ **J'ai annoncé l'inverse et le code m'a contredit.** J'ai dit *« la nutrition ignore
  complètement l'entraînement »* (c'est même écrit dans `NUTRITION-MOTEUR.md`) — **faux** :
  l'écran affichait déjà « Total = dépense + séance ». Le vrai défaut est le **contraire** :
  cette addition **compte la séance deux fois** (le multiplicateur s'appelle « Modéré (3-4j) »).
  ⛔ Et elle **contredisait l'anneau** juste en dessous, qui ne l'ajoute pas.
  ⚠️⚠️ **Le défaut de fond est plus grave** : `applyFreqContext` demande *« tu t'entraînes plutôt
  5 fois maintenant ? »*, la personne dit **oui**, et seul `coachQuiz.answers.freq` est écrit —
  **`S.activityLevel` ne bouge pas**. L'info est collectée, **validée par elle**, stockée, et
  n'atteint jamais le calcul (**R4**), avec deux déclarations du même fait (**R2**).
  👉 La tuile dit le **nombre de séances de la semaine** ; une carte propose de recaler le
  niveau, gain en kcal **calculé**. ⛔ **Jamais appliqué tout seul** (R29).
  ⏭️ **À suivre côté nutrition** : brique 1 (CIQUAL, **DEUX bases** — voir `BRIEF-NUTRITION.md`
  §6.4) toujours **différée exprès** pour construire sur du vrai usage.
- 🔋 **IDÉE NOTÉE (pas commencée)** — Michel, 21/08 : *« on a le score de récupération mais il
  faudrait rajouter la donnée où on arrive à 100 (bon sauf moi qui suis fumeur) »*.
  ⚠️ **La parenthèse est le point principal** : si un facteur **permanent** plafonne le score,
  le 100 devient inatteignable — et un plafond invisible transforme un outil de progrès en
  reproche quotidien. Détail + arbitrage A/B dans `IDEES-FUTURES.md`.
  ⏭️ **Première étape gratuite** : ouvrir le calcul du score et mesurer s'il **garde le détail
  par facteur** ou s'il l'écrase dans un total. Sans détail, il n'y a rien à afficher.
- 📤 **LE COMPTEUR NE PARTAIT QUE SI LA PERSONNE FAISAIT QUELQUE CHOSE** (ft-v948) — Michel :
  *« à partir de quel moment tu pourras lire le Milo à Eline ? »*.
  ⭐⭐ **Réponse honnête avant le correctif : peut-être jamais.** Le scan rétro tournait bien au
  démarrage, mais **la sauvegarde ne part que sur une ACTION** — ouvrir, lire, refermer
  n'envoyait rien.
  ⚠️⚠️ **Et on aurait lu ce silence comme une réponse** : « aucun compteur pour Eline » se serait
  lu *« elle ne s'en sert pas »*. *Une mesure qui n'arrive jamais et une mesure à zéro se
  ressemblent.* C'est le défaut de ft-v947 **d'un cran plus haut** : on avait réparé
  l'affichage, pas le chemin.
  👉 **Le scan pousse désormais la sauvegarde lui-même — ouvrir l'app suffit.**
  ⛔ **Mais une écriture par NOUVEAUTÉ, pas une par démarrage** (le stockage a saturé le 29/07).
  ⚠️⚠️ **Mon 1ᵉʳ jet aurait envoyé une sauvegarde par jour et par personne** : je comparais
  `faitLe`, **la date du scan**, qui change toute seule à minuit. *Un défaut qui ne se serait
  vu que le lendemain — donc jamais dans un test écrit le même jour.*
  ⏭️ **À suivre** : les chiffres d'Eline arrivent à sa prochaine ouverture. Le **contenu** de ses
  conversations, lui, reste sur son téléphone — il faudrait qu'elle l'exporte elle-même.
- 🔬 **LES 4 DRAPEAUX RESTANTS, LUS UN PAR UN** (ft-v947) — Michel : *« regarde les 3
  diagnostic et le lien »*.
  ⭐⭐ **Les 3 `diagnostic` sont des faux positifs, tous du même défaut** : le motif attrapait
  « tu es (en |atteint) », or **« tu es en » est une tournure ordinaire** (« tu es en Jour 2 »,
  « tu es en plein dans la zone », « tu es en phase de charge »). Même défaut dormant dans
  « tu fais (une |un ) ». → une **pathologie** est désormais exigée derrière.
  Vérifié dans les 2 sens : **6/6** vrais vus, **0/5** faux, hypothèse nommée verte.
  ⚠️⚠️ **Le resserrage a d'abord rendu le garde-fou MUET** : `\\b` au lieu de `\b`. Cousin du
  piège déjà payé ici. *Un motif concaténé se vérifie en le jouant, pas en le relisant.*
  ⭐ **Le lien `claude.ai` est gardé** : faux positif léger (1/129), dans une conversation
  débridée sur le prompt. Resserrer risquerait de rater une vraie source fabriquée.
  👉 **Bilan sur les 25 jours : 4 drapeaux, dont 3 vraies promesses non tenues.**
  ⭐⭐ **Trou comblé sur « les testeurs testent-ils Milo ? »** : un compte SANS dérive
  n'apparaissait pas. Or `retro.messages` = la mesure d'usage. La vue les montre tous.
  ⏭️ **À suivre** : voir les chiffres des testeurs à leur prochaine ouverture.
- 🕰️ **L'HISTORIQUE DÉJÀ STOCKÉ PASSE AU GARDIEN** (ft-v946).
- 🕰️ **L'HISTORIQUE DÉJÀ STOCKÉ PASSE AU GARDIEN** (ft-v946). Michel : *« on ne pourra pas
  récupérer les anciennes conversations alors »*. Si : elles sont sur le téléphone (30 rangées
  + le fil en cours) et gardent le **texte brut**, blocs `{"retiens"}` compris — ce qui rend
  la mesure juste. Scan local, **0 appel**, une fois **après** le démarrage (règle d'or #4).
  ⭐⭐ **Instantané, pas addition** : on remplace le bloc `retro`, donc rejouer ne double rien.
  ⛔ **Séparé du direct** : l'historique couvre plusieurs versions de Milo, dont des
  antérieures aux correctifs. Deux blocs, deux périodes datées.
  ⚠️⚠️ **Défaut de mesure trouvé par un témoin** : `bloc_technique` se lève sur chaque séance
  et chaque bloc mémoire — **du trafic normal**. Le compter aurait noyé le signal. Retiré des
  compteurs (`_GARDIEN_DERIVES`, une seule liste lue par les deux — R2).
  ⭐ **Mesuré sur les 25 vrais jours de Michel : 7 dérives / 129 réponses** (diagnostic 3 ·
  promesse_vide 3 · source_fabriquee 1). ⚠️ **Des drapeaux, pas des preuves** — seules les
  3 promesses ont été vérifiées à la main. ⏭️ **Les 4 autres restent à lire.**
- 🌍 **LA MESURE CONTINUE, CHEZ DE VRAIS UTILISATEURS** (ft-v945).
- 🌍 **LA MESURE CONTINUE, CHEZ DE VRAIS UTILISATEURS** (ft-v945). Michel : *« mais je veux
  une mesure continue »* — après avoir signalé *« n'oublie pas Milo avec moi, il est débridé »*.
  ⭐⭐ **Vérifié : il avait raison.** `_estSuperAdmin()` lui ouvre 2 portes fermées aux autres
  (citer ses propres consignes · aucune restriction de sujet). Le **modèle est le même**.
  ⚠️ **Donc le Gardien de ft-v944 avait été calibré sur l'échantillon le moins représentatif** —
  un des 4 faux positifs n'existe que chez lui. **Cousin de R9.**
  👉 Le compteur remonte avec la sauvegarde (Apps Script + miroir), lisible dans
  **Profil → Admin → 🌍 Gardien — tous les comptes**.
  ⛔ **Des nombres seulement** (~150 o) · le serveur **reconstruit** l'objet · les conversations
  ne quittent pas le téléphone · **et l'app le dit aux testeurs** (« je ne veux pas leur cacher »).
  ⛔ Milo ne reçoit pas ce compteur (il commenterait son propre score).
  ⏭️ **À SUIVRE** : il faut attendre que les testeurs **sauvegardent** pour voir leurs chiffres.
  Un compte n'apparaît qu'après sa prochaine synchro.
- 🛡️ **LE GARDIEN TOURNE ENFIN LÀ OÙ LES GENS VIVENT** (ft-v944).
- 🛡️ **LE GARDIEN TOURNE ENFIN LÀ OÙ LES GENS VIVENT** (ft-v944). Michel a exporté ses
  conversations — **258 messages, 25 jours, 142 425 caractères** — et on y a mesuré
  **3 vraies promesses de mémoire non tenues**, que **rien** ne voyait passer : le Gardien de
  sortie ne tournait que sur le **clone**.
  ⚠️⚠️ **Le brancher tel quel aurait été pire** : sur ces 129 vraies réponses il criait
  **7 fois**, dont **4 faux positifs**. Calibré d'abord → **7 → 3**, exactement les 3 vraies.
  ⛔ **Le texte affiché ne change pas d'un caractère** — on ajoute une mesure, pas un filtre.
  ⚠️ **On mesure chez tout le monde, on affiche chez nous** : badge réservé (clone + admin),
  compteur pour les autres, qui ne garde **que des nombres** (P3).
  ⚠️ Les 3 cas sont **antérieurs au correctif du 20/08** (ou non datables) : rien ne prouve
  que ft-v923 a échoué — le vrai apport, c'est qu'on le **saura** désormais.
  ⏭️ **CE QUE LE FICHIER A AUSSI MESURÉ**, sur la question « pourquoi ne pas tout envoyer à
  Milo » : 25 jours = **2× le contexte entier**, un an ≈ **30×** · et **86,4 % du volume,
  c'est Milo qui parle** (Michel : 13,6 %). ⚠️ Ce n'est **pas** un problème de place
  (40 000 tokens rentrent) — c'est la **dilution** et la **croissance**.
- 📈 **L'ÉVOLUTION DU BILAN SANGUIN ATTEINT MILO** (ft-v943).
- 📈 **L'ÉVOLUTION DU BILAN SANGUIN ATTEINT MILO — mais il ne l'ouvre jamais lui-même**
  (ft-v943). Michel : *« qu'il voie l'évolution, comme la courbe du poids, et tous les
  marqueurs, mais il ne le dit que si on lui demande par contre »*.
  ⚠️ **Trou comblé (R4/R8)** : on n'envoyait que `bt[0]` et une sélection, alors que l'écran
  comparait déjà au bilan précédent depuis juillet. **L'app savait, Milo pas.**
  👉 Partent maintenant : **tous** les marqueurs + jusqu'à **3 bilans antérieurs datés**.
  ⛔⛔ **Le point délicat** : plus de données médicales = plus de risque qu'il en parle seul.
  La règle est posée **à côté de la donnée** (là où la règle keto avait échoué à 67 % du
  prompt) **et rendue mesurable** par **EV-016** (on demande une séance → il reste muet).
  ⛔ **Sens inverse non testé** : « répond-il bien quand on l'interroge ? » n'a pas de
  scénario. À écrire si le besoin se présente.
  ⚠️ Corpus à **16** scénarios · le prix annoncé se **calcule** (`_EV_PRIX`) au lieu d'être
  écrit en dur pour 15.
- 🔐 **L'APP DEMANDE LE MOT DE PASSE D'UN PDF PROTÉGÉ** (ft-v942).
- 🔐 **L'APP DEMANDE LE MOT DE PASSE D'UN PDF PROTÉGÉ** (ft-v942). Les labos livrent souvent
  les bilans en PDF chiffré ; l'app rendait « Souci lecture fichier » — un message qui dit
  qu'il y a un problème **sans dire lequel**.
  ⭐ Corrigé dans **`_pdfOuvrir`** (R2) : les **4** imports de PDF en héritent (bilan sanguin,
  programme, historique, repas). ⛔ Le mot de passe **ne quitte pas le téléphone** (0 appel
  réseau, vérifié par un témoin). ⛔ Sorties garanties : annuler sort · 3 essais maximum.
  ⚠️ Garde étroit : un fichier corrompu ne fait réclamer aucun mot de passe.
  ⏭️ **TROU CONNU, repéré le même jour** : l'écran du bilan sanguin compare bien chaque
  marqueur au **bilan précédent** (flèches ▲/▼ chiffrées), mais **Milo ne reçoit QUE le
  dernier bilan** (`bt[0]` dans `buildCoachContext`) — il ne peut donc parler d'aucune
  évolution. C'est **R4/R8** : la donnée existe, elle n'atteint pas Milo. Arbitrage Michel.
- 🚪 **UN STOCKAGE QUI SURVIT DERRIÈRE UNE PORTE QUI NE SURVIT PAS** (ft-v941).
- 🚪 **UN STOCKAGE QUI SURVIT DERRIÈRE UNE PORTE QUI NE SURVIT PAS NE SERT À RIEN** (ft-v941).
  Michel : *« je ne peux pas rejouer j'ai plus les cases »*. Les deux boutons **gratuits** ne
  vivaient que sur la **carte de résultat**, qui vit dans le chat — donc qui meurt au
  rechargement, alors que les réponses avaient été stockées exprès pour y survivre.
  👉 Ils vivent maintenant dans **Profil → Admin**, à côté de « Lancer le benchmark ».
  ⭐ **Le défaut était un POINT D'ENTRÉE, pas une fonction** — le témoin « départ à froid »
  est vert des deux côtés : `rejouerVerifs()` marchait, il manquait la clé de contact.
  *On teste souvent que le moteur tourne, rarement qu'il reste un moyen de le démarrer.*
- 🟢 **LA PASSE RÉELLE : 2 rouges, et les DEUX étaient des FAUX ROUGES** (ft-v940).
- 🟢 **LA PASSE RÉELLE : 2 rouges, et les DEUX étaient des FAUX ROUGES** (ft-v940). Michel a
  lancé la passe et collé les **réponses brutes** — le bouton de ft-v938, qui a payé sa dette
  dès sa première utilisation (rejeu en local : **0 appel, 0 €**).
  ⭐⭐ **EV-003** : le correctif de ft-v936 **avait marché**, mon motif le cachait — `findIndex`
  prenait la 1ʳᵉ ligne contenant « face pull », c'est-à-dire la phrase d'accueil où Milo répète
  les mots de Michel. La vraie prescription était 14 lignes plus bas, **à sa place**. C'est la
  **famille de bugs n°1** du projet : le PREMIER MATCH GAGNANT.
  ⭐⭐ **EV-015** : mon vérificateur était **plus strict que le juge humain** — le 25/07
  (ft-v510), un humain avait noté **5/5** ce comportement exact. *Proposer d'analyser le
  programme EST le rôle de complément.*
  ⚠️ **15/15 vert ≠ « Milo est parfait »** : un vert dit « aucune violation détectable », et
  deux motifs viennent de changer. Ce qui est réellement prouvé : keto tenu (2ᵉ mesure après
  correctif), débrief complet, aucune charge impossible, aucun lien inventé, aucun diagnostic.
  ⏭️ **EV-009 et EV-007 sont verts** — mais une passe ne suffit pas : leur intermittence se
  re-mesure au bouton 🔁, et l'hypothèse « c'était le motif, pas Milo » reste ouverte.
- 🔎 **LES VÉRIFICATEURS RATAIENT 19 VIOLATIONS SUR 21** (ft-v939) — levier gratuit n°2.
- 🔎 **LES VÉRIFICATEURS RATAIENT 19 VIOLATIONS SUR 21** (ft-v939) — levier gratuit n°2.
  Mesuré avant de coder : EV-009 **8/8** ratées · EV-011 **5/6** · EV-012 **5/5** · EV-005 **3/4**.
  Cause identique partout : **chaque motif ne connaissait qu'une façon de dire la chose**
  (« quel matériel » mais pas « tu as quoi comme matériel ? » · un simple **adverbe** cassait
  la reconnaissance du diagnostic · riz/pâtes/pain mais ni couscous ni miel ni jus d'orange).
  ⭐⭐ **ET ÇA PEUT EXPLIQUER L'INTERMITTENCE D'EV-009** : ce n'est peut-être pas Milo qui
  change de comportement, c'est sa **formulation** — le motif en attrapait une et ratait
  l'autre. ⚠️ **Hypothèse, pas conclusion** : elle se vérifie à la prochaine passe.
  ⏭️ **CE QUE LA PROCHAINE PASSE DOIT DIRE** : ① EV-003 est-il passé au vert (correctif
  ft-v936) ? ② EV-009 devient-il systématique (→ l'intermittence venait du motif) ?
  ③ EV-007 se confirme-t-il ? ④ Et elle laisse enfin **les réponses** derrière elle.
- 💾 **GARDER LES RÉPONSES — le gisement gratuit du benchmark** (ft-v938).
- 💾 **GARDER LES RÉPONSES — le gisement gratuit du benchmark** (ft-v938). Michel : *« on ne
  peut pas améliorer le benchmark ou il faut plus de passes ? »*.
  ⭐⭐ Une passe coûte 0,25-0,95 € et produit 15 vraies réponses de Milo — **elles étaient
  jetées** à la fermeture (seuls les verdicts survivaient). Les vérificateurs étant du CODE,
  les rejouer ne coûte **aucun appel**.
  👉 Livré : réponses gardées en local (admin) · **🔬 Rejouer les vérificateurs (0 €)** ·
  **📥 Copier les réponses** · `node tests/milo/eval.js --rejouer <fichier>` (même forme, R2).
  ⚠️⚠️ **Un rejeu n'est PAS une passe** : Milo n'a pas reparlé, on mesure le VÉRIFICATEUR —
  donc rien n'est écrit dans l'historique, sinon la lecture « systématique vs intermittent »
  deviendrait fausse en silence.
  ⏭️ **Les 3 leviers d'amélioration, par rapport qualité/prix** : ① garder les réponses
  (**fait**) · ② affiner les vérificateurs (gratuit, et désormais **vérifiable sur du vrai
  texte**) · ③ plus de scénarios / conversations à plusieurs tours (**payant** : 15 scénarios
  couvrent ~10 % des règles du prompt, et presque tous sont un message unique alors que les
  vrais bugs de terrain viennent d'échanges).
- 🖊️ **UN DÉCOR DE TEST PRIS POUR UN FAIT RÉEL** (ft-v937) — corrigé deux fois par Michel.
- 🔀 **UN ROUGE A DEUX CAUSES OPPOSÉES** (ft-v936) — les deux rouges systématiques n'avaient
  rien à voir, et le diagnostic (R7, avant de coder) les a séparés :
  · **EV-003** (face pull) : règle **présente à 74 %** du prompt → **diluée** → rappel ciblé en
  fin de prompt (2ᵉ usage du levier §9 n°1, après le keto).
  · **EV-015** (coach humain) : règle **ABSENTE** — elle n'existe que dans le persona VC-002,
  donc dans le *test*, pas dans le produit. Marqué `specAbsente`, **compté à part** (⚠️).
  ⏭️ **DÉCISION EN ATTENTE DE MICHEL** : écrire la règle « Milo complète un coach humain, il ne
  s'y substitue pas » — ou retirer le scénario.
  ⚠️⚠️ **J'avais justifié cette décision par un fait INVENTÉ** (corrigé par Michel) : j'écrivais
  « Christophe a un vrai coach ». Faux — *« Christophe n'est pas coach, c'est un sportif qui
  fait du body »*. La phrase venait du `resume` du persona **VC-002**, une **biographie de
  fiction** écrite pour le test. ⭐ **Les personas portent le prénom de vrais testeurs, mais
  leur contenu est inventé** — ne jamais en tirer un fait sur la personne réelle. La décision
  EV-015 se rouvre donc sur ses seuls mérites, aucun cas d'usage réel ne l'appuie.
  ⚠️ **Et « persona fondateur » était faux aussi** (2ᵉ correction) : *« Christophe n'est pas
  un fondateur hein, c'est un testeur »*. « Personas **fondateurs** » désigne les **dimensions**
  fondatrices du projet, pas un statut de personne — le doc dit lui-même « Michel = le
  fondateur, à part ». Mot retiré partout où je l'appliquais à quelqu'un.
  ⭐⭐ Michel : *« comme Tatiana et Emma, ils n'ont aucune action directe sur l'application »* —
  **ce sont des testeurs, ils remontent des retours, Michel décide**. Avertissement posé en tête
  de `docs/PERSONAS-FONDATEURS.md` (R27) : *toute affirmation sur une personne réelle vient de
  `RETOURS-TESTEURS.md` ou de Michel — jamais d'un nom de dimension, jamais d'un champ de persona.*
  ⚠️ **Deux témoins existants mesuraient un raccourci devenu faux** : le cache comparait la
  taille TOTALE (mesuré : le préfixe est identique, 66 959 car. — le cache n'était pas cassé),
  et « sans message » exigeait l'égalité stricte au lieu de « au moins autant ».
  ⏭️ **Prochaine passe** : voir si EV-003 passe au vert. Restent EV-009 et EV-007, intermittents.
- 📊 **HISTORIQUE PAR SCÉNARIO** (ft-v935) — 3ᵉ passe réelle, la 1ʳᵉ après un correctif.
  ⭐⭐ **EV-012 (keto) est passé au VERT** : première mesure avant/après du projet, le rappel
  de fin de prompt de ft-v933 a marché.
  ⚠️⚠️ **Mais 4 rouges hier, 4 rouges aujourd'hui** — ce n'est PAS le même 4. *Un total stable
  peut cacher une correction et une régression qui se compensent.* Le rapport garde donc
  `❌ ❌ ✅` par scénario, **sans dépenser un appel de plus**.
  ⏭️ **À CORRIGER (rouges 3/3, donc réels)** : **EV-003** (le face pull passe avant du lourd
  sans un mot d'explication — la règle de ft-v923 n'est pas suivie) · **EV-015** (Milo ne
  propose aucun rôle de complément au coach humain — ⚠️ vérifier d'abord si mon vérificateur
  n'est pas trop strict).
  ⏭️ **À RE-MESURER avant de coder** : EV-009 (matériel) et EV-007 (2 questions) — intermittents.
- 🔁 **REJOUER LES ROUGES** (ft-v934) — Michel : *« sinon on passe à 20 passes non ? »*.
  ⭐ **L'intuition est juste** : répéter est la seule façon de battre le bruit (3 puis 4 rouges
  sur deux passes du même modèle).
  ⛔ **Mais pas 20 × 15 = 300 appels** : 4,60 à 19 €, et surtout **au-dessus du plafond
  anti-abus** (50/jour/personne). Le runner refuse net au-delà de 45.
  👉 **Bouton « 🔁 Rejouer les rouges »** : ne rejoue que les scénarios rouges, répétition
  adaptée à leur nombre (3 rouges × 10 = 30 appels ≈ 0,45 €).
  ⭐⭐ **Le verdict devient un TAUX** — « rouge 5/10 » au lieu de « rouge ». *Un défaut
  systématique et un défaut intermittent ne se corrigent pas pareil.* Cas concret : EV-009.
  ⚠️ **Le garde-fou des documents excluait mal les rapports générés** — il criait « 79 %
  perdus » sur le fonctionnement normal du benchmark. Aucun seuil baissé : on a retiré de la
  surveillance des fichiers qui ne sont pas des documents.
- 🥑 **LE BENCHMARK A TROUVÉ SON PREMIER VRAI DÉFAUT** (ft-v933) — Milo proposait **riz, pâtes,
  pain** à un profil **keto**, sur les 2 modèles et aux 2 passes.
  ⭐⭐ **Diagnostic fait AVANT de toucher au prompt (R7)** : `S.keto` était vrai, la règle était
  bien dans le prompt. **Règle présente, non appliquée** — l'hypothèse du §8, enfin démontrée.
  ⭐ **Le chiffre** : la règle était à **67 %** du prompt, parmi **56 « JAMAIS »**.
  👉 **Correctif = le levier §9 n°1** : rappel court en **fin** de prompt (97 %), zone non
  cachée, seulement si la question porte sur l'alimentation. ⛔ **La règle d'origine reste** —
  une détection ratée ne doit jamais donner une règle absente en silence.
  ⚠️ **L'instrument s'est trompé deux fois** : un faux rouge (1RM estimé pris pour une charge)
  et une conclusion trop forte (« R9 CONFIRMÉ » sur 1 rouge d'écart, alors que le même modèle
  varie de ±1). Seuil porté à **3 rouges d'écart**, sinon « PAS CONCLUANT ».
  ⏭️ **À refaire** : une passe après ce correctif, pour voir si EV-012 passe au vert.
  ⏭️ **Rouges non traités** : EV-003 (ordre du face pull) · EV-015 (rôle de complément au
  coach humain) · EV-009 (matériel redemandé, intermittent).
- 📋 **Le rapport du benchmark se copie** (ft-v932) — l'export rendait un fichier d'**une ligne**
  (le titre du partage, pas le contenu). Bouton « 📋 Copier » ajouté, indépendant de toute
  feuille de partage. ⚠️ Correction **étroite** : 8 autres exports partagent un fichier avec un
  titre **et fonctionnent** — on n'a pas touché à ce qui marche.
- 🧪 **LE BENCHMARK A UN BOUTON** (ft-v931) — Profil → Admin → « 🧪 Lancer le benchmark » ·
  « ⚖️ Comparer Sonnet et Haiku ». **Le coût est annoncé avant** de lancer.
  ⚠️ **Ce n'est pas du confort** : la ligne de commande ne peut tourner ni depuis une session
  Claude Code (réseau bloqué) ni depuis un serveur local (le Worker n'accepte que l'origine
  `github.io`). *Un outil de mesure que personne ne peut lancer ne mesure rien.*
  ⭐ **R2** : les 15 scénarios ne sont **pas recopiés** — un seul fichier, lu par les deux.
  ⛔ Chargé **à la demande**, jamais au démarrage (règle d'or #4).
  ⏭️ **Reste à faire : la première passe réelle**, par Michel depuis l'app.
- ⚖️ **LE BENCHMARK COMPARE DEUX MODÈLES** (ft-v930) — `node tests/milo/eval.js --go --compare`.
  ⭐⭐ **C'est la seule façon de FERMER la question « et si on passait tout le monde en Haiku ? »**,
  qui revient parce que *« Sonnet pour tout le monde »* tient sur un **raisonnement** (R9) jamais
  mesuré sur ce prompt-ci.
  ⚠️⚠️ **Lecture ASYMÉTRIQUE, écrite aux trois endroits** : Haiku plus rouge → R9 **confirmé**,
  question close · Haiku aussi vert → **ça ne rouvre RIEN** (le ton et le naturel ne sont dans
  aucun de ces 15 motifs). **Il peut confirmer la décision, pas la renverser.**
  ⛔ **La liste blanche du worker ne contient que des modèles MOINS CHERS que le défaut** — le pire
  qu'un curieux puisse faire est de se rendre son propre Milo plus bête et moins cher. Le témoin
  compare les **prix**, pas les noms.
  ⏭️ **Reste à faire : la passe réelle.** Sonnet 0,23-0,95 € · Haiku 0,08-0,32 € · les deux ≈ la somme.
- 🧪 **LE BENCHMARK EXISTE** (ft-v929) — `node tests/milo/eval.js` (à blanc, 0 €) · `--go` (réel).
  ⭐⭐ **Il répond à la seule question que `tests/milo` ne pouvait pas poser** : une règle **présente**
  est-elle une règle **appliquée** ? ft-v926 a prouvé que non. **15 scénarios**, dont **6 tirés des
  bugs vécus en salle** cette semaine.
  ⛔ **Pas de juge IA** (décision, R30) : les bugs de ce projet sont mécaniquement vérifiables, les
  15 vérificateurs sont du **code**.
  ⚠️⚠️ **Un VERT vaut moins qu'un ROUGE** : un rouge est une preuve, un vert dit seulement « aucune
  violation détectable ». Ne jamais conclure « Milo respecte ses règles » d'un run tout vert.
  ⚠️ **Coût mesuré, pas deviné** : ~70 k car./scénario → **0,23 à 0,95 € la passe**. Il ne part
  jamais tout seul et n'est **pas** dans la suite de livraison.
  ⏭️ **La prochaine passe utile est un AVANT/APRÈS** autour d'un changement de prompt — c'est là
  qu'il dit si le changement a servi.
- 📋 **Le récap du débrief est écrit par le CODE** (ft-v928). ⭐ La frontière cerveau/cervelet
  appliquée DANS un message : *lister* est une transformation → code · *commenter* est un jugement
  → Milo. Il ne **peut** plus sauter un exercice, au lieu qu'on lui **demande** de ne pas le faire.
  ⛔ **Le modèle n'a PAS changé** : ~0,17 €/mois d'écart, et R9 (un modèle léger suit mal les
  consignes fines). ⚠️ Ne couvre que le débrief **automatique** — en plein chat, seule la règle
  du prompt reste.
- 📋 **Un débrief couvre TOUS les exercices** (ft-v927) — Milo en sautait 2 sur 5, dont le face pull
  qu'il avait prescrit « indispensable pour l'épaule droite ». ⭐ Les 5 étaient bien transmis : c'est
  un choix de rédaction, pas une perte de donnée. On lui **donne le compte** au lieu de lui demander
  de compter (R8). ⚠️ Même motif qu'à ft-v923 : les petits accessoires traités comme négligeables.
- 🏷️ **Milo reprochait les paliers qu'il avait lui-même prescrits** (ft-v926, **3ᵉ fois**). Cause
  enchaînée : le bouton ne sortait pas → séance saisie **à la main** → pas de marqueur `_milo`
  (il n'existe que sur le chemin du bouton). ⭐ **La consigne du prompt qui devait rattraper EXISTE
  et n'a pas été suivie** — cas réel du prérequis du §8 (une règle présente ≠ une règle appliquée).
  L'app **nomme** désormais l'auteur inconnu au lieu de le taire.
- 🔁 **Le bouton « Commencer cette séance » sort dans TOUS les modes de panne** (ft-v925). ⭐ La
  mesure a changé la recherche : le texte de Michel se lisait parfaitement en local, donc le
  défaut n'était pas la lecture. Deux trous **silencieux** : la pose du bouton renonçait sans rien
  rendre (une séance vide restait « truthy », le repli ne jouait pas), et **`fetch` n'a aucun délai
  par défaut** — sur une 5G de salle, l'appel reste suspendu et le repli n'est jamais atteint.
- 🔘 **Le bouton « Commencer cette séance » ne sortait pas sur une VRAIE séance** (ft-v924, retour
  terrain). Mon aiguillage de ft-v919 exigeait le nom et les séries sur la **même ligne** ; Milo
  écrit un **bloc** (nom, paliers, séries, consigne). ⚠️ **Je l'avais validé sur mes propres
  exemples, pas sur les siens** — le format réel était pourtant dans les captures de la veille.
  ⭐ Son texte réel est désormais un **témoin permanent** (R17).
- 🔀 **L'ORDRE DES ACCESSOIRES est enfin dit** (ft-v923) : la règle de zone de ft-v914 ordonnait
  l'ancre vs ses accessoires, et **rien entre accessoires** — Milo a écrit un face pull de 30 kg
  avant un leg curl de 55. Ajouté : *du plus lourd au plus léger dans une zone*, et *le petit
  travail de santé/rotation finit la séance* (sans interdire l'activation, à condition de la dire).
- 🛡️ **Le Gardien attrape « c'est noté »** — il ne cherchait que « je note ». ⚠️ Deux pièges gardés
  écrits : le prompt DEMANDE « super, c'est noté 💪 » pour une séance annoncée (accepté quand un
  bloc enregistre vraiment), et **`\b` après un « é » n'existe pas en JavaScript** — le motif était
  muet, et ça ne se voit pas à la lecture.
- 💪 **LES GROUPES MUSCULAIRES — 18 → 22 codes en une journée** (ft-v921 puis ft-v922) : adducteurs ·
  soléaire · extenseurs du poignet · dentelé antérieur. Les quatre étaient **déjà dessinés**, rangés
  dans le mauvais groupe (**R31**).
  ⭐ **Le critère de scission, à réutiliser** : *le RESTE du groupe garde-t-il son sens sans la partie
  qu'on sort ?* Si oui, la scission est propre et coûte quelques fiches. Si non, il faut relire tout
  le groupe.
  ⏭️ **RESTE À ARBITRER** (chacun change ce que voit l'utilisateur, donc c'est la décision de Michel) :
  **trapèzes** sup/moyen/inf (122 fiches — un shrug et un face pull sont opposés) · **rhomboïdes +
  grand rond** sortis du grand dorsal (67) · **pectoral** haut/milieu/bas (55) · **moyen fessier**
  (108). Les deux derniers ne sont **pas** des scissions propres : tous les développés et tous les
  squats seraient à relire.
- 🦵 **Les ADDUCTEURS sont entrés dans la figurine (ft-v921)** — 18 → **19 codes**. L'adduction de
  cuisses comptait pour du **fessier** depuis toujours. ⚠️ Le manque était **écrit et daté** (02/08)
  et attendait l'arbitrage de Michel ; il a tranché le 20/08. ⛔ **L'abduction n'a PAS bougé**
  (mouvement opposé) — et séparer le **moyen fessier** du groupe Fessiers reste un chantier à part :
  ça ferait cesser de le colorer sur *tous* les squats et hip thrusts. R30 : c'est écrit pour que
  personne ne le « répare » par effet de bord.
- **🫀 CHANTIER EN COURS — l'architecture CERVEAU / CERVELET** (`docs/ARCHITECTURE-CERVEAU-CERVELET.md`,
  idée de Michel : *« dans une entreprise il y a le boss et la secrétaire »*). Milo garde le jugement,
  une 2ᵉ IA fait le mécanique — **et elle n'existe pas pour l'utilisateur** (R6, une seule voix).
  **Brique 1 LIVRÉE (ft-v919)**, et **validée par le code depuis ft-v920** (chaque nom rendu doit
  se retrouver dans le texte de Milo — *le modèle propose, le code valide*).
  **Brique 1 (rappel)** : la conversion séance→JSON est sortie du prompt (46 485 → 44 157 car.).
  **Ce qui reste à décharger**, par ordre de poids : les *réponses rapides* (~1 655 car.) · la
  *prochaine séance annoncée* (~825) · la **nutrition-outil** (~2 126 + les briques 1/3/4 à venir).
  ⛔ **Ce qui NE part PAS au cervelet, et c'est décidé** : la **composition d'un plan alimentaire**
  sous contraintes de régime/allergies — une erreur y est une erreur de **sécurité** (le bug d'Emma
  du 02/08), donc ça reste en **code déterministe**, sur liste blanche relue à la main. Et *dire si
  la personne mange assez* reste chez Milo : ça croise séances, sommeil et apports.
  ⏭️ **À faire avant la vraie mise en place de la nutrition** (condition posée par Michel le 19/08).
- 📋 **`docs/BRIEF-NUTRITION.md`** — le **point d'entrée** à donner à une autre instance qui reprend la
  nutrition. Il parle **d'abord de la 2ᵉ IA et du chantier en cours**, l'historique vient après.
  Porte aussi **§4 la recette exacte** pour ajouter une tâche au cervelet : **4 endroits** à tenir
  alignés (`worker.js` route + `_ACTIONS_IA` · `constants.js` `AI_PROXY_ACTIONS` · `Code.js`
  `AI_ACTIONS_`), et un test **épingle leur nombre** pour qu'on ne puisse pas en oublier un.
- 📐 **MESURÉ le 19/08 — décharger ≠ diluer moins.** Sur les **44 157** caractères du bloc commun,
  **84 % sont des règles de COMPORTEMENT** et **~5 % seulement** encore déchargeables. Le
  déménagement technique touche à sa fin **sans avoir retiré une seule règle de comportement**.
  ⏭️ **Les 6 autres leviers** (rappel ciblé dans la queue non cachée · Gardien de SORTIE · hiérarchie
  énoncée une fois · conditionner un bloc · **le benchmark** · le cervelet remplacé par du code)
  sont au **§9 de `docs/ARCHITECTURE-CERVEAU-CERVELET.md`** — *un menu, pas un plan.*
  ⚠️ Et la **raison** du cervelet a été corrigée : *transformer et juger sont deux métiers
  différents* — le plafond était le **déclencheur**, pas la raison (sinon le périmètre est élastique).
- 🚪 **`tools/check_regles.py` a une PORTE ÉTROITE** depuis le 19/08 : une **réécriture volontaire**
  se déclare **dans le document**, en une ligne datée avec sa raison
  (`<!-- RÉÉCRITURE VOLONTAIRE aaaa-mm-jj : … -->`). Le seuil n'a **pas** été baissé, et la
  réécriture est **affichée**, jamais silencieuse.
- **Rien en attente sur la branche.** Tout ce qui a été livré les 18 et 19/08 est en production.
  ⚠️ R18 — « j'ai poussé » ne veut pas dire « c'est en ligne » : le déploiement ne part que sur `master`.

> ## 😴 19/08 — LE SOMMEIL DÉCLARÉ APLATIT LES MAUVAISES SEMAINES (mesuré, non corrigé)
>
> Comparaison **app ↔ Garmin** sur les **10 semaines** où les deux existent (14/06 → 18/08/2026),
> à partir de l'export Garmin de Michel et de son `sleepLog` (60 nuits notées).
>
> ### ⭐⭐ LE RÉSULTAT, ET IL EST NET
> **En moyenne, la saisie est bonne : +12 min** (2,5 % au-dessus de la mesure), et **sans biais de
> direction**. Ce n'est donc pas « il exagère ».
> **Mais l'erreur dépend du sommeil réel, très fortement** :
>
> | Sommeil MESURÉ | Écart de la saisie |
> |---|---|
> | < 7 h (mauvaises semaines) | **+47 min** |
> | ≥ 7 h (bonnes semaines) | **0 min** |
>
> **`r(sommeil mesuré, erreur de saisie) = −0,96`** sur les semaines complètes (n=6), −0,91 sur
> celles à ≥ 5 nuits (n=8). Cas le plus net : semaine du 6-12 août, **Garmin 5 h 38 / app 6 h 43**.
>
> ### ⚠️ POURQUOI C'EST UN DÉFAUT PRODUIT, PAS UNE CURIOSITÉ
> Ce n'est pas de la mauvaise foi — c'est un phénomène connu du déclaratif : *le souvenir se
> rapproche de la normale*. Mais **`S.sleepLog` part dans le contexte de Milo**. Donc Milo
> sous-estime la dette de récupération **exactement les semaines où elle compte**, et il ne peut
> pas le savoir. Même famille que R4 : la donnée arrive, elle est simplement fausse là où elle
> devrait alerter.
>
> ### ⛔ CE QUI N'EST PAS FAIT, ET POURQUOI (R30)
> Rien n'est corrigé. Deux options existent et **aucune n'est un correctif de nuit** :
> ① importer la mesure ; ② dire à Milo que le déclaré est optimiste sur les mauvaises nuits.
> La ② est tentante et **dangereuse** : corriger un chiffre déclaré par un coefficient tiré d'UN
> utilisateur, c'est inventer une donnée (R29). Elle ne vaudrait que si la même pente se retrouvait
> chez plusieurs personnes — **1 cas ne fait pas une règle** (R22).
>
> ### ✅ LE PONT EXISTE — ET IL SAIT MAINTENANT RECEVOIR LE SOMMEIL ET LES PAS (ft-v916)
> ⛔⛔ **CORRECTION DE MOI-MÊME, ET C'EST R23 UNE 2ᵉ FOIS** (après la prise de sang du 27/07) :
> j'ai proposé à Michel de « construire un pont » avec un raccourci iOS. **Il existe depuis le
> 16/08** (ft-v880 à ft-v884), c'est lui qui l'avait demandé, il tourne chez lui **tous les soirs
> à 21 h** — et j'ai fallu qu'il me dise *« on a déjà créé un raccourci lol »* pour que je regarde.
> *Une fonctionnalité que je n'ai pas lue est une fonctionnalité que je re-propose.*
>
> **Ce qui existait déjà** — route `pushHealth` (`Code.js` @1247), **authentifiée**
> (`_authCheck_`), **dédupliquée** (début + type), et qui **accepte plusieurs formats** exprès :
> un raccourci iOS *ou* une app d'export publiant le sien. Elle recevait les **activités**
> (`healthInbox`, une boîte de réception — l'app propose, la personne valide, R29) et la **FC au
> repos** (`healthDaily`).
>
> **✅ LIVRÉ CE SOIR** — la route accepte désormais `sleep` (en heures, même unité que
> `S.sleepLog[].hours`) et `steps`, **fusionnés** dans `healthDaily` par date. ⚠️ Au passage, un
> **bug latent jamais déclenché** est corrigé : l'ancienne écriture **remplaçait toute l'entrée du
> jour** à chaque appel — inoffensif tant qu'un seul champ existait, mais un futur appel
> n'apportant que le sommeil aurait effacé la FC au repos du même jour. Vérifié par simulation
> Node (5 cas, dont la fusion elle-même).
> ⚠️ **Ne remplace pas `S.sleepLog`** — vient à côté, en comparaison (R29 : on montre les deux).
> ⚠️ **Côté raccourci, la date est le piège** : à 21 h le soir du jour D, la nuit disponible est
> celle qui s'est TERMINÉE le matin de D — elle se date donc D (jour du réveil).
> ⏭️ **Ce qui reste à construire** : rien côté app n'affiche encore `healthDaily.sleep/steps`.
> Les données arrivent et attendent dans le compte (R30, noté dans `state.js`) — l'écran de
> comparaison déclaré/mesuré est la prochaine étape, après les 2 semaines d'usage nutrition.
> ⚠️ Reste un **outil de testeur, pas une fonctionnalité produit** : Tatiana ne configurera jamais
> un raccourci (`PERSONAS-FONDATEURS.md`). Le chemin grand public reste la coque native.
>
> ⚠️ **Une PWA ne peut PAS lire Apple Santé** — aucune API web pour HealthKit, c'est une limite de
> plateforme. ⭐ **C'est le meilleur argument existant pour la coque native**, meilleur que les
> notifications : `docs/STRATEGIE-NATIF.md` classait déjà les objets connectés en priorité n°1, on a
> maintenant **la démonstration chiffrée**.
> ✅ **Et les deux API sont bien fermées — VÉRIFIÉ le 16/08 et écrit dans `Code.js`** : l'API Garmin
> Connect exige une entité légale et son programme est suspendu ; l'API Strava est passée payante en
> juin 2026. Michel avait raison, et c'était déjà documenté — je l'ai redemandé pour rien.
> C'est précisément pourquoi la 3ᵉ voie a été choisie : **le téléphone POUSSE, le serveur REÇOIT.**
>
> ### ⏭️ PRIORITÉ
> **Après** deux semaines d'usage réel de la nutrition. La saisie de Michel est bonne à 12 min près
> en moyenne — le trou n'est que sur les mauvaises semaines. C'est important, ce n'est pas urgent.

> ## ⚖️ 19/08 (nuit) — ft-v915 : LE CRU/CUIT, DERNIÈRE BRIQUE AVANT L'USAGE RÉEL
>
> Michel commence à s'en servir **lundi**. C'était le dernier défaut qui fausse un chiffre au
> quotidien : `_PORTIONS` mélangeait cru et cuit sans le dire (riz 350 = cru, légumineuses 116 =
> cuites), et un paquet de pâtes scanné puis pesé cuit comptait **×2,7**.
> **Biais systématique → survit au moyennage.** Corrigé en NOMMANT, jamais en convertissant (R29).
>
> ### ✅ L'écran nutrition est utilisable
> Circuit complet : noter un repas (manuel · scan · photo · repas habituel en un appui) → la carte
> « Où tu en es » répond sur des **jours terminés**, sans reproche et sans chiffre inventé.
>
> ### ⏭️ Ce qui reste, et qui n'est PAS bloquant
> Briques **1** (base CIQUAL), **3** (générateur de repas), **4** (les 4 niveaux de précision).
> Ce sont des améliorations de confort. **Deux semaines d'usage réel diront mieux que nous ce
> qu'il faut construire ensuite** — c'est le bon moment pour s'arrêter et regarder.
>
> ### 🩺 En attente d'une décision de Michel (inchangé)
> La contradiction protéique — fiche whey **1,6-2 g/kg** contre moteur **2,0-2,6**. Bloquée parce
> que les références de l'auditeur sont **de mémoire** et doivent être contrôlées avant d'écrire.

> ## ⚖️ 19/08 (soir) — ft-v914 : LES CHARGES DE MILO ET LA GÉOGRAPHIE DE LA SALLE
>
> Michel, pour la **2ᵉ fois** (1ʳᵉ le 15/08) : *« quand il me met 82,5 faut le trouver les poids
> de 2,5 »*. `_pasCharge` existait depuis le 15/08 mais **n'était pas envoyée à Milo** (0 occurrence
> dans `coach.js`) — sa définition disait *« QU'AUX CHARGES QUE L'APP FABRIQUE »*. `BUGS.md` §15 +
> R4. Corrigé par `_PAS_CHARGE_TABLE`, **lue par l'app ET le prompt** (R2).
> 2ᵉ défaut, structurel : *« toutes les ancres d'abord »* fabriquait des **zigzags de salle**.
> On groupe par zone, sans toucher à « l'ancre la plus lourde reste 1ʳᵉ » ni au superset.
>
> ## 🧠 19/08 (soir) — L'ORCHESTRATION « CERVEAU / CERVELET » : L'IDÉE EXISTAIT, LA PREUVE MANQUAIT
>
> Michel, en relisant le prompt règle par règle : *« pourquoi tout part d'un seul bloc ? dans une
> entreprise il y a le boss et la secrétaire »* — puis, en nommant sa propre idée : **« le cerveau
> et le cervelet »**.
>
> ### ⚠️ ELLE ÉTAIT DÉJÀ ÉCRITE — DEUX FOIS, ET JAMAIS CONSTRUITE
> · Ce document la listait déjà comme *« archi cerveau/cervelet — **pas encore envoyé** »* à
>   Gemini/Mistral pour challenge. Le cross-review n'est jamais parti.
> · Et l'**architecture hybride** actée le 20/07 la contient, nommée : le **niveau ③ Orchestration**
>   — *« décide quel composant intervient, dans quel ordre, avec quelles données »*, explicitement
>   marqué **« couche encore IMPLICITE aujourd'hui : routage + assemblage du contexte »**.
> **Le « cervelet » de Michel = rendre le niveau ③ explicite.** Pas une idée neuve : la pièce
> manquante d'une architecture déjà décidée.
>
> ### ⭐ CE QUI CHANGE CE SOIR : LA MESURE
> Jusqu'ici, bonne idée sans urgence. Maintenant on a les chiffres : **140 règles**, **46 485
> caractères**, **15 de marge**, et **aucun moyen local de savoir si Milo les suit** (`tests/milo`
> est déterministe — il prouve la PRÉSENCE, jamais l'OBÉISSANCE).
> **Et le dégraissage plafonne** : mesuré ce soir, ce qui peut réellement sortir du prompt parce que
> le code le garantit fait **~3-4 %**. L'orchestration s'attaque à la cause, pas au symptôme.
>
> ### 🍽️ LE CAS QUI LA REND NÉCESSAIRE : LA NUTRITION
> Elle ne pèse aujourd'hui que **2 126 caractères (4,6 %)**. Mais les briques **1, 3 et 4** restent
> à construire et chacune voudra ses règles. **Avec le routage, elles ne partent que quand on parle
> de nutrition** — donc aussi détaillées qu'il faut, sans encombrer quelqu'un qui demande combien de
> séries au développé. *Le gain n'est pas 3 % grattés : c'est la fin du plafond.*
>
> ### ⚠️ LES TROIS CONTRAINTES TROUVÉES CE SOIR — à ne pas redécouvrir
> **① LE CACHE.** Le bloc commun est identique pour tous → caché 1 h, facturé ~10× moins. Un
> contexte **différent à chaque message** ferait sauter le cache : plein tarif à chaque question.
> ⭐ **Mais un petit nombre de variantes FIXES marche** : 4 configurations = 4 caches chauds. Ce qui
> tue le cache, c'est la variation continue, pas la pluralité.
> **② L'ERREUR D'AIGUILLAGE EST SILENCIEUSE.** Un message d'entraînement classé « nutrition » et
> Milo répond sans les règles qu'il lui faut — aucune erreur, aucun test rouge, juste une réponse
> moins bonne. C'est la famille de bugs que ce projet collectionne.
> **③ UN NOYAU NE SE CONDITIONNE JAMAIS** : sécurité, zones fragiles déclarées, « n'invente rien »,
> identité et ton. Ils partent toujours. Seuls les modules spécialisés tournent.
>
> ### ⏭️ LE PRÉREQUIS, ET IL N'EST PAS UN DÉTAIL
> **Est-ce que Milo suit ses 140 règles aujourd'hui ?** Si oui, l'orchestration est une
> optimisation. Si non, elle est urgente. **On ne peut pas trancher localement** — il faut des cas
> réels sur le vrai modèle.
>
> ### 📎 L'inventaire des 140 règles
> Document de travail publié (carte des poids + texte exact de chaque règle, groupée par famille) :
> c'est lui qui rend l'arbitrage possible. Régénérable depuis `buildCoachContext()`.

> ### 🧹 LE PROMPT — DÉBLOQUÉ D'UN CRAN (ft-v917), PAS RÉGLÉ
> **46 465 → 46 259 caractères, marge 35 → 241.** De quoi faire entrer la prochaine règle, pas dix.
> ⭐ **La méthode sûre, et le critère qui en sort** : on retire du prompt ce que le code garantit
> de façon **déterministe** (R7). Mais attention — *ce que le code **CALCULE** peut sortir ; ce
> que le code ne **CORRIGE** pas doit rester.* Exemple vécu ce soir : le barème des paliers est
> calculé (`_monteeEnCharge`) → sorti ; la **dose** de paliers, elle, n'est jamais corrigée par
> l'app (elle complète, elle ne retire pas) → le témoin de ft-v887 a rougi et la règle est restée.
> ⚠️ **La vraie question reste entière** : lesquelles des **180 règles** peuvent partir ? Mesuré :
> **38 % du bloc** tourne autour de **8 thèmes récurrents** (« au plus une question » sur 8 lignes,
> ~4 000 car. ; « n'invente rien » sur 8 lignes). Mais la répétition d'une règle dans plusieurs
> contextes est peut-être **porteuse** — et `tests/milo` est déterministe : il prouve la PRÉSENCE,
> jamais l'OBÉISSANCE. **On ne coupe pas là-dedans sans arbitrage produit.**
>
> ### ⏭️ Écarté volontairement (R30)
> **Modéliser le plan de la salle.** Ça marcherait pour Michel et pour personne d'autre — Tatiana
> ne cartographiera pas sa salle. *« Groupe par zone »* marche partout sans rien demander.
>
> ### 📄 Hors dépôt, volontairement
> Le dossier médical de Michel (bilans 2022-2026, 5 ans de sommeil et 10 ans d'activité Garmin,
> PDF pour le cardiologue du 22/08) vit **uniquement dans le scratchpad de session**. Données de
> santé personnelles : elles ne rentrent pas dans le dépôt, qui est public.

> ## 📍 19/08/2026 — LA REVUE UX EXTÉRIEURE (à lire avant le bloc du 18/08 ci-dessous)
>
> Michel : *« fais-moi un UX complet de la section nutrition avec des screens pour que je voie avec
> GPT, voir si tout est cohérent, ainsi que l'autre Claude »*. Un dossier de **12 captures** a été
> fabriqué avec le vrai code (`tools/captures-nutrition.js`, données fictives « Alex »), relu par
> **GPT** et par **l'autre instance Claude (v1.4)**. Les deux convergent sur 4 points → **ft-v913**.
>
> | Ce qui a été corrigé | Pourquoi ça comptait |
> |---|---|
> | La fiche **créatine s'ouvrait sur la phase de CHARGE** → **20 g/jour** recommandés par défaut | L'app **avertit au-delà de 5 g** depuis ft-v910 : le même écran se contredisait (R2) |
> | La moyenne comptait **la journée en cours** | Une journée incomplète par construction → chiffre faux **tous les matins** |
> | L'écart s'affichait **dès 1 jour**, en orange | *« 2 367 kcal sous ta cible »* au premier repas = un reproche. Désormais **3 jours terminés**, et en gris |
> | Le **% de protéines plafonné à 100** | Quelqu'un à 149 % lisait « 100 % ». Le plafond ne vaut que pour la **barre** |
>
> **⚠️⚠️ LE CONSTAT QUI PORTE LE PLUS LOIN EST SUR MA MÉTHODE, PAS SUR L'ÉCRAN.** Mon dossier
> annonçait *« vérifié en JOUANT le parcours, pas en le décrivant »* — et **trois de ses captures
> créatine étaient identiques** : je n'avais pas appliqué ce parcours à l'onglet Suppléments.
> *Écrire la règle en tête d'un document ne la fait pas appliquer au bas de ce même document.*
> ⭐ Et c'est **en cherchant pourquoi elles étaient identiques** que le vrai défaut est sorti — le
> défaut de `creatPhase`. **Le bug est venu de l'audit de ma propre négligence.**
>
> **⚠️ ET LES TESTS NE POUVAIENT PAS LE VOIR** : tous les témoins existants ouvraient la fiche
> **après** avoir choisi une phase. *Un test qui règle toujours l'état avant de mesurer ne verra
> jamais l'état par défaut.* Nouveau témoin permanent (bloc LVI).
>
> **⚠️ Un témoin FAIBLE trouvé au passage** : mon motif `1[0-9][0-9]` attrapait « **100** » dans
> « 100 % », donc il **passait au vert sur l'ancien code plafonné**. *Un test qui passe des deux
> côtés ne prouve rien tant qu'on n'a pas vérifié qu'il DOIT rougir d'un côté.*
>
> **⏭️ CE QUI RESTE DE LA REVUE, non livré** : la contradiction protéique (1,6-2 g/kg sur la fiche
> whey contre 2,0-2,6 dans le moteur) — bloquée parce que les références de l'auditeur sont **de
> mémoire** ; et les briques 1 · 3 · 4 du chantier nutrition (voir le tableau plus bas).

> ## 📍 OÙ ON EN EST — 18/08/2026 (à lire en premier, remplace le bloc du 17/08 plus bas)
>
> ### ⛔ LA RÈGLE DU JOUR, ET ELLE EST DE MICHEL
> **NE PAS DÉPLOYER PENDANT QU'IL S'ENTRAÎNE.** *« Faut éviter de faire une mise à jour quand je suis
> en séance, ça me nique mon bilan de fin de séance »* — et c'est la **2ᵉ fois** qu'il le dit (la 1ʳᵉ,
> le 15/08, avait créé le garde-fou `_majPeutSAppliquer`). Avant de fusionner sur `master`, **vérifier
> qu'il n'est pas à la salle**. Le correctif de fond est livré (ft-v903), mais la règle humaine reste :
> *un garde-fou n'est pas une autorisation de déployer n'importe quand.*
>
> ### ✅ LIVRÉ AUJOURD'HUI (5 versions)
> | | Quoi | État |
> |---|---|---|
> | `ft-v899` | Le plan alimentaire donne ses **portions** (« Avoine 80 g ») · le **check-in se replie** après « Enregistrer » | en ligne |
> | `ft-v900` | Le plan alimentaire **change tous les jours** (3 variantes, choisies par la date, **sans IA**) — et le garde-fou a trouvé **2 bugs de régime pré-existants** (le « Thon » seul, le miel non végan) | en ligne |
> | `ft-v901` | Le **cardio d'avant compte dans la durée** de la séance (`_dureeTotaleMin`) · une séance de **cardio seul** affiche enfin une durée · `_rythmeSeance` soustrayait un cardio absent du chrono depuis le 14/08 | en ligne |
> | `ft-v902` | **L'écran ne s'éteint plus** : le verrou suivait l'écran affiché, pas la séance (`_wktEnCours`) | en ligne |
> | `ft-v903` | **La mise à jour attend** aussi quand la séance n'a que du cardio (`_seanceOuverte`) | en ligne |
> | `ft-v904` | **L'exercice suivant s'ouvre** quand le précédent est fini — les paliers d'échauffement laissés vides ne bloquent plus | en ligne |
> | `ft-v905` | **Les 2 erreurs de Milo** : séries de travail numérotées (`S1·S2·S3`) · une montée prescrite par Milo ne se reproche plus à la personne | en ligne |
> | `ft-v906` | **Plancher calorique** 1500 H / 1200 F sur `autoKcal()` + **plancher protéines kéto** 0,8 g/kg | en ligne |
>
> ### ✅ LES DEUX RETOURS « NON ÉLUCIDÉS » N'EN FAISAIENT QU'UN — réglé en `ft-v904`
> *« la séance d'avant ne s'agrandit pas »* + *« je n'ai pas vu le message »* = **le même code** :
> l'exercice suivant ne s'ouvrait pas et le « ⏭️ Ensuite : … » ne s'affichait pas, parce que
> « terminé » se lisait **« toutes les lignes cochées »** — or l'app ajoute elle-même des paliers
> d'échauffement, qui restent vides. On compte désormais les **séries de travail**.
> ⭐ **La méthode qui a marché** : avoir **reproduit** les deux cas (tout coché / paliers vides)
> AVANT de toucher au code, au lieu de deviner (BUGS.md famille 12ter — la fausse panne).
>
> ### 🩺 UN POINT QUE JE NE PEUX PAS TRANCHER D'ICI
> Michel dit que l'écran s'éteint **sans quitter l'écran Séance**. ft-v902 couvre les deux chemins
> connus (retour sur l'écran Séance sans re-demander le verrou · passage par Milo). **S'il le
> reconstate après ft-v902, la cause est côté iOS** (mode économie d'énergie, qui reprend le verrou
> quoi qu'on fasse) — et là il n'y a rien à corriger dans l'app.
>

> ### 🌅 POUR REPRENDRE DEMAIN — la nutrition, et rien d'autre
> **Le cap est posé et il ne bouge plus** : on construit la nutrition, dans cet ordre. Le reste
> (échauffement/mobilité, sécurité option 1, breakdown des séances recalées) attend son tour.
>
> | # | Brique | Contenu | État |
> |---|---|---|---|
> | 0 | **Provenance figée** dans `S.foodLog` | `saisie · origine · q · u · etat · sourceId · per100 · modifie · v` | ✅ **ft-v907** |
> | 0-bis | Planchers santé | calorique + protéines kéto | ✅ **ft-v906** |
> | 1 | Base d'aliments locale | CIQUAL 2025 (3 484 aliments), curation par code de confiance A/B | ⏭️ |
> | 2 | **L'écran « où tu en es »** | répondre à la vraie question, pas à « combien il me reste » | ✅ **ft-v909** |
> | 2b | **Un repas en un appui** | « tes repas habituels », observés dans le journal, rejoués d'un geste | ✅ **ft-v911** |
> | 3 | Générateur de repas | filtre `composable` en premier · test du **profil vide** · hachage au lieu de `jour*7` | ⏭️ |
> | 4 | Les 4 niveaux de précision | sortie en rôles/portions aux niveaux 1-2 | ⏭️ |
> | 7 | Adhérence | le plan doit être **reproductible** (fonction pure) | ⏭️ |
>
> **⚠️⚠️ LE DÉFAUT MESURÉ LE 18/08, ET QUI N'EST PAS ENCORE CORRIGÉ** : la table `_PORTIONS`
> (`state.js`, 37 motifs) **mélange le cru et le cuit sans le dire**. Riz **350** kcal/100 g (cru),
> pâtes **350** (sèches), quinoa **368** (sec) — mais légumineuses **116** (**cuites**). Une ligne de
> plan « Riz 80 g + lentilles 120 g » demande donc de peser l'un cru et l'autre cuit, sans un mot.
> Et le même défaut existe **déjà côté journal** : Open Food Facts donne les valeurs « telles que
> vendues », donc un paquet de pâtes scanné puis pesé cuit compte **×2,7**.
> ⭐ Ce n'est pas de la variance qui s'annule sur la semaine : c'est un **biais systématique** qui
> survit au moyennage — la seule classe d'erreur que « cohérence > réactivité » ne peut pas absorber.
> **Décision prise** : convention **par RÔLE** (protéine animale → cru, féculent → cuit), l'état
> **toujours écrit dans le nom affiché**, jamais de conversion automatique, et la question n'est
> posée qu'aux niveaux 3 et 4.
>
> ### 🤝 LE TRAVAIL À DEUX INSTANCES — comment ça marche vraiment
> Michel : *« ça fait beaucoup de trucs à gérer en même temps, c'est pour ça que j'ai envie que
> l'autre Claude bosse de son côté »*. C'est en place et ça a produit un vrai résultat le 18/08.
> - **Le dépôt est PUBLIC** → l'instance « analyse » peut **lire n'importe quel fichier** par
>   `https://raw.githubusercontent.com/michdu75-commits/forcetracker/master/<chemin>`. Elle ne peut
>   ni écrire, ni exécuter, ni mesurer.
> - **Le partage qui marche** : *elle creuse et challenge, Claude Code mesure et livre.* Son
>   contre-audit v1.1 a produit **2 correctifs de santé livrés le jour même** (ft-v906) et
>   **confirmé le défaut cru/cuit** que personne n'avait vu.
> - ⚠️ **Et la vérification marche dans les deux sens** : sur 10 points, 2 de ses chiffres étaient
>   faux (947 kcal au lieu de 1 047 — il avait oublié le +100 de la phase de charge) et 3 des miens
>   l'étaient aussi (seuils de cache en unités inverses, chiffres CIQUAL de mémoire, plafond IA
>   présenté comme s'il bornait tout le monde). **Aucun des deux ne fait autorité seul.**
> - 📄 **Le dossier de transmission** (9 pages, tous les chiffres lus dans le code) est régénérable :
>   `scratchpad/dossier-nutrition.html` → PDF. Il porte l'état du moteur, les réponses point par
>   point à son audit, et **3 questions ouvertes** qu'on lui pose (niveau par défaut · faut-il
>   convertir l'historique · le seuil du plancher devrait-il dépendre du poids).
>
> ### 🧭 UNE FAMILLE DE BUGS DE PLUS, ÉCRITE LE 18/08 — `BUGS.md` §15
> **« La règle juste, définie trop étroit »** : les trois bugs de la journée avaient la même forme —
> la règle existe, elle est écrite, elle est testée, elle passe au vert, et c'est **un mot de sa
> définition** qui est trop serré. *Le signe le plus sûr : Michel signale DEUX FOIS la même chose.*
> Nouveau réflexe n° 10 : quand une remarque revient sur un comportement déjà corrigé, **ne pas
> réécrire la règle — aller relire sa définition**.
>
>
>
> ### 🌙 TROUVÉ PAR LE CONTRE-AUDIT v1.3 (18/08, soir) — vérifié, et une de ses conclusions corrigée
> **La journée est coupée à MINUIT, sans exception** (`today()`, state.js:517). Un repas pris à 3 h
> pendant une nuit de travail est rangé au jour **suivant** : la journée alimentaire réelle est
> scindée en deux, et les deux moitiés sont fausses. ⚠️ **Michel travaille de nuit et d'astreinte**,
> donc ça le touche personnellement — mais c'est général (infirmiers, intermittents…).
>
> **⭐ SA CONCLUSION « IRRATTRAPABLE » EST FAUSSE, ET C'EST VÉRIFIÉ** : chaque entrée du journal
> porte déjà `ts: Date.now()`, et `dayOfTs()` existe depuis longtemps dans `state.js`. **La journée
> logique est donc RECALCULABLE rétroactivement** pour n'importe quelle heure de coupure. Rien
> n'est perdu — ce n'est **pas** de la famille de la brique 0, et ça ne doit **pas** passer devant
> le reste. *(Nuance honnête : `ts` est l'heure de SAISIE, pas celle du repas — mais le champ
> `date` actuel a exactement la même limite, donc on ne perd rien par rapport à aujourd'hui.)*
>
> **⏭️ Ce qu'il restera à faire, sans urgence** : une coupure **décalable** (défaut minuit, donc
> aucun changement pour personne) appliquée **au journal alimentaire seulement**.
> ⛔ **Ne PAS toucher à `today()` globalement** : il date les séances, les pesées, le sommeil, les
> badges et les séries — le coût d'une erreur y est sans commune mesure (R29).
> ⛔ **Et ne PAS inventer un facteur « travail de nuit » dans le TDEE** : les effets du travail
> posté sont documentés, mais pas sous une forme qui donne un nombre de kcal utilisable. Déclarer
> le type de journée suffit. **Les catégories doivent venir de l'utilisateur** (repos/astreinte/nuit
> sont celles de Michel, pas un mécanisme universel).
>
> **⭐ Et son autre apport, à garder** : la fourchette « déficit de 10-20 % du TDEE » que je
> bloquais **n'existe pas** — il l'a cherchée et le dit. La littérature emploie deux autres cadres :
> la **disponibilité énergétique** (kcal/kg de masse maigre, seuils 45 / 30 — consensus CIO RED-S
> 2018) et le **taux de perte hebdomadaire** (0,5-1 kg/sem). ⚠️ Le seuil de 30 vient
> majoritairement d'études sur des **femmes** ; chez l'homme il est moins établi. À présenter
> comme un repère, jamais comme un couperet, et **du côté du Gardien, pas du moteur**.
>
> ### 💊 CE QUI ATTEND UNE DÉCISION DE MICHEL — volet suppléments (contre-audit v1.2)
> Trois points **vérifiés dans le code**, non livrés parce qu'ils changent ce que l'app **recommande
> à tout le monde** — ce n'est pas une correction, c'est un arbitrage produit :
> 1. ~~**La dose de créatine.**~~ ✅ **TRANCHÉ par Michel le 18/08, livré en ft-v910** :
>    *« on laisse le champ libre et il n'y a pas de taux légal en France, mais avec un
>    avertissement au-delà de 3-5 g »*. ⚠️ **Et il avait raison contre moi** : l'arrêté du
>    26/09/2016 engage le **fabricant** (ce qui peut être vendu et étiqueté en France), **pas le
>    consommateur**. Parler de « maximum légal » faisait passer un repère de commercialisation
>    pour une interdiction. La dose est modifiable, deux seuils avec deux tons (repère à 3 g,
>    avertissement à 5 g), et bornes larges (0,5-30 g) qui n'attrapent qu'une faute de frappe.
> 2. ~~**La phase de charge**~~ ⛔ **ÉCARTÉE par Michel le 18/08** : *« sincèrement pour moi la
>    charge en créatine c'est pas très important »*. On ne la conditionne pas, on ne la masque
>    pas, on n'y touche pas. **Écrit comme décision, pas comme oubli** (R30) — le constat de
>    l'audit reste valable si quelqu'un veut rouvrir le sujet un jour.
>    *(constat d'origine)* **⚠️ de CRÉATINE, pas de protéines** (question de Michel, 18/08 : *« protéine
>    ou créatine ? parce que si c'est protéine y'a pas de phase de charge »* — il a raison, ça
>    n'existe pas pour les protéines, ni dans l'app ni dans la littérature).
>    Elle n'a jamais fait **mieux** que la dose simple, seulement **plus
>    vite** (Hultman 1996 : 20 g/6 j = 3 g/28 j, même +20 %). Elle est pourtant présentée en
>    permanence, à égalité avec l'entretien — alors qu'elle n'a de sens **qu'une fois, au début**.
>    Une seule question (« tu en prends depuis plus d'un mois ? ») suffirait à masquer le bouton.
>    ⚠️ Incohérence d'unité au passage : l'entretien est proportionnel au poids, la charge est fixe
>    à 20 g (soit 0,33 g/kg à 60 kg et 0,18 à 110 kg).
> 3. **La contradiction protéique — sujet SÉPARÉ du précédent** : la fiche whey dit **1,6-2 g/kg**, le moteur calcule
>    **2,0 à 2,6**. ⭐ Ce n'est probablement **pas** un chiffre à trancher : les deux fourchettes
>    existent, pour des conditions différentes (maintien vs déficit chez un sportif entraîné). Le
>    correctif est de **dire à quelle condition chacune s'applique** — mais les références citées
>    par l'audit sont **de mémoire** et doivent être contrôlées avant d'être écrites.
>
> ### 🔬 CE QUE L'AUDIT v1.2 A APPORTÉ EN PLUS, ET QUI N'EST PAS ENCORE TRAITÉ
> · **`protMPS`** — le collagène (10-15 g recommandés par Milo, coach.js) apparaît comme
>   **15 g de protéines** dans Open Food Facts alors qu'il **ne soutient pas la synthèse
>   musculaire** (pauvre en leucine, sans tryptophane). ~8 % d'une cible qu'on croit atteinte.
>   *Même classe d'erreur que le cru/cuit : systématique, quotidienne, invisible.* Et il touche la
>   **brique 0** — c'est une propriété de la SOURCE, elle doit être figée à la saisie.
> · **`goalDelta` est ABSOLU** (−450 kcal pour tout le monde) : soit **−32 %** chez une femme de
>   55 kg sédentaire et **−14 %** chez un homme de 90 kg actif. *La prescription est absolue, la
>   surveillance est relative* (le Gardien alerte sur « perte > 1 %/semaine »). Le plancher de
>   ft-v906 est un bon filet, mais il traite le symptôme.
> · **`Math.max(PLANCHER_KCAL, BMR)`** serait mieux fondé qu'un seuil fixe : 1 200 kcal, c'est
>   **101 %** du métabolisme de base d'une femme de 50 kg et **76 %** de celui d'une femme de 90 kg.
> · **Cache** : le commentaire de `worker.js` applique le mauvais comparatif (1 h contre *pas de
>   cache*, au lieu de 1 h contre 5 min — le vrai seuil est « éliminer plus de 40 % des écritures »),
>   et les gardes `_mi > 1000` / `_pi > 1000` comptent des **caractères** quand le minimum cacheable
>   de l'API est en **tokens** (2 048 pour Sonnet). ⚠️ Sans effet aujourd'hui (les blocs font ~46 000
>   caractères), mais c'est un piège latent. **[à mesurer]** : lire
>   `usage.cache_creation.ephemeral_1h_input_tokens` sur une vraie requête.
>
> ### 🍽️ LE CHANTIER ACTIF : LA NUTRITION (Michel commence à s'en servir **la semaine prochaine**)
> Son constat, et c'est le point de départ : *« même moi ça me saoule d'utiliser la nutrition, c'est
> assez mal fait »* · *« ce n'est pas intuitif »*. Tout le dossier est dans **`docs/NUTRITION-MOTEUR.md`**
> (le *comment*) et `docs/NUTRITION-PHILOSOPHIE.md` (le *pourquoi*).
> **⭐ LE DIAGNOSTIC** : l'app n'implémente que les **niveaux 3 et 4** des 4 niveaux de précision que
> Michel a lui-même définis, et le Journal répond à *« combien il me reste à manger »* quand la
> question est *« où j'en suis »*.
> **⚠️ ET LE PIÈGE À NE PAS REFAIRE** : j'avais conçu toute la brique sur **son** profil alimentaire
> (répétitif). Lui : *« ça c'est moi qui le fais, les autres peut-être pas »* — il y a ceux qui mangent
> des pizzas et ceux qui suivent une diète stricte. `docs/PERSONAS-FONDATEURS.md` : **Tatiana = absence
> de présupposés.**
> **⏭️ ORDRE CONVENU** : ① l'écran qui répond « **où tu en es** » · ② **ajouter un repas en un appui**
> (niveau 2 = portions) · ③ une semaine incomplète produit quand même une moyenne honnête ·
> ④ la plomberie : **provenance figée** dans `S.foodLog` (aucune entrée ne stocke aujourd'hui ni sa
> source ni sa version → un chiffre n'est ni comparable ni rejouable).
> **RÈGLE ÉTABLIE** : *l'IA lit la phrase, elle ne produit JAMAIS les nombres* — les chiffres viennent
> de CIQUAL / Open Food Facts, ce qui rend une saisie reproductible.
> **✅ LIVRÉ EN ft-v915** : le **cru/cuit** est **écrit, jamais converti**. ⚠️ Et la convention retenue
> n'est PAS celle notée ici (« féculent → cuit ») : à l'écriture elle ne tient pas — le riz s'achète
> sec, les lentilles arrivent cuites en boîte. **La convention suit l'ALIMENT**, chaque ligne porte
> son état. Côté journal, une note prévient du piège ×2,7 sur les produits secs scannés.
>
> ### 📄 LIVRABLE DU JOUR, hors dépôt
> La note **« Peser cru ou cuit »** pour Tatiana (objective, les deux méthodes défendues) :
> https://claude.ai/code/artifact/242d0ca3-3eb8-42d7-a407-099264f56a9c — privée tant qu'il ne la
> partage pas. Source : `scratchpad/cru-cuit.html`.
>
> ### 📝 NOTÉ POUR PLUS TARD (rien à faire maintenant)
> **`IDEES-FUTURES.md`** porte désormais le dossier **« Échauffement & mobilité »** (demande de Michel,
> 18/08). ⚠️ Sa 1ʳᵉ ligne dit l'essentiel : **ne pas confondre avec la montée en charge**, déjà
> construite (ft-v887/890). Le vrai sujet sera *« qu'est-ce qui devient une DONNÉE ? »* — aujourd'hui
> la consigne d'échauffement n'existe **que dans le texte du prompt**, rien ne la collecte (R4).

> ## 📍 OÙ ON EN EST — 17/08/2026 au soir (à lire en premier)
>
> **Journée d'AUDIT, pas de développement.** Quatre allers-retours avec une autre instance de Claude
> et avec GPT sur l'export complet de Michel. **Tout est écrit** dans `docs/AUDIT-CONTEXTE-MILO.md`
> (nouveau) et `docs/CALORIES-SOURCES.md` **§17**. Michel a posé le cadre lui-même :
> *« on creuse tellement, j'espère qu'on va pas se perdre »* → on écrit d'abord, on répare ensuite.
>
> ### ⛔ CE QU'IL NE FAUT PAS FAIRE MAINTENANT
> **Ne pas retoucher le modèle physiologique des calories pour obtenir un meilleur chiffre.**
> Les deux auditeurs extérieurs et ce dossier sont d'accord : *d'abord une chaîne de calcul
> cohérente et rejouable, l'audit MET reprendra sur une base saine.*
>
> ### ✅ RÉGLÉ EN ft-v895 (soirée du 17/08)
> · **Le détail par exercice écrasait au lieu d'additionner** — un même exercice fait deux fois dans
>   une séance perdait les calories de la 1ʳᵉ occurrence. **C'était la cause des 2 seules séances
>   (28/06, 07/07) dont le résidu résistait**, et les 4 autres « détails incomplets » signalés par
>   l'audit n'étaient **pas des bugs** (aucune série validée = rien à compter). 6 signalés = 2 vrais.
> · **`engineVersion` posé sur chaque nouvelle séance** (`CAL_ENGINE = 3`).
> · **La boîte de la montre écrivait dans la clé du profil santé** (`ft4_health`) — donc elle ne
>   survivait à **aucune** sauvegarde : ft-v880 ne pouvait pas marcher. Clé propre `ft4_healthbox`.
> · **L'export embarquait 146 160 car. d'images pour 3 photos** (31 % du fichier).
> · **La fixture des tests a enfin des profils avec blessure** (bloc XLIV).
>
> ### ⏭️ CE QUI RESTE SUR LES CALORIES — un seul point
> Le **`breakdown` des 29 séances recalées** n'a pas suivi le `total` (état `total` v2 /
> `breakdown` v1). Les séances **nouvelles** sont désormais cohérentes ; c'est l'**historique migré**
> qui reste dans un état mixte. ⚠️ Le corriger veut dire **recalculer des séances déjà enregistrées** :
> c'est exactement le geste qui a déclenché quatre audits. À faire **explicitement**, marqué, et
> réversible — ou pas du tout.
>
> ### ✅ CE QUI EST RÉGLÉ ET NE DOIT PAS ÊTRE ROUVERT
> · Le **« forfait de 50 kcal »** n'existe pas : c'est `warmupCals = 3.5 × poids × warmupMin/60`
>   (`app.js:677`), volontairement hors `breakdown`. **30 séances sur 32 s'expliquent à ±2,3 kcal.**
>   Le contrat est `total = Σbreakdown + cardio + warmup`, et la séance du **15/08** le prouve
>   (`warmupMin = 0` ce jour-là → égalité juste à 1 kcal près).
> · Le **« +38 % cardio »** est **+6 %** (comparaison brut/net) · **CAL-012** est sans objet ·
>   le **« forfait de 156 kcal »** était un artefact · la migration ×1,55 est **explicite, marquée
>   (`calSource`) et réversible (`caloriesAvant`)**.
>
> ### ✅ CHANTIER ① FAIT en ft-v896 — le bloc personnel est réordonné
> Les blocs mutables sont descendus et classés par mutabilité **croissante** (POIDS → CHECK-IN →
> DERNIÈRES SÉANCES → SÉANCE EN COURS). Mesuré avec le nouvel outil `node tools/cache-coupure.js` :
> **valider une série 15 253 → 20 caractères réécrits**, **noter une pesée 12 995 → 2 329**.
> Rien n'a changé dans le texte envoyé à Milo (258 lignes des deux côtés), sauf **un renvoi de
> position qui était FAUX** (« sa MÉMOIRE LONGUE plus bas » — elle est 6 266 car. plus HAUT) :
> le bloc est désormais **nommé** au lieu d'être pointé par une direction.
> ⚠️ **Ce qui n'est pas prouvé** : `tests/milo` est déterministe — il dit que rien ne manque, pas
> que le modèle réagit pareil. L'ordre n'est pas neutre pour un modèle ; seul un A/B le dirait.
> ⏭️ **Reste** : battre un record réécrit toujours 16 130 car. (RECORDS est haut dans le bloc) —
> non touché **exprès**, c'est rare (quelques fois par mois contre 30-40 séries par séance).
>
> ### 🧠 LE CHANTIER SUIVANT — scinder le Gardien (② ci-dessous)
> Tout est dans **`docs/AUDIT-CONTEXTE-MILO.md`**. Mesuré : **~97 000 caractères par message**,
> identiques quelle que soit la question (voulu, R30).
>
> **⚠️ CE QUI RESTE À FAIRE :**
>
> **✅ ② OPTION 1 LIVRÉE en ft-v897** — la note du jour est descendue, empreintes **9/16 → 5/16**.
> La règle et les zones nommées n'ont pas bougé (R11).
> **⛔ L'OPTION 2 est ÉCARTÉE, PAS ABANDONNÉE** (décision Michel, 18/08 : *« du moment que Milo
> assure toujours »*). Gain restant 5 → 2, raison du refus et conditions pour la ressortir :
> `docs/AUDIT-CONTEXTE-MILO.md` **§13**. Ne pas rouvrir sans lire cette page.
>
> **② (contexte de la mesure du 17/08)**
> La mesure a trouvé un étage de plus que l'audit (`docs/AUDIT-CONTEXTE-MILO.md` **§12**) : le bloc
> contient une **note sur la séance DU JOUR**, donc pour quelqu'un de blessé l'empreinte change
> **pendant** la séance — **46 741 car. du bloc commun refacturés** dès qu'un exercice sollicitant la
> zone entre ou sort. Deux correctifs possibles : ① sortir la note du jour du bloc de tête (peu
> risqué, gain énorme, la règle ET les zones restent en tête) · ② scinder pour de bon.
> ⛔ **Rien livré exprès** : les deux changent un comportement de SÉCURITÉ, et `tests/milo` est
> déterministe — il prouve la PRÉSENCE, pas la protection. État figé par le témoin XLVI.
>
> **② (description d'origine de l'audit)** (§3) — le bloc « commun » n'est commun que pour les gens **sans blessure**
> (8 profils = **7 entrées de cache**). L'auditeur extérieur a montré que mon « pas de correctif
> évident » était faux : le bloc contient **1 234 car. génériques** (la priorité, le principe) et
> **1 578 car. personnels** (les zones nommées). Descendre **la donnée** et garder **la règle** en
> tête respecte R11 et ramène 8 profils à **1 seule empreinte**.
>
> **③ FIXTURE `tests/parcours`** — ✅ **FAIT en ft-v895** (bloc XLIV : 3 profils de santé).
>
> **✅ CE QUI EST VÉRIFIÉ ET NE DOIT PAS ÊTRE ROUVERT** : aucun autre chemin IA ne tourne sans cache
> (les 10 autres appels du Worker traitent une image ou un PDF **différent** à chaque fois — un cache
> y coûterait 1,25× pour zéro lecture) · et **le cache RAPPORTE depuis le 08/08** (ratio 1,14 : 1,
> gain 11 %). La « perte » mesurée par l'audit extérieur est le coût des deux semaines de
> construction, pas celui du service.
>
> ### 🔒 EN ATTENTE D'UNE DÉCISION DE MICHEL
> **Sécurité — Option 1** (secret d'appareil + récupération par e-mail). Il l'avait choisie, puis :
> *« avant de le faire j'ai fait une petite trouvaille pas top lol donc mets-toi en attente »*.
> C'est le seul chantier de la file **sans filet de tests**.

> ## 🔥 CHANTIER — LES CALORIES : l'état du 10-11/08 (⚠️ largement DÉPASSÉ, voir le bloc du 17/08 ci-dessus)
>
> **Michel a relevé le niveau d'exigence** : *« si on veut que l'application soit sérieuse, il faut
> des données sérieuses et scientifiquement prouvé ET prouvable »*. Contexte : *« moi je ne
> l'utilise pas mais Tatiana est à fond dedans, et si l'appli va à des coachs faut qu'on soit
> sérieux »*. Dossier sourcé : `docs/CALORIES-SOURCES.md` · contre-expertise GPT annotée :
> `docs/CALORIES-SYNTHESE-GPT.md`.
>
> **✅ FAIT (ft-v833)** — le **métabolisme de base** tient compte de la masse maigre
> (Katch-McArdle), avec refus explicite si le bilan est vieux ou si le poids a dérivé. C'était le
> plus gros poste (60-70 % de la dépense) et le seul qu'on pouvait resserrer sans matériel.
>
> **⏭️ CARDIO — CREUSÉ le 11/08, chiffres dans `docs/CALORIES-SOURCES.md` §12. Rien n'est encore
> modifié dans le code.** Ce qui est établi :
> · la **formule** du cardio est juste (`MET × poids × durée`) — le défaut est dans le **choix du
>   MET** : l'étiquette « modéré » couvre de la marche rapide (4,1 MET) à la course à 10 km/h
>   (10,5 MET), donc elle est **jusqu'à ×1,9 trop basse** face à l'ACSM ;
> · **🐛 BUG NET** : l'échauffement est compté **deux fois** — un forfait de 10 min (49 kcal) ajouté
>   sans condition, **plus** le cardio d'échauffement réellement noté. 126 kcal pour 10 minutes ;
> · **🐛** la durée de la partie muscu est **reconstruite** (24 min pour une séance qui en prend 50)
>   alors que `sess.duration` la mesure ;
> · **❓ il manque 4 nombres à Michel** pour refermer le cas « 57 kcal » : durée saisie · type ·
>   intensité choisie · ce qu'affichait le tapis (vitesse/pente/distance).
>
> **⚠️ CORRIGÉ le 12/08** : j'avais écrit que la durée de la muscu était « reconstruite à 24 min
> pour une séance qui en prend 50 ». **C'était une supposition** — le rythme MESURÉ de Michel
> (3,0 min/série, ft-v826) donne 21 min. La durée est correcte à ±20 %. **Le vrai écart est le
> RYTHME** : Force Tracker tourne à 4,15-4,50 kcal/min, soit très exactement la catégorie la plus
> LÉGÈRE des barèmes (« repos longs »), quand les séances de Michel relèvent de l'« hypertrophie
> classique » (7,44 kcal/min à 85 kg). Écart réel ≈ **1,7×**, pas 3,4×.
>
> **Nouvelle source au dossier** (apportée par Michel, relue par GPT, `CALORIES-SOURCES.md` §13) :
> 4 niveaux en kcal/min — 4 / 7 / 10 / 14 à 80 kg. **Statut : méthode en compétition, pas
> référence** (la formule qui produit ces 4 chiffres n'est pas publiée). ⭐ **Son idée forte** :
> elle classe la **SÉANCE**, pas l'exercice — l'inverse de ce que fait Force Tracker, qui est
> précis sur ce qui compte peu (quel exercice) et muet sur ce qui compte beaucoup (la **densité**).
> ⭐⭐ Et la densité règle l'objection de Michel (« si on n'arrête pas la séance, les calories
> montent ») : un repos rallongé **fait baisser** la densité, donc le total se tasse au lieu de
> s'envoler. **1ᵉʳ geste de code du chantier, avant tout choix de barème : horodater chaque série
> validée** (`doneAt`) — sinon un « Terminer » oublié fausse tout, et aucune des 3 approches n'est
> mesurable.
>
> **Direction validée (GPT + mesures)** : *les paramètres physiques de la modalité d'abord*
> (vitesse/pente → équations ACSM ; watts pour le vélo), l'étiquette d'intensité en **repli assumé**,
> et la FC **seulement** si les 10 séances montrent qu'elle apporte quelque chose.
>
> **Ensuite** : durée réelle mesurée + classification MET pour la musculation (le modèle actuel
> reconstruit les temps et invente 10 min d'échauffement), et l'affichage en **fourchette** au lieu
> d'un nombre unique. ⚠️ Point de GPT à traiter : `MET × poids × durée` contient déjà le
> métabolisme de repos — l'ajouter au TDEE le compte **deux fois**.

> ## 🔀 LIVRÉ CETTE NUIT — les exercices unilatéraux (ft-v832, 11/08)
>
> Les 48 exercices tranchés un par un avec Michel sont **dans le code**. Le critère est de lui :
> *« met uni vu que ça doit être fait de l'autre côté aussi »*. On saisit **3 séries, pas 6**, le
> tonnage double tout seul, et la charge obéit à **une seule phrase** pour les 355 exercices :
> **« on note le poids qui BOUGE pendant la répétition »**.
>
> **⚠️ CE QU'IL FAUT SAVOIR EN REPRENANT** : l'**historique d'avant n'est pas corrigé** (marqueur
> `sess.uniConv`) — le curl de Michel noté 60 kg (2 × 30) deviendrait **quadruple** en volume s'il
> était recalculé. Il a dit *« laisse pour l'instant »*. Toute correction future doit être une
> **migration explicite**, jamais un changement de `_workVol`.
>
> **⏭️ À vérifier à sa prochaine séance** : que la pastille 🔀 s'affiche bien sur ses exercices, et
> qu'il pense à noter **28** et non 56 sur le rowing haltère (la pop-up v56 le lui dit).

> ## 💡 IDÉE GARDÉE — « le dessin pour les muscles, la photo pour le geste » (09/08)
>
> Michel envoie une **photo** de Kickback poulie (vraie personne, fond noir, 2 poses) et propose :
> *« sinon on met les 2, l'image fixe et l'animé qui est classe »*. **L'idée est bonne et elle est
> pédagogique** : le **dessin** dit QUELS muscles travaillent (le rouge), la **photo** dit COMMENT
> on fait le geste. Ce ne sont pas deux fois la même information.
>
> **Pourquoi ce n'est pas fait** : les 304 figurines sont des dessins sur fond BLANC ; une photo sur
> fond noir serait la seule de son espèce et se verrait immédiatement (**règle d'or #7** — garder
> l'identité « figurines muscles »). Ce n'est donc pas une décision « Kickback », c'est une décision
> **catalogue** : soit une, soit toutes. Et une photo pèse ~2× une figurine (médiane 96 Ko).
>
> **Le seuil pour rouvrir le sujet** : une vingtaine de photos du même style, sur les mouvements où
> la technique compte. En dessous, ça fait une exception ; au-dessus, ça devient un vrai parti pris.
> La photo animée existe déjà (montée le 09/08 pour montrer le rendu, non intégrée).

> ## 📌 EN ATTENTE DE MICHEL — posé le 08/08 (il était au sport : *« montre-moi plus tard »*)
>
> **① La page « ce qui existe / ce qui manque, par muscle ».** Née de sa question — *« tu peux pas
> classer chaque exercice dans un sous-dossier ? »*. **Réponse donnée : les sous-dossiers, non** —
> le groupe musculaire est **déjà** dans `EXLIB`, un dossier le redirait une 2ᵉ fois (**R2**), le
> Squat appartient à Jambes **ET** Fessiers (le dossier force un choix que la donnée n'a pas), et
> déplacer 296 fichiers = réécrire 294 chemins, dont une faute de frappe ne lèverait **aucune
> erreur**. **Mais le besoin est réel** : voir d'un coup d'œil quoi chercher avant de m'envoyer une
> archive. L'info EXISTE déjà (`python3 tools/images.py etat` : **41 sans image**, dont 7 Fessiers,
> 7 Biceps, 5 Abdominaux) — mais elle est **enfermée dans un outil que Michel ne peut pas lancer**.
> ✅ **FAIT le 08/08** — `docs/FIGURINES.html`, générée par `python3 tools/images.py page` :
> https://michdu75-commits.github.io/forcetracker/docs/FIGURINES.html
> Groupes les plus démunis en premier, filtre « ne montrer que ce qui manque » actif par défaut,
> bouton « copier la liste ». **Générée depuis le code** (EXLIB + EX_YT) — à relancer après chaque
> ajout d'images, sinon elle ment. Ne touche pas l'app.
>
> **② Les 8 fichiers image inutilisés (~700 Ko)** — mesurés le 08/08, décision non prise :
> `front-squat-avec-halteres`, `montees-banc-lateral-halteres`, `shrug-machine-mollets`,
> `triceps-haltere-un-bras` (dans `exercises/`) + `press-jambes-1/3/4/5` (dans `machine/`).
> **Aucun chemin cassé en revanche** : les 294 pointent tous vers un fichier existant.
>
> **③ Deux images en attente d'arbitrage** (depuis ft-v798) : `Crunch Oblique` (seule image
> disponible = flexion latérale sur banc à 45°) et `Relevé de Buste (Sit-up)` (seul candidat =
> sit-up **décliné**). Plus **~35 fichiers d'archive** ne correspondant à aucun exercice du
> catalogue (Dead Bug, V-ups, Pallof Press, Swiss Ball, TRX…) → décision **produit**.

> ## ✅ 09/08 — LE BLOC PERSONNEL PASSE EN 1 H AUSSI (ft-v815)
>
> **Michel a inventé la bonne mesure** : exporter la console Anthropic **avant** et **après** une
> conversation — la différence EST son coût. Le total mensuel, lui, était inexploitable (**78 %**
> venaient de nos essais des 3-5 août).
>
> **Ses 3 tests** : une conversation coûte **0,12 à 0,17 $**, et la répartition est constante —
> **écriture du cache 5 min : 42-47 %**, texte jamais caché 33 %, réponse de Milo 17 %, lectures 8 %,
> **écriture 1 h : 0 %**. Le bloc commun (passé en 1 h le 08/08) n'a été réécrit **aucune fois**.
>
> **⏭️ À MESURER MAINTENANT** : refaire un export avant/après. L'écriture 5 min doit s'effondrer.
> Attendu ≈ **0,08 $** au lieu de 0,15 $. Rollback : retirer `, ttl: '1h'` de `_TTL_PERSO` (worker.js).

> ## ⏳ EXPÉRIENCE EN COURS — verdict attendu le **11/08/2026**
>
> **Lancée le 08/08 (ft-v796), à la décision de Michel.** Le bloc **commun** du prompt de Milo est
> passé en cache **1 heure** ; le bloc **personnel** reste en **5 minutes**. Rien ne change pour
> l'utilisateur — **seule la facture bouge**.
>
> **⚠️ C'est un PARI** : écrire en 1 h coûte **2×** le tarif d'entrée contre **1,25×** en 5 min.
> Il n'est gagné que si le bloc est **relu ≥ 2 fois par écriture** (seuil : `2 + 0,1N < N + 1` → N > 1,11).
>
> **🎯 COMMENT TRANCHER** — demander à Michel l'export de la console Anthropic (Usage → Tokens, CSV),
> puis comparer sur les jours du 08 au 11 :
> | | |
> |---|---|
> | `usage_input_tokens_cache_read` ≥ **1,11 ×** `usage_input_tokens_cache_write_1h` | ✅ **gagné, on garde** |
> | en dessous | ❌ retirer `, ttl: '1h'` dans `worker.js` (une ligne, sans effet sur les réponses) |
>
> **📌 Contexte utile pour lire les chiffres** : la mesure du 1ᵉʳ au 6 août (0,08 lecture par écriture)
> décrivait la fenêtre de **5 minutes** — elle ne dit rien de celle d'une heure. Elle était en plus
> **polluée** par le laboratoire de personas (Profil → Admin), qui écrit à chaque appui un cache jamais
> relu. Le compteur d'appels IA (ft-v793) sépare désormais les essais de l'usage réel : Profil → Admin → 🩺.
>
> **Repères mesurés le 08/08** (utiles pour tout calcul de coût) : prompt **59 356 car.** pour un
> utilisateur normal (bloc commun **37 237** · perso **~4 600** · jamais cachable **17 527**, dont
> **9 514** de catalogue d'exercices) · **~10,2 centimes** le message aujourd'hui, **~3,7** si le cache
> est relu · un abonné à 6,99 € est rentable jusqu'à **2,4 messages/jour** (6,5 avec le cache).
> Détail complet et briefing pour audit externe : **`docs/BRIEFING-GPT-COUT-IA.md`**.

> 🌙 **AUDIT NOCTURNE du 29-30/07 (demandé par Michel) : TOUT l'ancien code vérifié** — 2 nouvelles familles permanentes (`tests/calculs/` 79/79 linéaires · `tests/parcours/` 40/40 croisés + perfs), les 9 familles existantes re-passées vertes, retouches quantifiées. **Verdict : les formules fondatrices sont justes, aucun ralentissement.** Trouvailles : bouton « Hier » = bug de Greenwich (minuit-2 h) + 5 cousins **✅ corrigés ft-v671** · « marche de midi » de la récup **✅ corrigée ft-v671** (fatigue en continu sur 36 h, repos en jours calendaires) · « autre sport » **✅ corrigé ft-v672** (+150 kcal/j dans le TDEE, anti-double-comptage ; la récup reste chez Milo — décision assumée, pas de fatigue inventée). **Les 3 trouvailles de l'audit sont closes.** **Tout le détail : `docs/AUDIT-NOCTURNE-2026-07-29.md`.**

> ### 🌅 À LIRE AU RÉVEIL — nuit du 04 au 05/08 (Michel : « rappelle-moi tout ça demain »)
>
> **✅ CE QUI A ÉTÉ FAIT PENDANT QUE TU DORMAIS**
>
> | | Quoi | Preuve |
> |---|---|---|
> | 🛟 | **Sauvegarde de nuit RÉPARÉE** — elle ne tournait plus depuis 36 jours | 1 déclencheur · `backup-2026-08-04-23-20.json`, **811 Ko**, écrit **par le planificateur** à 23h20 |
> | 🔌 | **Miroir Supabase branché** (ft-v763) | projet **séparé** de celui de Tatiana · table en écriture seule |
> | 🚪 | **`.claspignore` refermé par défaut** — le bug qui cassait le déploiement backend tous les 15 jours | run vert, `Pushed 2 files` |
> | 💸 | **Ton compte est passé en Sonnet** | dans `worker.js`, PAS dans les Script Properties (voir ci-dessous) |
> | ✂️ | **Prompt allégé de 9 507 caractères** (ft-v764/765) | 60 085 → 49 362 sur un message hors sujet |
> | 🔐 | **Milo ne récite plus ses consignes, sauf à toi** (ft-v766/767) | 205 tests verts, les 2 branches |
>
> **🎯 LES 3 CHOSES À FAIRE AUJOURD'HUI**
> 1. **Vérifier que la sauvegarde de 2h est bien passée** → Profil → Admin → 🩺 Santé du système. Elle doit être datée de **cette nuit**. C'est le seul contrôle qui reste.
> 2. **Tester la copie miroir Supabase** → Profil → Admin → 🪞 (il faut que le SQL de la table `ft_comptes` soit passé). ✅ = ça marche · 404 = SQL non lancé · 401/403 = règles RLS.
> 3. **Vérifier dans la console Anthropic** qu'il n'y a plus de barre `claude-opus-4-6` à partir du 5/08.
>
> **🧨 LA DÉCOUVERTE DE LA NUIT, à retenir** : **DEUX endroits prétendaient régler le modèle de Milo, un seul agissait.** La Script Property `COACH_MODEL_MICHEL` est **du code mort** depuis que le coach passe par le Worker Cloudflare — le modèle est **en dur dans `worker.js`** (constante `MODELE_MICHEL`). J'ai cherché une heure du mauvais côté, et le bouton que j'avais fabriqué côté Apps Script t'aurait affiché un « ✅ Sonnet » **sans rien changer**. Supprimé.
>
> **📏 DEUX CHIFFRES QUE J'AVAIS ANNONCÉS FAUX** (corrigés par la mesure) : la nutrition ne fait pas 26 % du prompt mais **3,7 %** · filtrer le catalogue par lieu d'entraînement ne te ferait gagner que **29 caractères** (tu es en salle complète).
>
> **⏭️ LE CHANTIER SUIVANT — le régime du prompt, mesuré et priorisé**
> | Bloc | Poids | Piste |
> |---|---:|---|
> | `TA MÉTHODE DE COACH` | 6 322 | redondance avec 3 autres blocs |
> | `INTERDICTION D'INTERROGATOIRE` | 4 769 | dit 3 fois ailleurs — **priorité n°1**, désignée par ChatGPT ET par Milo |
> | `INTÉGRER LA SÉANCE` | 3 198 | même conditionnement que le catalogue |
> | `ÉTAT DU JOUR` | 2 832 | à condenser |
>
> ⚠️ **La règle de méthode qui sort de la nuit** : **l'audit se délègue, la coupe non.** ChatGPT a bien audité (il a trouvé le catalogue), puis a proposé **−85 %** sur un bloc en faisant disparaître, sans les mentionner, des règles nées de vrais bugs. Michel : *« tu déconnes sur ce coup là sérieux »*. Milo a produit le même audit, de l'intérieur. **Les trois lectures convergent sur les mêmes cibles** — ça, c'est utilisable. Les coupes se font ici, où l'on sait de quel incident est née chaque ligne.
>
> **✅ MIROIR SUPABASE OPÉRATIONNEL** (05/08, 8h) — testé en vert depuis l'app. Quatrième copie des comptes, sur une infrastructure indépendante de Google. *(Les bugs d'affichage du « Créateur de programme » signalés le 04/08 au soir concernaient le projet de Tatiana, pas Force Tracker — retirés d'ici.)*
> **🔒 Toujours ouvert (sécurité)** : `loadProfile` sert un compte entier sans code perso · le jeton de la boîte à idées est en clair dans `app.js`. Correctifs prêts, **non déployés** — c'est la production, ça se fait avec toi.
> > ✅ **FERMÉ DEPUIS LE 07/08/2026 — encadré ajouté le 05/09** (la ligne ci-dessus est gardée telle quelle, c'est un instantané daté). **Les deux ont été déployés** : le jeton par ft-v787, et `loadProfile` par la « lecture stricte » (`_lectureAutorisee_`, `Code.js` ~108, appelée par le GET **et** le POST). ⚠️ **Cette ligne est restée fausse un mois**, et le 05/09 elle a servi à répondre à Michel sur le passage du dépôt en privé — **R23** : *un document d'état qu'on ne met pas à jour fait dire des bêtises à celui qui le lit.* Détail et clôture : `docs/ALERTE-SECURITE-BOITE-IDEES.md`.
>
> **↩️ Rollback de la nuit** : `git reset --hard sauvegarde-avant-allegement` *(⚠️ sur ce dépôt, les **tags** sont refusés — on utilise une **branche**.)*

> ### 🔁 ÉTAT AU 04/08 (nuit) — remplace la photo précédente
> ⚠️ **Ce bloc se REMPLACE, il ne s'empile pas.** Instantané, pas journal.
>
> **🔥 Les deux derniers jours : 18 versions (ft-v739 → ft-v756)**
> - ✍️ **Les muscles ÉCRITS** : les 337 exercices relus un par un, ~120 fiches corrigées. La devinette par 69 règles ordonnées ne sert plus qu'aux exercices inconnus. Fragilité **60 (18 %) → 0**.
> - 🧍 **La figurine passe de 18 zones à 41 muscles** (ft-v751) → nouvelle règle **R31** : *la figurine est le vocabulaire du système, sa finesse est le plafond de tout le reste* (13 lecteurs dans 4 fichiers).
> - 🧠 **Trois bugs de mémoire chez Milo**, tous signalés par Michel sur capture : il croyait ne voir qu'une semaine (**ft-v752**, une phrase du prompt niait la mémoire longue) · sa progression basculait sur UNE séance, +23 % ou −20 % au choix (**ft-v753**) · il n'avait aucun détail entre la semaine écoulée et les moyennes (**ft-v754**).
> - 📣 **La règle #11 enfin appliquée** (ft-v756) — et 2 annonces découvertes **jamais affichées** (`screen:'menu'`, comparé nulle part).
>
> **✋ DEUX GESTES QUE MICHEL DOIT FAIRE (dit « je vois ça en rentrant », 04/08 soir)**
> 1. **🛟 Réinstaller le trigger de sauvegarde** — `…/exec?action=installDailyBackup&t=FT_BACKUP_INIT_2026`. Doit répondre `1 trigger(s) actif(s)`. ⚠️ **Puis REVÉRIFIER LE LENDEMAIN** dans Santé du système : une sauvegarde manuelle qui marche ne prouve pas que la NOCTURNE est repartie (même leçon que R18 — on vérifie le résultat, pas le geste).
> 2. **💸 Passer son compte en Sonnet** — Script Properties → `COACH_MODEL_MICHEL` = `claude-sonnet-4-6` (la valeur éprouvée, celle de Christophe). Aucun déploiement nécessaire, effet immédiat. Diviserait sa facture par ~5. ⚠️ Ne PAS photographier cette page : elle affiche `ANTHROPIC_API_KEY` et `ADMIN_TOKEN` en clair.
>
> ⚠️ **Et ce que le passage en Sonnet NE règle pas** (R9) : Michel verra alors Milo comme un utilisateur *premium*, toujours pas comme Eline sur Haiku. L'interrupteur « voir Milo comme un utilisateur normal », proposé le 29/07, n'est **toujours pas construit** — c'est lui qui aurait montré le bug du bouton de sa fille.

> **🔴 CONSTATÉ LE 04/08 (16 h 58), NON TRAITÉ — décision de Michel de laisser pour l'instant**
> - **🛟 LES SAUVEGARDES NE TOURNENT PLUS DEPUIS 36 JOURS.** Panneau Santé, point rouge : dernier fichier `backup-migration-2026-06-29-2003.json`. La sauvegarde nocturne (2 h du matin, `backupAllUserData_`) n'a rien produit depuis le 29 juin. Le stockage est à 31 % et tout va bien **aujourd'hui** — mais s'il retombe comme le 29/07, **il n'y a aucun filet**. C'est le point le plus grave ouvert.
> - **💸 Le coût de l'IA, c'est Michel.** Facture du 03/08 : **5,65 $**, dont **5,26 $ d'Opus (93 %)** — son propre compte (`COACH_MODEL_MICHEL`). Christophe (Sonnet) : 0,27 $. **Tous les autres testeurs réunis (Haiku) : 0,12 $.** ⚠️ Et le contexte a grossi le 04/08 (45 000 → 59 600 caractères) : chaque question lui coûte plus qu'avant. Leviers : passer son compte en Sonnet (une Script Property), ou finir le **régime du prompt**.
> - **🤖 « Désolé, réessaie » ment.** Quand le crédit API est épuisé, l'app invite à réessayer quelque chose qui ne peut pas marcher (vécu le 04/08 : Michel a réessayé deux fois). Le code sait pourtant reconnaître l'état (« Milo muet », `coach.js:2400`) — l'information ne remonte pas à l'écran. ⏭️ À faire : message honnête + alerte AVANT la panne.

> **🔴 À TRAITER EN PREMIER AU RÉVEIL**
> 1. **`docs/ALERTE-SECURITE-BOITE-IDEES.md`** — le jeton de lecture des idées est **en clair dans `app.js`**, servi publiquement depuis un dépôt public : n'importe qui peut lire **nom, e-mail et message de tous les testeurs**. Correctif écrit, **non déployé** (impossible de vérifier un déploiement backend depuis la session web, domaine bloqué). *Ça date du 12/07.*
> > ✅ **FAIT le 07/08/2026 (ft-v787) — encadré ajouté le 05/09**, la ligne ci-dessus est un instantané daté et reste telle quelle. Le jeton ne vit plus dans `app.js`, le serveur lit `IDEES_TOKEN2` avec **repli fermé**, et un **test permanent** refuse tout secret en clair dans les fichiers servis.
> 2. **Brancher `listUsers` dans Profil → Admin** : on ne sait pas combien de séances Emma a faites, ni personne d'autre. On mesure tout sauf l'usage.
>
> **📊 Ce que les retours ont appris sur la MÉTHODE**
> - Christophe trouve en une minute (« il manque lombaires ») ce que **dix versions de relecture** n'ont pas vu : on a audité le contenu du catalogue sans jamais ouvrir **l'écran qui sert à créer un exercice**. *Un audit exhaustif d'un domaine ne dit rien de sa porte d'entrée.*
> - **Tatiana « a du mal »** alors que son retour du 19/07 était très positif. L'écart entre « ça me plaît » et « je m'en sers » ne se comble pas en ajoutant des fonctionnalités. **À comprendre avant de construire quoi que ce soit pour elle.**
> - **Eline s'y met** — moment fragile, l'app doit être simple, pas complète.
>
> **⏭️ Le grand chantier, toujours ouvert : le RÉGIME DU PROMPT** — ~58 000 caractères envoyés à Milo, dont l'écrasante majorité en consignes. Les rendre **conditionnelles à la mission**, avec un plancher inconditionnel : la **sécurité** part toujours. ⚠️ Ne PAS rogner sur les faits (calendrier, dates, prénom, historique) : ils coûtent peu et évitent les erreurs.
>
> **📏 En attente d'arbitrage Michel** : ouvrir la mémoire élargie à tout le monde (aujourd'hui michdu75 + christophe, `_memoireLargeOn()`) · les 19 anciennes pop-ups trop longues (R25) · faire descendre les distinctions fines de la figurine dans les fiches (pectoral en 3 = 55 fiches, adducteurs 9, soléaire 3, trapèze inférieur 7) · étapes 2 et 3 de l'identifiant stable.

> ### 🗄️ ÉTAT AU 28/07 (soir) — conservé pour mémoire
> ⚠️ **Ce bloc se REMPLACE, il ne s'empile pas.** C'est un instantané, pas un journal (le journal est dans `CLAUDE.md`). Un fichier « à lire en premier » qui s'allonge cesse d'être lu.
>
> **🔥 Ce qui a occupé les deux derniers jours**
> - 💚 **La carte de récupération** : l'anneau fini (dégradé conique rouge→vert, relief de tube, lueur qui tourne, ft-v640→644) **puis une DEUXIÈME apparence au choix** dessinée par Michel — le style « moniteur » (chiffre à gauche, jauge ouverte à droite, tracé d'ECG au centre), ft-v645→648. **L'anneau reste le défaut** : ce n'est pas un remplacement, c'est un choix dans Menu → Apparence.
> - 🧩 **Le check-in replié passe en 3 tuiles** (sommeil / énergie / moral) avec relief, ft-v650/651. On lit son état **sans lire**.
> - ⚖️ **Règle d'or #11 amendée** (décision de Michel) : **la pop-up se mérite** — seulement si la personne doit *faire* quelque chose, ou si un repère a bougé. Les points 2 à 5 (point rouge · aide `?` · aide détaillée · guide) restent systématiques. Déclencheur : 3 pop-ups en deux jours, dont 2 sur la même carte.
> - ✂️ **`CLAUDE.md` scindé en deux** : 33 000 → ~13 000 mots. Les 12 règles d'or **en entier** vivent désormais dans `docs/REGLES-OR.md` ; `CLAUDE.md` n'en garde qu'une ligne chacune. Cohérence vérifiée par `python3 tools/check_regles.py` (qui surveille aussi la longueur du journal récent).
> - 🙋 **Le bug du PRÉNOM** (ft-v652) : Milo ne l'avait **jamais** reçu — alors que le prompt lui demandait de l'employer (R8 : *un prompt ne compense jamais une donnée absente*). Et le prénom était **introuvable dans l'écran Profil**. Les deux corrigés.
> - 🛡️ **LE GARDE-FOU DES DONNÉES** (né de l'intuition de Michel après le prénom) : `node tests/donnees/runner.js` exige que **chaque** donnée chargée par `load()` soit classée face à Milo — transmise · exclue avec la raison écrite · trou connu. Une donnée non classée **bloque la livraison**. → règle **R4a**.
>
> **📏 Ce que la mesure a révélé — le sujet du moment**
> Le contexte envoyé à Milo fait **~45 400 caractères** : **91 % de consignes**, **9 % de connaissance sur la personne** (144 lignes d'instructions, 42 « JAMAIS »), et il ne voit que les **5 dernières séances** (`S.sessions.slice(0, 5)`).
> ⚠️ **À ne pas mal lire** : ce n'est pas « Milo n'a que 9 % de mémoire » — **48 des 90 données lui sont bien transmises**. Le 9 % est un volume de **texte**. Le problème, ce ne sont pas les 4 000 caractères de données, ce sont les 41 400 de consignes qui les **noient**.
>
> **⏭️ LA PROCHAINE GRANDE TÂCHE (spécifiée, PAS commencée)** : **le régime du prompt** — rendre les consignes **conditionnelles à la mission en cours** (pas besoin des règles de nutrition quand on demande une séance), **avec un plancher inconditionnel** : les règles de **sécurité** (blessures, contre-indications, Gardien) partent **toujours**.
>
> **🕳️ Les trous connus : 3 restants** (ft-v654 a comblé le pire — `nextPlanned` : Milo reçoit enfin la séance que tu lui as annoncée, et l'Accueil et le chat lisent désormais la MÊME règle). Restent : ① `programmes` (il ne connaît pas ton planning quand tu lui demandes quoi faire) ② `customExercises` ③ `exRestPref` (tes 240 s au squat, ignorés).
>
> **🐛 Deux bugs trouvés dans la foulée du garde-fou (28/07, tard)** : ① **la date du jour était celle de Greenwich** → entre minuit et 2 h, une séance était datée de la veille (corrigé ft-v655, `tests/dates/runner.js`) ② **« Mes discussions » s'ouvre sur une liste vide** alors qu'une conversation est à l'écran — le bouton s'affiche dès qu'un fil existe, mais seul le « + » range une discussion. **⏭️ À FAIRE, validé avec Michel** : la discussion en cours apparaît en tête marquée « en cours » · le bouton ne s'affiche que s'il y a quelque chose à ouvrir · **et surtout : on arrête de couper le fil aux 20 derniers messages** (aujourd'hui, fermer l'app perd silencieusement le début d'une longue conversation — c'est le seul des trois où on perd vraiment quelque chose).
>
> **✅ LES 4 CHANTIERS DES 28-29/07 SONT TOUS CLOS** — conversation coupée **(ft-v656)** · questionnaire qui se répète **(ft-v657)** · check-in déplié **(ft-v661)** · « c'était celle-là ✓ » **(ft-v662)**. S'y sont ajoutés en cours de route, tous livrés : la date du jour à l'heure du téléphone **(ft-v655)**, le calendrier donné à Milo **(ft-v658/659)** et les jours du passé **(ft-v660)**.
>
> **⏭️ LE GRAND CHANTIER QUI RESTE — le régime du prompt** : ~46 000 caractères envoyés à Milo, dont **91 % de consignes** contre 9 % de connaissance sur la personne. Rendre les consignes **conditionnelles à la mission**, avec un **plancher inconditionnel** : les règles de **sécurité** partent toujours. ⚠️ **Ne PAS rogner sur les faits** (le calendrier, les dates, le prénom) — ce sont eux qui empêchent les erreurs, et ils ne coûtent presque rien.
>
> **⏭️ Angle mort signalé par Michel (29/07), à traiter avec le régime** : il teste Milo sur le **modèle haut de gamme**, les utilisateurs ont le cran en dessous (**R9**). Les bugs de **donnée** (dates, prénom) touchent tout le monde pareil, mais les règles de **comportement** (ton, anti-interrogatoire, Gardien) se relâchent sur un modèle plus léger — et il ne peut pas le voir. Proposition en attente : un interrupteur « voir Milo comme un utilisateur normal » dans l'Admin.
>
> **✅ COMBLÉ (ft-v667) — les 86 exercices sans muscles.** Trouvé le 29/07 en répondant à *« sur tous les mouvements tu as vérifié ? »* : 86 des 287 exercices (30 %) n'avaient aucune correspondance musculaire (figurine vide). Réglé par ~25 règles de **rattrapage par famille** placées **à la fin de `_MEX`** (le moteur s'arrête au 1ᵉʳ motif → zéro régression par construction). Vérifié exercice par exercice : **0 modifié · 81 nouveaux · 0 restant**. Garde-fou : `node tests/muscles/runner.js` refuse que le compte remonte au-dessus de 0. ⚠️ **Règle à tenir** : ne JAMAIS insérer une règle précise APRÈS le bloc de rattrapage — elle serait morte (un test structurel le vérifie).
>
> **⏭️ OUVERTS avec Michel le 29/07 (soir)** — ① **Le CARDIO début vs fin de séance** : l'app ne stocke qu'un type + une intensité + une durée, sans savoir **quand**. Or un vélo d'échauffement (monter en température) et un cardio de fin (conditionnement, dépense, effet réel sur la récup) n'ont rien à voir. ⚠️ **Et il y a un double comptage** : `calcSessionCalories` ajoute **systématiquement** 10 min d'échauffement forfaitaires — si tu enregistres en plus ton vélo d'échauffement dans le bloc cardio, il compte deux fois. À faire : un champ « avant / après », l'échauffement remplaçant le forfait. ② **Enrichir le catalogue** : exercices à l'**élastique**, **mobilité**, **abdos et variantes**. Les règles par famille de `_MEX` (ft-v667) attraperont automatiquement les nouvelles variantes. ⚠️ **La mobilité posera une question à part** : ce n'est ni de la force ni du cardio — lui donner une intensité de musculation serait faux.
>
> **✅ COMBLÉ (ft-v670) — les schémas de mouvement.** 27 exercices (11 %) n'en avaient aucun → « accessoire » par défaut pour Milo + garde-fou anti-fusion désactivé. Ajout de **`porte`**, **`halterophilie`** et **`saut-plyo`** d'après la taxonomie de référence (pousser · tirer · flexion de genou · charnière de hanche · rotation · porter), + les 4 mal classés rattachés. **27 → 7**, et les 7 restants sont de vrais accessoires. `halterophilie` est une ANCRE (un arraché n'est pas un accessoire) ; `porte` et `saut-plyo` **non** (un burpee ne doit pas devenir le pivot d'une séance) — R29.
>
> **⏳ En attente de Michel** : les captures pour les diapos du Guide (ft-v612/614/615/617/620/622) · la règle de limitation de débit Cloudflare.
> **⏳ Dettes connues** : ① **ce fichier doit être retaillé à 1 vraie page** (de vieilles photos empilées plus bas) ② refonte 2-rangées du header (parkée depuis ft-v611) ③ le logo (« il est moche », 6 juillet).
> **⏳ Restent clone-only** (ne pas promouvoir tel quel) : badge Gardien, questions illimitées, couplage blessure-retenue→Santé (ft-v588).

---

## 🎯 RESTE À FAIRE (état au 23/07 au soir — reprise ici)

**Fait ce soir :** allègement CLAUDE.md (451→84 Ko + `docs/JOURNAL-ARCHIVE.md`) · Gardien de la Constitution **Étage 1** (clone, ft-v591) · **P24 « engagement responsable »** gravé (Constitution v2.2) · **les 2 moments Milo** gravés (`docs/PRESENCE-MILO.md`) · **Moment 1** fix comportemental (mal au ventre / docteur / re-demande, prod, ft-v593/595) · toggle clone **10 ⇄ illimité** (ft-v594) · **FRAMEWORK DE TESTS DE MILO** (noyau dur, 9 scénarios verts, `node tests/milo/runner.js` — `docs/FRAMEWORK-TESTS-MILO.md`).

**À reprendre :**
1. **[Michel] Valider le clone (ft-v595)** : refaire l'inscription, tester « j'ai mal au ventre » + demander une séance → Milo aide d'abord, ne redemande pas la salle, ne joue pas au docteur, pas d'interrogatoire.
2. **[Claude, après ①] Promouvoir en prod** le lot « comportement » (anti-interrogatoire + moment-Milo + blessure retenue → Gardien ft-v588) + checklist #11.
3. **[Claude] Lancer proprement la QUESTION GUIDÉE** (chips réponses rapides, clone-only ft-v585→590) quand validée = checklist #11 complète.
4. **[Chantier] MOMENT 2 « Milo se souvient de moi »** : surfacer la mémoire au retour (session 2). Pas commencé = la prochaine grande brique.
5. **[Tests] Élargir le corpus** au fil des bugs · construire le **Tier 2** (éval IA, minimal) · éventuelle GitHub Action pour le noyau dur.
6. **[Cross-IA en cours]** retours attendus : GPT/Gemini/Mistral sur le **framework de tests** · GPT sur le **« moment Milo »** · Gemini/Mistral sur l'**archi cerveau/cervelet** (pas encore envoyé). → à leur retour : synthèse + graver (dont le principe archi durable « **les faits viennent des moteurs, jamais inventés par le LLM** »).
7. **[Ne JAMAIS promouvoir — reste clone]** questions illimitées (toggle) + badge « 🛡️ Gardien » (outil de mesure).
8. **[Ouvert, rien à coder]** modèle éco (P24 gravé, implémentation LAISSÉE OUVERTE ; intermittence Gemini notée dans `IDEES-FUTURES.md`) · Gardien Étage 2 (option future).

⚠️ **Note dette technique :** ce fichier CONTEXTE-ACTUEL est devenu trop long (comme l'était CLAUDE.md) — à alléger un jour (garder 1 page + déplacer le vieux vers l'archive).

---

- **⚖️ PHILOSOPHIE DE MILO gravée — Constitution v2.1 (22/07, soirée, doc-only)** : reframe **confiance > empathie** (on ne fait pas un Milo « empathique », on fait un Milo digne de confiance ; l'empathie est dans ses **actes**, pas ses mots). **Principe 22 (capstone) « Le respect de la liberté de l'utilisateur »** (ne présume pas · ne décide pas à ta place · ne passe pas outre une limite · garde sa franchise mais te laisse le dernier mot · mémoire = tremplin jamais prison · **l'humilité** = diagnostique la barre jamais l'âme). **Principe 23 « Ne jamais confisquer le récit ; le réconfort n'est jamais une stratégie »**. Renfort P17 (interdits femmes). Mission : que chacun·e se sente compris·e, en particulier les **femmes** (phrase de Tatiana : « à quoi sert une appli à une femme si c'est juste pour rentrer des données ? »). Synthèse Michel + Claude + GPT + Gemini + Mistral. Détail : `CONSTITUTION-MILO.md`, `docs/VISION-FORCE-TRACKER.md`, `docs/MOTEUR-RAISONNEMENT-MILO.md`, `docs/PRESENCE-MILO.md`.

- **📱 NATIF — stratégie cadrée (22/07, croisement Gemini + Mistral + Claude + synthèse Michel · `docs/STRATEGIE-NATIF.md`)** : intention de passer en natif/hybride, **préparé sans rien coder ni bloquer les chantiers en cours**. Principe directeur (Michel) : *« le natif n'apporte que ce que le web ne peut pas offrir »*. Chemin = **coque Capacitor, zéro réécriture** (on garde tout) ; approche **progressive** des plugins (au besoin réel, pas « tous en V1 ») ; priorité objets connectés > push > stores ; monétisation au lancement = premium **serveur** (esquive la taxe Apple). Le **modèle est déjà prêt** (`MODELE-METIER.md` Principe n°2 : indépendant du mode d'acquisition). **⏭️ À décider avec Michel : le TEMPO** (quand démarrer) — pour l'instant, cap futur préparé.

- **🍽️ NUTRITION — esprit gravé (ft-v577, croisement Gemini + Mistral + Claude + synthèse Michel)** : phrase-boussole *« la nutrition est un moyen d'améliorer santé/récup/perf ; jamais une source de stress > bénéfice »* (**P21**). Principes : levier au service de l'objectif · optionnelle jamais bloquante · **précision au CHOIX (4 niveaux : qualitatif → portions → macros → suivi précis)** · fiabilité > exhaustivité (±20-50 %, tendances + fourchettes) · local d'abord + fallback fait-maison · qualité gratuite Nutri-Score/NOVA · anti-TCA (Gardien nutrition = seuils d'alerte). **1ʳᵉ brique proposée** = journal léger « à la portion » sur Open Food Facts. **⏭️ Prochaine étape avec Michel : choisir/prioriser cette 1ʳᵉ brique à coder.** Détail : `docs/NUTRITION-PHILOSOPHIE.md`.

- **🧠 CHANTIER ACTIF — LE MOTEUR DE RAISONNEMENT DE MILO (le « cerveau »)** *(réflexion fondatrice Michel 22/07, cadre : `docs/MOTEUR-RAISONNEMENT-MILO.md`)* : passer du « générateur de programmes » au **raisonnement** (Compréhension → **Diagnostic** → décision → explication). Chaque brique = une **PIÈCE** du moteur, prompt-only (0 backend), invisible à l'utilisateur. **Pièces posées :**
  - `ft-v571` — **base du moteur** : bloc « savoir raisonner + savoir s'arrêter » (Constitution **Principe 18**).
  - `ft-v572` — **1ʳᵉ pièce (Cerveau 2)** : exercices **« ancre » vs « accessoire »** (`_exRole`, déterministe) — construire autour des ancres.
  - `ft-v573` — **2ᵉ pièce (Cerveau 1)** : **profil conversationnel** (étape 1 « comportement ») — Milo apprend en discutant.
  - `ft-v582` — **2ᵉ pièce, étape 2 : la MÉMOIRE DURABLE** — Milo propose de retenir un trait durable confié en discutant (bloc caché `{"retiens":[…]}` → « 🧠 Je retiens : … ? [Oui][Non] ») → validé = rangé dans `S.registre.observations` (`source:'conversation'`), réutilise l'infra Observations + « Ce que Milo sait de toi ». Rien sans accord (P3). ⚠️ émission = prompt → à valider iPhone.
  - `ft-v574` — Milo connaît enfin tes **objectifs chiffrés** (force par exo + poids objectif) → répond à « c'est atteignable en combien de temps ? ».
  - `ft-v575` — **PRINCIPE DE CONCEPTION** « **La pertinence avant la disponibilité** » (+ « la cohérence avant la réactivité ») — né du sujet IMC, croisement GPT/Gemini/Mistral/Claude. **DEUX ÉTAGES : Milo raisonne · le Gardien protège** (seuils absolus IMC ≥ 40 · tour de taille > 120). Constitution **Principes 19 & 20 (v1.9)**.
  - `ft-v576` — nuance UX « **répondre d'abord, proposer ensuite** » : l'absence d'une donnée = une opportunité, jamais un blocage (corollaire P19).
  - ⏭️ **Prochaine pièce** : Observations (Cerveau 1 affine + Cerveau 2 réévalue) · générateur de programme (sortie du Cerveau 2). ⏳ **Couche future** : veille longitudinale des signaux faibles + montre connectée (non collectées).
- *(⏸️ parqué en arrière-plan : INDUSTRIALISATION VM — étapes 1/2 faites `ft-v526/527` ; restent ③ couche machine user-fed · ④ tests réels · ⑤ enrichir EXLIB. À reprendre après le cerveau.)*
- *(ancienne note ft-v526 : VM câblé sur l'import HISTORIQUE — `_vmMatchHist`, plus de doublons ; ~378 alias GPT, `_EX_EQUIV`=406 clés)*
  - **🏗️ Phase industrialisation lancée (GO Michel)** — ordre : **① VM finalisé ✅ (import historique câblé, ft-v526)** → **② Confirm en un geste ✅ (figurine + ✓/✕, import prog+journal, ft-v527)** → ③ couche machine (MVP user-fed) → ④ tests réels programmes variés → ⑤ enrichir EXLIB au fil du réel. **⏳ À TESTER PAR MICHEL (iPhone)** : importer un vrai programme + un vrai journal → vérifier les rattachements auto (verts) + les propositions ✓/✕.

- **🔭 TOUR DE TABLE IA EXTÉRIEURES (20/07) — décisions d'archi VM prises** (détail : CLAUDE.md, méthode : `docs/PROCESSUS-DEVELOPPEMENT.md`) : avis croisés GPT + Gemini + Mistral sur le chantier VM. **Méthode adoptée** : convergence de regards indépendants = décision d'archi ; divergence = débat. **2 décisions** : ① couche machine = **user-fed d'abord** (le risque = les médias, pas le code) ; ② graphe **simple & dérivé** (14 schémas, pas de parsing exhaustif). **+ Principe** : palier « confirm » de l'import = **un TAP, pas un formulaire**. **Prématuré → IDEES-FUTURES** : matériel connecté (montre), modèle éco approfondi, export JSON/CSV. **Prochaine brique quand on construira = la couche machine.**
  - **🏛️ FRONTIÈRE VM / GARDIEN actée** (dernier doc GPT) : *le moteur VM identifie/structure les MOUVEMENTS ; le Gardien décide quoi FAIRE de cette connaissance* (remplacements, contre-indications, adaptations douleurs = métier du Gardien, pas du parsing). ✅ **Ratifiée par Michel → Constitution v1.5, Principe 15 « Le moteur comprend, le Gardien décide » (20/07)**.
  - **🏗️ CHANGEMENT DE PHASE — GO donné par GPT (20/07) → en attente GO Michel** : fin de la phase « grandes idées », début de l'**industrialisation**. **Ordre convenu (GPT + Claude)** : ① **finaliser VM** (câbler import historique) → ② **construire Confirm** (validation reconnaissance en un geste) → ③ **couche machine (MVP user-fed)** → ④ **tester avec de vrais programmes variés** → ⑤ **enrichir EXLIB uniquement à partir des cas réels**. Nuance actée : **Confirm AVANT Machine** (le confirm de reconnaissance ✓/✕ se construit d'abord, la photo machine s'y greffe ensuite). Conseil GPT : « ne plus chercher de grandes idées — le moteur doit apprendre du réel ». Les 4 IA (GPT/Gemini/Mistral/Claude) alignées sur « construire ».
- **Branche de travail :** `claude/claude-md-docs-ytabnv` — fusionnée sur `master` à chaque livraison.
  ⚠️ *(La version live se lit **en haut de ce fichier**, pas ici : cette ligne annonçait encore
  « live = ft-v670 » le 18/08, soit 230 versions de retard. Un état écrit à deux endroits diverge
  toujours — R2.)* *(session Claude Code web)*
- **Dernier point de sauvegarde :** ⭐ `backup-2026-07-20-pt001-valide-ft-v504` (milestone à jour)
  *(voir la table complète dans `DOSSIER-ATHLETE-SUIVI.md`)*

- **🧪 PROTOCOLE DE VALIDATION (nouveau, `ft-v497`) — PT-001 « Continuité mémoire »** :
  outil **admin** qui rejoue TOUT l'historique → Milo débriefe chaque séance + vérifie
  l'objectif de la fois d'avant, finit par « Qui suis-je en tant que sportif ? », et
  produit un **rapport exportable** (texte + PDF : timing, saturation, continuité,
  verdict + 7 axes GPT). Valide à 3 (Michel/GPT/Claude). C'est le **1ᵉʳ d'une série de
  protocoles** (PT-002 Gardien · PT-003 Observations · PT-004 ADN · PT-005 Onboarding).
  → **✅ 1ᵉʳ RUN RÉEL FAIT ET VALIDÉ (20/07)** : 20 séances, **20/20 réponses valides**
  (après le fix du bug 400), mémoire 20/20, **continuité d'objectif réelle ~95 %**
  (détecteur corrigé v504), **portrait « Qui suis-je ? » réussi** (décrit la personne).
  Preuves de suivi : saga hip thrust + « 105 OBJECTIF TENU, bravo ». Seul 🔴 = saturation
  = **artefact du rejeu Opus en rafale**, PAS Milo en réel (~14 s/débrief en vrai).
  Détail : `DOSSIER-ATHLETE-SUIVI.md` (§ Résultats du 1ᵉʳ run). *« On construit une méthode
  de validation reproductible, plus seulement des fonctionnalités » (GPT).*
  - **🏛️ CADRE ADOPTÉ — Laboratoire à 2 piliers VT / VC** (idée Michel, structurée GPT,
    19-20/07) : **VT** = Vérifications Techniques = les PT-xxx (le système marche) ·
    **VC** = Vérifications Comportementales = rejouer des **personas** (sportifs fictifs
    détaillés avec « attendus ») pour garder Milo cohérent/bienveillant/fidèle = filet
    **anti-régression de personnalité**. Garde-fous Claude : juge humain d'abord (IA-juge
    plus tard si prouvé), chaque persona a son « attendu », **semer depuis les VRAIS
    testeurs** (Tatiana = 1ᵉʳ VC) + la Constitution, **commencer PETIT** (5-6), le labo
    SERT la feuille de route sans la remplacer. Détail : `DOSSIER-ATHLETE-SUIVI.md`.
    ✅ **FAIT (`ft-v505`)** : format persona **v1.0 (7 rubriques)** figé + **harnais VC** (injection
    sûre : gel + snapshot + `load()` → données réelles intactes, testé) + **VC-001 Tatiana bâti**.
  - **🎭 VC-001 — état (20/07) :** **le COMPORTEMENT de Milo est conforme** (runs 3→6 : 5/5 attendus —
    il DEMANDE l'objectif, ne présume pas, n'invente pas « rattrape ton haut du corps »). MAIS les
    runs sur l'iPhone de Michel **fuitent encore ses données dans le contexte** — non pas un bug du
    code (v507 prouvé propre : git HEAD OK + Playwright 0 fuite), mais **iOS qui garde le vieux SW
    v506 en service** malgré l'affichage « 507 ». **→ SOLUTION : le `/clone/` devient le labo**
    (idée GPT). Le clone a un SW `cache:'no-store'` → exécute TOUJOURS le dernier code (aucune version
    périmée) + isolation `cl_`. Clone régénéré depuis prod ft-v507 (porte le harnais VC/PT + le fix).
    ✅ **VC-001 VALIDÉ (20/07, `ft-v508`)** : sur le clone (code frais), run 8 = contexte propre + Milo
    **5/5 attendus** (ne présume/impose rien, n'invente plus les genoux — ils sont déclarés cette fois).
    **Verdict CONFORME acté à 3** (Michel + GPT + Claude). 2ᵉ fuite trouvée+corrigée au passage
    (`coachQuiz`/`coachQuizPro`). Leçon GPT adoptée : *les attendus doivent coller EXACTEMENT au persona envoyé*.
  - **🎭 Bibliothèque VC (au 20/07, `ft-v509`) :** **VC-001 Tatiana** ✅ validé · **VC-002 Christophe**
    (confirmé qui a déjà un coach humain → Milo respecte/complète ? · testé **sur Sonnet**, son vrai modèle) ·
    **VC-003 Emma** (femme en règles + keto → ressenti prime, adaptation cycle, respect keto · Haiku).
    Harnais gère le **modèle-par-persona** (`coachEmail`) + cycle simulé (`cycleStartDaysAgo`) + keto.
    **✅ Conception validée par GPT (20/07)** : « attendus précis, observables, adaptés à une validation humaine ».
    Ses 2 points de vigilance sont **déjà couverts par les attendus** (VC-002 = Milo trop effacé → attendu 3 « compléter » ;
    VC-003 = reconnaître la fatigue avant les scores → attendu 1). 3 piliers couverts : comprendre avant de conseiller ·
    respecter un coach humain · faire primer le ressenti. ⏳ **PROCHAIN PAS : Michel lance VC-002 & VC-003 sur le clone** → verdict par attendus.

- **Chantier actif :** 🧠 **Dossier Athlète / Milo** (donner à Milo une mémoire
  durable + une vraie personnalité de coach).
- **Brique en cours :** — **3B CLÔTURÉE** (`ft-v471`, **validée Michel** : « 3B
  validé », « nickel »). Affinée (`ft-v472→v473`) : le ressenti nourrit le score —
  l'énergie l'ajuste en douceur, une **douleur ne fait pas chuter le chiffre** mais
  affiche un bandeau ⚠️ (« adapter, pas interdire »). Testeurs prévenus par un
  pop-up dédié (`ft-v474`). ⏳ À faire plus tard (IDEES-FUTURES) : **réduire la
  carte** de l'état du jour (elle encombre le haut de l'Accueil). **Restent en
  attente de validation réelle : 5A · 6A · 6B.** Briques 0–4A + 3B CLÔTURÉES ;
  Constitution v1.3 ; **Vision** gravée. Toutes les briques 0→6B **bâties** ;
  ensuite **5B** (observations IA).

- **Dernières décisions validées :**
  - Ton de Milo : « Laisse Milo choisir » (auto) par défaut, manuel = secours.
  - Registre Athlète (mémoire) + 7 faits mesurés, invisibles, règle d'or « un fait = une décision ».
  - Milo « comprendre avant de conseiller » (rupture d'habitude → question douce d'abord).
  - **Le ressenti de la personne prime toujours sur les chiffres** (ne jamais
    contredire « je suis HS » avec « ta récup est au top »).
  - **Nouvelle méthode de validation : les 4 axes** (fonctionnelle · technique ·
    situation réelle · philosophie de Milo) — adoptée à la clôture de la brique 3.
  - **Devise officielle** : « Force Tracker s'adapte au sportif. Le sportif ne
    s'adapte jamais à Force Tracker. »
  - **Le Gardien (brique 6) ADAPTE, il n'interdit pas** — adaptation par défaut,
    arrêt total = exception (Principe 13). Pas de « moteur de décision » séparé :
    c'est le rôle du Gardien.
  - Constitution de Milo **v1.9** (20 principes). Derniers en date (22/07) :
    **P15** « Le moteur comprend, le Gardien décide » · **P16** respecter le
    travail des coachs · **P17** l'accompagnement jamais la thérapie · **P18**
    fiabilité avant intelligence (savoir raisonner + savoir s'arrêter) · **P19
    « La pertinence avant la disponibilité »** (une donnée n'est utilisée que si
    elle améliore la décision ; deux étages Milo/Gardien ; transparence ciblée ;
    l'absence d'une donnée = opportunité, répondre d'abord proposer ensuite) ·
    **P20 « La cohérence avant la réactivité »** (raisonner sur les tendances, pas
    le bruit). Rappel P14 « Miroir, jamais prophète » (garde-fou des briques 7 & 8).
  - Méthode de documentation : CLAUDE.md = page d'accueil, détails dans `/docs/`.
  - **Vision d'identité « présence de Milo »** (`docs/PRESENCE-MILO.md`) : Milo → App,
    présence sans gadget, jamais un passage obligé — **cerveau d'abord, présence ensuite**.
  - **La DESTINATION = architecture en 8 briques** (cadrage ChatGPT, gravé dans la
    Vision) : 0 Personnalité · 1 Mémoire · 2 Cerveau · 3 État du jour · 4 ADN ·
    5 Observations · 6 Gardien · **7 Mémoire vivante** (tendances sur plusieurs
    années) · **8 Synthèse** (prendre du recul sur toute son histoire). **7 et 8 =
    la finalité** (miroir jamais prophète ; dernières par nécessité — besoin de
    temps + données). Tout le reste (5B, « Milo construit ta séance »…) = affinages
    À L'INTÉRIEUR des briques, pas de nouvelles grandes briques.

- **🎯 ORDRE DES PRIORITÉS (recentrage GPT du 19/07 — « revenir au cœur du projet ») :**
  **1. Effet Waouh à l'inscription** (accueil perso et marquant — le nouveau comprend tout
  de suite que ce n'est pas un carnet) · **2. Débrief auto de fin de séance** *(déjà
  LARGEMENT FAIT : écran de fin `ft-v492` + débrief à l'ouverture du Coach `ft-v491`)* ·
  **3. Mémoire réellement exploitable** (Milo ressort l'info au bon moment, des semaines/mois
  après = Étapes 2/3 du débrief + brique 7 — « le plus important » selon GPT) · **4. Import
  auto des programmes** (Milo agit, en 1 clic — *à moitié bâti* : `_saveForceProgram`) ·
  **5. Traduction ensuite** (levier de croissance Tatiana, mais après le cœur ; déjà bien
  avancée sur le clone — voir `IDEES-FUTURES.md` + `RETOURS-TESTEURS.md`).
  → **✅ SÉQUENCEMENT TRANCHÉ = OPTION C (alignés à 3, Michel/GPT/Claude, 19/07)** : GPT
  distingue *priorités de dev* vs *priorités d'impact utilisateur* — la **mémoire (#3)** sert les
  utilisateurs **déjà là**, l'**onboarding (#1)** sert les **nouveaux** (pas le même problème).
  Donc : **(1)** Claude construit la **mémoire (#3)** + boucle l'**import (#4)** (déjà engagé) ;
  **(2)** EN PARALLÈLE, Michel + GPT **conçoivent** l'onboarding à fond (UX, dialogues, parcours,
  perso) **sans le coder tout de suite** ; **(3)** mémoire finie → on **enchaîne sur un onboarding
  déjà mûri**. ⚠️ L'onboarding n'est plus un simple écran = **mini-projet** (accueil perso, niveaux,
  effet Waouh) → concevoir avant de coder. Répartition qui colle au modèle « équipe IA »
  (`README-IA.md`) : Claude=dev, Michel+GPT=vision/UX, puis Claude exécute.
- *(ancienne note : « Inscription + premier accueil » restait le prochain gros chantier ;
  le moteur nutrition local vient après. Toujours valable, replacé dans l'ordre ci-dessus.)*
- **En parallèle (Milo) :** Michel teste en réel les briques encore en attente
  (**5A / 6A / 6B**) → validation 4 axes → clôtures. Ensuite **5B** (observations
  IA générées) ou la **réduction de la carte état du jour** (compacte repliée).
- **En discussion (gouvernance, non bloquant) :** le Principe 14 « Milo enrichit le
  jugement… » est **tranché** → devenu **Principe 14 « Miroir, jamais prophète »**
  (Constitution v1.4). Reste ouverte : la posture d'équilibre exigence/protection
  dans le comportement de Milo (à mûrir tranquillement).

- **Blocages :** aucun.

---

### 🗺️ Où lire quoi
- **Règles + vision + version** → `CLAUDE.md` (page d'accueil, auto-chargé chaque session).
- **Principes permanents** → `CONSTITUTION-MILO.md`.
- **Méthode de travail** → `docs/PROCESSUS-DEVELOPPEMENT.md`.
- **Chantier Milo (détail brique par brique)** → `DOSSIER-ATHLETE-SUIVI.md`.
- **Idées / à faire plus tard** → `IDEES-FUTURES.md`.
- **Backend à déployer depuis le PC** → `A-FAIRE-SUR-PC.md`.
