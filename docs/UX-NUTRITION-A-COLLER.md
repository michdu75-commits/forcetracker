# 🍽️ UX Nutrition — dossier à coller dans Claude Design

> **Créé le 25/08/2026**, à la demande de Michel : *« pour la nutrition, ça ne va pas — peux-tu me
> faire un dossier pour Claude Design pour améliorer l'UX ? »*
>
> ⚠️ **AUTONOME : lisible sans le dépôt.** C'est tout l'objet de ce genre de kit. Le projet en a
> déjà trois (`DESIGN-KIT.md` pour l'écran, `CONTRAINTES-PDF.md` pour le papier,
> `MOTEUR-MET-A-COLLER.md` pour le moteur), et ils existent tous pour **la même raison** : un outil
> extérieur travaille **à l'aveugle**. Il ne connaît ni les couleurs, ni les polices, ni les
> composants — alors il **invente** une esthétique, belle chez lui et **intransposable** ici.
>
> ⭐ **Tout ce qui suit est MESURÉ dans un vrai navigateur** (Chromium, 390 × 844, densité 2×),
> le 25/08/2026 sur la version en production. Aucun chiffre de mémoire.

---

## ⚠️ 0. CE DOSSIER A ÉTÉ EN PARTIE APPLIQUÉ — lire ceci avant de s'y fier (26/08/2026)

**L'onglet Macros a été réorganisé en `ft-v1025`** (chantier `docs/MACROS-A.md`, variante A). **Les
mesures de l'onglet Macros ci-dessous décrivent donc l'état d'AVANT.** Elles restent utiles — c'est
le diagnostic qui a motivé le chantier — mais elles ne décrivent plus l'écran.

*Un document d'état qu'on ne date pas fait dire des bêtises à celui qui le lit* (**R23**).

| Ce que disait ce dossier | Mesuré après ft-v1025 |
|---|---|
| Onglet Macros : **2 800 px** (3,3 écrans) | **1 439 px** — et **2 649 px** re-mesurés avant, avec la fixture du témoin |
| *« noter ce que je mange »* à **1 957 px** | **415 px** |
| La cible affichée **deux fois** à 200 px d'écart | **une seule fois**, en petit, en tête de carte |
| **647 px** de réglages au milieu du contenu | dans **deux accordéons repliés**, en pied d'onglet |

**⛔ CE QUI N'A PAS ÉTÉ TRAITÉ, et qui reste vrai dans ce dossier** : l'onglet **Journal** (§4.2 —
il ne tient plus en un écran, et il a **perdu** la carte « ce que l'app a appris », passée dans
Macros), l'onglet **Suppléments** (jamais relevé bloc par bloc), le **mode clair** (§6.6), et
surtout **§5.6 — le plan de repas est une table écrite en dur** : il ne connaît ni ce que la
personne mange ni ce qu'elle déteste. *C'est la raison pour laquelle il est désormais replié, et
le sous-titre le dit à l'écran.*

---

## 1. Le produit, en trois phrases

**Force Tracker** est une application de suivi de musculation. Sa promesse n'est pas l'intelligence
artificielle mais la **mémoire** : *« il ne te dit pas qui tu dois devenir, il se souvient de qui tu
es devenu »*. **Milo** est le coach conversationnel intégré.

**La nutrition n'est pas le cœur du produit — c'est un levier au service de l'entraînement.** Le
document de référence interne le dit en une phrase-boussole : *« la nutrition est un moyen
d'améliorer la santé, la récupération et la performance ; elle ne doit jamais devenir une source de
stress supérieure au bénéfice qu'elle apporte »*. ⛔ **Ce principe n'est pas décoratif : il exclut
tout ce qui culpabilise, classe, note ou met en échec.**

---

## 2. ⛔ LES CONTRAINTES — à lire avant de dessiner

Elles ne sont pas négociables. Un écran qui les ignore est **intransposable**, quelle qu'en soit la
qualité graphique.

| | |
|---|---|
| **Largeur** | **430 px maximum**. Mobile uniquement. Pas de version bureau, pas de responsive à colonnes. |
| **Technique** | HTML/CSS/JS **vanilla**. Aucun framework, aucune étape de compilation. Pas de React, pas de Tailwind, pas de Flutter. |
| **Thème** | **Sombre par défaut.** Le mode clair existe et doit rester lisible, mais le sombre est la référence. |
| **Rendu** | **SVG + CSS.** L'interface n'utilise pas `canvas` (104 `<svg>` dans l'app ; canvas ne sert qu'à traiter des images). |
| **Hors ligne** | L'app s'ouvre **sans réseau**, depuis son cache. Un écran qui a besoin d'une requête pour s'afficher est refusé. |

⭐ **Ce que ces contraintes n'interdisent PAS** — et c'est important, parce que le fondateur a cru
pendant des semaines être limité alors qu'il ne l'était pas : **dégradés, ombres, profondeur,
animations, transitions** sont tous parfaitement faisables. La limite est le **mobile** et le
**vanilla**, pas l'ambition visuelle.

---

## 3. 🎨 Le système visuel RÉEL (à reprendre tel quel)

```css
/* ── Mode sombre (référence) ─────────────────────── */
--bg:  #0C0D11;   --bg2: #14161C;   --bg3: #1B1E26;   /* fonds, du plus profond au plus clair */
--sep: rgba(255,255,255,.08);                          /* séparateurs */
--t1:  #F2F3F5;   --t2:  #8A8F99;   --t3:  #6B7180;   /* texte : fort · secondaire · discret */
--red: #FF6A73;   --red2:#EF3E57;                      /* accent principal (identité du produit) */
--green:#34D399;  --blue:#5BA8FF;   --gold:#EAB308;
--orange:#FF8A72; --purp:#A855F7;

/* ── Mode clair ──────────────────────────────────── */
--bg:  #E7E8EC;   --bg2: #F6F6F9;   --bg3: #DCDDE4;
--sep: #CBCCD6;   --t1:  #12121E;   --t2:  #4A4A6A;   --t3: #8888AA;
--red: #D91843;   --green:#00A856;  --blue:#1565C0;   --gold:#CC8800;
```

**Polices** : `Manrope` (texte courant) · `Space Grotesk` (chiffres et titres) · `Pacifico`
(logo uniquement). Elles sont **hébergées en local** — ne pas proposer de police Google.

**Codes couleur des macros, déjà établis et à ne pas inverser** :
🟩 protéines `--green` · 🟥 glucides `--red`/`--orange` · 🟨 lipides `--gold`.

**Composants existants** : cartes `--bg2` à coins arrondis (~14 px) sur fond `--bg` · boutons
pleins en `--red` pour l'action principale · boutons contour pour le secondaire · anneaux de
progression en **SVG** · barres de progression fines.

---

## 4. 📐 L'ÉCRAN AUJOURD'HUI — mesuré, pas décrit

> ⚠️⚠️ **MISE À JOUR DU 26/08/2026 — LE JOURNAL A GAGNÉ DEUX BLOCS DEPUIS LA MESURE.**
> Les chiffres ci-dessous datent du **25/08**. L'onglet **Macros n'a pas bougé** : ses 2 800 px
> et ses 3,3 écrans restent exacts, et **c'est lui le sujet du travail**. En revanche l'onglet
> **Journal** a reçu deux cartes neuves (voir **§4.3**), donc **il ne tient plus en un écran**.
> ⛔ **Je ne remplace pas son chiffre par une estimation** : je n'ai pas pu le remesurer
> proprement, et un nombre inventé serait pire qu'un nombre daté. *Le contraste Macros/Journal
> reste vrai — il est simplement moins spectaculaire qu'au 25/08.*


L'écran Nutrition a **trois onglets** : **Macros** · **Journal** · **Suppléments**.

### 4.1 Le contraste qui résume tout

| Onglet | Hauteur | Défilement |
|---|---:|---|
| **Journal** | **869 px** | **1,0 écran** |
| **Macros** | **2 800 px** | **3,3 écrans** |

⭐ **Le Journal est bien conçu** — et il faut le dire, parce qu'il ne s'agit pas de tout refaire :
un sélecteur de jour `‹ Aujourd'hui ›`, le compteur du jour, **trois façons de saisir** (À la main ·
Étiquette · Code-barres), puis les aliments **groupés par repas** avec leurs calories. Une intention
par zone, une action évidente. **C'est le modèle à suivre, pas à corriger.**

### 4.2 L'onglet Macros, bloc par bloc (dans l'ordre réel)

| # | Bloc | Hauteur | Nature |
|---|---|---:|---|
| 1 | Onglets Macros/Journal/Suppléments | 46 px | navigation |
| 2 | **« Où tu en es »** — `1005 / 3144 kcal`, protéines `87/187 g`, + un texte sur la moyenne | 201 px | **consultation quotidienne** |
| 3 | **Anneau `3 144 KCAL/JOUR`** + « Prise de muscle +450 » + répartition % + BMR/TDEE | 231 px | **consultation quotidienne** |
| 4 | « ✎ Ajuster mes calories à la main » | 42 px | réglage |
| 5 | Charge `+450` / Décharge `+250` | 64 px | réglage |
| 6 | **Mode alimentaire** (cétogène, jeûne…) | 230 px | **réglage rare** |
| 7 | Protéines / Glucides / Lipides en grammes | 195 px | consultation |
| 8 | Hydratation `3.5 L/jour` | 73 px | consultation |
| 9 | Séance du jour | 60 px | consultation |
| 10 | **Plan de repas** (petit-déjeuner, déjeuner…) | 491 px | **contenu — plan LOCAL** |
| 11 | « 📓 Noter ce que je mange › » | 121 px | action → renvoie à l'onglet Journal |
| 12 | **Type d'alimentation** + restrictions + allergies | 417 px | **réglage rare (formulaire)** |
| 13 | **PLAN DE REPAS IA** — « Générer ma semaine » / « Importer un plan » | 210 px | **contenu — plan IA** |

---

### 4.3 ⭐ LES DEUX BLOCS AJOUTÉS LE 26/08 — à intégrer, pas à réinventer

Ils sont **neufs, voulus, et déjà validés par l'auteur**. Le travail de design consiste à leur
donner leur place, **pas à décider s'ils doivent exister**.

**① « Ce qu'il te reste, en vrai »** — dans la carte du résumé du jour, sous les trois lignes de
macros. Il traduit un manque en **aliments que la personne mange déjà** :

```
CE QU'IL TE RESTE, EN VRAI
289 g  de glucides —  250 g de Riz basmati
167 g  de protéines — 2 × Shake protéiné + 250 g de Blanc de poulet   (≈ 108 g)
 53 g  de lipides —   100 g d'Amandes

À peu près — calculé sur tes aliments, pas sur une table générique. Une idée, pas une consigne.
```
- **1 à 3 lignes**, jamais plus. Une par macro qui manque vraiment.
- Le `(≈ 108 g)` n'apparaît **que** si la suggestion ne couvre pas le manque — c'est une
  honnêteté, pas une décoration.
- Codes couleur imposés : protéines `--green`, glucides `--orange`, lipides `--gold`.
- ⛔ **Il DISPARAÎT** sur un jour passé, quand la cible est dépassée, et quand la personne n'a
  aucun aliment enregistré. **Ton maquettage doit tenir dans les deux états** — avec et sans.

**② « Ce que l'app a appris de ton alimentation »** — carte autonome, après le résumé du jour :

```
🧠 CE QUE L'APP A APPRIS DE TON ALIMENTATION
Petit-déj ~7h    Fromage blanc 0%
Déjeuner  ~13h   Riz basmati · Blanc de poulet
Dîner     ~20h   Œufs

Observé sur 6 jours · en moyenne 865 kcal et 87 g de protéines par jour noté.
C'est encore court — l'app décrit ces jours-là, pas tes habitudes.
Calculé sur ton téléphone, sans aucun appel à l'IA.
```
- **Trois états à dessiner**, pas un : *moins de 3 jours notés* (la carte le dit, elle ne se cache
  pas) · *partiel* (elle prévient que c'est court) · *solide* (à partir de 14 jours).
- ⚠️ **La dernière ligne n'est pas un détail technique** : c'est une promesse produit — *ça ne
  coûte rien et ça marche hors ligne*. Elle doit rester lisible.

---

## 5. ⛔ CE QUI NE VA PAS — cinq constats, tous mesurés

### 5.1 Le même chiffre est affiché deux fois, à 200 px d'écart
`3 144 kcal` apparaît dans le bloc 2 (*« 1005 / **3144** kcal »*) **et** au centre de l'anneau du
bloc 3 (*« **3 144** KCAL/JOUR »*). Le premier montre la **journée réelle en cours**, le second la
**cible théorique** et sa composition. **Deux vues du même sujet, empilées** — la personne doit
comprendre seule que ce n'est pas une répétition.

### 5.2 Les réglages sont enterrés dans le contenu quotidien
Les blocs **6** (mode alimentaire) et **12** (type d'alimentation, restrictions, allergies) sont des
**réglages qu'on pose une fois** — et ils sont posés **au milieu**, puis **tout en bas** de ce qu'on
consulte tous les jours. Le bloc 12 fait à lui seul **417 px de formulaire**, à 2 100 px du haut.
⚠️ Pire : les deux traitent du **même sujet** (ce que la personne mange ou non) et sont séparés par
**plus de 800 px** de contenu sans rapport.

### 5.3 Deux plans de repas coexistent sans se distinguer
Le bloc **10** est un plan **calculé localement** (gratuit, immédiat). Le bloc **13** est le plan
**généré par l'IA**. Rien à l'écran n'explique lequel s'applique, ni ce qui les différencie. *C'est
un point déjà identifié en interne comme source de confusion — il a failli faire corriger le mauvais
bloc lors d'une intervention précédente.*

### 5.4 On traverse tout l'écran pour arriver à l'action
Le bouton **« 📓 Noter ce que je mange »** — l'action la plus fréquente de tout l'onglet — est à
**1 957 px du haut**, soit après **2,3 écrans de défilement**. Et il ne fait que **renvoyer vers
l'onglet Journal**, qui est à un clic depuis le haut.

### 5.5 Trois niveaux de lecture cohabitent sans hiérarchie
Sur le même écran, et au même niveau visuel : le **réel du jour** (1005 kcal mangés), la **cible**
(3 144), les **paramètres du calcul** (BMR 1738, TDEE 2694), les **réglages** (charge/décharge,
mode, restrictions) et deux **propositions de plan**. *Tout est présenté comme également important,
donc rien ne l'est.*

---

### 5.6 ⭐⭐ L'app connaît l'athlète SPORTIVEMENT, pas du tout ALIMENTAIREMENT *(26/08)*

Mesuré : le questionnaire pose **6 questions** sur l'entraînement (ancienneté, séances/semaine,
lieu, quotidien, stress, sommeil) et **ZÉRO** sur la nourriture. Résultat visible à l'écran : le
**Plan alimentaire journalier** est une **table écrite en dur** — *« Yaourt grec entier + noix de
macadamia »* s'affiche parce que c'est dans le code, pas parce que ça concerne quelqu'un.

> L'auteur, devant son propre plan : *« les noix de macadamia j'en mange pas, et en plus c'est
> dégueulasse »*.

⛔ **Ce n'est PAS ton chantier** — le corriger demande de décider quoi demander et quoi observer,
c'est en cours ailleurs. **Mais ça doit peser sur ta maquette** : le plan de repas est aujourd'hui
le bloc le plus long de l'écran **et le moins pertinent**. Ne lui donne pas la place d'un contenu
sur mesure tant qu'il n'en est pas un.

---

## 6. ⛔ CE QUI NE DOIT PAS CHANGER

**À respecter absolument** — ce sont des décisions prises, pas des habitudes.

1. **Les trois onglets restent.** Le Journal fonctionne bien : on ne le refond pas.
2. **La barre de navigation du bas ne bouge pas** — et surtout **le bouton central rouge « + »**.
   C'est un point sensible du projet : toute modification d'écran doit vérifier qu'il n'a pas bougé,
   **en le mesurant**. Il fait 54 px et vit au centre.
3. **Aucune information n'est supprimée sans décision.** BMR, TDEE, hydratation, séance du jour :
   tout cela sert. Le sujet est **le classement et la hiérarchie**, pas le retrait.
4. **Rien de culpabilisant.** Pas de score, pas de note, pas de « objectif manqué », pas de rouge
   d'échec sur un dépassement. C'est la règle anti-stress citée au §1, et elle prime sur l'élégance.
5. **Les couleurs de macros ne s'inversent pas** (vert protéines · rouge/orange glucides · or lipides).
6. **Le mode clair doit rester lisible.** Ce n'est pas une variante secondaire.

---

## 7. 🎯 CE QU'ON ATTEND DE TOI

**Réorganiser l'onglet Macros.** Pas le réécrire : le **hiérarchiser**.

Les questions auxquelles l'écran devrait répondre, dans cet ordre :

1. **« Où j'en suis aujourd'hui ? »** — la seule chose qu'on regarde tous les jours.
2. **« Qu'est-ce que je mange ? »** — le plan, s'il y en a un.
3. **« Comment c'est calculé ? »** — BMR, TDEE, surplus. Utile, consulté rarement.
4. **« Mes réglages »** — objectif, mode, restrictions, allergies. Posés une fois, revus deux fois par an.

**Trois pistes, non exclusives** — à toi de trancher, ou d'en proposer une meilleure :
- **replier** ce qui est rarement consulté (accordéons) plutôt que de l'empiler ;
- **déplacer** les réglages ailleurs (une page dédiée, ou l'écran Profil qui en accueille déjà) ;
- **fusionner** les blocs 2 et 3, qui parlent du même chiffre.

⚠️ **Le vrai critère de réussite n'est pas esthétique** : *une personne qui ouvre l'onglet doit savoir
où elle en est **sans faire défiler**.* Aujourd'hui il faut 3,3 écrans pour en faire le tour.

---

## 8. ⚠️ CE QUE TU NE PEUX PAS DEVINER — et qui a déjà coûté

**Une tentative précédente avec un outil externe a échoué**, et les raisons sont instructives :
> *« le cercle n'a rien à voir, pas de profondeur, les couleurs pas respectées »* — et l'outil avait
> proposé du **Flutter** pour une application web vanilla.

D'où ce dossier. Trois pièges à connaître :

⚠️ **① Les noms de champs ne s'inventent pas.** En préparant ce dossier, j'ai peuplé le journal avec
des clés `gluc`/`lip` — l'app lit `carbs`/`fat`. Tout s'affichait « G 0 · L 0 », et j'ai bien failli
signaler un bug qui n'existait pas. *Un levier qui n'est pas celui du code produit une mesure propre
et fausse.* **Si une maquette suppose une donnée, elle doit dire laquelle.**

⚠️ **② Le contenu réel est plus long que le contenu de démonstration.** Les noms d'aliments, les
plans de repas, les listes de restrictions débordent vite. Une maquette calibrée sur « Poulet
grillé » cassera sur « Rowing Poitrine Appuyée (Chest Supported) ».

⚠️ **③ Ce qui est demandé, c'est une DIRECTION, pas du code.** Le bon partage des rôles, établi
dans le projet : **l'outil externe explore une direction**, l'équipe la **rend réelle** sur l'écran
existant. Une maquette transposable vaut mieux qu'une belle page impossible à porter.

---

## 9. 📎 Le brief en une phrase, si tu ne lis rien d'autre

> Réorganise l'onglet **Macros** de l'écran Nutrition d'une application mobile de musculation
> (430 px, thème sombre, palette et polices ci-dessus) : il fait aujourd'hui **3,3 écrans de
> défilement**, mélange le suivi du jour, les paramètres de calcul, deux plans de repas et
> **417 px de formulaire de réglages**, et affiche **deux fois le même chiffre** à 200 px d'écart.
> **On veut savoir où on en est sans faire défiler.** Rien de culpabilisant, aucune information
> supprimée sans décision, et la barre de navigation du bas ne bouge pas.

---

*Mesures : version en production du 25/08/2026, Chromium 390 × 844 densité 2×. Aucun fichier de
code modifié pour produire ce document.*
