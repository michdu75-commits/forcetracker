# Force Tracker — Idées & projets futurs

Fichier de notes : bugs à corriger, fonctionnalités à explorer. Rien ici n'est en cours.

---

# 🗺️ FEUILLE DE ROUTE (ordre des priorités)

**Phase 1 — Stabiliser la fondation (AVANT tout le reste)**
1. ⭐ Refonte de la logique d'affichage des écrans (règle 3 bugs d'un coup).
2. 🧱 Découper index.html en plusieurs fichiers (moins de bugs + économie de tokens).
3. 🐞 Corriger les bugs restants (minuterie, bouton d'aide, écran qui s'éteint/pivote, touches fantômes, mode jour, en-tête incohérent).

**Phase 2 — Fiabiliser le cœur**
4. 📗 Refaire proprement le tableur de synchro (structure saine).
5. 🗂️ Ranger le dossier forcetracker + `.claspignore` correct.
6. 🔁 / ⚠️ Finaliser & clarifier superséries + dropsets (UX + édition).

**Phase 3 — Enrichir (une fois la base solide)**
7. Fonctionnalités : remontée exercices manquants, doublons, barre Progrès, pull-to-dismiss, swipe entre onglets, indicateur nouveauté, aide détaillée.
8. 🍽️ Nutrition : semaine de repas premium. 🩺 Profil avancé (santé).
9. ♿ Accessibilité (daltonien, basse vision, gaucher/droitier) + vérifs F-pattern / thumb zone.
10. 🖼️ Visuels exercices (machine + GIF) — gros chantier contenu.

**Phase 4 — Gros projets / long terme**
11. 🤖 Coach IA (mémoire premium, personnalité, proactif, sujets élargis).
12. 👩 Thème femme (priorité produit). 🎤 Logging vocal. ⌚ Garmin.
13. 🏗️ Base de données + hébergement adapté (quand le nombre d'utilisateurs le justifie).

> Principe : **structurer avant d'empiler** (voir « Principe directeur » plus bas). Une chose à la fois, testée, sur branche Git.

---

# 💡 IDÉES À CADRER (discussion en cours — pas encore lancées)

## 📣 Réseau social / fil communautaire (gros projet, long terme)
Idée Michel : une **page dédiée** type mini-réseau social / fil d'actu — ex. « Christophe a fait une super séance », « Événement aujourd'hui : salon du culturisme ». **Sans pop-up intrusif.** But : créer du lien entre utilisateurs.
- ⚠️ **Gros chantier** : nécessite un **vrai backend** (comptes, posts, modération, notifications non-intrusives) — l'archi actuelle (Apps Script + localStorage) ne suffit pas. À planifier quand la base utilisateurs le justifie (cf. Phase 4 « base de données + hébergement »).
- Piste douce et réaliste **tout de suite** : un simple **fil « Actus / Événements »** en lecture seule (annonces salon, défis du mois), alimenté par Michel — pas de comptes ni de posts utilisateurs. Beaucoup plus simple, sans backend social.

## 🔔 Rappel « tu as oublié d'enregistrer ta séance » (petit, faisable)
Michel veut **éviter les pop-ups à la con**, mais accepte un rappel utile : si une séance est **en cours depuis longtemps sans être terminée** (`S.wkt` actif, vieux), afficher un rappel discret (style carte Milo sur l'Accueil, pas de pop-up). → Faisable sans backend, à faire quand on veut.

## 💳 « Super Premium » (suivi Excel/Sheets) — Michel penche vers « trop »
Idée : un palier au-dessus du Premium pour ceux qui veulent le **suivi Excel/Sheets**. Michel doute que ça marche et pense que « c'est peut-être un peu trop ». **Avis : d'accord — ne pas ajouter de palier pour l'instant** (complexité tarifaire, valeur incertaine). L'export existe déjà (Exporter les données). À rediscuter seulement si des utilisateurs le réclament vraiment.

## ⚖️ Connexion à une balance connectée — limite technique honnête
Question Michel : se connecter à une appli de balance connectée (Withings, etc.) ?
- **PWA web = très limité** : pas d'accès à Apple Santé / Google Fit depuis le web, Web Bluetooth **non supporté sur iOS Safari/PWA**. Se brancher sur Withings/Fitbit demanderait leur **API OAuth + un backend** (lourd), et ne couvrirait pas Apple Health.
- **Réaliste aujourd'hui** : saisie manuelle (déjà en place). Une vraie synchro balance = **appli native** (futur) ou intégration API tierce ciblée (gros dev). À garder en tête, pas prioritaire.

---

# 🚧 EN COURS — à reprendre (non fini)

## 🏋️ Programme de force « Gagner en force (Big 3) » — v1 livrée (ft-v225), **à approfondir**

**Ce qui marche déjà (déployé) :**
- Bouton « Gagner en force (Big 3) » dans le Coach.
- Milo lit automatiquement les maxes (1RM) Squat / Développé Couché / Soulevé de Terre dans les records (`S.prs`).
- Il renvoie un conseil + un programme, avec un bouton « 💾 Enregistrer ce programme » qui l'ajoute dans « Mes programmes » (chargeable en séance avec les charges).

**Ce qui reste à faire / améliorer (pourquoi c'est « non fini ») :**
- **Vraie périodisation sur plusieurs semaines** : aujourd'hui le programme = des séances fixes. Il faudrait une progression semaine par semaine (montée des %1RM, deload) plutôt qu'un jeu de séances figé — idéalement relié au **Cycle de Force** existant (`s-cycle`) qui gère déjà accumulation → intensification → peak → décharge.
- **Mode « prépa compétition »** : viser une date de compétition, avec un peak calé dessus.
- **Fiabilité du format** : le programme dépend d'un bloc JSON généré par l'IA ; si le modèle ne respecte pas le format, pas de bouton « Enregistrer » (juste le conseil). À sécuriser (ex. action backend dédiée à réponse structurée, ou 2e tentative).
- **Correction des maxes avant génération** : laisser Michel ajuster ses 3 maxes (si l'app en a mal estimé un) avant de lancer.
- **Charges plus fines** : calcul des %1RM et de la progression plus rigoureux (RPE, tonnage), adapté au niveau.

> État : posé de côté à la demande de Michel. La v1 reste utilisable telle quelle ; on reprend quand on veut pour la rendre « complète ».

---

# ✅ À FAIRE

## ⭐ PRIORITÉ — Refonte de la logique d'affichage des écrans

Plusieurs bugs viennent du même endroit : la façon dont l'app **ouvre, empile et ferme** les écrans/panneaux.
Le régler en premier corrige d'un coup plusieurs bugs ci-dessous (menu qui ne se ferme pas, Profil en arrière-plan, retour sans effet).

**À demander à Claude Code (en clair) :**
> Mets en place une gestion centralisée des écrans, type "pile de navigation" :
> - Ouvrir un écran l'affiche TOUJOURS au premier plan (au-dessus de tout le reste).
> - Ouvrir un nouvel écran ferme proprement le panneau/menu précédent (un seul visible à la fois, sauf overlay voulu).
> - Le bouton "retour" dépile = revient à l'écran précédent.
> - Le drawer Menu se ferme dès qu'on choisit une entrée.
> Une seule logique réutilisée partout, au lieu d'un comportement différent par écran.

---

## 🐞 Bugs à corriger

- **Mise à jour auto du Service Worker (cache PWA)** : normalement réglé, mais à **revérifier** — l'app gardée en cache ne se met parfois pas à jour seule (signet/app installée montre l'ancienne version). Vérifier détection de nouvelle version + bandeau « Rafraîchir » ou reload auto, et cache bien bumpé (`ft-vN`) à chaque release. Important pour les utilisateurs (sinon bloqués sur vieille version).
- **Drawer Menu ne se ferme pas après sélection** : on ouvre le Menu, on choisit une entrée des Outils
  (Anatomie, Protéines, Compléments, Calculateur 1RM…) → le menu reste ouvert par-dessus la page. À fermer automatiquement. *(réglé par la refonte ci-dessus)*
- **Profil s'ouvre en arrière-plan** : si un outil est déjà ouvert (ex. Anatomie) et qu'on clique sur Profil,
  le Profil s'affiche derrière → il faut fermer l'outil pour le voir. *(réglé par la refonte ci-dessus)*
- **Bouton retour du Profil sans action** : clic sans effet → le câbler pour revenir à l'écran précédent. *(réglé par la refonte ci-dessus)*
- **Profil accessible 2 fois dans le Menu (doublon)** : la **carte « Michel » en haut** ET l'entrée **« Mon profil »** dans COMPTE mènent au même endroit → garder **uniquement la carte du haut**, supprimer « Mon profil » de COMPTE.
- **Accès admin en double** : le **petit logo admin** (haut droite) fait doublon → on y accède déjà en cliquant sur le logo dans **Nutrition**. À retirer/simplifier.
- **Croix ✕ du Profil : mauvais côté + trop loin** : la croix de fermeture du Profil n'est **pas du même côté** que celle des autres sous-menus (incohérent) ET trop **haute/éloignée** pour le pouce (usage à une main). → Uniformiser le côté de la ✕ sur tous les sous-menus + la rendre atteignable au pouce.
- **Minuterie d'exercice non mise à jour** : la valeur en minutes (durée/minuteur) ne se met pas à jour correctement.
- **Bouton d'aide mal placé** : le petit bouton d'aide (?) est mal positionné **partout** (pas qu'à un endroit) → définir une **place cohérente et atteignable** pour l'aide sur tous les écrans, plutôt qu'un coin haut-droite difficile au pouce.
  **Décision :** le « ? » est une **aide contextuelle** (chaque écran a sa propre aide) → on le **garde** (utile), on le **repositionne** juste à un endroit cohérent + atteignable au pouce sur tous les écrans. (≠ « Aide détaillée » du menu, qui reste en place.)
- **Mettre à jour le contenu de l'aide** : après toutes les refontes (affichage, superséries, menu…), les textes d'aide contextuelle + « Aide détaillée » doivent être **réécrits pour coller à la version actuelle** des écrans (sinon l'aide décrit une ancienne UI).
- **Profil — « ? » d'aide + petit logo (menu caché) en haut à droite** : ces deux accès sont dans la zone la plus dure à atteindre au pouce (haut-droite) → repositionner pour l'usage à une main.
- **Écran s'éteint en séance** : l'écran s'éteint alors que l'app est ouverte → activer **Wake Lock** (garder l'écran allumé pendant la séance).
- ✅ **L'écran pivote — FAIT** : verrouillé en portrait via `manifest.json` (`"orientation":"portrait-primary"`, app installée) + `screen.orientation.lock('portrait')` (app.js).
- **Touches accidentelles (tél posé) — limite iOS** : on ne peut PAS empêcher iOS de détecter les touches quand l'écran touche une surface (matériel/OS, hors portée web). **Mitigation en place** : les actions destructrices sont protégées (suppression exo/série = appui long 400ms, Vider/Annuler séance = confirmation) → une touche fantôme ne peut pas détruire de données. *Si un popup précis réapparaît tout seul, identifier l'action concernée et la blinder (confirmation/appui long).*
- **Mode jour — drawer Menu reste sombre** : en **mode jour/clair**, une **ombre apparaît à droite** et l'ouverture du **Menu s'affiche en noir** (pas adapté au thème clair). → Adapter le drawer Menu (fond + ombre) au mode jour.
- **Logo/titre « Force Tracker » incohérent entre onglets** : l'en-tête « Force Tracker » n'est **pas identique sur tous les onglets** (taille/style/position varient), en **mode jour ET nuit**. → Uniformiser l'en-tête sur tous les écrans.

---

## 🔁 Superséries — comportement à finaliser

Dans une supersérie (ex. 3 exercices), une fois le **dernier exercice du tour validé**,
l'app revient **automatiquement au 1er exercice** pour enchaîner le tour suivant (boucle 1 → 2 → 3 → 1 …) jusqu'à la fin des séries.
- **Pas de minuteur entre les exercices** d'un même tour : ils s'enchaînent dans la foulée.
- Le **chrono de repos se déclenche uniquement après le dernier** exercice du tour (puis retour au 1er).

## ✅ Remontée des exercices manquants — FAIT

Les exercices perso ajoutés par les utilisateurs remontent côté admin (Sheet), avec ID anonyme.

## 🖼️ Exercices — image de la machine + GIF du mouvement (gros chantier)

Pour chaque exercice :
- afficher l'**image de la machine** concernée et ses **variantes** (dans la liste / la fiche).
- en **entrant dans l'exercice**, montrer le **mouvement en GIF** (démonstration animée).
⚠️ Gros boulot (collecte/création des visuels pour tous les exercices + intégration). À planifier comme un chantier à part.

## 📊 Stats globales (admin) + stats perso utilisateur + RGPD — à faire

- **Admin** : Sheet miroir global regroupant **tous les utilisateurs** (colonne **ID_utilisateur anonyme**, pas d'email en clair) → stats globales, usage, exercices manquants.
- **Utilisateur** : chaque personne doit pouvoir voir **ses propres stats** dans l'app (synthèse de sa progression, volumes, PRs…).
- ⚠️ **RGPD / vie privée** : prévenir les utilisateurs que leurs données sont stockées, ID anonyme plutôt qu'identifiant perso, pouvoir **supprimer** les données sur demande. À faire proprement, surtout quand l'app grandit.

## 📤 Export performance utilisateur + template Excel premium — à faire

- **Export perso** : améliorer le bouton « Exporter mes données » → fichier Excel/CSV propre (séances, charges, PRs). Chaque utilisateur n'exporte que **SES** données (vie privée).
- **Template Excel premium** (plus tard) : offrir le beau fichier de suivi (graphes, mésocycles, calculateur 1RM) en bonus **premium** — vrai argument de vente.

## 📈 Historique poids au tap (écran séance) — à faire

Garder PRÉCÉDENT à 1 valeur. Ajouter une **petite icône historique (graphique)** à côté de chaque exercice :
au tap → **mini-graphe de progression du POIDS uniquement** (3-5 dernières séances), lisible au pouce, refermable.
Données = historique déjà mémorisé par l'app. Ne pas alourdir la grille de saisie.

## ✅ Progrès — choisir les exercices de la barre de progression — FAIT

Dans l'onglet **Progrès**, on peut **changer les 4 exercices** affichés dans la barre de progression.

## ✅ Détecter les exercices en doublon — FAIT

Rapprochement flou à la création (ignore casse, accents, espaces, pluriels) + outil admin de fusion.

## 👇 Fermer la fenêtre en scrollant (groupes musculaires / muscle) — à ajouter

Pouvoir **fermer la fenêtre en scrollant** (swipe vers le bas) :
- depuis la **liste des groupes musculaires**,
- et quand on est **dans un muscle**.
→ Geste « tirer vers le bas pour fermer » (pull-to-dismiss), en plus du bouton de fermeture.

## 🍽️ Nutrition — repas (premium vs gratuit) — EN COURS

- 🆓 **Gratuit** : idées de repas **du jour**, **1 régénération par jour** (incite au premium).
- ⭐ **Premium** : **semaine complète** de repas planifiés + **historique sur 1 mois**.
- Génération par le **Coach IA**, basé sur le **profil** (objectifs, calories/macros) — profil à bien remplir.

**Phrase pour Claude Code :**
> Nutrition : génère les idées de repas via le **Coach IA**, à partir du profil (objectifs, calories/macros cibles).
> - **Gratuit** : repas **du jour** avec **1 seule régénération par jour**.
> - **Premium** : **semaine complète** de repas + **historique sur 1 mois**.
> - Si le profil n'est pas rempli, invite à le compléter avant. Ne casse pas l'écran Nutrition existant.

## ✅ Indicateur de nouveauté — FAIT

Pastille « nouveau » en place sur les fonctionnalités récentes.

## ✅ Menu « Aide détaillée » — FAIT

Aide détaillée étoffée (guides par écran, superséries/dropsets, coach…). Bloc 7 terminé.

## 🩻 Logo Force Tracker en filigrane de fond (à tester)

Au lieu du logo en petite icône, le mettre en **fond d'écran léger et très transparent** (watermark/filigrane discret,
ex. centré ou en bas, opacité faible) pour habiller l'app sans nuire à la lisibilité. À tester sur le thème nuit.

## 🎨 Réduire la présence du rouge (à revoir)

Le rouge corail est **trop présent** (CTA, onglet actif, FAB, chiffres, icônes, badges, dégradés…) → il perd son impact.
Principe : l'accent doit rester **rare** pour garder sa force.
- Réserver le rouge à **l'action n°1 de chaque écran** + l'onglet actif.
- Passer chiffres / icônes secondaires / petits badges en **neutres** (blanc/gris sur le charbon).
- Garder vert (récup/validé) et or (PR) là où ils portent une vraie info.
→ Objectif : app qui respire, plus premium, l'œil va droit à l'action.

## 🎨 Palette & thèmes personnalisables (à explorer)

- Trouver une **palette cohérente** (1 accent fort + neutres + vert/or pour l'info). Michel aime le **bleu** → testable comme accent alternatif (le bleu marche très bien en UI : calme, "tech", lisible).
- Proposer des **thèmes / accents au choix** (rouge, bleu, …) et éventuellement un **fond personnalisé** par l'utilisateur (option perso premium ?).
- **Fonds à thème premium** (idée Michel) : packs de fonds stylés (dragon, espace, etc.) en bonus premium.
  ⚠️ **Droits d'auteur** : NE PAS utiliser de licences protégées (Dragon Ball, Mandalorian/Star Wars…) → illégal sans accord.
  Solution : créer des fonds **originaux "inspirés de"** (dragon original, ambiance sci-fi/guerrier…) ou utiliser des visuels libres de droits. Lisibilité du contenu à préserver (assombrir/flouter le fond derrière le texte).
- **Modèle économique (idée Michel)** : plusieurs **thèmes inclus dans le premium** + des **thèmes complémentaires payants à l'unité** (comme les skins de jeux vidéo → 2e source de revenus, fort attachement). Affichage **bandeau** recommandé (lisibilité). Visuels = illustrateur exclusif ou banques libres de droits.
- ⚠️ Garder la lisibilité et le contraste quel que soit le thème (lié à l'accessibilité).

**Fond sombre & batterie :** vrai sur écrans **OLED/AMOLED** (téléphones haut/milieu de gamme) — le noir = pixels éteints = **moins de conso**. Sur écrans **LCD**, pas de gain. Donc garder un **vrai noir** pour le thème nuit = bon pour l'autonomie sur OLED (+ confort visuel en salle sombre).

## ⚠️ Dropsets & superséries — fonctionnement + clarté UX à revoir

Le fonctionnement actuel des **dropsets** et **superséries** n'est pas satisfaisant et **pas assez clair pour l'utilisateur**.
À revoir : rendre évident où on en est (quel exercice/tour en cours, ce qui s'enchaîne, quand vient le repos),
et fluidifier le déroulé. → Faire une maquette claire de l'UX avant de recoder.

**Bug édition supersérie :** quand on **retire** un exercice d'un groupe, on ne peut **pas en rajouter** un ensuite ;
on est obligé de **tout effacer et refaire le regroupement**. → Permettre d'ajouter/retirer un exercice d'un groupe existant sans le détruire.

---

## ✅ PRIORITÉ #2 — Découper index.html — FAIT

Le JS est désormais **découpé en 8 fichiers** (`constants.js` · `state.js` · `screens.js` · `log.js` · `setup.js` · `tracking.js` · `coach.js` · `app.js`), chargés via `<script src>`. `index.html` (~1660 lignes) ne contient plus que l'HTML/les modales + 1 petite balise d'init. Bénéfice atteint : fichiers séparés = moins de bugs en cascade + Claude n'ouvre que le fichier concerné.

**Reste éventuel (non prioritaire, risqué)** : `log.js` (~3350 lignes) est le plus gros — pourrait être re-découpé un jour (séance / picker / timers / figurines), MAIS c'est le fichier le plus sensible (« zéro perte de séance ») → n'y toucher que s'il devient ingérable.

---

## 👆 Navigation — slider entre onglets

Pouvoir **glisser horizontalement** (swipe gauche/droite) pour passer d'un onglet à l'autre
(Accueil ↔ Progrès ↔ Séance ↔ Nutrition ↔ Coach), en plus du tap sur la barre du bas.
⚠️ Attention aux conflits avec le drawer Menu et les éléments qui glissent déjà.

---

# 💡 PROJETS À EXPLORER

## 🎓 Offre Débutant (nouvelle formule payante — idée Michel)

**Vision :** une offre dédiée aux **débutants** — le plus gros segment, le plus perdu au démarrage, et le plus fidèle si on l'accompagne bien. Un vrai « prends-moi par la main » de A à Z.

**Tarifs proposés (Michel) :**
- **Découverte** : 2 mois à **9,99 €**.
- **Renouvellement** : 4 mois à **14,99 €**.
- ⚠️ **Note de cohérence tarifaire à trancher** : 9,99 €/2 mois = **5,00 €/mois** ; 14,99 €/4 mois = **3,75 €/mois** → le renouvellement est **moins cher au mois** que la découverte. C'est défendable (« engage-toi plus longtemps, paie moins cher au mois » = logique d'abonnement classique + récompense de fidélité), mais à **valider consciemment**. Alternative si on veut « hameçon » : découverte moins chère puis prix plein.
- **Inclut le Premium** (Coach IA illimité, etc.) → l'offre Débutant est un **cran au-dessus** du Premium actuel (4,99 €/2 mois).

**Contenu de l'offre :**
- 📋 **Questionnaire de départ** : situer la personne (niveau, objectif, matériel dispo, fréquence, blessures, morphologie…) → base pour tout personnaliser.
- 🏋️ **Programme sur mesure** : exercices **simples**, adaptés débutant, avec **explications visuelles** (photo machine + GIF/mouvement + consignes de sécurité).
- 🍽️ **Conseils nutrition** de base (adaptés à l'objectif, pas une usine à gaz).
- 📈 **Suivi personnalisé** : stats dédiées + **évolution du programme selon les performances réelles** (surcharge progressive automatique, on complexifie quand la personne progresse).

**Synergie avec l'existant :** s'appuie fortement sur le **Coach IA** (déjà là), les **visuels d'exercices** (chantier en cours), le **profil avancé** (santé/blessures), et le système **premium** existant.

**Points techniques à cadrer (avant de coder) :**
- 💳 **Abonnement récurrent** : le premium actuel passe par **Ko-fi** (codes / webhook one-shot). Une offre avec **durées + renouvellements** demande une vraie gestion d'abonnement (Ko-fi **memberships**, ou Stripe plus tard) → à décider. Prévoir dates de début/fin, relance de renouvellement.
- 🧭 **Parcours guidé** : le questionnaire → génération de programme → suivi = un **flux onboarding** dédié (pas juste un écran de plus).
- 🔁 **Programme évolutif** : logique de progression automatique (quand valider une montée de charge/volume, quand complexifier un exercice).
- ⚠️ **Périmètre** : garder simple pour le débutant (ne pas noyer sous les options). L'offre = **accompagnement**, pas surcharge de features.

**Prochaine étape :** maquette du parcours (questionnaire → 1er programme → 1re semaine → suivi) + décision sur la brique paiement récurrent, avant tout code.

---

## 🎯 Exercices « ancre » vs « accessoire » (à explorer)

**Origine (méthode Michel) :** Michel structure ses séances avec **1 polyarticulaire + 1 isolation** sur le muscle visé, **+ 3 exercices complémentaires** qui n'ont pas forcément à voir avec le groupe du jour — volontairement, **pour la nouveauté** (garder le cerveau stimulé, éviter la lassitude / « j'ai la flemme, c'est toujours pareil »). **Contrepartie assumée :** il ne se « spécialise » pas et ne performe pas sur ces mouvements qui tournent.

**Constat :** beaucoup de pratiquants **font tourner leurs accessoires** (variété, motivation, adhérence). Résultat : la **courbe de progression** de ces exos est vide/en dents de scie (normal, ils changent) — alors que le suivi PR/1RM n'a de sens que sur les mouvements **répétés** (les « ancres »).

**Idée :** permettre de **marquer un exercice comme :**
- **🎯 Ancre** = mouvement suivi → on cherche la **surcharge progressive**, la courbe et les PRs comptent (ex. le polyarticulaire lourd du jour).
- **🔄 Accessoire** = juste **loggé** → compte pour le **volume** et le **diagramme des muscles**, mais **pas de pression PR** (pas de « faux décrochage » quand il change).

**Bénéfices :**
- Réconcilie les deux styles : progression **là où on la veut**, variété **partout ailleurs**, sans polluer les stats.
- L'onglet **Progrès** met en avant les **ancres** (courbes propres) ; les accessoires restent dans le volume/muscles sans encombrer.
- Colle à l'app existante : le **volume** et la **carte des muscles** ne dépendent déjà pas de la progression d'un exo précis.

**Pistes de mise en œuvre (léger) :**
- Un simple **drapeau** par exercice (`anchor: true/false`) — réglable au tap (ex. une petite étoile/épingle sur le bloc exo, ou dans le menu ⋯).
- Par défaut : rien n'est « ancre » → aucun changement pour l'existant. L'utilisateur épingle ses 1-2 ancres.
- Optionnel : le **Coach IA** pourrait dire « tu tournes beaucoup, pense à garder 1-2 ancres pour progresser » (info, pas leçon).

**À NE PAS faire :** imposer la distinction ou compliquer la saisie. Ça doit rester **invisible** pour qui s'en fiche, et **utile** pour qui veut suivre proprement.

---

## 🤖 Coach IA — qualité, engagement & personnalité (à explorer)

Objectif : augmenter la qualité **sans 2ème IA** (garder une seule IA, mieux la nourrir) et rendre le coach addictif.

**Déjà en place :**
- **Mémoire pour les membres premium** (le coach se souvient des échanges). → Atout fort : à mettre en avant et à enrichir.

**Pistes qualité :**
- Étendre/enrichir la mémoire (objectifs, blessures, historique d'échanges) — plus gros levier de qualité.
- Donner une vraie **personnalité** au coach (nom, ton) → les gens s'attachent à un personnage.
- Affiner les **instructions** (system prompt) : ton technique, précis, format des réponses.

**Pistes engagement / addiction (saine) :**
- Coach **proactif** : messages personnalisés au bon moment (félicitations après un PR, rappel doux, conseil du jour).
- Notifications intelligentes (pas du spam), streaks/régularité, check-in quotidien (« comment tu te sens ? »).
- Réponse instantanée 24/7 = avantage vs coach humain.

**Questions au-delà du sport :**
- Ouvrir aux sujets **sport, nutrition, sommeil, motivation, stress, mental** = compagnon de vie sportive.
- ⚠️ Rester dans ce domaine élargi (pas "tout" : identité + coûts API). ⚠️ Médical : orienter vers un pro, ne pas diagnostiquer (lié au profil avancé).

---

## 👩 Profil femme — thème féminin (priorité produit)

**Vision / opportunité :** vrai potentiel marché côté femmes — la plupart des apps de muscu
sont pensées "homme" puis juste repeintes en rose. Faire un thème femme **sérieux et abouti**
(pas cosmétique) peut être un vrai différenciateur. À traiter comme une priorité produit, pas un détail.

**Décidé :**
- **Thème optionnel** (activable/désactivable), pas imposé selon le sexe.
- **Figurines** : aujourd'hui ce sont des silhouettes d'homme → il faut une **silhouette femme**
  (utiliser/adapter l'asset existant `female-body.png` pour TOUTES les figurines en mode thème femme).

**À cadrer plus tard :**
- Accent couleur / palette du thème femme (garder charbon + variante d'accent ?).
- Ton des textes, objectifs par défaut (optionnel).
- Garder la cohérence avec l'identité Force Tracker — variante, pas refonte totale.

---

## 🩺 Profil avancé (Menu › Profil) — EN COURS

Profil avancé santé (tous champs **optionnels**) :
- 🩹 Blessures / limitations (zones : épaule, genou, dos, poignet… + en cours ou ancienne)
- 🫀 Pathologies (cardiaque, tension, diabète, asthme, hernie…)
- 💊 Traitements en cours (optionnel)
- 🤰 Grossesse (utile pour le futur profil femme)
- 📝 Note libre

Le **Coach IA** en tient compte (adapte exos/charges, évite contre-indications) — **jamais de diagnostic**, oriente vers un médecin.
**Disclaimer médical** affiché sur l'écran.
⚠️ **Données de santé sensibles (RGPD élevé)** : stockage privé, jamais partagé, suppression possible, champ optionnel + raison expliquée.

**Phrase pour Claude Code :**
> Ajoute un **Profil avancé santé** (Menu › Profil), tous champs **optionnels** : blessures/limitations (zones + en cours/ancienne), pathologies (cardiaque, tension, diabète, asthme, hernie…), traitements en cours, grossesse, note libre. Le **Coach IA doit en tenir compte** (adapter exos/charges, éviter les mouvements contre-indiqués) **sans jamais diagnostiquer** (orienter vers un médecin). Affiche un **disclaimer médical**. Données **sensibles** : stockage privé, jamais partagé, l'utilisateur peut **tout supprimer**.

---

## 🎤 Logging vocal de la séance

**Idée :** logger ses séries à la voix, mains libres.
- « Je vais faire du développé couché » → l'app insère l'exercice automatiquement.
- « Je viens de faire une série de 10 à 60 kilos, je valide » → la série est enregistrée.

**Comment ça marcherait :**
- `SpeechRecognition` (Web Speech API) transcrit la voix → texte.
- Parsing local simple pour les chiffres (« 10 à 60 » → reps 10, poids 60) afin d'éviter de cramer des appels IA.
- L'IA (Coach) ne sert que pour les cas ambigus / noms d'exercices flous.

**Points d'attention :**
- 🎧 **Bruit en salle** : privilégier le **push-to-talk** + **confirmation visuelle** avant validation (« Développé couché — 10 × 60 kg ? »).
- 🍎 **iPhone** : `SpeechRecognition` mal supporté dans une PWA Safari (contrainte technique, pas un blocage Apple). 🟢 Bien mieux sur Android/Chrome.
- 💎 **Modèle premium** : le Coach illimité est réservé aux membres premium. Décider si le logging vocal est premium, OU inclus pour tous grâce au parsing local.
- 🔁 Reconnaissance des noms d'exercices : rapprochement flou avec la liste d'exos existante.

**Prochaine étape :** maquette du flux (écoute → « j'ai compris : X » → confirmation → insertion) avant de coder.

---

## ⌚ Connexion objets connectés (Garmin, Fitbit, Apple Santé, Samsung Health)

Relier l'app aux montres/trackers pour récupérer FC, sommeil, calories, activité → nourrir le Coach et la récup.

**Réalité du chantier (par plateforme, pas un seul projet) :**
- **Apple Santé** : possible seulement depuis une **vraie app iOS** (pas une PWA). Nécessiterait de passer l'app en natif/wrapper iOS.
- **Samsung Health / Google Health Connect** : pareil côté **Android natif**.
- **Garmin / Fitbit** : ont des **API web** (OAuth) → jouables même en web, mais chaque intégration = compte développeur, validation, maintenance.
- ⚠️ Gros morceau : 4 écosystèmes = 4 intégrations différentes, + contraintes natives (l'app est une PWA aujourd'hui).

**Conseil :** ne pas tout faire d'un coup. Commencer par **1 source** (la plus demandée par tes users), idéalement une API web (Fitbit/Garmin) pour rester en PWA. Les intégrations Apple/Samsung impliquent de passer natif → décision produit majeure, plus tard.
**Note :** Michel utilise **Garmin** → bon candidat pour la 1ère intégration (API web, on reste en PWA).

---

## 📱 Rapprocher la PWA d'une vraie app native (faisable, progressif)

Sans passer par l'App Store, on peut rendre la PWA quasi indiscernable d'une app native. Pistes :
- **Installation propre** : icône, splash screen, plein écran sans barre d'URL (manifest PWA bien réglé). ← logo splash déjà prêt.
- **Mode hors-ligne** solide (Service Worker : l'app s'ouvre même sans réseau).
- **Notifications push** (web push) → rappels, coach proactif (limité sur iPhone, OK Android).
- **Gestes natifs** : swipe entre onglets, transitions fluides, retour haptique.
- **Vibrations**, garder l'écran allumé en séance, etc. (APIs web dispo).

**Limites à connaître :** iPhone bride certaines APIs web (push, reconnaissance vocale, capteurs). Pour 100% des capacités natives (Apple Santé, etc.) → wrapper natif (Capacitor) un jour. Mais une PWA bien faite couvre déjà ~90% du ressenti natif.
*(Irritants concrets écran éteint / rotation / touches fantômes → déplacés dans « Bugs à corriger ».)*

## 🎯 Principe directeur (vision Michel)

Le **PWA bien structuré** est un pari d'avenir crédible face au natif — **à condition** d'être rigoureux sur la structure.
- **La structure prime** : sans architecture claire, Claude Code développe « comme il peut » → dette + bugs. C'est à NOUS de cadrer (fichiers séparés, conventions, tableur/base propres).
- **Garder la main** : s'informer un minimum sur les choix techniques pour **repérer les limites de Claude** (il ne voit pas toujours les problèmes) et valider les décisions, sans devenir développeur.
- Structurer AVANT d'empiler les fonctionnalités (rejoint priorité #1 affichage + #2 découpe).
- Changer de techno (framework React/Vue/Angular) = réflexion **très long terme, NON prioritaire** ; le vanilla bien découpé suffit largement.

## 🛡️ Construire proprement — l'app est en production

L'app devient **complète et complexe**, et **des gens l'utilisent vraiment** → plus le droit aux bugs/régressions.
La construire **proprement** pour qu'elle tienne dans la durée. Principes à appliquer systématiquement :
- **Toujours une branche Git** dédiée + commit « ça marche » avant toute modif (retour arrière facile).
- **Une seule chose à la fois**, testée avant de passer à la suivante (écran par écran).
- **Tester sur Chrome ET Safari/iPhone** avant de déployer (PWA = comportements différents).
- Garder le **backend Apps Script intouché** sauf besoin explicite ; `.claspignore` à jour (ne jamais uploader maquettes/`support.js`).
- Bumper le cache Service Worker (`ft-vN`) à chaque release.
- La **priorité #2 (découper index.html)** sert directement cet objectif : moins gros fichier = moins de régressions.

---

## 🏗️ Optimisation & architecture (à anticiper — l'app grossit)

L'app devient complète → penser à la **solidité de la fondation** avant d'empiler les fonctionnalités.

**Base de données :**
- Aujourd'hui les données passent par **Google Sheets** (via Apps Script) → simple mais **pas fait pour grandir** (lenteur, limites, fragile avec beaucoup d'utilisateurs).
- À terme : migrer vers une **vraie base de données** (ex. Firebase/Firestore, Supabase) → plus rapide, plus fiable, gère mieux la montée en charge, l'authentification, le temps réel.
- ⚠️ Gros chantier (migration des données + réécriture des accès). À planifier, pas dans l'urgence.

**Hébergement / support adapté :**
- Aujourd'hui : **GitHub Pages** (gratuit, simple, mais basique).
- Si l'app grandit (base de données, comptes, paiements premium, images/GIF) → un hébergement plus adapté (Firebase Hosting, Vercel, Netlify…) facilitera tout.

**Optimisation perçue (faisable plus tôt, moins lourd) :**
- Compression des images/GIF, chargement à la demande (lazy-load), bon cache Service Worker.
- Réduire les appels réseau inutiles.

**Ordre logique :** d'abord stabiliser (bugs + découpe index.html), PUIS base de données + hébergement quand le nombre d'utilisateurs le justifie.

## 🌈 Version daltonien (accessibilité) — à prévoir

Prévoir un **mode daltonien** : ne pas reposer uniquement sur la couleur pour transmettre l'info
(ex. vert = bon / rouge = alerte). Ajouter icônes/formes/textes en complément, et proposer des
**palettes adaptées** (deutéranopie, protanopie, tritanopie). À cadrer comme option d'accessibilité.

## ♿ Autres options d'accessibilité — à prévoir

- **Mode « bigleux » / basse vision** : option **gros texte / contraste renforcé** (tout doit rester lisible et ne pas casser la mise en page).
- **Gaucher / droitier** : pouvoir **basculer les éléments d'action** (boutons, validation, FAB) côté gauche ou droit selon la main dominante.
- **Usage à une main** : actions clés atteignables au pouce (bas de l'écran), cibles ≥ 44px — déjà amorcé en séance, à généraliser.

## 👁️ Ergonomie de lecture & d'usage — vérifier (à appliquer partout)

- **F-pattern** : organiser l'info selon la façon dont l'œil lit (important en haut/à gauche, balayage en F) → titres, chiffres clés et actions placés là où le regard tombe en premier.
- **Thumb zone** : placer les actions principales dans la **zone d'atteinte du pouce** (bas de l'écran), réserver le haut à l'info/lecture.
À vérifier sur **chaque écran** lors des prochaines passes design.

**⭐ Manipulation au pouce = facteur clé.** On utilise l'app en salle, souvent à **une main** → toutes les actions
fréquentes (valider une série, +/- poids/reps, naviguer, lancer le repos) doivent être atteignables **au pouce, sans se contorsionner**.
À traiter comme un critère de conception central, pas un détail : tester chaque écran « une main » avant de valider.
**Gaucher vs droitier :** la zone du pouce est **inversée** (droitier = côté droit, gaucher = côté gauche).
→ Ne pas figer toutes les actions d'un seul côté ; la **bascule gaucher/droitier** (voir accessibilité) déplace les
éléments d'action du bon côté. Michel est **gaucher** → tester aussi en gaucher, pas seulement en droitier.
**Important :** l'écart gauche/droite doit rester **léger** → l'utilisateur ne pensera pas forcément à régler sa main.
La disposition **par défaut doit déjà bien marcher pour les deux** (actions centrées/atteignables) ; la bascule est un **bonus**, pas un prérequis.

## 📗 Refaire le fichier Excel/Sheets de synchro (proprement)

Un fichier tableur (Excel/Google Sheets) **synchronisé avec l'app** avait été créé → à **refaire correctement**.
- C'est la couche de données actuelle (via Apps Script) → structure soignée = moins de bugs.
- À cadrer : colonnes/onglets clairs (séances, exercices, PRs, nutrition, profil…), format stable que l'app lit/écrit,
  cohérent avec une future migration base de données (voir section Optimisation & architecture).
- ⚠️ Lien direct avec la robustesse : un tableur mal structuré = source de bugs de synchro.

## 🗂️ Ranger le dossier forcetracker (PC) — à faire

Le dossier local du projet est en désordre. À réorganiser proprement :
- Séparer le **code de l'app** (index.html, Code.js, sw.js, assets, anatomy/muscles/…) des **fichiers de design/handoff** (maquettes, `support.js`, dossiers `design_handoff_*`) qui NE doivent PAS être poussés par clasp.
- Vérifier le **`.claspignore`** (ne jamais uploader maquettes/support.js → cause du crash passé).
- Ranger les exemples/tests (PDF, GIF logo) dans un sous-dossier à part.
- **Note :** Michel a déjà ajouté des dossiers d'**images musculaires** et d'**exercices** → bien les classer/nommer dans cette structure (ex. `assets/muscles/`, `assets/exercices/`) et vérifier qu'ils sont référencés au bon chemin + bien gérés par le cache.

---


