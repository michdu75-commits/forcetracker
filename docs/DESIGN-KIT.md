# 🎨 Kit de design Force Tracker — à coller dans un outil de maquettage

> **Pourquoi ce fichier existe (27/07/2026).** Michel travaille ses maquettes avec un outil externe,
> dans un canevas d'aperçu qui **ne connaît pas** Force Tracker : ni ses couleurs, ni ses polices, ni ses
> composants. Résultat, l'outil **invente** une esthétique — belle chez lui, **intransposable** ici.
> Le 21/07/2026, une maquette a été rejetée exactement pour ça : *« le cercle n'a rien à voir, il n'y a
> pas de profondeur, les couleurs ne sont pas respectées »*.
>
> **Mode d'emploi** : coller le bloc ci-dessous **en tête de la demande de maquette**. L'outil dessine
> alors avec les **vraies** valeurs → ce qui s'affiche à l'écran est directement transposable.

---

## 📋 LE BLOC À COLLER

> **Une seule chose à copier.** Tout ce qui suit part ensemble : les contraintes, les couleurs,
> les composants ET les pièges déjà payés. C'est volontaire — une consigne qu'on doit **penser à
> ajouter** finit toujours par être oubliée le soir où on est pressé (règle **R27** : on s'applique
> ce qu'on promet à l'utilisateur, ne pas repartir de zéro à chaque fois).

```
CONTRAINTES TECHNIQUES (à respecter strictement)
- HTML + CSS purs. Aucun framework, aucune librairie, aucun build.
- Application MOBILE : largeur maximale 430 px, une seule colonne.
- Mode sombre par défaut ; le mode clair est une variante de la même page.
- Pas de <canvas> pour l'interface : les anneaux, jauges et graphiques sont en SVG ou en CSS.
- Les polices sont hébergées dans le projet : Manrope (texte), Space Grotesk (chiffres),
  Pacifico (logo uniquement). N'en charge aucune depuis internet.
- L'app doit fonctionner HORS LIGNE : aucune ressource externe, ni police, ni image, ni script.
- Doit s'afficher correctement sur SAFARI iOS (iPhone) — c'est le navigateur de référence.
- Rends-moi UN SEUL fichier HTML autonome, que je puisse ouvrir tel quel.

PIÈGES DÉJÀ PAYÉS SUR CE PROJET — les respecter, ce ne sont pas des préférences
- Safari iOS rend MAL un filtre SVG appliqué à un TRACÉ (ombre interne sur un stroke) :
  l'élément devient quasi invisible sur iPhone alors qu'il s'affiche sur ordinateur.
  Pour creuser une rainure, empiler des cercles simples plutôt qu'un <filter>.
- Ne pas utiliser mask-composite / -webkit-mask-composite : imbriquer deux masques
  d'un seul calque à la place.
- Ne pas animer une variable CSS via @property : elle est pilotée en JavaScript.
- Un dégradé SVG est LINÉAIRE : il ne peut pas suivre un arc de cercle. Pour une couleur
  qui tourne (rouge à 0 -> vert à 100), c'est conic-gradient, pas SVG.
- Toujours prévoir un repli quand une propriété récente peut ne pas être supportée
  (ex. color-mix) : sinon la déclaration est ignorée et l'élément DISPARAÎT.

SYSTÈME DE COULEURS — utiliser CES variables, ne pas en inventer d'autres

:root {
  --bg:  #0C0D11;  --bg2: #14161C;  --bg3: #1B1E26;   /* fonds : page, carte, carte enfoncée */
  --sep: rgba(255,255,255,.08);                        /* séparateurs et bordures */
  --t1:  #F2F3F5;  --t2:  #8A8F99;  --t3:  #6B7180;    /* textes : fort, moyen, discret */
  --red: #FF6A73;  --red2:#EF3E57;                     /* couleur d'accent (identité) */
  --green:#34D399; --blue:#5BA8FF;  --gold:#EAB308;
  --orange:#FF8A72; --purp:#A855F7;
  --r: 16px; --r-sm: 10px;                             /* arrondis */
  --font: 'Manrope', -apple-system, sans-serif;
  --font-cond: 'Space Grotesk', sans-serif;            /* chiffres, données */
}
/* Mode clair — mêmes noms, autres valeurs */
.light-mode {
  --bg:#E7E8EC; --bg2:#F6F6F9; --bg3:#DCDDE4; --sep:#CBCCD6;
  --t1:#12121E; --t2:#4A4A6A; --t3:#8888AA;
  --red:#D91843; --green:#00A856; --blue:#1565C0; --gold:#CC8800; --orange:#CC5200;
}

COMPOSANTS EXISTANTS — les réutiliser tels quels

.btn      { width:100%; padding:15px; border:none; border-radius:var(--r);
            font:700 16px var(--font); letter-spacing:.3px; cursor:pointer; }
.btn-red  { background:linear-gradient(135deg,#FF2D55,#FF4D6D); color:#fff;
            box-shadow:0 4px 20px rgba(255,45,85,.3); }          /* bouton principal */
.card     { background:var(--bg2); border:1px solid var(--sep);
            border-radius:var(--r); overflow:hidden; }
.sbox     { border-radius:var(--r); padding:12px 14px; }          /* petite boîte */
.modal    { background:var(--bg2); border-radius:24px 24px 0 0; padding:22px;
            max-width:430px; max-height:85dvh; }                  /* feuille du bas */

ANNEAU / JAUGE — le motif utilisé partout (SVG, pas canvas)
<svg width="120" height="120" style="transform:rotate(-90deg)">
  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg3)"  stroke-width="11"/>
  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--green)" stroke-width="11"
          stroke-linecap="round" stroke-dasharray="327" stroke-dashoffset="98"/>
</svg>
(327 = circonférence ; dashoffset = 327 × (1 − pourcentage). Pour de la profondeur :
 <filter> avec feDropShadow, ou un <linearGradient> — jamais une image.)

ANNEAU DE PROGRESSION (le cas le plus demandé) — deux techniques, pas une
- SVG (<circle> + stroke-dasharray) : parfait pour la FORME et l'animation de remplissage,
  mais son dégradé est LINÉAIRE — il ne peut pas tourner avec l'arc.
- CSS conic-gradient : le seul moyen d'avoir une couleur qui SUIT le cercle
  (ex. rouge à 0, vert à 100). Recette qui marche sur Safari iOS :

.ring{position:relative;width:100px;height:100px;}
.ring .track,.ring .arcwrap{position:absolute;inset:0;border-radius:50%;}
.ring .track{background-color:var(--bg3);
  -webkit-mask:radial-gradient(closest-side,transparent 76%,#000 76.5%);
          mask:radial-gradient(closest-side,transparent 76%,#000 76.5%);}
.ring .arcwrap{                                   /* la PART : --p = 0..100 */
  -webkit-mask:conic-gradient(from 0deg,#000 calc(var(--p)*1%),transparent 0);
          mask:conic-gradient(from 0deg,#000 calc(var(--p)*1%),transparent 0);}
.ring .arc{position:absolute;inset:0;border-radius:50%;
  background:conic-gradient(from 0deg,#FF4D5E 0%,#FF8A72 33%,#EAB308 66%,#34D399 100%);
  -webkit-mask:radial-gradient(closest-side,transparent 78%,#000 78.5%);
          mask:radial-gradient(closest-side,transparent 78%,#000 78.5%);}

  Trois pièges à éviter absolument :
  1. NE PAS utiliser mask-composite / -webkit-mask-composite (mal supporté) : on IMBRIQUE
     deux masques d'un seul calque (le parent découpe la part, l'enfant creuse le trou).
  2. NE PAS animer --p avec @property : le piloter en JS (requestAnimationFrame), comme le
     compteur du chiffre. Zéro dépendance à une fonctionnalité récente.
  3. Le TOUR GRIS doit être un peu PLUS LARGE que l'arc coloré (trou 76 % contre 78 %),
     sinon la couleur le recouvre et le cercle ne se lit plus comme complet.

RÈGLES DE STYLE
- L'accent rouge est l'identité : le garder pour l'action principale, ne pas le diluer partout.
- Les chiffres importants en Space Grotesk, gros, avec l'unité en plus petit et en --t3.
- Hiérarchie par le CONTRASTE de texte (--t1 / --t2 / --t3), pas par des couleurs en plus.
- Zones tactiles ≥ 44 px : l'app s'utilise debout, en salle, parfois les mains moites.
- Toujours proposer le rendu en mode sombre ET en mode clair.
```

---

## ⚠️ Ce qu'il ne faut PAS demander à un outil de maquettage

| À éviter | Pourquoi |
|---|---|
| Du code **Flutter / React / Vue** | L'app est en HTML/CSS/JS purs, sans build. Rien n'est transposable. *(C'est ce qui est arrivé le 21/07 : du Flutter proposé pour une PWA.)* |
| Des **polices Google** chargées en ligne | Règle d'or #4 : aucune dépendance réseau au démarrage. Les polices sont dans le projet. |
| Des **images** pour des éléments d'interface | Les anneaux, jauges et icônes sont en SVG : nets à tout écran, recolorables par variable, et ils ne pèsent rien. |
| Du **SVG** quand on demande une couleur qui tourne autour du cercle | Un dégradé SVG est droit : il pose les couleurs de travers sur un arc (constaté le 28/07 — le rouge tombait en bas de l'anneau). Pour ça, c'est `conic-gradient`. |
| Une **refonte complète** d'un écran | Règle #7 : une chose à la fois, testée. Et l'identité « figurines muscles » ne se remplace pas par un thème générique. |

## 💡 L'alternative qui évite toute transposition

Pour une variante visuelle sur un écran **existant**, il n'y a pas besoin de maquette externe :
Claude Code peut modifier le vrai écran et **envoyer une capture du rendu réel** (c'est ainsi qu'ont été
faites les captures du Guide et du carrousel). Zéro perte entre la maquette et l'app — puisqu'il n'y a
pas de maquette.

**Le bon partage des rôles** : l'outil de maquettage pour **explorer une direction** (ambiance, idées,
compositions) · Claude Code pour **la rendre réelle** sur l'écran existant.

---

*À mettre à jour si les variables de `style.css` changent (bloc `:root`, ligne ~33).*
