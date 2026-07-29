# 🌙 Audit nocturne du 29-30/07/2026 — « vérifie TOUT ce qui a été mis en place avant »

> Demandé par Michel le 29/07 au soir : *« vérifie tout ce qui a été mis en place avant de bosser
> avec toi, je dis bien tout, fait des tests linéaires et croisés »* + quantifier les retouches
> répétées + contrôler Milo, les calories, la récupération et les disciplines.
> **Aucun code de l'app n'a été modifié cette nuit** — uniquement de la lecture, des mesures et
> des tests. Sauvegarde posée avant : tag `avant-audit-nocturne-2026-07-29`.

## 1. L'impression d'ensemble (après lecture complète de l'ancien code)

**L'ancien code est plus sain que ce que les bugs de la semaine laissaient craindre.** Les
formules fondatrices sont des formules RECONNUES, appliquées correctement : le 1RM est du
Brzycki exact, les calories de base du Mifflin-St Jeor exact, le cardio des MET standards, les
niveaux de force des ratios classiques avec correction d'âge. **79 tests linéaires sur 79 sont
verts.** La maladie de la semaine (poignet-barre, calories, muscles absents) ne venait pas de
formules fausses — elle venait de **listes parallèles jamais re-mesurées** pendant que le
catalogue grossissait. C'est confirmé : là où il y a UNE formule, c'est juste ; là où il y avait
DEUX listes, ça avait divergé.

Le point faible réel de l'époque d'avant n'est pas la qualité, c'est **l'absence de filet** :
rien de tout cela n'avait de test. C'est corrigé cette nuit — deux familles permanentes.

## 2. Ce qui a été fait

| Étape | Résultat |
|---|---|
| Tests **linéaires** (chaque calcul seul, valeurs vérifiables à la main) | **79/79 ✅** → `tests/calculs/runner.js` |
| Tests **croisés** (parcours réel : profil → séance → PR → badges → récup → Accueil → calendrier → Progrès → Nutrition → Milo → rechargement) | **40/40 ✅** → `tests/parcours/runner.js` |
| Les 9 familles existantes re-passées | **Toutes vertes** (10/10 · 110/110 · 10/10 · 18/18 · 18/18 · 18/18 · 7/7 · 45/45 · données OK) |
| Contrôle de ce que Milo reçoit | Prénom, séances datées, dernier record daté, score de récup (identique à l'Accueil), calendrier, séance annoncée, autre sport, discipline : **tout y est** |
| Mesure de performance (200 séances chargées) | **Aucun ralentissement** — voir §5 |
| Quantification des retouches | Voir §6 |

## 3. 🔎 Les trouvailles (rien n'est corrigé — à décider avec Michel)

### 3a. Le bouton « Hier » de l'écran Séance a le bug de Greenwich (le vrai bug de la nuit)
`setLogYesterday()` (log.js:113) calcule « hier » avec le motif UTC interdit depuis ft-v655 —
mais sur une **variable**, donc le garde-fou de `tests/dates/` ne le voit pas (il ne cherche que
`new Date().toISOString()`). Conséquence : entre **minuit et 2 h du matin**, taper « Hier »
date la séance d'**avant-hier**. Et c'est pile son cas d'usage : on rentre de la salle après
minuit et on veut dater la séance de la veille. **Proposition : corriger avec `today()` +
élargir le garde-fou au motif sur variable.**

Quatre cousins mineurs de la même famille (fenêtre minuit-2 h uniquement) :
- `app.js` import de plan de repas : les jours importés peuvent démarrer « hier » ;
- `app.js` résumé hebdo : la fenêtre lundi-dimanche glisse d'un jour (lundi 0 h-2 h seulement) ;
- `setup.js` filtre de période des graphiques : la coupure glisse d'un jour (affichage pur) ;
- `tracking.js` (2 endroits) : le repli `ts → date` d'une séance sans date peut donner la veille.

### 3b. « Autre sport » : la promesse dépasse la réalité (R4 en plein)
L'aide et le toast disent : *« un autre sport change ta récupération ET ta dépense d'énergie
(donc tes calories) »*. Vérifié cette nuit : la réponse (vélo, course…) atteint **le texte de
Milo** (avec une bonne consigne), mais ne change **NI le score de récupération NI le
TDEE/calories** — aucun chiffre ne bouge. C'est exactement R4 : *l'info reste dans le TEXTE,
elle ne descend pas jusqu'à la DONNÉE*. **À discuter : soit faire descendre l'info dans les deux
calculs, soit adoucir la promesse.**

### 3c. La « marche de midi » de la récupération
Les jours écoulés depuis une séance se comptent depuis **midi** du jour de séance. Avant midi,
le lendemain d'une séance est encore compté « jour même » : mesuré, le score fait un saut de
**+7 points à 12 h 01** (55 → 62 dans le scénario testé), et les jours de repos se créditent
avec une demi-journée de retard. Pas faux, mais surprenant si on regarde son score le matin.
**À discuter (lié au chantier temps de repos réels).**

### 3d. Micro-constats (sans danger, notés pour mémoire)
- une séance sans aucune série validée facturerait 47 kcal d'échauffement (le bouton Terminer
  est déjà bloqué dans ce cas — constat théorique) ;
- `_checkBadgeCond('club_100')` rend `undefined` au lieu de `false` (comportement juste) ;
- après « Terminer la séance », `renderLog()` recrée aussitôt un brouillon vide (sans danger) ;
- badges « streak 7/30/90 jours consécutifs » : récompenser 7 jours d'entraînement d'affilée
  est en tension avec le discours récupération de Milo — question produit, pas bug.

## 4. Contrôles demandés explicitement

- **Milo a-t-il ce qu'il faut pour donner les bonnes infos ?** Oui — vérifié en croisé : le
  score de récup du contexte est **le même chiffre** que l'Accueil, les séances et records sont
  datés, le calendrier est fourni. Restent les 3 trous connus du garde-fou (`programmes`,
  `customExercises`, `exRestPref`).
- **Calories — ce qui est pris en compte** : région musculaire (MET 6.5/5.5/8.0/4.0 via la table
  unique ft-v668) + temps de repos du profil (`defRest`) + 30 s par série + forfait échauffement
  10 min + cardio par type/intensité (léger < modéré < intense vérifié sur les 6 types). **Pas
  encore pris en compte** (déjà noté avec Michel) : la durée réelle au chrono, le cardio
  début/fin, les séances importées (aucune calorie), l'« autre sport » (§3b).
- **Récupération (page d'accueil)** : sommeil 3 nuits pondérées (60/30/10) + volume et
  intensité de la dernière séance (échec ×1.5, drop ×1.3, décroissance dans la journée) + repos
  + âge + cycle menstruel + jours enchaînés + tabac + énergie du check-in. Douleur = bandeau,
  jamais le chiffre (voulu). Tout testé linéairement.
- **Différences entre disciplines** : la **discipline** (muscu/powerlifting/haltéro…) atteint
  Milo qui adapte ses conseils ; l'**haltérophilie** a son MET propre (8.0) pour les calories ;
  l'« autre sport » → §3b.

## 5. Performances (profil chargé : 200 séances, 400 pesées, 400 nuits)

| Mesure | Temps | Verdict |
|---|---|---|
| Accueil complet (`renderHome`) | ~6-8 ms | imperceptible |
| Sauvegarde (`persist`) | ~2 ms | imperceptible |
| Score de récupération | ~0,4 ms | imperceptible |
| Contexte de Milo (~47 600 caractères) | ~2-3 ms | la construction ne coûte rien — c'est la TAILLE qui coûte (chantier « régime du prompt ») |
| Calories d'une séance | ~0,03 ms | imperceptible |
| Écran Progrès | ~14 ms | imperceptible |
| Stockage local | 189 Ko | très loin des limites (~5-10 Mo) |

**Réponse à la question de Michel : non, ni l'app ni Milo ne sont ralentis** — et un garde-fou
de perf est maintenant dans `tests/parcours/` pour que ça ne régresse jamais en silence.

## 6. Les retouches répétées, quantifiées (à discuter ensemble)

Deux mesures croisées : commits git dont le diff touche la fonction, et entrées du journal
(221 entrées) qui citent la zone.

| Zone | Commits git | Entrées journal | Lecture |
|---|---|---|---|
| Contexte de Milo (`buildCoachContext`) | **129** | 42 | Le n°1 incontesté. Pas « mal né » : c'est le cœur du produit. Mais 129 retouches = le chantier « consignes conditionnelles » est mûr. |
| Blocs exercice Séance (`renderExBlocks`) | **71** | — | Écran le plus manipulé, churn élevé mais fonctionnel. À ne plus toucher sans besoin réel. |
| Accueil (`renderHome`) | 60 | — | Normal : tout s'y affiche. |
| Carte Milo Accueil (`_miloMessage`) | 57 | — | Élevé pour une carte. Se stabilise depuis `plannedSession()` (source unique). |
| Mur premium (`showPremiumWall`) | 51 | 19 | Élevé pour un écran qu'on voit peu — historique des galères premium. Stable depuis @44. |
| Carte récup visuelle (`_renderHomeHero`) | 43 | 36 | Le plus gros churn ESTHÉTIQUE (anneau/moniteur/tracé). Candidat n°1 à un GEL : on fige, on ne retouche plus. |
| Score de récup (`calcRecoveryDetail`) | 30 | — | Beaucoup pour un calcul — chaque facteur ajouté = une retouche. Maintenant sous tests. |
| Timer repos | ~24 | 19 | Récurrent depuis le début. Sous tests partiels. |
| Check-in du jour | ~20 | 15 | 3 refontes visuelles (emoji → tuiles → déplié). Vient d'être harmonisé (ft-v661) : GELER. |
| Figurine muscles | ~10 | 24 | Le gros du travail est récent et TESTÉ (45/45). |
| **FAB « + »** | **3-4** | **5** | ⭐ Surprise : le « modifié 30 fois » de mémoire ne se voit PAS dans git — les retouches datent d'avant le suivi git (époque Claude Design) ou sont noyées dans des commits plus larges. Aujourd'hui : 3 fonctions, 1 règle d'or (n°9), stable. **Recommandation : garder tel quel, ne plus toucher.** |
| sw.js (535) / CLAUDE.md (433) | — | — | Ce n'est pas du churn : c'est le compteur de versions et le journal — leur rôle est d'être touchés à chaque livraison. |

**Aucune zone ne mérite une SUPPRESSION à mes yeux** : les zones sur-retouchées sont soit le
cœur du produit (contexte Milo, écran Séance), soit déjà stabilisées par les chantiers récents.
La bonne réponse est le **gel** (carte récup visuelle, check-in, FAB) : on n'y retouche plus
sans un vrai retour utilisateur. À valider avec Michel.

## 7. Ce qui attend une décision de Michel (rappel consolidé)

1. Corriger le bouton « Hier » (§3a) + élargir le garde-fou dates — petit, sûr, testable.
2. « Autre sport » : faire descendre dans les chiffres, ou adoucir la promesse (§3b).
3. La marche de midi de la récup (§3c) — avec le chantier temps de repos réels.
4. Calories : durée réelle au chrono + cardio début/fin + séances importées (déjà noté).
5. Geler officiellement carte récup visuelle / check-in / FAB (§6).
6. Régime du prompt de Milo (le 129 du tableau le confirme).
