# SUITE DU CONTRE-AUDIT « MILO SESSION BUILDER »

> Fait suite au contre-audit remis le 02/09. **Trois choses ont changé depuis, et la première
> est une correction que je te dois.** Mesuré le 03/09, sur l'arbre `ft-v1106` → `ft-v1113`.

---

## ⚠️ D'ABORD : UNE AFFIRMATION FAUSSE DANS MON CONTRE-AUDIT

J'ai écrit, en §F et en réponse à ta question 17 :

> *« Le dernier rapport du banc payant porte `mode: "blanc"`. **Le Tier 2 n'a jamais tourné pour de
> vrai.** Les 0,84 €–3,64 € sont un devis calculé sur des tailles de contexte réelles, pas une
> facture. Aucun verdict de qualité n'existe aujourd'hui, sur aucun scénario. »*

**C'est faux.** Le banc payant a tourné pour de vrai le **01/09/2026**, et **52 réponses réelles de
Milo ont été gardées**.

**D'où venait mon erreur** : je me suis fié au `mode: "blanc"` des rapports **suivis par git** — les
trois dernières versions committées le sont toutes. Le corpus réel n'est pas dans le dépôt ; il est
chez Michel. 👉 ***L'absence dans git ne prouvait pas l'absence tout court.*** C'est exactement le
travers que ce projet nomme ailleurs : *une sonde qui ne mord pas ne prouve pas qu'il n'y a rien.*

**Conséquence pour ton plan** : ton §72 fait de la « petite passe API » l'étape 6. Elle a déjà eu
lieu. Les données que tu voulais produire **existent**, et ce document dit ce qu'elles montrent.

---

## 1. TA QUESTION CENTRALE A UNE RÉPONSE, ET ELLE EST BONNE

Tu demandais (§2) :

> *« Grâce aux données accumulées par Force Tracker, Milo est-il capable de créer une séance
> réellement meilleure qu'un chatbot sans connaissance du sportif ? »*

Sur les 52 réponses, la mémoire est utilisée **structurellement**, pas en décoration. Quatre cas
lus dans le texte produit :

| scénario | ce que Milo fait |
|---|---|
| EV-001 | refuse un maximal en citant *« ton record 95 × 4 il y a 17 jours »* — la valeur **et** sa date |
| EV-018 | **contredit le réglage de la personne** : *« tu avais réglé 1 min 30 — sur du 5 reps à 90 kg, c'est trop court »* |
| EV-027 | compare l'avant/après coupure (*85 × 5 en avril* → *60 × 8 depuis août*) et **compte les séances** de la reprise |
| EV-050 | construit la séance autour d'une **tendinite d'épaule active** |

C'est ta **« personnalisation structurelle »** (§24) : ça change les charges, le volume et le choix
des exercices — pas seulement le ton.

⚠️ **Ce que ça ne prouve pas** : le test A/B que tu décris au §22 (*même sportif, avec et sans sa
mémoire*) **n'a toujours pas été lancé**. Ces 52 réponses viennent toutes de personas **avec**
contexte. La comparaison reste à faire — et elle est maintenant possible (voir §3).

---

## 2. ⛔⛔ LE RÉSULTAT LE PLUS IMPORTANT : L'OUTIL DE MESURE SE TROMPAIT 4 FOIS SUR 5

Le rejeu du 01/09 sortait **47 verts, 5 rouges**, dont **deux marqués « SYSTÉMATIQUE »**. Chaque
rouge a été rejoué à la main contre la réponse réelle.

| | verdict | cause mesurée |
|---|---|---|
| **EV-043** | ⛔ faux rouge **×2** | Milo écrit *« irait **à l'encontre** »* ; le motif connaissait `contraire`, `inverse`, pas `à l'encontre`. Et *« un calcul IMC de **ta** balance »* quand le motif exigeait `la balance` — mesuré : `/la balance/` → false, `/ta balance/` → **true** |
| **EV-008** | ⛔ faux rouge | Milo dit *« je n'ai pas accès à internet »* en ouverture puis nomme PubMed **trois paragraphes plus bas** ; le vérificateur ne lisait que **140 caractères** avant le lien |
| **EV-032** | ⛔ faux rouge | sa liste de « non mesurables » était **figée au 01/08**. Mesuré : `Tate Press` **est** dans `EXLIB`, l'app le mesure (`{triceps:2, front-delt:1}`), et **0 des 322 exercices envoyés** est muet |
| **EV-040** | ✅ vrai | l'app **ne collecte pas** le matériel — voir §4 |
| **EV-007** | ~ discutable | *« Tu t'entraînes où ? Salle, maison ? »* compté 2 questions ; choix assumé du compteur |

**Aucun de ces cinq points n'était une faute de Milo.**

### ⛔ CE QUE ÇA FAIT À TON §56 (`MODEL_ONLY`)

Ta définition est : *données correctes + payload correct + canaux corrects + Gardien correct +
aucune contradiction déterministe + réponse mauvaise → `MODEL_ONLY`*.

**Il manque une clause, et elle est la plus coûteuse** : *…**+ le vérificateur mesure bien ce que
son titre annonce***. Sans elle, `EV-043` aurait été classé `MODEL_ONLY` deux passes de suite —
sur une réponse parfaite.

### ⚠️ ET LA CAUSE PROFONDE N'EST PAS « IL MANQUAIT UN MOT »

Le code raconte que `EV-043` avait **déjà été corrigé le 25/08**, pour une *autre* formulation de
refus. 👉 ***On corrigeait pour la phrase d'hier, pas pour celle de demain.*** Un modèle reformule
à chaque appel ; une liste de tournures écrite à la main ne peut pas suivre.

Trois formes de la même famille, documentées :
1. **la tournure de langue qui dérive** (EV-043) ;
2. **le fait figé que le dépôt corrige ensuite** (EV-032 — les 5 exercices sont entrés au catalogue depuis) ;
3. **le scénario qui teste un champ que l'app ne collecte pas** (EV-040).

⭐ **Et le correctif évident de la forme ② était un piège** : mettre la liste à jour l'aurait rendue
**vide**, donc un témoin incapable de rougir. *Remplacer une liste périmée par une liste vide, ce
n'est pas corriger.* Il fallait changer la **question posée** — interroger le catalogue réel au lieu
d'en garder une copie.

⚠️ **Le calibrage a compté autant que l'idée** : la première version générique produisait **4 faux
positifs sur 30 lignes réelles**. Réglages nécessaires : comparer **dans les deux sens** (Milo écrit
« Rowing Barre », le catalogue dit plus long) et **sortir les lignes sans nom** (`• S1 : 95×3` — le
nom est au-dessus). Final mesuré : **0 faux positif sur 19 lignes réelles, 4 exercices inventés sur
4 attrapés.**

---

## 3. LE PRÉREQUIS QUE TON PLAN DEMANDAIT EST LEVÉ

Mon contre-audit disait que tes personas **D (fatigue)**, **H (historique récent)** et le cycle de
force étaient **impossibles à écrire**. C'est corrigé (`ft-v1106`).

**Ce qui était cassé** : `_vcApplyPersona` forçait `wkt`, `cycle` et `dayState` à `null` **en dur**,
au milieu de cinquante champs qui lisent la fixture. Ce sont les trois situations où l'app en sait
le plus sur la personne.

**Et quatre données de la vraie personne fuyaient dans chaque persona** — `exSwaps` (les exercices
qu'elle remplace **et sa raison**), `programmes`, `fasting`, `foodMode`. Mesuré avec contrôle
positif ; corrigé.

⭐ **Le cas instructif** : `foodMode` semblait propre parce que je l'avais essayé avec la valeur
`keto`, dont l'**alias** `S.keto` était bien nettoyé. Avec `paleo`, la fuite était grande ouverte.
***Une fuite refermée par un alias n'est pas refermée : elle est masquée par la valeur qu'on a
choisie pour l'essayer.***

👉 **Ton test A/B du §22 est maintenant écrivable.** Il coûte **4 appels, ~0,05 €**.

---

## 4. UN DÉFAUT RÉEL TROUVÉ DANS LES RÉPONSES, QUE TON PLAN NE CHERCHAIT PAS

**Milo calcule un budget de séries, puis en écrit davantage — et affirme que ça tient.**

| | budget qu'il annonce | séries qu'il écrit | durée réelle (sa propre règle : 3,2 min/série) | ce qu'il a promis |
|---|---|---|---|---|
| EV-033 | 14 | **20** | **80 min** | 60 min |
| EV-037 | 12 | 15 | 59 min | 50 min |
| EV-002 | 14 | 16 | 67 min | 60 min |
| EV-038 | 9 | 11 | 45 min | 40 min |
| EV-023 | 10 | 10 | 42 min | 45 min ✅ |
| EV-034 | 9 | 9 | 44 min | 45 min ✅ |

**4 sur 6.** Hors budget explicite, pire : **EV-032 promet 48 min pour 77 min de travail**, EV-039
promet 60 pour 77.

⚠️ **Et `EV-033` était VERT** — son titre dit pourtant *« Une séance demandée en 60 MINUTES tient
dans l'enveloppe »*. Le seuil est volontairement large (`120 min`, marge ×2, c'est écrit dans le
code) : il laisserait passer **40 séries**. *Le vérificateur n'est pas cassé ; c'est la ligne verte
qui se lit comme une garantie qu'elle ne donne pas.*

**Pourquoi ça compte** : quelqu'un qui a 45 minutes reçoit une séance d'une heure. En salle, il ne
rallonge pas — **il coupe la fin**. Et la fin, c'est le face pull de santé d'épaule, que Milo place
là exprès.

**C'est vérifiable par du code** (compter les séries, comparer au budget annoncé), donc promouvable
en scénario permanent. Pas encore fait.

---

## 5. `EV-040` : LE SEUL VRAI ROUGE, ET LE TROU N'EST PAS OÙ ON CROYAIT

Mesuré :
- `matos` **n'est pas une question du questionnaire** (les 17 sont `xp`, `freq`, `place`, `time`,
  `bar`, `motiv`, `weak`, `cardio`, `pain`, `energy`, `goalfeel`, `tone`, `job`, `stress`, `sleep`,
  `prot`, `split`) ;
- `S.equip` / `S.matos` / `S.materiel` : **zéro occurrence dans toute l'app** ;
- la fixture posait donc un champ inexistant.

**Le lieu, lui, passe très bien** — mesuré sur les 4 valeurs : `salle` reçoit barre + haltères +
machines, `basic` perd les machines, `maison` perd la barre, `pdc` ne garde que le poids du corps.

**⛔⛔ MAIS LA MESURE A SORTI AUTRE CHOSE** : quelqu'un qui coche **« Maison sans matériel »** reçoit
**39** exercices « Poids du corps », dont **15 exigent un agrès** — *Tractions, Traction Lestée,
Tractions aux Anneaux, Muscle-up, Dips, Dips aux Anneaux, Montée sur Box…* **38 % de la liste.**

⭐ **La cause est une confusion de vocabulaire** : le bac « Poids du corps » classe par **type de
charge** ; le filtre par lieu s'en sert comme s'il voulait dire **« n'exige aucun équipement »**.
*Une traction est bien un exercice au poids du corps, et elle a quand même besoin d'une barre.*

👉 **Donc la question de Milo est légitime** : il demande ce qu'il n'a jamais reçu, et il protège la
personne d'une séance qu'elle ne peut pas faire. **Le scénario reste rouge exprès** — le neutraliser
ferait disparaître le trou du radar. Correctif différé par décision de Michel.

---

## CE QUI RESTE OUVERT, ET DANS QUEL ORDRE

1. **Le test A/B du §22** — même sportif, avec et sans mémoire, même demande. **4 appels, ~0,05 €.**
   C'est la seule mesure qui puisse changer une décision produit. Décision de Michel.
2. **Le budget de séries** — défaut mesuré, vérifiable par du code, pas encore épinglé.
3. **Enrichir les personas** — sur les 55 scénarios, **3 seulement** donnent un historique à Milo,
   0 un programme, 0 un cycle, 0 un état du jour, alors que **20 demandent de construire une
   séance**. *Le banc mesure donc si Milo écrit une séance plausible, pas si la mémoire la rend
   meilleure.* Rien n'empêche plus de les écrire.
4. **Le filtre « sans équipement »** — différé, chiffré, écrit dans `IDEES-FUTURES.md`.

---

## CE QUE JE RETIENS, ET QUI VAUT POUR LA SUITE

Ton plan cherchait des défauts **du modèle**. Sur les cinq rouges de cette passe, **quatre étaient
l'outil de mesure**. Le seul vrai pointait un trou dans **l'application**, pas dans Milo.

👉 ***Avant de faire parler un banc d'essai, il faut l'éprouver dans les deux sens : vert sur la
bonne réponse, et rouge sur la mauvaise.*** Un rouge sur la bonne réponse coûte plus cher qu'un test
absent — il apprend à ne plus lire les rouges, et il enterre les vrais.

*Document produit le 03/09/2026 (dépôt à `ft-v1113`). Toutes les mesures citées sont rejouables ;
aucun appel API n'a été passé pour l'écrire.*
