# 🧱 Brief technique pour une IA extérieure — « ne me rends pas de HTML »

> **Créé le 02/09/2026**, demande de Michel : *« donne les infos nécessaires à GPT pour pas
> qu'il sorte des trucs en HTML, et que c'est bien une appli PWA avec les contraintes qui
> vont avec »*.
>
> 📄 **Version autonome à envoyer** : `Force-Tracker-brief-technique-GPT.pdf` (3 pages).
> ⚙️ Régénérable : `scratchpad/brief-tech.html` → Chromium `page.pdf()`.

---

## ⚠️ Pourquoi ce fichier, alors que `DESIGN-KIT.md` existe

**Ce n'est pas le même besoin, et confondre les deux coûte cher.**

| | `docs/DESIGN-KIT.md` | **ce fichier** |
|---|---|---|
| Destinataire | un outil qui **DESSINE** (Claude Design, un canevas de maquette) | une IA qui **RAISONNE** (GPT en analyse/architecture) |
| Ce qu'on lui demande | *« rends-moi UN fichier HTML autonome »* | ⛔ ***« ne rends JAMAIS de code »*** |
| Ce qu'on veut en retour | une image, une direction visuelle | une **spécification** : règle, états, seuils, cas limites |

👉 Le kit de design **réclame** du HTML ; ici on l'**interdit**. Les envoyer tous les deux au
même interlocuteur produit exactement la contradiction qu'on cherche à éviter.

---

## ⭐ Le constat qui l'a motivé

GPT produit des propositions de bonne qualité **sur le fond**, et les rend en HTML/CSS
— parfois avec des couleurs, des polices et des composants inventés. **Ce code n'entre jamais
dans le projet** : il faudrait le réécrire entièrement pour l'insérer dans des fichiers
existants, avec les `id` existants (**799**), les variables de couleur existantes (**13**) et
les fonctions de rendu existantes (**1 441**).

⚠️ **Et c'est pire qu'une maquette ratée** : une maquette se voit intransposable tout de suite,
un bloc de code **a l'air** intégrable — donc on essaie, et on perd la journée.

---

## 📏 Ce que le document contient (tout MESURÉ le 02/09, pas repris d'une note)

| Fait | Mesure |
|---|---|
| Frameworks | **0** — ni React, Vue, Svelte, Tailwind, jQuery |
| Étape de compilation | **0** — **aucun `package.json` à la racine**, fichiers servis tels quels |
| Fichiers servis | **13** (1 HTML · 1 CSS · 10 JS · 1 service worker) |
| Lignes de code servi | **44 434** |
| Fonctions globales | **1 441** — portée partagée, un nom au hasard **écrase** quelque chose |
| `id=` dans le HTML | **799** — en renommer un ne lève **aucune erreur**, l'écran reste vide |
| Balises `<svg>` | **196** — aucune limite graphique ; `canvas` ne sert qu'aux images |
| Dépendance externe | **1** (le QR de partage). Polices comprises : tout est hébergé |

**Les 4 contraintes PWA** qui décident du reste : ouverture instantanée hors ligne · cache
versionné **bumpé à la main** · `localStorage` comme seul stockage (et **deux onglets ouverts en
même temps**) · **Safari iOS** comme navigateur de référence, avec ses bugs silencieux.

**Les valeurs réelles** : les 13 couleurs avec leur hex, les 3 polices (hébergées), `--r:16px` /
`--r-sm:10px`, largeur **430 px**, **mode sombre uniquement** (le clair existe entièrement mais
il est **en pause** depuis juillet — le sélecteur est masqué, `LIGHT_MODE_PAUSED = true`).

**Les 5 pièges déjà payés** (repris de `DESIGN-KIT.md`, ils valent pour les deux publics) : le
filtre SVG sur un tracé invisible sur iPhone · `mask-composite` · `@property` animé · le dégradé
SVG qui ne suit pas un arc · le repli obligatoire sur une propriété récente.

---

## ⛔ Ce que le document demande à l'IA de NE PAS faire

- du **code**, de quelque nature que ce soit ;
- des **couleurs / polices / tailles** hors de la liste ;
- des **chiffres inventés** présentés comme des recommandations (« +200 kcal », « fiabilité
  87 % », « seuil ±5 % ») — *nommer des états vaut mieux qu'un score qu'on ne sait pas calculer* ;
- une **bibliothèque à installer** — il n'y a pas d'installation ici ;
- ⛔⛔ **affirmer qu'une chose n'existe pas sans l'avoir vérifiée**. C'est le défaut le plus
  fréquent des audits extérieurs reçus : sur la passe nutrition, **3 points sur 11** décrivaient
  un défaut déjà corrigé ou un écran qui n'existe plus (**R23**).

## ✅ Et ce qu'il demande à la place
Règle en une phrase · **conditions de silence** · états nommés (dont « pas assez de données ») ·
seuils **avec leur origine** · cas limites · hiérarchie en mots · coût en appels réseau.

---

*À régénérer si la pile change (un framework entrerait, un build apparaîtrait) — sinon les
chiffres se périment et le brief fait dire des bêtises à celui qui le lit (R23).*
