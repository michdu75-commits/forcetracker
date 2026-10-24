# Diagnostic MET — les calories d'une séance et le catalogue d'exercices

> **24/10/2026 · ANALYSE SEULE — mission Séance de Michel, § « diagnostic MET séparé ».** Le moteur calorique est **gelé**
> (consigne de Michel : *« ne modifie pas les coefficients MET ni l'algorithme calorique global sans un GO distinct »*) :
> **rien ici n'est appliqué**, les recommandations sont **simulées dans des copies** et chiffrées. Destinataires : Michel,
> puis Claude Principal (intégration).
>
> ✅ **REJOUÉ ET VÉRIFIÉ par la session Séance** (le brouillon venait d'un agent qu'elle avait lancé) : le banc a été
> relancé sur la tête finale de la branche (`git archive`, réseau coupé) — **13 scénarios sur 13 identiques** à ceux du
> brouillon, au chemin de l'arbre près (la seule autre différence : la DATE affichée sur une carte, le jour de l'essai).
> Recomptés à la main : catalogue **359 / 322 / 13 / 36 / 334** ; classes **97 / 122 / 87 / 16** ; **33** douteux ;
> séances **337 / 398 / 156** ; séries cochées en bloc **211** au lieu de 337 ; cardio d'après **488** au lieu de 427 ;
> « … sur tapis » à **8,0** ; second chiffre « 🔬 ~287 ». Le moteur (`app.js`) est **identique à l'octet** à master.
>
> **Légende de chaque chiffre** — **mesuré** : obtenu en exécutant le vrai code de l'app (copie hors dépôt, réseau
> coupé, données fictives) · **lu** : constaté en lisant le code · **doc** : repris d'un document du dépôt, non
> revérifié ici · **recherche web** : extrait d'un moteur de recherche, page source **non ouverte** (accès refusé).
> Les lignes citées sont celles du HEAD **84ac1a81** (branche `claude/dreamy-bell-pu88ia`). Celles d'`app.js` n'ont pas
> bougé depuis ; celles de `log.js` et `setup.js` ont glissé avec les lots 2 à 5 (chercher la fonction nommée).

## En bref

1. **Le total d'une séance dépend surtout de sa durée** : sur la séance type Pecs/Épaules de 60 min, 73 % du chiffre vient de « 3 MET × durée », 14 % d'un forfait fixe de 10 min d'échauffement, et 13 % seulement du type d'exercice et de la charge (mesuré ; décomposition exacte, 0 kcal d'écart sur 400 séances).
2. **Le catalogue : 322 exercices au choix** (359 appartenances, 13 groupes) **+ 12 retirés encore calculés** ; tous ont leurs muscles écrits ; **33 classements douteux** (Oiseau 5,5 contre 4,0 aux élévations latérales, Sissy squat 6,5…), tous causés par la règle « 3 muscles ou plus = polyarticulaire » — mais ils pèsent peu (−5 kcal sur la séance Pecs/Épaules).
3. **Ni le sexe, ni la discipline du profil, ni les repos réglés par exercice n'entrent dans le calcul** : seul le poids compte ; powerlifting et bodybuilding ne diffèrent que par la durée, les répétitions et le % du max (8 % d'écart à durée égale).
4. **Trois cas faussent vraiment le chiffre** : des séries cochées en bloc (211 kcal au lieu de 337), une durée saisie à la main (+48 kcal de forfait par-dessus), une séance importée sans durée (227 à 497 kcal selon le repos réglé). Les deux premiers ont une recommandation simulée ; le troisième est à signaler à l'écran.
5. **Aucune valeur n'a jamais été validée par une mesure métabolique** : le seul repère est la montre de Michel (elle calcule d'après le cœur), sur une seule personne. Et l'écran affiche déjà deux chiffres pour une même séance (337 et « 🔬 ~287 »).

---

## 0. Ce qui a été fait, sur quoi

| | |
|---|---|
| **Code mesuré** | Copie de **5a7b0a57** (début du travail), puis copie de **84ac1a81** (HEAD à la fin : le lot 1 de la session Séance a été poussé entre-temps, il touche `log.js` et `setup.js`). **`app.js` — le moteur — est identique octet pour octet** dans les deux. Tout a été rejoué sur les deux : **16 des 17 sorties sont identiques** ; la 17ᵉ (l'écran de détail) ne diffère que par le volume affiché, à cause de mes séances fictives sans champ `volume` — les calories affichées sont les mêmes. |
| **Montage** | Le banc existant `audit_verif/harnais3.js` (K1 à K7) **rejoué tel quel**, puis un banc dérivé (`met_harnais.js`, 18 scénarios) : garde réseau des tests chargé en premier, Chromium sans réseau (adresses non locales abandonnées, service worker bloqué), données **fictives**, un contexte neuf par scénario. Profil fictif : homme, 82 kg, 40 ans, 178 cm, repos par défaut 130 s. Seuls `prompt` (correction de durée) et `toast` sont remplacés — et, dans le seul scénario `SENSI`, deux fonctions du moteur sont remplacées en page pour mesurer leur poids. |
| **Simulations** | 11 copies modifiées, une par recommandation : remplacements bornés (chaque ancre vérifiée unique), `node --check`, puis **les mêmes scénarios**. Faites sur les deux HEAD : **résultats identiques**. |
| **Séances types (fictives)** | **A — Pecs/Épaules, 60 min, 22 séries** : Développé Couché É 40×10, É 60×6, 4×8 à 80 kg · Développé Incliné Haltères 3×10 à 52 · Écarté Poulie 3×12 à 15 · Développé Militaire Haltères 3×10 à 36 · Élévations Latérales 4×15 à 16 · Oiseau 3×15 à 12. **B — Jambes, 75 min, 23 séries** : Squat à la Barre É 60×8, É 80×5, É 100×3, 4×5 à 120 · Press Jambes 45° 3×12 à 180 · Soulevé de Terre Roumain Barre 3×8 à 100 · Leg Curl Assis Machine 3×12 à 50 · Extension Quadriceps 3×15 à 45 · Élévations Mollets Debout 4×15 à 80. **C — Courte, 20 min, 11 séries** : Pompes 3×15 · Rowing Haltère 3×10 à 30 · Curl Haltères 3×12 à 14 · Gainage 2×45 (secondes). Records fictifs posés pour que les séries de travail soient à ~70-80 % du max. Séries **horodatées** sur toute la durée (le cas normal d'une séance faite dans l'app depuis le 12/08), sauf mention contraire. |

---

## 1. Le catalogue, recompté

**Méthode** : scénario `CATALOGUE` de `met_harnais.js`, dans la vraie app : `EXLIB` (la liste du sélecteur,
`constants.js:17`), `EX_IDS` (les identifiants stables, `constants.js:1254`), `EX_MUSCLES` (les muscles écrits,
`constants.js:1782`), `_mscScores` (`log.js:4550`), `_movPattern` (`log.js:3128`). Sortie brute : `sorties_HEAD2/CATALOGUE.json`.

| Mesure | Valeur | Statut |
|---|---|---|
| Appartenances (lignes de `EXLIB`) | **359** | mesuré |
| Noms distincts au choix | **322** | mesuré |
| Groupes | **13** — Fessiers 64 · Jambes 57 · Dos 51 · Épaules 47 · Pectoraux 40 · Triceps 24 · Full Body 17 · Abdominaux 15 · Biceps 13 · Lombaires 12 · Mollets 8 · Trapèzes 6 · Avant-bras 5 | mesuré |
| Noms rangés dans plusieurs groupes | **36** : 35 dans 2 groupes (squats, fentes, presses en Jambes + Fessiers ; Kettlebell Swing en Fessiers + Full Body…), 1 dans 3 (Soulevé de Terre : Dos, Fessiers, Lombaires). 322 + 35 + 2 = 359 | mesuré |
| Identifiants stables | **334** = 322 + **12 retirés du choix mais encore calculés** (Pull-over, Squat Sumo, L-Sit, Turkish Get-Up, Dips Lestés…) : une séance ancienne qui les contient garde ses muscles et ses calories | mesuré |
| Fiches de muscles écrites | **334** (les 322 + les 12 retirés) ; **0 exercice du catalogue sans muscles connus** | mesuré |
| Règles de secours par le nom (`_MEX`, pour les persos et les noms importés) | **71** | mesuré |
| Schémas moteurs (`_movPattern`) | **20**, chaque nom en a un (poussée horizontale 44, élévation d'épaule 38, charnière de hanche 36, squat 34, tirage horizontal 32…) | mesuré |
| **Variantes** (même mouvement, matériel différent) | **au moins 39 familles, 118 noms**. Méthode : le nom sans la parenthèse explicative et sans les mots de matériel (barre, haltère, poulie, câble, machine, Smith, élastique, TRX, kettlebell, landmine, EZ…). Exemples : Rowing ×9 (barre, haltère, câble, machine, Hammer, Smith, T-bar, landmine, TRX) · Squat ×6 · Développé Couché ×5 · Écarté ×4 · Curl ×4. C'est un **minimum** : la méthode ne regroupe pas « Leg Curl Couché Machine » et « Leg Curl Assis Machine » (positions différentes), ni « Oiseau Poulie 45° » | mesuré (heuristique) |

⚠️ **Le dépôt cite plusieurs totaux, aucun n'est « 333 »** (lu) : 322 (`log.js:7688`, `BUGS.md:3586`), 324
(`constants.js:413`, `constants.js:1638`, `log.js:3593`, `log.js:4026`, `docs/MOTEUR-MET-A-COLLER.md`), 340
(`BUGS.md:188`), 355 (`constants.js:1687`). Le chiffre juste aujourd'hui : **322 au choix, 334 calculables**.

**Comment un exercice personnalisé est ajouté** (lu) : `saveCustomEx` (`log.js:7019`) refuse un doublon exact,
propose un exercice proche, et prévient si l'exercice serait « muet » (nom inconnu des règles **et** aucun muscle
coché, `_cexSeraitMuet`, `log.js:7057`) ; puis `_doCreateCustomEx` (`log.js:7064`) range `{nom, groupe, custom:true,
muscles {principaux, secondaires} si cochés, photo}` dans `S.customExercises` (clé `ft4_cuex`) et le signale de façon
anonyme. **L'import** crée les noms inconnus en `{nom, groupe 'Autres'}` **sans muscles** (`log.js:8031`, `log.js:8541`).

---

## 2. Chaque coefficient du moteur, sa valeur, sa source

Le moteur vit dans `app.js:28-849` (`calcSessionCalories`, `app.js:719`). Formule de base (doc, et c'est la définition
du MET) : **kcal = MET × poids (kg) × durée (h)**.

| Élément | Valeur | Où (lu) | Source annoncée | Vérifiable ? |
|---|---|---|---|---|
| MET « bas du corps » | **6,5** | `app.js:168` | aucune (exemples : squat, soulevé, hip thrust, presse) | non — valeur maison |
| MET « haut du corps » | **5,5** | `app.js:169` | aucune (développé, militaire, rowing, tractions) | non — valeur maison |
| MET « isolation » | **4,0** | `app.js:172` | aucune (curl, extension) | non — valeur maison |
| MET haltérophilie | **8,0** | `app.js:170` | aucune | non |
| MET « cardio » dans un exercice (burpees, corde…) | **8,0** | `app.js:171` | aucune | non |
| MET du repos entre séries | **3,0** | `app.js:222` (raisonnement `app.js:198-221`) | deux raisonnements : ① rétro-calcul depuis le 3,5 du Compendium avec la part active (19 %) **d'une** séance du 16/08 : 0,19 × 5,1 + 0,81 × x = 3,5 → x ≈ 3,1 ; ② « l'oxygène reste à ~50 % de l'écart à l'effort » (**aucune référence citée**). Validé par Michel (« oui pour le MET », ft-v886). Historique : 2,0 → 1,5 → 3,0 | ① arithmétique vérifiable, mais sur une séance ; ② non |
| MET de la « transition » (le reste de la durée réelle) | **3,0** | `app.js:248` | « Compendium 2024 · marche lente / port de charge légère », **sans code** | non vérifié (site inaccessible) |
| Forfait échauffement + retour au calme | **3,5 MET × (5 + 5) min**, chaque moitié retirée si un cardio est noté pour ce moment | `app.js:815-820` | aucune pour les 10 min ; le dépôt le classe lui-même « aucune source, inventé » (doc, `docs/CALORIES-SOURCES.md` §8) | non |
| Durée d'une série | **10 s + 3 s par répétition**, plafond 180 s, 30 s si aucune répétition notée | `app.js:627-630`, `app.js:679-684` | « tempo courant ~1 s + ~2 s », « fourchette publiée 20-40 s pour 8-12 rép. » **sans référence** | non |
| Tempo lu dans la note de l'exercice | 1 à 15 s par répétition, sinon ignoré | `app.js:662-675` | format des programmes de la coach de Michel | bornes = jugement |
| Facteur de charge (% du max de l'exercice) | **1 + 1,07 × (%max − 0,72)**, borné **0,85 à 1,30** ; 1 sans record ; 1 au-delà de 200 % | `app.js:709-718` | demande de Michel (ft-v879) ; motivé par une corrélation **r = +0,537** entre tonnage/min et kcal/min **de la montre** (27 séances) ; borne « Compendium 02052 → 3,5 / 02053 → 6,0 = ×1,71 » | **codes contredits** (voir encadré) ; et une étude citée par le dépôt ne trouve **pas** de différence entre 60 % et 80 % du max (doc, `CALORIES-SOURCES.md` §3) |
| Repos supposé par le moteur | `S.defRest`, sinon **130 s**, pour tous les exercices | `state.js:28-32`, `app.js:721` | le réglage de la personne | — |
| Plafonds des écarts mesurés entre séries | ≤ 5 rép. → 300 s · 6-12 → 180 s · ≥ 13 → 120 s ; ou 2 × la médiane du jour si ≥ 3 écarts ; borné 60-600 s ; changement d'exercice → 600 s | `app.js:363-368`, `app.js:418-432` | repères de Michel (14/08 : lourd 3-5 min, normal 1 min 15-1 min 45, abdos 30 s-1 min) | jugement, une personne |
| Bornes de durée | **1,5 à 10 min par série** (dès 6 séries), **180 min** maximum | `app.js:523-528` | 1,5 = « plancher physique » ; 10 et 180 calés sur 27 séances de la montre de Michel (doc) | une personne |
| Durée estimée sans chrono ni horodatage | **séries × (30 s + repos réglé)** | `app.js:556` | « le réglage de la personne, rien d'autre » | — |
| MET « temps réel » affiché 🔬 | **3,5** × minutes effectives | `app.js:468-474` ; affichage `setup.js:1281-1283` | Compendium « resistance training, moderate » | recherche web concordante (02054 = 3,5) |
| Poids | `S.bw`, **80 kg** s'il manque | `app.js:720` | — | — |
| Listes de mots-clés | 9 haltérophilie, 18 cardio, testées **en sous-chaîne** | `app.js:280`, `app.js:288-290` | jugement (« explosif », « essoufflant ») | — |
| Régions | bas : quadriceps, ischios, fessiers, mollets, soléaire, fléchisseurs de hanche, adducteurs, tibial ; haut : 10 muscles. **Abdos, obliques, lombaires, dentelé : dans aucune** | `app.js:294-297` | — | — |
| Table du cardio | elliptique 4,0 / 6,0 / 8,5 · tapis 3,5 / 5,5 / 9,5 · vélo 4,0 / 6,8 / 10,0 · rameur 4,5 / 7,0 / 10,5 · corde 6,0 / 9,0 / 12,0 · autre 3,5 / 5,5 / 8,0 (léger / modéré / intense) | `app.js:28-35` ; calcul `app.js:44-48` | **aucune**, ni dans le code ni dans les docs ; le dépôt montre que « modéré » au tapis couvre 4,1 à 10,5 MET selon l'ACSM (doc, §12.2) | non (historique git local limité au 16/10) |
| Version du moteur | `CAL_ENGINE = 3` | `app.js:264` | à incrémenter à chaque changement de modèle | — |

Valeurs mesurées des deux courbes : **durée d'une série** 1 rép. → 13 s · 5 → 25 s · 8 → 34 s · 10 → 40 s · 12 → 46 s ·
15 → 55 s · 20 → 70 s · 30 → 100 s · 60 et plus → 180 s · 0 → 30 s. **Facteur de charge** ≤ 58 % du max → 0,85 ·
60 % → 0,87 · 72 % → 1,00 · 80 % → 1,09 · 90 % → 1,19 · 100 % → 1,30 · au-delà de 200 % → 1. Tempo : « 3 sec descente,
2 sec contraction » → 5 s/rép. ; « tempo 3-1-2 » → rien (pas de « s ») (mesuré).

> **Le Compendium, ce qu'on peut en dire d'ici.** `pacompendium.com`, PubMed et PMC sont **inaccessibles** :
> `curl` → `CONNECT tunnel failed, response 403` (le proxy refuse ces domaines) ; `WebFetch` → `getaddrinfo ENOTFOUND`.
> Deux recherches web donnent, **en extraits** (pages non ouvertes) : **02050 = 6,0** (« vigorous », powerlifting ou
> bodybuilding) · **02052 = 5,0** (squats, soulevé de terre, lent ou explosif) · **02054 = 3,5** (plusieurs exercices,
> 8-15 répétitions). Donc : `app.js:193` et `app.js:622` (« 02054 → 3,5 ») concordent ; `app.js:701` (« 02052 → 3,5 »,
> « 02053 → 6,0 ») est **discordant** — les deux nombres 3,5 et 6,0 existent, pas sous ces codes. `app.js:622` parle
> encore d'un repos « à 1,5 » alors qu'il vaut 3,0. Les codes du repos (07021, 07040, 07041, `app.js:175-176`) et de la
> transition : **non trouvés** par la recherche. **Aucune des valeurs par exercice (4,0 / 5,5 / 6,5 / 8,0) ne vient du
> Compendium** : il publie des valeurs de **séance**, pas d'exercice.

---

## 3. Le classement des exercices

**Les règles, dans l'ordre** (lu, `getExerciseMET`, `app.js:298-330`) — la première qui répond gagne :
1. le nom contient un mot-clé d'haltérophilie → **8,0** (`app.js:300`) ;
2. le nom contient un mot-clé de cardio → **8,0** (`app.js:301`) ;
3. un porté (farmer, carry…) → **6,5** (`app.js:307`) ;
4. on compte les **muscles distincts** (fiche écrite, sinon règle par le nom, sinon muscles cochés) : **moins de 3 → 4,0** (`app.js:313`) ;
5. charnière de hanche → **6,5** (`app.js:323`) ;
6. sinon, si les muscles du bas pèsent **≥ 50 %** (principal = 2 points, secondaire = 1) → **6,5**, sinon **5,5** (`app.js:324-326`) ;
7. exercice inconnu → **4,0** (`app.js:329`).

**Le résultat sur le catalogue** (mesuré, scénario `CLASSES` ; table complète des 334 lignes dans `TABLE-CLASSES-MET.md`
et `table_classes_met.csv` ; le chemin de chaque ligne est **vérifié égal** au vrai résultat de `getExerciseMET`, 0 écart) :

| Classe | Exercices au choix | Règle qui les y met |
|---|---|---|
| 4,0 isolation | **97** | moins de 3 muscles (84 en ont 2, 13 en ont 1) |
| 5,5 haut du corps | **122** | ≥ 3 muscles, bas < 50 % |
| 6,5 bas du corps | **87** | ≥ 3 muscles + bas ≥ 50 % (52) · charnière de hanche (34) · porté (1) |
| 8,0 | **16** | mots-clés cardio (10) et haltérophilie (6) |

**Le seuil est fragile** (mesuré) : 43 exercices ont exactement 3 muscles (un de moins → 4,0) et 84 en ont exactement 2
(un de plus → 5,5 ou 6,5) : **127 exercices sur 305** (hors mots-clés) sont à un muscle près de changer de classe.
**20** n'atteignent 3 que grâce à un muscle **secondaire stabilisateur** (abdos, trapèzes, mollets, lombaires). Les
calories dépendent donc de la fiche anatomique : corriger un muscle déplace les calories en silence (le code l'écrit
lui-même pour le farmer's walk et les roumains, `app.js:302-322`).

**Les cas connus, expliqués** (mesuré) :
- **Oiseau 5,5 contre Élévations latérales 4,0.** Fiche de l'Oiseau (`constants.js:1936`) : principal deltoïde
  postérieur, secondaires deltoïde latéral **et** trapèzes → **3 muscles** → règle 4 franchie → bas 0 % → 5,5. Fiche des
  élévations latérales (`constants.js:1911`) : principal deltoïde latéral, secondaire trapèzes → 2 muscles → 4,0.
  **Toute la différence est le deltoïde latéral en secondaire.** L'aveu est écrit dans le code (`constants.js:1930-1935`).
- **Développé Couché 5,5** (`constants.js:1785`) : pectoraux + deltoïde antérieur + triceps = **3 muscles, pile au
  seuil** → 5,5, le même tarif que l'Oiseau ; l'Écarté poulie (pectoraux + deltoïde antérieur) est à 4,0.

**Les 33 classements douteux, relus un par un.** Le banc en signale 33 automatiquement en croisant la classe et le
schéma moteur ; j'en écarte 3 (les 2 kickbacks, rangés « charnière » par convention, sont bien des isolations à 4,0 ; le
Grimpeur est à 8,0 par un mot-clé voulu), 3 autres sont des exercices retirés du choix, et j'en ajoute 6 qu'il ne voyait
pas (les 4 pull-over, la suspension passive, la chaise). Tous passent par la règle 4 (3 muscles distincts ou plus,
stabilisateurs compris) et, pour le Superman, par la règle 6 :

| Catégorie | Exercices | Classe | Pourquoi (muscles comptés) |
|---|---|---|---|
| **A** — une seule articulation, compté comme un polyarticulaire (12) | Oiseau · Machine Oiseau · Oiseau Élastique · Oiseau Poulie 45° · Écarté Arrière Élastique · Oiseau Inversé TRX · Écarté TRX · Pull-over Haltère / Machine / Barre / Poulie · Suspension Passive (Dead Hang) | 5,5 | oiseaux : deltoïde post. + latéral + trapèzes ; Écarté TRX : + abdos ; pull-over : épaule seule, coude quasi fixe, 4 muscles ; Dead Hang : maintien passif, 3 muscles |
| **B** — isolation du genou comptée comme un squat (2) | Sissy Squat · Sissy Squat Machine | **6,5** | quadriceps + abdos + mollets, bas 75 % |
| **C** — deux articulations, discutable (5) | Tirage Menton (×3) · Tirage Visage (Face Pull) · Face Pull Couché Poulie | 5,5 | épaule + coude : pas faux, à trancher |
| **D** — gainage et abdos (12) | Gainage · Planche Latérale · Hollow Body · Relevé de Jambes · Chaise Romaine · Roue Abdominale · Rotation Russe · Drapeau · Bird Dog · Planche Inversée · Russian Twist Développé Épaules (5,5) · **Superman (6,5)** | 5,5 / 6,5 | les stabilisateurs comptent ; Superman : bas = **50 % pile**, et la règle dit « ≥ 50 % ». À côté, Crunch, Crunch Poulie, Crunch Machine, Rotation Machine Obliques : 4,0 |
| **E** — maintien isométrique compté comme le mouvement (1) | Chaise (Wall Sit) | 6,5 | comme un squat |
| **?** — à vérifier (1) | Chariot de Puissance — Tirage Épaules | 5,5 | schéma déduit du seul mot « épaule » |

**Aucun exercice à schéma polyarticulaire n'est compté 4,0** (mesuré). Ces erreurs ne jouent que sur le **temps actif**
(voir §5) : forcer **tous** les exercices à 4,0 ou à 6,5 ne déplace le total que de **−6 à −9 %** ou **+7 à +10 %**
(A : 316 / **337** / 372 ; B : 375 / **398** / 427 ; C : 142 / **156** / 171 — mesuré). Et **à durée égale, la séance
Jambes et la séance Pecs/Épaules donnent toutes deux 337 kcal à 60 min** (mesuré, scénario `DENSITE`).

---

## 4. Les formes de pratique (musculation, bodybuilding, powerbuilding, force athlétique)

- **La discipline du profil n'est lue nulle part dans le moteur** (lu : aucune occurrence dans `app.js:28-849`). Le
  cadre par discipline (`DISC_CADRE`, `constants.js:466`) est lu par Milo (`coach.js:342`), les cartes de séance
  (`log.js:517`), les repères de repos et de volume (`log.js:2720`, `log.js:4720`, `log.js:5315`) et le Profil
  (`setup.js:3173`) — **jamais par le calcul des calories**.
- **Mesuré** : la même séance donne **exactement le même total** avec chacune des 5 disciplines du profil, ou sans.
- Le moteur distingue les pratiques **seulement** par trois effets : les **répétitions** (durée d'une série), le
  **% du max** (facteur de charge) et la **durée réelle** de la séance. Les supersets / circuits ne sont pas lus
  (lu : aucune lecture de `group` dans `calcSessionCalories`).

Les 5 séances types de l'app (`DISC_SEANCE`, `constants.js:426`), faites avec **leurs propres repos** (mesuré ; charges
fictives choisies au milieu des fourchettes de `DISC_CADRE`, records fictifs) :

| Discipline | Séries × rép. (charge) | Durée qui en sort | kcal | kcal/min | À 60 min saisies |
|---|---|---|---|---|---|
| Musculation | 4×10 ×3, 3×10, gainage 3×30 (72 %) | 49 min | 304 | 6,2 | **349** |
| Bodybuilding | 4×10, 4×12, 3×15, 4×15, 3×15 (72 %) | 43 min | 255 | 5,9 | **326** |
| Powerbuilding | 4×5 ×2 (85 %), 3×12 ×2, 3×15 (70 %) | 55 min | 314 | 5,7 | **332** |
| Force athlétique | 5×3 ×2, 3×3 (87 %), 3×8 (72 %) | 69 min | 358 | 5,2 | **323** |
| Haltérophilie | 5×3, 5×2, 4×5 (80 %), gainage 3×30 | 56 min | 326 | 5,8 | **343** |

👉 **À durée égale, 8 % d'écart entre les pratiques** (323 à 349). Ce qui les sépare surtout, c'est la durée.
Les mêmes séries faites plus ou moins vite (séance A, MET de séance hors forfait, mesuré) : **3,62** en 35 min ·
**3,53** en 60 min · **3,26** en 120 min. Le moteur ne peut donc pas atteindre les niveaux « circuit » (5,8, doc) ou
« vigoureux » (6,0, recherche web) : tout ce qui n'est pas une série est payé 3,0.

---

## 5. La durée de l'effort et des repos

**Comment la durée est choisie** (lu, `_dureeSeanceMin`, `app.js:522-558`), dans l'ordre : ⓪ la durée **saisie** à la
main · ① les **horodatages** des séries (de la 1ʳᵉ à la dernière série validée, chaque écart plafonné,
`_dureeEffective`, `app.js:374-452`) · ② le **chrono** (s'il n'est pas « douteux ») · ③ une **estimation** séries ×
(30 s + repos réglé). Bornes : 1,5 à 10 min par série, 180 min. Le chrono démarre à la **1ʳᵉ série validée**
(`log.js:1944`) et exclut les pauses (`log.js:62-67`, `log.js:4985`).

**Comment le moteur s'en sert** (lu, `app.js:730-801`) : il modélise les séries (durée par répétitions) et le repos
**(séries − 1) × repos réglé** par exercice ; puis, si la durée réelle est plus longue, le reste devient de la
« transition » à 3,0 ; si elle est plus courte, **tout** est réduit à l'échelle, temps des séries compris.

👉 **Conséquence, et c'est la clé de tout le diagnostic** (mesuré, décomposition exacte, 0 kcal d'écart sur 400
séances aléatoires) : quand la durée réelle dépasse le modèle (le cas normal),
**total = 3,0 × poids × durée + bonus des séries + forfait**. Sur la séance A : 246,0 + 43,7 + 47,8 = 337,5 → 337 kcal
(73 % · 13 % · 14 %) ; sur B : 307,5 + 42,7 + 47,8 = 398,0 → 398 (77 % · 11 % · 12 %). Sur C (20 min, plus courte que
son modèle de 27 min), tout est réduit d'un quart et le forfait pèse **31 %**. Le « bonus » — seule partie où jouent la
classe de l'exercice et la charge — vaut **9 %** du total en médiane (10ᵉ centile 4 %, 90ᵉ centile 16 %) sur les 350
séances aléatoires du cas normal.

| Point | Constat | Statut |
|---|---|---|
| K4 — repos 60 / 130 / 240 s, 60 min | **317 / 317 / 317** ; en 20 min **153 / 147 / 140** — identique au 23/10 | mesuré, 5a7b0a57 **et** 84ac1a81 |
| Préférences de repos par exercice | **ignorées** : toutes les séances types rendent le même chiffre avec 45 s ou 300 s par exercice ; le repos des abdos (30 s), des échauffements (45 s) et après un échec (240 s), appliqués par le chrono (`log.js:1979-1980`), ne sont pas lus non plus | mesuré |
| Le repos réglé change-t-il le total ? | non tant que le modèle tient dans la durée (A : 337 à 60 et 130 s) ; **oui** sinon (A à 240 s : 327 ; C : 165 / 156 / 148 pour 60 / 130 / 240 s) | mesuré |
| Séance **sans durée** (import) | la durée est **fabriquée** depuis le repos réglé : A **227 / 332 / 497 kcal** pour 60 / 130 / 240 s | mesuré |
| K6 — forfait 10 / 5 / 0 min selon le cardio noté | **317 / 293 / 270** — identique au 23/10 | mesuré |
| Forfait sur une durée **saisie** | **appliqué** quand même : 317 comme le chrono (K6) ; A, B, C : même chiffre en « saisie » qu'en « chrono » | mesuré |
| `totalMin` sans la transition | K6 : 38 au lieu de 70 ; A : 61 au lieu de 70 ; B : 63 au lieu de 85 — **aucun lecteur** (seul `app.js:833` l'écrit) | mesuré + lu |
| K7 — bornes | 61 / 61 / 61 / 59 / 24, toutes finies — identique | mesuré |
| K1 — corriger la durée | 5a7b0a57 : 317 gardés pour 60 → 90 min ; **84ac1a81 : 440**, recalculé (lot 1, non publié) | mesuré |
| K2 — modification non enregistrée | 5a7b0a57 : effacée (120 → 100) ; **84ac1a81 : gardée (120)** | mesuré |
| K3 — « Enregistrer » au poids du jour | 5a7b0a57 : 97 → 112 ; **84ac1a81 : 97 gardés** (`_kcalApresEdition`, `setup.js:1747`) | mesuré |
| **Nouveau — séries cochées en bloc** | 1ʳᵉ série cochée au début (elle lance le chrono), 21 dans la dernière minute, chrono 60 min : le moteur prend les horodatages, relevés au plancher **1,5 min × 22 = 33 min** → **211 kcal au lieu de 337 (−37 %)**. Le chrono de 60 min n'est pas « douteux » : aucun ⚠️ | mesuré |
| **Nouveau — cardio d'après, chrono seul** | quand seul le chrono existe (moins de 2 séries horodatées), il contient le cardio d'après (le code le dit, `app.js:582-584`) : ces minutes sont payées **deux fois**, en transition à 3,0 **et** en cardio → **488 au lieu de 427 (+14 %)** pour 15 min de tapis. L'affichage de la durée, lui, le sait (`_dureeTotaleMin`, `app.js:588-596`) | mesuré + lu |
| Interruption de 20 min (appel) | horodatages : 63 min retenues (17 coupées) → 349 kcal ; chrono seul : 82 min → 428 | mesuré |
| Gainage en secondes | la feuille imprimée lit les « répétitions » de gainage/planche comme des **secondes** (`log.js:10093`, `log.js:10279`) ; le moteur les compte à 3 s pièce : 45 « rép. » = 145 s au lieu de 55 s | lu + mesuré |
| Cardio seul (20 min de vélo modéré) | 210 kcal = 186 de cardio + **24 de forfait** d'échauffement | mesuré |

---

## 6. Hommes et femmes

- **Le moteur ne lit pas le sexe** (lu : aucune occurrence de `gender`, ni de l'âge, de la taille ou du cycle, dans
  `app.js:1-900`). Seul le **poids** entre — séance (`app.js:720`), cardio (`app.js:47`), pas (`tracking.js:3776`).
- **Mesuré** : séance A — homme 82 kg **337** = femme 82 kg **337** ; homme 62 kg **255** = femme 62 kg **255** ;
  rapport 62/82 = 0,757, exactement celui des poids. Vélo 20 min : 186 et 141, identiques pour les deux sexes.
- Le facteur de charge se calcule sur le **% du max de la personne** : il est neutre par construction (`app.js:695-698`).
- **Où le sexe entre** (lu) : le métabolisme de base (Mifflin, +5 / −161, `state.js:1614`) → mesuré à 82 kg :
  1 738 contre **1 572 kcal/j** ; et le plancher calorique 1 500 / 1 200 (`state.js:2078`, D-017). La dépense de séance,
  elle, n'est **pas** ajoutée au TDEE (décision du 21/08, F13).
- **Rien n'a été mesuré sur des femmes** : toutes les données du dépôt viennent de Michel (doc).

---

## 7. Les exercices personnalisés

**L'ordre** (lu, `_mscScores`, `log.js:4550`) : ① la fiche écrite du catalogue (`log.js:4570`) · ② la **première règle
qui reconnaît le NOM** (`log.js:4578`, 71 règles) · ③ **seulement si aucune règle ne répond**, les muscles cochés
(`log.js:4580`). Et `getExerciseMET` teste les **mots-clés avant tout**, en sous-chaîne.

> ↪️ **Depuis le lot 3 de la mission Séance (D-122)** : la **figurine, les listes et Progrès** suivent les muscles cochés
> d'abord (`_mscScoresVus`) ; **le calcul des calories, lui, garde l'ordre ci-dessus** — `_mscScores` est restée identique
> à l'octet à master (moteur gelé, `docs/CHANTIER-NUTRITION-SEANCE.md` §8.3). Le tableau ci-dessous décrit donc toujours
> les CALORIES. L'extension aux calories est la recommandation **R8**, chiffrée plus bas, et attend la décision de Michel.

| Perso (fictif) | Muscles cochés | Ce qui décide | MET |
|---|---|---|---|
| Rowing Zorglub | quadriceps | règle « rowing » | **5,5** — le choix est ignoré (F05) |
| Squat Zorglub | biceps | règle « squat » | **6,5** — ignoré |
| Curl Maison Zorglub | quadriceps | règle « curl » | 4,0 — ignoré |
| Machin Bizarre | aucun | rien | 4,0 (par défaut) |
| Machin Bizarre Trois | quadriceps, fessiers / ischios | les muscles cochés | 6,5 |
| Spoto press | pectoraux / triceps, deltoïde ant. | les muscles cochés | 5,5 |
| **Étirements sur tapis** | aucun | mot-clé cardio « Tapis » | **8,0** — le tarif d'un burpee |
| Abdos sur tapis · Pompes sur tapis · Gainage sur tapis | — / pec + triceps / — | mot-clé « Tapis » | **8,0** |
| Hang Clean · Rameur | aucun | mots-clés | 8,0 (justes) |
| Oiseau assis · Élévations latérales assis | aucun | règles | 5,5 · 4,0 (même écart qu'au catalogue) |

Tout est mesuré. **Sur une séance, l'effet reste petit** : 4 × 10 d'un perso dans 45 min saisies → 241 à 251 kcal
selon le classement (mesuré). Les noms abrégés ou sans accents (« Squat Barre », « Developpe Couche ») ne retrouvent pas
leur fiche mais tombent sur une règle qui donne le même MET (mesuré).

---

## 8. Estimation contre mesure

- **Ce qu'est le chiffre** : une **estimation brute** (repos de base compris), kcal = MET × poids × heures (doc). Ce
  n'est pas une mesure : rien ne mesure l'énergie, l'app mesure le **temps** et suppose l'**intensité**.
- **Le niveau rendu** (mesuré) : A **3,52** MET et B **3,43** MET sur (durée + forfait) ; 4,11 et 3,88 sur la durée
  seule ; C **5,71** sur ses 20 min (le forfait domine). Valeur publiée pour une séance « modérée » : **3,5** (02054,
  recherche web).
- **Deux chiffres sur le même écran** (mesuré, vraie fonction `openSessDetail`) : « 🔥 **337** kcal … 🔬 ~**287** kcal
  en comptant le temps réel » (A) ; 398 et 359 (B) ; **156 et 96** (C). La ligne 🔬 (3,5 × temps effectif, sans forfait)
  est « affichée, pas branchée » exprès (`setup.js:1276-1280`) ; elle n'a pas été retirée depuis.
- **Limites connues, écrites dans le dépôt** (doc) : la **durée est la source d'erreur n° 1** (avant ft-v874 : −35 % en
  médiane contre la montre, une séance d'1 h 51 comptée 28 min) ; les montres sont **mauvaises en musculation**
  (r = 0,10 à 0,34 contre la calorimétrie) et chez Michel la montre suit le cœur (r = 0,968 entre fréquence cardiaque et
  kcal/min) ; une même personne varie de **2,4 à 5,2 MET** d'une séance à l'autre (écart-type 0,68) ; **±24 %** entre
  deux personnes faisant la même séance ; la calorimétrie elle-même sous-estime la musculation (part anaérobie) ;
  l'EPOC (~50 ± 31 kcal après la séance) n'est pas compté, exprès.
- **Ce qui a été comparé** (doc) : le moteur actuel (`CAL_ENGINE` 3) contre la **montre** de Michel, 27 séances : MET de
  séance 3,28 (publié 3,50), 17 séances sur 27 à ±20 %, erreur absolue 14 % (ft-v886). Le facteur de charge : −3 kcal
  en médiane, et un léger recul contre la montre (−5,2 % → −6,7 %, ft-v879).
- **Ce qui n'a jamais été validé** : ① aucune valeur contre une **mesure métabolique** ; ② **aucune autre personne**
  que Michel ; ③ **aucune femme** ; ④ les MET par exercice 4,0 / 5,5 / 6,5 / 8,0 ; ⑤ le forfait
  de 10 min ; ⑥ la 2ᵉ justification du repos à 3,0 ; ⑦ la table du cardio ; ⑧ les supersets, circuits, et les
  pratiques autres que celle de Michel ; ⑨ la durée d'une série (10 s + 3 s/rép.).

---

## 9. Recommandations (simulées, non appliquées)

Chaque ligne = une copie du code où **seules** les lignes visées changent, puis les mêmes séances (A, B, C : séries au
§0, records connus, 82 kg). Résultats identiques sur 5a7b0a57 et 84ac1a81. **Aucune ne crée de donnée persistée.** Toute
modification du moteur demande l'accord de Michel (moteur gelé), d'incrémenter `CAL_ENGINE` (`app.js:257`) et un banc
avant/après (R34). Classement : **impact** décroissant, puis
**risque** croissant.

| # | Ce que ça change | Impact mesuré (avant → après) | Ce qui ne bouge pas | Risque | Qui décide |
|---|---|---|---|---|---|
| **R1** (P7) | Des horodatages **sous le plancher physique** (< 1,5 min/série, dès 6 séries) ne sont pas une mesure : prendre le **chrono** | Séance A cochée en bloc : **211 → 337 (+60 %)** | A, B, C normales : 0 (4 modes) | **faible** — ce n'est pas l'idée déjà refusée « prendre toujours le plus grand des deux » (`app.js:533-543`) | technique ; Michel informé (kcal qui changent) |
| **R2** (P1) | **Pas de forfait** de 10 min quand la durée est **saisie** (F10) | Saisie : A **337 → 290 (−14 %)** · B **398 → 350 (−12 %)** · C **156 → 108 (−31 %)** | horodatage, chrono, sans durée : 0 | **moyen** : depuis le lot 1, **toute durée corrigée devient « saisie »** — mesuré : confirmer 60 → 60 min ferait passer **337 → 290**, et 60 → 90 min donnerait 413 au lieu de 460. À limiter aux durées d'import, ou à garder tel quel | **Michel** (deux lectures possibles de « durée saisie ») |
| **R3** (P3b) | Séance **plus courte que le modèle** : garder le temps des séries, ne réduire que le repos **supposé** (F09) | C **156 → 165 (+6 %)** · A faite en 35 min 221 → 235 (+6 %) · B en 35 min 220 → 234 | A, B à 60 et 75 min : 0 | **faible à moyen** (séances courtes ou denses ; le détail par exercice serait à recalculer) | Michel |
| | ↳ effet | **le total ne dépend plus du repos supposé** dès que la durée est connue : C = 165 pour 60, 130 ou 240 s (au lieu de 165 / 156 / 148) | | | |
| **R4** (P8) | **Chrono seul** : retirer le cardio d'après de la durée (il est déjà payé à part), comme le fait déjà l'affichage | A + 15 min de tapis : **488 → 427 (−12,5 %)** | tous les autres cas : 0 | **faible** (rare depuis les horodatages) | technique |
| **R5** (P4) | **Gainage / planche** : les « répétitions » sont des secondes (la même règle que l'impression) | C **156 → 151 (−3 %)** · C sans durée 204 → 193 · musculation à 60 min 349 → 339 | A, B : 0 | **faible** ; Chaise et Dead Hang restent comptés en répétitions | technique |
| **R6** (P2a / P2b) | Liste **explicite** d'isolations avant la règle des 3 muscles : 9 exercices (oiseaux, écartés arrière, Écarté TRX, Sissy) ou 14 (+ pull-over, Dead Hang) passent à 4,0 (F12) | A **337 → 332 (−1,5 %)** (les 3 × 15 d'Oiseau) | B, C : 0 | **faible** | **Michel** (R31 : la figurine est le vocabulaire) |
| | ⛔ **à ne pas faire** (P2c) | changer la **règle** (« sans les stabilisateurs ») déplace **21** exercices, dont **6 à tort** : Sled Push, Chariot Poussée, Chariot Tirage Inversé Jambes, GHD, Reverse Hyper, Pull Through 6,5 → 4,0 — le code veut exprès le traîneau et les charnières à 6,5 (`app.js:291-293`, `app.js:314-323`) | | | |
| **R7** (P5) | « Tapis » = **tapis de course** seulement | Catalogue : **0 changement** · persos « … sur tapis » 8,0 → 5,5 (abdos, pompes, gainage) ou 4,0 (étirements) · séance 45 min 251 → 241 | tout le catalogue | **très faible** | technique |
| **R8** (P6) | Perso : les **muscles cochés** passent avant la règle du nom **aussi pour les calories** (F05 ne l'applique qu'à l'affichage, D-122) | remesuré le 24/10 contre master, 10 persos fictifs : **0 écart sur les 322 exercices du catalogue** ; persos cochés dont le nom est reconnu : de **−6 à +4 kcal** sur une séance de 3 exercices d'une heure (**−4 % à +3 %**), de −3 à +2 kcal sur 4 × 10 en 20 min (−5 % à +3 %) ; un perso au nom inconnu ou sans muscles cochés : 0 | catalogue : 0 | **moyen** : un perso **composé** avec moins de 3 muscles cochés devient « isolation » (Squat Maison coché quadriceps seuls : 6,5 → 4,0) — le nombre de muscles cochés décide de la classe | **Michel** (décision attendue) |

**Écarté, avec la raison** : faire suivre au moteur les repos du chrono (P3a). Sans R3, il rend le total **dépendant des
préférences** (A avec 300 s partout : 337 → 324 ; C : 147 ou 165) ; avec R3, il n'a plus d'effet visible.

**Sans calcul à changer** (0 kcal) : `totalMin` sans lecteur — corriger ou retirer · la ligne 🔬 — décider ce qu'elle
devient (deux chiffres à l'écran) · les commentaires Compendium (`app.js:622`, `app.js:701`) · une durée **fabriquée**
pour les séances importées (227 à 497 kcal selon le repos réglé) — à signaler à l'écran plutôt qu'à deviner.

**Non rouvert** (règle d'or #15) : le **facteur de charge** est une décision de Michel (ft-v879) ; son poids mesuré
ici est **0 à 0,8 %** (B : 398 avec, 401 sans). La tension avec l'étude citée au §3 de `CALORIES-SOURCES.md` existait
avant la décision : ce n'est pas une preuve nouvelle.

---

## Limites de ce diagnostic

- **Données fictives seulement** (profil homme 82 kg, séances inventées). **La fréquence réelle des cas** (séries
  cochées en bloc, durées saisies, chrono seul, persos « tapis ») **n'est pas connue** : aucune donnée réelle n'est
  accessible d'ici.
- **Aucune mesure physiologique**, aucune montre. Les comparaisons à la montre citées viennent des documents du dépôt.
- **Sources scientifiques non ouvertes** : `pacompendium.com`, PubMed, PMC → `CONNECT tunnel failed, response 403`
  (proxy) ; `WebFetch` → `getaddrinfo ENOTFOUND`. Seuls des **extraits** de recherche web sur 02050 / 02052 / 02054 ;
  les codes 07021, 07040, 07041 et celui de la transition n'ont pas été trouvés.
- **Origine de la table du cardio introuvable** : l'historique git local ne remonte qu'au 16/10/2026 (235 commits), et
  un `git fetch` aurait écrit dans le dépôt (interdit).
- **Navigateur Chromium**, pas l'iPhone ; l'écran a été lu en texte, pas regardé.
- **Les simulations ne sont pas des correctifs** : ni témoins, ni mutations, ni passe ; P3b ne recalcule pas le détail
  par exercice.
- **Le dépôt a bougé pendant le travail** (5a7b0a57 → 84ac1a81, lot 1 Séance) : tout a été rejoué sur les deux, puis
  sur la tête finale de la branche (lots 1 à 5) — **identique**, `app.js` n'ayant pas changé de moteur.
- **Les « doutes » de classement sont mon jugement biomécanique** (une ou deux articulations, maintien ou mouvement) :
  à valider par Michel. Les familles de variantes sont une **heuristique** (minimum).
- **Non couvert** : la nutrition au-delà du sexe ; Milo (il ne reçoit pas les calories de séance — lu, `coach.js`) ; le
  tableau de bord ordinateur (sa tuile « Calories » est absente parce qu'`app.js` n'y est pas chargé, choix écrit
  `dashboard.html:191-196`).

---

### Rejouer ce diagnostic

Le banc est gardé dans le dépôt : **`tools/diag_met.js`** (hors passe, aucun témoin, il ne juge rien — il mesure).
Usage : `git archive HEAD | tar -x -C /tmp/arbre` puis `tools/sous_garde.sh node tools/diag_met.js /tmp/arbre /tmp/sorties
[SCENARIO,…]` — 18 scénarios (CATALOGUE, CLASSES, SEANCES, REPOS, DISCIPLINES, SEXE, PERSO, SENSI, DECOMP, AFFICHAGE,
DUREES_CAS, DENSITE, EDIT_DUREE, K4, K5, K6, K7, CONSTANTES), une sortie JSON par scénario. La table complète des 334
exercices (classe, règle, muscles comptés, doute) : **`docs/DIAGNOSTIC-MET-TABLE-CLASSES.md`**. Les copies modifiées
des recommandations (P1 → P8) n'ont pas été gardées : chaque ligne du §9 dit ce qui change, à refaire sur la tête du jour.
