# Onglet Macros — réorganisation (variante A) — à coller dans Claude Code

> Écrit le 26/08/2026 pour Michel. Direction validée : **variante A** de la maquette
> `Nutrition Macros - Refonte.dc.html` (colonne `1a`).
> Décision explicite : **les réglages restent dans l'onglet Macros**, repliés dans un accordéon en
> pied d'onglet. Pas de sous-page, pas de déplacement vers Profil.

---

## ⚠️ APPLIQUÉ EN `ft-v1025` (26/08/2026) — quatre écarts relevés en le confrontant au code

**Ce document reste tel qu'il a été écrit** — il a été rédigé **sans accès au dépôt**, à la
révision `de335fd4532d`. Voici ce que la vérification a corrigé ; **c'est le code qui fait foi**.

| Ce que dit le brief | Ce que dit le code |
|---|---|
| `#nu-macros` va de la ligne 635 à **747** | il finit ligne **745** (sans conséquence) |
| §3 : *« reprends le composant SVG existant — celui de l'anneau de récup »* | **cet anneau n'est pas en SVG** : `conic-gradient` + masques imbriqués (`style.css:1409`), avec un commentaire disant que c'est *la seule façon d'avoir une couleur qui SUIT le cercle*. Le vrai anneau SVG est celui de la **bande des 7 jours** du Journal (`screens.js`, ft-v1004, r=11) → repris et agrandi à 92 px |
| §2/§6 : *« charge/décharge `#nu-cycle` (l. 712) »* | `#nu-cycle` est **l'explication du cycle des glucides** ; les boutons Charge/Décharge sont `.phase-row` (l. 689-692). *Suivre le brief au mot aurait rangé le mauvais bloc — et laissé les vrais boutons au milieu de l'écran quotidien.* |
| §4 : *« 🧠 Ce que l'app a appris — n'existe pas, créer »* | **elle existait**, dans l'onglet **Journal**, avec ses trois états (ft-v1021, le matin même). Elle a été **déplacée**, pas recréée : deux exemplaires auraient divergé (**R2**). Idem pour *« ce qu'il te reste »* (ft-v1019), qui reste **visible aux deux endroits** mais avec **un seul code**. |

**⭐⭐ ET SA FUSION « carte du jour + semaine » (§2 bloc 1, §3) A ÉTÉ REFUSÉE PAR LA MESURE.**
Fusionnées, la carte montait à **552 px** et les cinq premiers blocs à **958 px** — pour un objectif
que le brief fixe lui-même à **844**. `#nu-ou-en-es` reste donc une carte à part, rangée avec le
**rétrospectif** (*ce que l'app a appris · ta semaine*). Ça se tient : *le jour et la semaine ne
sont pas le même horizon.*

**Mesure finale, dans un vrai navigateur (390 × 844)** : cinq premiers blocs **793 px** · onglet
entier **1 439 px** contre **2 649 px** re-mesurés sur l'ancien code · *« noter ce que je mange »*
à **415 px** contre **1 783**. 🔴 Bouton central « + » : **44 × 44, cx 166,8, top 792** — identique
avant/après, mesuré à trois moments.

**⛔ L'animation de remplissage des anneaux (§3) n'a pas été reprise**, et c'est délibéré : l'onglet
Macros se re-dessine à **chaque** retour dessus (`switchNuTab`), donc elle rejouerait à chaque
aller-retour entre Journal et Macros. Anneaux remplis directement.

**⭐ R13 — aucun composant nouveau** : l'accordéon demandé aux §6 et §7 existait déjà
(`details.acc`, `style.css` — celui du Profil et du menu admin). `<details>` natif, zéro JS,
chevron et clavier gratuits. **Aucune ligne de CSS ajoutée par ce chantier.**

---

## 0. ⛔ Périmètre — ce qui est touché et RIEN d'autre

**Un seul conteneur est modifié : `#nu-macros` dans `index.html` (l. 635 → 747).**

| Touché | Pas touché |
|---|---|
| L'ordre des enfants de `#nu-macros` | `#nu-journal` (l. 630), `#nu-suppl` (l. 748) |
| Deux nouveaux blocs ajoutés dans `#nu-macros` | La barre d'onglets `.nu-tabs` (l. 623-627) |
| `renderNutrition()` (`screens.js:2015`) — remplissage des nouveaux blocs | `switchNuTab()` (`app.js:913`) |
| | **La barre de navigation du bas, et le bouton central rouge « + » (54 px)** |

⚠️ **La barre du bas et le `+` ne sont pas dans `#s-nutrition`.** Aucune ligne de leur bloc n'est
touchée par ce chantier — c'est structurel, pas une intention. **Vérifie-le quand même en le
mesurant** (§6 du dossier UX : « toute modification d'écran doit vérifier qu'il n'a pas bougé »).

⛔ **Aucune information n'est supprimée.** BMR, TDEE, hydratation, séance du jour, charge/décharge,
répartition % : tout reste. Le sujet est le **classement**, pas le retrait.

---

## 1. Le problème en une ligne

L'onglet fait **2 800 px / 3,3 écrans**. On veut : *savoir où on en est **sans faire défiler***
(844 px). Le même chiffre (`3 144`) est affiché deux fois à 200 px d'écart, l'action la plus
fréquente est à 1 957 px du haut, et 647 px de formulaire de réglages sont posés au milieu du
contenu quotidien.

---

## 2. L'ordre cible des enfants de `#nu-macros`

Les identifiants ci-dessous sont ceux du dépôt (relevés par recherche — **revérifie les numéros de
ligne**, `index.html` dépasse le plafond de lecture et je n'ai pas pu le parcourir en entier).

| # | Bloc | Source actuelle | Action |
|---|---|---|---|
| 1 | **Carte « Aujourd'hui »** (fusion des blocs 2 + 3) | `#nu-ou-en-es` (l. 637) + la carte anneau/BMR/TDEE (l. 655-685) | **fusionner** — voir §3 |
| 2 | **Bouton « 📓 Noter ce que je mange »** | `#nu-journal-ptr` (l. 732) | **remonter ici** — code inchangé |
| 3 | Bannière de cycle | `#nu-cycle-banner` (l. 638) | garder en place relative |
| 4 | Séance du jour | `.nu-stat` (l. 722-723) | remonter, inchangé |
| 5 | **🧠 Ce que l'app a appris** | *n'existe pas* | **créer** — voir §4 |
| 6 | Dérive d'activité | `#nu-act-drift` (l. 727) | inchangé |
| 7 | **« Ce que je mange »** — plan local replié + option Milo | blocs 10 et 13 | **regrouper** — voir §5 |
| 8 | Hydratation | l. 716-717 | inchangé, descendu |
| 9 | **« Comment c'est calculé »** — accordéon replié | `#nu-bmr`, `#nu-tdee`, répartition %, `#nu-adjust` (l. 687), charge/décharge `#nu-cycle` (l. 712) | **replier** — voir §6 |
| 10 | **« Mes réglages alimentaires »** — accordéon replié | `#nu-keto` (l. 694) + bloc 12 | **fusionner et replier** — voir §7 |

⭐ **Le critère de réussite** : les blocs 1 à 5 doivent tenir dans **844 px**. La maquette y arrive
avec la carte du jour à ~470 px, le bouton à 52 px, la séance à 56 px.

---

## 3. Bloc 1 — la carte « Aujourd'hui » (fusion 2 + 3)

Une seule carte `--bg2`, `border-radius:14px`. Elle règle le doublon du `3 144`.

```
AUJOURD'HUI · MARDI 26                    CIBLE 3 144 KCAL     ← t3, 10px, letter-spacing 1.3px
1 005  kcal mangées                                            ← Space Grotesk 44px, t1
▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░                                      ← 4px, dégradé --red2 → --red
2 139 kcal restantes                                           ← t2, 12.5px
────────────────────────────────────────
   ( 87 )      ( 96 )      ( 34 )                              ← trois anneaux 92px
   / 187 g    / 385 g     / 87 g
  PROTÉINES   GLUCIDES    LIPIDES
────────────────────────────────────────
CE QU'IL TE RESTE, EN VRAI                                     ← §4.3 du dossier, dans la carte
```

**La cible reste affichée, mais une seule fois, en discret.** Le gros chiffre est le réel du jour.

### Les trois anneaux

⚠️ **Ma maquette les dessine en `conic-gradient` ; l'app utilise des anneaux SVG** (§3 du dossier :
« anneaux de progression en SVG »). **Reprends le composant SVG existant** — celui de l'anneau de
récup — plutôt que de porter ma technique. La direction est *trois anneaux côte à côte, un par
macro*, pas *conic-gradient*.

- Diamètre 92 px, trois en grille `repeat(3,1fr)`, `justify-items:center`.
- **Une seule couleur par anneau, prise du kit, sans dégradé** : protéines `--green #34D399`,
  glucides `--orange #FF8A72`, lipides `--gold #EAB308`.
- Tour de piste en `--bg3`, **plus large que l'arc coloré** — c'est ce qui donne la profondeur, pas
  une teinte inventée.
- Centre : valeur en Space Grotesk 22px `--t1`, `/ 187 g` en 9.5px `--t3`.
- Remplissage animé ~1,1 s, ease-out cubique, en `requestAnimationFrame`. Coupé sous
  `prefers-reduced-motion`.

⛔ **N'applique PAS l'échelle rouge→vert de l'anneau de récup à ces anneaux.** Un anneau de
protéines à 47 % s'afficherait rouge, ce qui contredit les codes couleur des macros (§3) *et* la
règle anti-culpabilisation (§6.4). L'échelle rouge→vert reste réservée au score de récup.

⛔ **Aucune teinte hors kit.** La maquette a été corrigée une fois sur ce point : six teintes
intermédiaires avaient été inventées pour faire des dégradés, elles ont été retirées.

### Dépassement de cible

Quand la cible est dépassée : **aucun rouge d'échec**, les anneaux se remplissent à 100 % et la
ligne devient `Cible dépassée de 146 kcal. Un jour, pas une tendance.` (§6.4 du dossier).

---

## 4. Bloc 5 — « 🧠 Ce que l'app a appris de ton alimentation »

Carte autonome `--bg2`, après la séance du jour. Le contenu exact est au §4.3 du dossier UX.

**Trois états à implémenter, pas un :**

| État | Condition | Affichage |
|---|---|---|
| court | < 3 jours notés | « 2 jours notés. Pas encore assez pour décrire quoi que ce soit — l'app préfère se taire que deviner. » |
| partiel | 3 à 13 jours | les lignes de repas + moyenne + « C'est encore court — l'app décrit ces jours-là, pas tes habitudes. » |
| solide | ≥ 14 jours | les lignes de repas + moyenne, sans l'avertissement |

Grille des lignes : libellé de repas 78 px, heure 34 px, aliments en `flex:1` avec
`text-wrap:pretty`.

⭐ **La dernière ligne reste lisible dans les trois états** : point `--green` 5 px +
« Calculé sur ton téléphone, sans aucun appel à l'IA. » en `--t2` 11.5px. C'est une promesse
produit (hors ligne, gratuit), pas une note technique.

---

## 5. Bloc 7 — « Ce que je mange » : les deux plans réunis

Les blocs 10 (plan local, 491 px) et 13 (plan IA, 210 px) deviennent **une seule carte**, sous un
titre de section `CE QUE JE MANGE`.

- **Ligne 1 — Plan de repas**, replié par défaut, chevron `⌄`.
  Sous-titre obligatoire : `Calculé sur ton téléphone · pas encore adapté à ce que tu manges`.
  ⭐ Cette phrase est la réponse au §5.3 (rien ne distinguait les deux plans) **et** au §5.6 (le
  plan est une table écrite en dur). Elle est repliée parce qu'elle n'est pas encore pertinente —
  quand le plan deviendra personnalisé, elle se déplie par défaut et le sous-titre change.
- **Ligne 2 — Générer ma semaine avec Milo**, avec le badge `IA` en `--purp` (bordure
  `rgba(168,85,247,.45)`, radius 5px).
  Mention : `Un plan bâti sur tes aliments et tes horaires observés. Demande une connexion.`
  Deux boutons contour côte à côte : `Générer` (`--red`) et `Importer un plan` (`--t2`),
  `min-height:44px` chacun.

---

## 6. Bloc 9 — accordéon « Comment c'est calculé »

Replié par défaut. En-tête 56 px : titre `--t1` 14px + sous-titre `--t3` 11.5px
`Prise de muscle · +450 kcal · TDEE 2 694`, chevron `⌄` / `⌃`.

Déplié, dans l'ordre : BMR et TDEE en deux `--bg3` radius 10px · barre de répartition
P/G/L (8 px, trois segments aux couleurs des macros, `gap:2px`) avec les pourcentages dessous ·
charge `+450` / décharge `+250` en deux cases cliquables `min-height:44px` · la ligne
`✎ Ajuster mes calories à la main` en `--red`.

⚠️ `#nu-adjust` et `#nu-cycle` sont des **trous remplis par `renderNutrition()`**. L'accordéon
enveloppe les conteneurs ; **ne touche pas à ce que la fonction y écrit**.

---

## 7. Bloc 10 — accordéon « Mes réglages alimentaires » ⭐ c'est la variante A

Les blocs 6 (`#nu-keto`, mode alimentaire) et 12 (type d'alimentation, restrictions, allergies)
étaient séparés par plus de 800 px de contenu sans rapport. **Ils fusionnent en un seul accordéon,
replié, en pied d'onglet.**

- **Replié : 56 px.** En-tête `Mes réglages alimentaires` + sous-titre listant l'état courant :
  `Cétogène · sans lactose · allergie aux fruits à coque`.
  ⭐ Ce sous-titre est important : c'est la seule chose visible sans déplier, et il évite d'ouvrir
  pour vérifier.
- **Déplié**, trois sections : `MODE ALIMENTAIRE` (puces, `#nu-keto`) · `TYPE D'ALIMENTATION`
  (puces) · `RESTRICTIONS ET ALLERGIES` (une ligne `--bg3` cliquable, `min-height:44px`).
- Puces : `min-height:36px`, radius 10px, `--bg3` / `--t2` au repos, `--red` fond + `#0C0D11`
  texte quand actif.

**Pourquoi A et pas une sous-page ou Profil** — à savoir si la question revient :
le questionnaire pose 6 questions sur l'entraînement et **zéro** sur la nourriture (§5.6). Ces
réglages sont donc le seul endroit de l'app où les préférences alimentaires existent. Les envoyer
dans Profil les éloigne de deux écrans du plan qu'ils pilotent, et personne n'y serait jamais
envoyé. Repliés ici, ils restent au pied de l'écran où on constate leur effet, et le dépliement est
un geste volontaire.

⭐ **A se transforme en sous-page plus tard sans rien jeter** : le contenu de l'accordéon *est* la
sous-page. Si l'usage montre que le dépliement gêne, on le sort à ce moment-là.

---

## 8. Valeurs à ne pas réinventer

Tout vient de `docs/DESIGN-KIT.md` et de `style.css`. Aucune valeur ci-dessous n'est inventée.

```css
--bg #0C0D11   --bg2 #14161C   --bg3 #1B1E26   --sep rgba(255,255,255,.08)
--t1 #F2F3F5   --t2 #8A8F99    --t3 #6B7180
--red #FF6A73  --red2 #EF3E57
--green #34D399  --orange #FF8A72  --gold #EAB308  --blue #5BA8FF  --purp #A855F7
```

- Cartes : `--bg2`, `1px solid --sep`, `border-radius:14px`.
- Polices : `Manrope` pour le texte, `Space Grotesk` pour les chiffres et les libellés capitales.
  **Hébergées en local — aucune police Google.**
- Toute zone tactile : **44 px minimum**.
- Largeur de référence : **430 px**.

⚠️ **Le mode clair doit rester lisible** (§6.6 du dossier). La maquette ne traite que le sombre —
à reprendre avec les variables claires du kit, pas par inversion mécanique.

---

## 9. Ce qu'il faut vérifier avant de dire que c'est fini

1. **Le bouton central rouge `+` fait toujours 54 px et est toujours au centre.** À mesurer, pas à
   supposer.
2. **Les blocs 1 à 5 tiennent sous 844 px**, accordéons repliés, à 430 px de large.
3. Les trois onglets fonctionnent toujours : `switchNuTab('macros'|'journal'|'suppl')`.
4. `renderNutrition()` remplit toujours `#nu-ou-en-es`, `#nu-adjust`, `#nu-keto`, `#nu-cycle`,
   `#nu-act-drift` après déplacement.
5. **Les noms de champs ne s'inventent pas** (§8① du dossier) : l'app lit `carbs` et `fat`, pas
   `gluc`/`lip`. Une erreur de clé produit un affichage propre et faux.
6. **Test de débordement** : les libellés longs ne cassent pas la mise en page. Éprouve avec
   « Rowing Poitrine Appuyée (Chest Supported) » sur la séance du jour, et une liste de
   restrictions à cinq entrées.
7. Aucun rouge d'échec sur un dépassement de cible.
8. `tools/captures-nutrition.js` produit toujours ses captures 01→07 sans erreur.

---

## 10. Ce que la maquette ne couvre pas

- **L'onglet Journal.** Il a gagné deux cartes le 26/08 et ne tient plus en un écran (§4.2 du
  dossier), mais il n'était pas dans le périmètre — « le Journal fonctionne bien : on ne le refond
  pas ».
- **L'onglet Suppléments.** Jamais décrit dans le dossier. Il faudrait un relevé bloc par bloc
  comme celui de Macros.
- **Le mode clair.**
- **Rendre le plan de repas réellement personnalisé** — explicitement hors chantier (§5.6), mais
  c'est la raison pour laquelle il est replié.

---

*Source : `Nutrition Macros - Refonte.dc.html` colonne `1a` · dossier `docs/UX-NUTRITION-A-COLLER.md`
· `docs/DESIGN-KIT.md` · `index.html` `#nu-macros` · `screens.js:2015` · `app.js:913`.
Dépôt lu à `de335fd4532d`. Aucun fichier de l'app modifié pour produire ce document.*
