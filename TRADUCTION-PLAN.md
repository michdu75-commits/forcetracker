# 🌍 Traduction de l'application — plan & état (démarré 2026-07-12)

Langues cibles : **FR (défaut) · EN (anglais) · ES (espagnol) · EL (grec) · RU (russe)**
Branche de travail : `feat/traduction-app`. **Sur le CLONE d'abord** (la prod reste en français tant que ce n'est pas validé).

## ✅ Ce qui est fait (fondation, sur le clone)
- **Moteur i18n** : `translations.js` (nouveau fichier). Principe : le **code garde ses textes source en français** ; à l'affichage, on **parcourt le DOM** et on remplace les chaînes connues par leur traduction (dictionnaire `TR`). Un `MutationObserver` ré-applique après chaque rendu dynamique. **Aucune réécriture massive du code** → sûr et rapide à étendre.
- **Sélecteur de langue (drapeaux 🇫🇷🇬🇧🇪🇸🇬🇷🇷🇺)** : bouton drapeau dans la barre du haut (`openLangPicker`), overlay `#ov-lang`. Changer de langue = `setLang(l)` → sauvegarde `ft4_lang` + **recharge la page** (propre, source toujours en FR).
- **Milo (Coach IA) multilingue** : `buildCoachContext` (coach.js) → « Tu réponds TOUJOURS en {langue} ». Les consignes internes restent en français, mais Milo **répond dans la langue choisie** (Claude traduit naturellement). Testé : contexte contient bien « anglais » en mode EN.
- **Dictionnaire `TR`** (dans translations.js) : couvre le **squelette visible** — navigation, boutons/actions communs, Accueil, Séance, Nutrition, Progrès, Profil (titres de sections), Menu, Onboarding. ~150 chaînes × 4 langues.
- **Testé (Playwright, EN)** : nav traduite (Home/Progress/Coach/Menu), drapeau 🇬🇧, `t('Enregistrer')`→Save, Milo en anglais. 0 erreur JS.

## ⏳ Ce qui reste (pour une traduction 100 %)
Le moteur traduit les chaînes **statiques exactes** listées dans `TR`. Restent à ajouter :
- Les **chaînes dynamiques** (celles avec des valeurs, ex. « 3 séries · 40 kg ») — le walker ne les matche pas (le texte final varie). À gérer au cas par cas (soit clé sans la partie variable, soit traduire la fonction de rendu).
- Les **écrans profonds** : tout le contenu détaillé de `index.html` (modales, aides), `WHATS_NEW`, `NEW_FEATURES`, `_HELP_DATA`, `_DRAWER_CONTENT` (aide + guides), le guide-film, les libellés d'exercices, etc.
- Certaines chaînes construites en JS (toasts, messages).

## 🔧 Comment ÉTENDRE la traduction
Ouvrir `translations.js` → ajouter dans `TR` : `"texte FR exact":{en:"…",es:"…",el:"…",ru:"…"}`. La **clé = la chaîne française telle qu'affichée** (trim). C'est tout — le moteur s'en charge. Pour du texte dynamique, isoler la partie fixe ou utiliser `t('…')` directement dans le code de rendu.

## 🚀 Comment PROMOUVOIR en prod (quand validé)
`translations.js` est déjà dans le repo (dormant en prod, non chargé). Pour l'activer :
1. `index.html` : ajouter `<script src="translations.js"></script>` (après constants.js) + le bouton drapeau dans la topbar.
2. `coach.js` : la ligne Milo multilingue (« réponds en {langue} »).
3. `sw.js` : ajouter `'./translations.js'` au `PRECACHE` + bump du cache.
4. (`build_clone.py` inclut déjà `translations.js`.)

## 📝 Notes
- Grec (EL) : Michel est d'origine grecque.
- Le drapeau 🇬🇧 est utilisé pour l'anglais (au lieu de 🇺🇸).
- Approche volontairement **incrémentale** : on peut traduire de plus en plus de chaînes sans rien casser (les non-traduites restent en français, lisibles).
