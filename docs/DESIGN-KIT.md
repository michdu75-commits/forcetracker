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

```
CONTRAINTES TECHNIQUES (à respecter strictement)
- HTML + CSS purs. Aucun framework, aucune librairie, aucun build.
- Application MOBILE : largeur maximale 430 px, une seule colonne.
- Mode sombre par défaut ; le mode clair est une variante de la même page.
- Pas de <canvas> pour l'interface : les anneaux, jauges et graphiques sont en SVG.
- Les polices sont hébergées dans le projet : Manrope (texte), Space Grotesk (chiffres),
  Pacifico (logo uniquement).

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
