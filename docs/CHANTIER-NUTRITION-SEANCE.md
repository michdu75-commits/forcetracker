# 🧩 Chantier commun Nutrition + Séance — préparation

> **24/10/2026 · Claude Principal (session-B) · GO de Michel : ANALYSE ET PRÉPARATION SEULEMENT.**
> Aucun code, aucune donnée, aucune fusion, aucune publication. Ce document répond au cahier des charges commun du
> 24/10 (« spécification à valider, pas ordre de développement ») : il **prépare**, il ne décide rien à la place de Michel.
> État mesuré sur master `18f924a5`, dont l'application est identique à l'octet à `ft-v1260` (`1df57e4c`).
> Branche Séance : `claude/dreamy-bell-pu88ia` @ `99ef3002`.
> ↪️ **Mise à jour du 24/10 au soir — mission de coordination de Michel** : Claude Nutrition corrige la Nutrition (lot 6), Claude Séance corrige la Séance (lots 0 à 5), Claude Principal coordonne, intègre et qualifie. Branches, conflits, numéros réservés, tableau de coordination et contrôles transversaux : **§8**.

## 0. En bref

- **Coordination (24/10 au soir) → §8.** Les deux sessions spécialisées corrigent chacune leur couloir sur leur branche ; je prépare l'intégration sur une branche dédiée, sans toucher à master. Mesuré : **plus aucun conflit de code** entre les trois branches depuis que la session Séance a fusionné master elle-même (le seul, dans `constants.js`, est réglé), des **numéros réservés** pour que personne ne renumérote (Séance avait réservé avant moi : je me suis aligné), un tableau de coordination par chantier, et ce qui manque aux contrôles transversaux. Deux nouvelles questions : **Q21** (la bande FORCE TRACKER « sur l'Accueil seulement » n'est pas construite, et elle porte le « ? ») et **Q22** (GO du clone pour la recette iPhone).
- **L'état est vérifié en exécutant, pas seulement en lisant.** J'ai rejoué sur le master d'aujourd'hui les 26 scénarios de la contre-vérification Séance du 23/10 : vraie app, réseau coupé, données fictives. Résultat : **les mêmes écarts qu'au 23/10** (F01 à F08, F19, plus 3 défauts de l'édition d'une séance), et **les cas qui protègent les données restent conformes**. Nutrition V2 n'a rien changé côté Séance.
- **Rien n'est à refaire côté Séance.** La branche porte deux lots finis, testés et documentés, mais non intégrés : le **repos qui survit à la fermeture** (SEANCE-REPOS-01, avec l'expiration à 15 min) et les **8 vignettes** du sélecteur. Un essai de fusion jetable avec master donne **1 seul conflit de code**, une entrée de point rouge, trivial, plus 6 conflits de documentation.
- **Nutrition : le cas « Iso zero » est reproduit** sur données fictives : deux propositions du même aliment, P 26 et P 35. Deux trous mesurés : « ✕ » ne retire pas l'aliment de « Déjà noté par toi », et ce que l'on masque n'est jamais synchronisé.
- **Le plan tient en 7 lots sur une seule branche, et une seule passe complète finale** : la répartie (~37 min), ou la classique (~96 min) si aucune classique n'a déjà tourné dans la semaine de publication (R4). Estimation centrale : **≈ 18 h 15 de travail + ≈ 7 h 45 de tests** (≈ 8 h 45 si la passe finale doit être la classique), risques à part (§5).
- **Aides « ? » (complément du 24/10)** : l'audit des aides du 17/10 a été revérifié sur le code actuel, sans le refaire. Ses constats Séance, Accueil, Coach et Profil sont **corrigés** (`ft-v1257`), et le banc `aides_audit` rejoué donne 18 / 0. **Restent valables** : 4 phrases fausses ou contradictoires dans les aides Nutrition, un « \*\*pas\*\* » affiché tel quel dans l'aide détaillée, et des aides Nutrition encore plus longues qu'au 17/10 (42 points, ~28 000 caractères). Les corrections entrent au lot 6 (§2.6) ; l'aide contextuelle de chaque onglet est préservée.
- **Chrono de repos, la dernière décision explicite est `D-102`** (Michel, 22/10 après-midi, VALIDÉE) : **expiration 15 min après la fin théorique du repos, application ouverte ou fermée**. Elle a remplacé les 5 min du matin (`D-100` ①). Elle n'est pas ambiguë ; je demande seulement de la confirmer (§6, Q1).

## 1. Ce qui a été lu, ce qui a été exécuté

| Source | Portée |
|---|---|
| Cahier des charges commun (24/10) | lu en entier |
| Audit transversal Séance (Drive, 59 712 caractères), matrice de recette (62 cas + 13 recettes), index des fonctions (en-tête + 1 903 déclarations listées automatiquement) | lus en entier ; positions de lignes recalculées sur le master actuel |
| Branche Séance | 42 commits d'avance, 59 de retard ; `SEANCE-ETAT-2026-10-22.md`, `SEANCE-REPOS-01.md`, `SEANCE-UX-IMAGES.md`, `CONTRE-VERIF-AUDIT-SEANCE-2026-10-23.md`, décisions D-100, D-102, D-104 à D-107 |
| **Rejeu dynamique** (copie de master hors dépôt, garde réseau, données fictives) | les 6 harnais de la session Séance (`tools/contre_verif_seance_2026_10_23/` sur la branche) : 26 scénarios, catalogue, tuiles, noms de persos réalistes |
| **Sonde Nutrition** (même montage) | 3 cas fictifs « Iso zero protein (ASL) » : liste « Mes aliments », recherche « Déjà noté par toi », « ✕ », synchro interceptée, rechargement |
| **Essai de fusion** de la branche Séance dans master | dossier jetable, fusion annulée ensuite, rien poussé |
| Non couvert | iPhone réel, données réelles, serveur réel, justesse anatomique image par image |

## 2. Inventaire des corrections et améliorations restantes

Légende : **mesuré** = rejoué aujourd'hui sur master · **lu** = constaté dans le code, pas rejoué · Prio P1 = un chiffre faux écrit ou deux écrans qui se contredisent ; P2 = plus rare, ou demande une décision ; P3 = invisible.

### 2.1 Séance : données et chiffres

| # | Problème | État sur master (24/10) | Prio |
|---|---|---|---|
| **F21** | « Enregistrer » une séance passée **sans rien changer** recalcule ses calories **au poids du jour** | **mesuré** : 97 → 112 kcal (séance faite à 82 kg, poids passé à 95) | P1 |
| **F02** | le même « Enregistrer » **divise par deux** le volume unilatéral | **mesuré** : 600 → 300 kg, pendant que le résumé de la semaine dit toujours 600 | P1 |
| **K1** | corriger la **durée** ne recalcule pas les calories | **mesuré** : 60 → 90 min, 317 kcal gardés au lieu de 440 | P2 |
| **K2** | corriger la durée **efface** une modification pas encore enregistrée | **mesuré** : charge tapée 120, enregistrée 100 | P2 |
| **F01** | le **calendrier** compte l'unilatéral à moitié | **mesuré** : séance enregistrée 1 100 kg, calendrier « 0,8 t » | P1 |
| **F25** | la tendance de volume (`_volumeParMoitie`) ignore la convention unilatérale **et** compte les échauffements | **lu** (`state.js`, aucun filtre de type) | P2 |
| **F03** | les anciennes séries « W » comptent dans le volume par muscle | **mesuré** : 3 séries de pectoraux au lieu de 2 ; Milo lit « 1,5 série/semaine » au lieu de 1 | P2 |
| **F08** | un **record** reste après la suppression ou la baisse de la séance qui le porte | **mesuré** : 100 × 5 gardé ; l'outil admin `_prsDepuisSeances` le recalcule (aperçu : 60 × 5). Règle écrite exprès, décision attendue | P1 |
| **F04** | « Primaires » obtenu par cumul de deux secondaires | **mesuré** : triceps listé « Primaires », 8 zones rouges au lieu de 6 | P2 |
| **F05** | une règle générique passe avant les muscles choisis pour un exercice perso | **mesuré** : « Curl Maison Zorglub » → figurine biceps, Progrès quadriceps ; « Rowing Zorglub » : classe calories 5,5 au lieu de 4 | P2 |
| **F06** | la tuile « Séance » de Nutrition ne montre qu'**une** séance du jour | **mesuré** : 250 + 350 kcal → affiche 350 | P2 |
| **F07** | couleur du calendrier gardée en cache après une édition | **mesuré** : « bas 86 % » au lieu de « haut 100 % » jusqu'au redémarrage | P3 |
| **F22** | import Apple Santé : course, marche et natation tombent sur « autre » | **lu** : `_typeCardioDepuisMontre` rend des types absents de `CARDIO_MET` | P2 |
| **F23** | l'export PDF compte des **jours**, pas des séances | **lu** (`setup.js:546`) | P2 |
| **F13** | l'aide Nutrition dit que le cardio « s'ajoute au TDEE » ; le calcul ne le fait pas (et c'est juste) | **mesuré** : TDEE 2 663 avec ou sans 800 kcal de séance, aide inchangée | P2 |
| **F19** | score de récupération sans sommeil présenté comme sûr | **mesuré** : « Bon 79 » ; à 25 ans « Optimal 82, idéal pour tenter des records » | P2 |
| F09 à F12 | moteur calorique : repos des préférences ignoré, forfait 10 min sur une durée saisie, `totalMin` sans la transition, Oiseau compté comme un développé | **mesuré** (K4 à K6) ; moteur gelé, rien sans accord | P2/P3 |
| — | CSV : une ligne unilatérale porte le volume d'**un** côté ; avertissement de stockage plein affiché 3 fois | **mesuré** | P3 |

**Déjà conformes, rien à faire, à protéger par des témoins** : séance vide refusée, double « Terminer » = une séance, **remplacer un exercice n'hérite ni des charges ni du repos**, première référence ≠ record, même exercice en deux blocs, stockage plein sans perte, `synced` seulement sur accusé du serveur, débrief supprimé avec sa seule séance (A01, A02, A09, A11/A12, B05, B09/B10, E01, E02, E04, mesurés aujourd'hui).

### 2.2 Chrono et minuterie de repos

| Sur master (`ft-v1260`) | Sur la branche Séance (prêt, non intégré) |
|---|---|
| le repos vit **en mémoire** : app fermée par iOS → **perdu** ; au retour au premier plan, coupé dès −5 s ; dépassement affiché en négatif jusqu'à **15 min**, app ouverte | **SEANCE-REPOS-01 + avenant D-102** : le repos survit à la fermeture (`S.wkt.repos = {debut, total}`, **aucune clé nouvelle**, hors du brouillon de secours), revient à l'heure réelle, en négatif s'il est dépassé, **effacé 15 min après la fin théorique**, app ouverte ou fermée ; banc 61 / 0, contrôle négatif 52 / 52, passe complète 7 884 / 0 sur sa base ; calories identiques prouvées par témoins |
| repos par défaut : `REPOS_DEFAUT = 130 s` (2:10), un seul propriétaire | inchangé (hors lot, D-102) |

**Restent à faire** : les scénarios iPhone du cahier (appli ouverte ou fermée, retour après 1, 3, 5, 15 et 17 min, interruption, hors ligne, exercice supprimé, fin de séance), sur le clone, après l'intégration. ⛔ Aucun son ni alarme différée : une PWA iOS ne peut pas en jouer quand elle est fermée sans notification push.

### 2.3 Images, sélecteur, figurine (trois systèmes distincts)

| Système | Constat (24/10) | À faire |
|---|---|---|
| ① vignettes des groupes | 8 PNG sur la branche, `D-104` et `D-106` validées ; **21 noms sans tuile** (Avant-bras 5, Full Body 16, recherche seulement) ; **`08_mollets.png` pèse 765 Ko** (les 7 autres 32 à 40 Ko), et il est préchargé | intégrer depuis la branche ; tuiles manquantes et poids : décisions |
| ② illustrations des mouvements (`EX_YT`) | **mesuré** : 359 appartenances, 322 noms, 13 groupes ; 305 images présentes, **17 sans image** (liste de l'audit, identique), 1 clé morte ; 4 WebP orphelins, dont 2 préchargés, et 4 images `machine/` préchargées sans usage : **6 fichiers jamais affichés mais préchargés, 551 Ko** | pour les 17 : remplacer le repli « muscle deviné » par « aucune illustration disponible » (**3 endroits** dans `log.js`, le cahier l'exige) ; illustrations à produire puis valider par Michel, une par une ; ne jamais repartir de `docs/export/catalogue-exercices.json` |
| ③ figurine | F04 et F05 ci-dessus | décisions |

### 2.4 Réglages de la séance (inventaire avant tout ajout)

| Réglage | Où il vit aujourd'hui | Synchronisé |
|---|---|---|
| repos par défaut (`S.defRest`, `ft4_rest`) | Profil | oui (profil) |
| repos mémorisé par exercice (`S.exRestPref`, `ft4_exRp`) | Séance (implicite) | oui (envoyé avec le profil ; repris à la restauration seulement si l'appareil n'en a pas) |
| poids de la barre (`S.barW`) | Profil | oui (profil) |
| tout déplier (`ft4_expandall`) | Séance | local |
| unités kg / lb | **inexistant** (kg partout) | — |
| sons / alertes | **inexistant** : vibration seulement, que l'iPhone ne fait pas en web | — |
| RIR / RPE, tempo, échauffement progressif | RIR demandé dans la barre de repos (D-093), non réglable ; tempo lu dans la note ; aucun échauffement progressif réglable | — |

👉 L'**accès direct depuis Séance** peut se faire **sans aucune donnée nouvelle** : une feuille qui lit et écrit les **mêmes** valeurs que le Profil (une seule source). La séance en cours garde ses propres exceptions (repos par exercice), et rien de déjà enregistré n'est réécrit.

### 2.5 Nutrition

| # | Constat (24/10) | Prio |
|---|---|---|
| **N2** | **mesuré sur données fictives**, avec un favori d'avant V2 à P 26 et une ligne du journal à P 35 (40 g, 156 kcal) : selon la présence d'un code-barres, **deux propositions** coexistent, dans « Mes aliments » ou dans « Déjà noté par toi », toutes deux « non vérifié ». ⚠️ 156 kcal avec P 26 · G 1 · L 1 donne ~117 kcal par les coefficients d'Atwater : **la ligne P 26 est incohérente**, et rien ne la signale comme « à vérifier ». Aucune **fiche personnelle** n'existe : un favori ne peut que s'étoiler ou se retirer, **jamais se corriger** | P1 |
| **N2 ✕** | **mesuré** : « ✕ » retire l'aliment de « Mes aliments », mais **« Déjà noté par toi » le propose toujours** (la recherche ignore `S.hiddenFoods`) ; et **ce qui est masqué n'est jamais synchronisé**, donc tout revient sur un autre appareil ou après « Restaurer » | P1 |
| **N1** | « Déjà noté par toi », la partie « récents » de « Mes aliments » et « Tes repas habituels » se **calculent depuis le journal** : on ne peut pas les « vider » sans toucher au journal, **sauf à ajouter un mécanisme** (une date de départ ou une liste de masquage synchronisée, donc une donnée nouvelle, règle #17). Les favoris (`S.savedFoods`) sont synchronisés : le serveur P1 garde ceux qu'on retire dans sa zone de récupération, sans jamais les renvoyer à l'app ; « Restaurer » ne remplace que si le serveur en a | décision |
| N3 | `D-098` : les 10 entrées identifiées, reconstruction v1.2 (`D-095`) en simulation, rien appliqué · `D-112` reportée (« Restaurer » remplace les favoris) · valeurs inconnues comptées 0 par la carte des repas habituels, l'en-tête d'un repas, Milo et le Worker (à mesurer au banc, R34) · repas habituels regroupés par nom · F06 et F13 (écran Nutrition) | P1/P2 |

### 2.6 Aides « ? » — l'audit du 17/10 revérifié (complément du 24/10)

Source : « Audit des aides du clone.md » (Drive, 17/10), lu en entier, y compris le relevé mot pour mot des 6 aides et de l'aide détaillée (87 cartes). Ses deux exemplaires sont identiques à l'octet. **L'audit n'est pas refait** : chaque constat est vérifié sur master (application = `ft-v1260`).

| Constat de l'audit (17/10) | Sur master au 24/10 | Preuve |
|---|---|---|
| Affichage : « \*\* » visibles, icônes doublées, « U0001F4C5 » (Séance 2 et 3, aide détaillée) | corrigé (`ft-v1257`), **sauf** la carte « Journal alimentaire » de l'aide détaillée, qui affiche encore « \*\*pas\*\* » (Subway) | banc `aides_audit` 18 / 0 (il exclut Nutrition) ; lecture de `coach.js` |
| « NN » (Accueil 12) · Big 3 (Accueil 19) · cycle dans le Profil (Accueil 20) · badges sur l'Accueil (Accueil 21) | corrigés | banc `aides_audit` ①b, ③a à ③c |
| Séance 12 « −10% » · 18 « 📊 » · 19 « ℹ️ » · 20 « 📸 Word / Excel » | corrigés | banc `aides_audit` ②b à ②e |
| Coach 15 (Premium non dit) · Profil 1 (14 contre 15 entrées) · Profil 4 (sections) | corrigés | banc `aides_audit` ④a à ④c |
| Nutrition 28 et carte « Cardio en séance » : le cardio « s'ajoute au TDEE » | **toujours faux, à 2 endroits** (c'est F13) | lecture ; rejeu B16 : TDEE identique avec ou sans séance |
| Nutrition 5 contre 13 : 128 contre 123 produits de fast-food ; aide détaillée : « 4 lignes sur 27 » à côté de « de 27 à 128 » | **toujours contradictoire** | lecture |
| Nutrition 34 : « ✎ Ajuster mes calories » placé « sous l'anneau » | **toujours faux** : le bouton est dans « Comment c'est calculé » (`#nu-adjust` dans `#nu-acc-calc`), comme le disent le point 21 et l'aide détaillée | lecture de `index.html` |
| Nutrition 4 et 6 : « coca light » donne la bonne ligne ? | **à mesurer** : l'audit ne l'avait pas retesté ; `D-070` ne règle que « coca zéro / 0 / 0 % », et « coca light » est une dette connue de `ft-v1254` | — |
| Aides trop longues (Nutrition 24 364 caractères, dont un point de 3 253 ; Séance 37 points ; carte « Journal alimentaire » 10 151 caractères) | **toujours vrai, et ça a grossi** : Nutrition 42 points, 27 995 caractères (le plus long : 3 757) ; Séance 37 points, 15 567 caractères | mesure |
| Doublons (Séance, Nutrition, Accueil, Coach, et entre onglets) | non recomptés un par un ; les aides ont grossi depuis, le constat tient | — |
| Écrans sans aide propre : Menu (« ? » recouvert), Cycle de force (aide de l'Accueil), séance en cours (« ? » masqué, aide par ⋯), sous-onglets | inchangé, et voulu (D-083 pour la séance en cours) | lecture (`showHelp`, `style.css`) |

👉 **Ce qui entre dans le lot 6** : corriger les 4 phrases Nutrition (TDEE à 2 endroits, 128 / 123 / 27, « sous l'anneau ») et le « \*\*pas\*\* » ; mesurer « coca light » puis dire ce que la recherche fait vraiment ; étendre le banc `aides_audit` à la Nutrition, avec ses mutations, pour qu'elles ne reviennent pas. **Chaque correction du chantier met aussi à jour son aide** (règle d'or #11) : repos qui survit à la fermeture (déjà écrit sur la branche Séance), volume et calories d'une séance éditée, « aucune illustration disponible », tuile Nutrition à plusieurs séances, fiche personnelle et « ✕ ». ⛔ **L'aide contextuelle de chaque onglet est gardée telle quelle dans sa forme** (un « ? » par onglet, la même modale) ; le guide interactif à flèches reste une amélioration future.

## 3. Travaux Séance déjà réalisés — à ne pas refaire

- **Publiés (`ft-v1257`)** : les deux états de l'écran Séance (D-083), Cobalt et rouge destructif (D-085), la pastille N/É/X et « Précédent » (D-086), la note de la dernière fois (D-087), l'import d'historique (D-089), « Ta séance jusqu'ici » face/chiffres/dos (D-091/092), la réserve Échec · 0 · 1 · 2 · 3 · 4+ et les 4 dernières séances (D-093).
- **Prêts sur la branche, à intégrer tels quels** : SEANCE-REPOS-01 avec son avenant (`log.js`, `app.js`, une ligne de `state.js`, les aides), SEANCE-UX-IMAGES (8 vignettes, `style.css`, précache), leurs bancs `seance_repos` (61) et `picker_vignettes` (20), leurs contrôles négatifs, et leurs décisions (D-100, D-102, D-104 à D-107 ; numéros sans collision avec master, vérifié).
- **Outils de diagnostic déjà écrits, à réutiliser comme témoins rouges** : les harnais de la contre-vérification (F01 à F08, F19, K1 à K7, A/B/E), `_prsDepuisSeances` (recalcul des records avec aperçu), le garde réseau et les identités fictives.
- **Déjà corrigé** : la synchro jugée sur l'accusé du serveur (26/08).

## 4. Plan d'intégration commun — une branche, sept lots, une passe complète

> ↪️ **Organisation remplacée le 24/10 au soir par le §8** (deux branches spécialisées et une branche d'intégration). Le contenu des lots, leurs témoins et leurs décisions restent valables.

**Principes** : une branche dédiée depuis master à jour (`claude/chantier-nut-seance`), lot par lot, chaque lot ouvert par un **témoin vu rouge sur master**, puis la correction minimale, le contrôle négatif et les bancs voisins. **Aucune passe complète avant le gel du lot.** Aucune réécriture d'historique, aucun recalcul rétroactif sans consentement, moteur calorique gelé.

| Lot | Contenu | Prérequis | Témoins rouges (à prouver d'abord) | Risque inter-onglets |
|---|---|---|---|---|
| **0 — Base** | fusion **contrôlée** de la branche Séance (relecture du diff, 1 conflit de code et 6 de documentation, bancs de la branche rejoués sur l'arbre fusionné) ; harnais de diagnostic convertis en bancs | Q19 | `seance_repos`, `picker_vignettes` verts sur l'arbre fusionné | Séance (repos), sélecteur |
| **1 — Une séance enregistrée ne change pas en silence** | F21, F02, K1, K2 : « Enregistrer » suit la règle unique `_workVol`, ne recalcule les calories que si l'effort a changé ; la durée se corrige dans le détail ouvert et recalcule | Q4, Q5 | F02 (600→300), K3 (97→112), K1, K2 | Progrès, Accueil, Nutrition (tuile), Milo, exports |
| **2 — Les mêmes chiffres partout** | F01 (calendrier), F25 (tendance), F03 (W), F07 (cache), F23 (PDF par séance), F06 (tuile), F22 (Apple Santé) | Q9, Q10 | F01 (1 100 contre 800), F03 (3 contre 2), F06 (350 au lieu de 600), F07 | Accueil, Progrès, Nutrition, Milo, exports |
| **3 — Records et muscles** | F08 (recalcul **ciblé avec aperçu**), F04 (libellé), F05 (le choix de la personne d'abord, banc calories avant/après, R34) | Q6, Q7, Q8 | F08, F04, F05 | Milo (charges proposées), calories des persos |
| **4 — Chrono et réglages** | contrôles du repos après fusion, scénarios iPhone (clone), feuille de réglages dans Séance qui réutilise ceux du Profil | Q1, Q2, Q18 | réglage modifié dans Séance = même valeur dans Profil ; rien de réécrit dans les séances | Profil, Séance |
| **5 — Images** | « aucune illustration disponible » au lieu du muscle deviné (3 endroits), liste des 17, vignettes (lot 0), précache nettoyé, poids de la vignette Mollets | Q3, Q12, Q13 | repli générique visible aujourd'hui pour les 17 | Séance, import, programmes |
| **6 — Nutrition** | **N2 d'abord** (fiche personnelle corrigible ou retirable, « ✕ » respecté par la recherche, masquage qui survit à la synchro, incohérence signalée), **puis N1** (remise à zéro ciblée, seulement si la séparation fiches / journal est prouvée), F13, les 4 phrases d'aide Nutrition encore fausses et le « \*\*pas\*\* » (§2.6), « coca light » mesuré, banc des aides étendu à la Nutrition, valeurs inconnues restantes | Q14 à Q17, Q20 | « ✕ » ignoré par « Déjà noté par toi » ; cas Iso zero ; masquage perdu à la restauration | Nutrition, synchro, restauration, Milo |

**Passes D-031 (le minimum, R1 à R4)** :
- pendant le travail : témoin rouge → correction → banc → contrôle négatif → voisins. **Aucune passe complète** ;
- au gel du lot : **une seule passe complète**. La répartie (~37 min) si une classique a déjà tourné dans la semaine de la publication ; sinon la classique (~96 min), qui règle R4 en même temps ;
- en plus, seulement si nécessaire : une 2ᵉ passe après une correction tardive (R2 si une anomalie apparaît en répartie) ;
- ⚠️ les nouveaux modules du runner (repos, vignettes, nouveaux bancs) tombent dans le processus 0 de la répartie : couverts, mais ils l'allongent. Pas de rééquilibrage (décision du 24/10).

**Livrable au gel** (pour décision de Michel) : branche, commits, diff exact, résultats ciblés et intégrés, preuve d'absence de perte de données (anciennes séances et anciens journaux relus à l'identique), recette iPhone à faire valider, retour arrière rejoué à blanc, recommandation de **publication unique**.

## 5. Estimation (méthode D-088, repères mesurés)

| Lot | Travail | Tests (exécution) |
|---|---|---|
| 0 — Base | ≈ 2 h | ≈ 40 min |
| 1 — Séances enregistrées | ≈ 2 h | ≈ 45 min |
| 2 — Chiffres partout | ≈ 2 h 30 | ≈ 1 h |
| 3 — Records et muscles | ≈ 2 h | ≈ 1 h (dont banc calories avant/après) |
| 4 — Chrono et réglages | ≈ 1 h 30 | ≈ 45 min (+ recette iPhone de Michel ≈ 30 min) |
| 5 — Images | ≈ 1 h | ≈ 30 min |
| 6 — Nutrition (N2, N1, N3, aides du 17/10) | ≈ 5 h 15 | ≈ 1 h 45 |
| Aides (règle d'or #11), documentation, journal | ≈ 1 h 30 | — |
| Gel : passe complète, annexe, fumée, retour arrière, rapport | ≈ 30 min | ≈ 1 h 15 (répartie) ou ≈ 2 h 15 (classique) |
| **Total central** | **≈ 18 h 15** | **≈ 7 h 45** (répartie) ou **≈ 8 h 45** (classique) |

**Risques, à part** : une décision qui tarde, et le lot qui l'attend glisse sans bloquer les autres · une 2ᵉ passe complète (+ 37 à 96 min) · N1 arrêté net si la séparation fiches / journal n'est pas prouvable (règle du cahier) · reprises après la recette iPhone (≈ 1 à 2 h) · conflits si une autre session publie pendant le travail (refusion + passe périmée) · le poids de la vignette Mollets sur un iPhone hors ligne. **Le calendrier réel dépend surtout des 20 décisions du §6** : sans elles, seuls les lots 0, 1 (partiel), 2 (partiel) et 5 (partiel) peuvent avancer.

## 6. Décisions à prendre (avant de coder le lot concerné)

| # | Question | Ce que je propose | Lot |
|---|---|---|---|
| **Q1** | **Expiration du repos** : la dernière décision explicite est `D-102` (22/10 après-midi) : 15 min après la fin théorique, app ouverte ou fermée ; elle a remplacé les 5 min du matin. La confirmer ? | **confirmer D-102 telle quelle** (une seule règle, déjà testée) | 4 |
| Q2 | Repos **par défaut** : le code dit 2:10 (130 s) ; le cahier parle de 2 min. Garder 2:10 ou passer à 2:00 ? (touche les nouveaux comptes seulement, pas le réglage de chacun) | garder 2:10, chacun le règle dans Profil (ou bientôt dans Séance) | 4 |
| Q3 | Vignette Mollets : 765 Ko préchargés pour une case de 88 × 51 px. Réduire le fichier (D-107, PROPOSÉ) ? | la réduire au format des 7 autres, sans retoucher le dessin | 5 |
| Q4 | Calories d'une séance passée quand on l'édite : garder celles d'origine tant que l'effort (séries, durée, cardio) n'a pas changé ? Et en cas de recalcul, au poids **de la séance** ou du jour ? | garder l'origine sans changement d'effort ; recalculer au poids de la séance, ce qui veut dire stocker ce poids (donnée nouvelle, règle #17) | 1 |
| Q5 | Séances unilatérales **déjà** réduites de moitié par une édition depuis le 11/08 : diagnostic en lecture seule d'abord, puis montrer le bon chiffre sans réécrire, ou corriger avec ton accord ? | diagnostic en lecture seule, puis affichage juste sans réécrire | 1 |
| Q6 | Records (F08) : proposer un recalcul **ciblé avec aperçu** après la suppression ou la baisse de la séance qui porte le record ? | oui, exercice par exercice, jamais d'effacement d'un record invérifiable | 3 |
| Q7 | Figurine (F04) : séparer « muscle moteur » et « souvent sollicité » ? | oui : libellé exact, couleurs inchangées pour un vrai primaire | 3 |
| Q8 | Exercices perso (F05) : les muscles choisis par la personne passent avant la règle générique ? (change les calories de certains persos) | oui, avec banc calories avant/après | 3 |
| Q9 | Tuile « Séance » de Nutrition (F06) : la somme des séances du jour, ou la liste ? | la somme, avec « 2 séances » écrit | 2 |
| Q10 | Apple Santé (F22) : course, marche et natation, quels barèmes ? | les nommer à l'écran, garder « autre » tant qu'aucun barème n'est validé (moteur gelé) | 2 |
| Q11 | Récupération sans sommeil (F19) : « estimation sans sommeil récent », sans conseil « records » ? | oui (texte seulement) | 2 |
| Q12 | Images manquantes : « aucune illustration disponible » au lieu de l'image musculaire générique (3 endroits), comme le dit le cahier ? | oui | 5 |
| Q13 | Précache : retirer les 6 fichiers préchargés jamais affichés (551 Ko) ? Tuiles pour Avant-bras et Full Body (21 noms) ? | retirer ; pour les tuiles, une entrée « Autres » sans nouvelle vignette | 5 |
| Q14 | N1 : comment vider « Déjà noté par toi », les récents et les repas habituels **sans toucher au journal** : une date de départ (une seule valeur) ou une liste de masquage ? Synchronisée ? | une date de départ synchronisée : une donnée, pas une liste qui grossit | 6 |
| Q15 | N1 : remise à zéro des favoris : sauvegarde récupérable montrée avant, puis effacement local et serveur ; les copies gardées par P1 dans la zone de récupération restent (jamais renvoyées) ? | oui, après N2 et un aperçu exact du périmètre | 6 |
| Q16 | N2 : une **fiche personnelle** corrigible (le favori devient éditable, le journal passé n'est jamais réécrit) ; « ✕ » respecté par la recherche ; le masquage synchronisé ; une incohérence kcal/macros signalée « à vérifier » (une règle de plus à la douane, gelée depuis le 13/09) ? | oui pour les trois premiers ; le contrôle kcal/macros seulement avec ton feu vert explicite | 6 |
| Q17 | N3 : `D-098` (les 10 entrées) et `D-112` (restauration des favoris) dans ce lot, ou après ? | `D-112` dans le lot, car elle conditionne N1 ; `D-098` après, avec son propre GO (données réelles) | 6 |
| Q18 | Réglages dans Séance : lesquels ? (repos, poids de la barre, tout déplier ; unités lb et sons inexistants) | repos et poids de la barre, en lisant ceux du Profil ; ni unités ni sons dans ce lot | 4 |
| Q19 | Intégrer la branche Séance par **fusion contrôlée** (décisions et documents compris), ou par copie sélective des seuls fichiers de l'app ? | fusion contrôlée : son diff est entièrement utile, et une copie sélective perdrait ses décisions et ses tests | 0 |
| Q20 | Aides trop longues et doublons (audit du 17/10, toujours vrai) : réécrire l'aide Nutrition (42 points, ~28 000 caractères) et l'aide Séance (37 points), en gardant un « ? » par onglet ? | pas dans ce lot : seulement corriger les phrases fausses, une à une ; une réécriture éditoriale à part, avec ton accord, car elle change ce que chacun lit | 6 |

**Hors de ce lot (gelés ou à décider à part)** : le moteur calorique (F09 à F12, et la validation scientifique : 10 vraies séances consenties), le guide interactif, les plats favoris, la modularisation de `log.js`.

## 7. Reproduire

Les harnais de la session Séance sont sur la branche (`tools/contre_verif_seance_2026_10_23/`). Pour les rejouer sur master, il faut une copie hors dépôt (`git archive origin/master`), y placer le dossier des harnais, puis lancer `tools/sous_garde.sh node <harnais>.js <copie>` : réseau coupé, données fictives. La sonde Nutrition de ce document est restée hors dépôt (script de session) : elle sera réécrite en banc au lot 6.

## 8. Coordination — qui fait quoi depuis le 24/10 au soir (Claude Principal)

> **Mission de Michel du 24/10 (P1)** : *Claude Nutrition corrige Nutrition, Claude Séance corrige Séance, Claude Principal coordonne, intègre et qualifie.* Les lots du §4 restent le contenu du travail ; ils ont maintenant **un responsable et une branche chacun**, et l'intégration se fait sur une **branche dédiée**. GO de Michel : coordination, analyse, préparation non destructive. ⛔ Ni fusion sur master, ni publication, ni déploiement, ni purge réelle sans son accord explicite. Ce paragraphe se met à jour à chaque livraison.

### 8.1 Les branches (mesuré le 24/10 à 21 h UTC, après `git fetch --all`)

| Branche | Responsable | Tête | Par rapport à master | Contenu | État |
|---|---|---|---|---|---|
| `master` (référence) | — | `37fbbbb3` à la mesure ; depuis, ma documentation de coordination seulement | — | application **identique à l'octet** à `ft-v1260` (`1df57e4c`) ; depuis : outils de la D-031 accélérée et documentation | `ft-v1260` en ligne ; Apps Script @193 ; Worker inchangé |
| `claude/nutrition-v2` | Claude Nutrition (session-A) | `1c9428e7` | repartie de master `999b7947` ; +1 commit : sa ligne de journal, portée **par sa branche** et pas par master ; il ne lui manque que ma documentation de coordination | rien de codé poussé à cette heure | démarrée à 20:35 UTC |
| `claude/dreamy-bell-pu88ia` | Claude Séance (session-C) | `5a7b0a57` | master `999b7947` **fusionné par sa session** (`ce45c79a`, 20:39 UTC) ; 44 commits d'avance ; il ne lui manque que ma documentation de coordination ; sa ligne de journal est portée **par sa branche** | repos persistant (SEANCE-REPOS-01 + `D-102`) · 8 vignettes (`D-104` à `D-107`) · harnais de la contre-vérification du 23/10 · `BUGS` §91, 93, 95, 99, 100 | lots 1 → 5 démarrés à 20:40 UTC ; la session a signalé une **baisse de 130 témoins « voulue »** : à justifier témoin par témoin à la livraison |
| `claude/integration-nut-seance` | Claude Principal | — | sera créée depuis master au moment d'intégrer | — | après les deux livraisons |

### 8.2 Les conflits (simulation `git merge-tree`, rien n'est écrit dans le dépôt)

- **Mesuré à 20:39 UTC**, avant que la session Séance ne fusionne master : **1 conflit de code**, dans `constants.js` (Séance réécrit la ligne du point rouge `repos-maximum`, « 15 minutes après la fin du repos », juste à côté de `nutri-v2-quantites` de Nutrition V2), et 6 conflits de documentation.
- **Re-mesuré à 20:55 UTC**, après la fusion de master faite par la session Séance (`ce45c79a`) : **aucun conflit de code** entre les trois branches. Le conflit de `constants.js` a été réglé par son responsable (les trois points rouges `repos-maximum`, `repos-persistant` et `nutri-v2-quantites` sont présents ; la résolution sera relue à la livraison). Il reste des conflits de documentation : master + Séance → `CONTEXTE-ACTUEL`, `JOURNAL-DE-PARTAGE` ; Séance + Nutrition et master + Nutrition → `JOURNAL-DE-PARTAGE`.
- **Un témoin d'un couloir a été réécrit par l'autre** : `B-NP01-A` (banc Nutrition `nut_punch01`) ne compare plus `S.wkt.repos` depuis le repos persistant. C'est justifié et protégé par un contrôle négatif (MA20), mais **Claude Nutrition doit le relire**.

### 8.3 Fichiers communs et frontières

| Zone | Claude Nutrition | Claude Séance | Règle |
|---|---|---|---|
| `log.js`, vignettes, précache des images (`sw.js`) | — | oui | Séance seule |
| `nutrition-v2.js` | oui | — | Nutrition seule |
| `app.js` | zone Nutrition | reprise du repos au démarrage (`_reposReprendre`), Guide (`APP_GUIDE_SLIDES`) | ⛔ **moteur MET gelé** : `CARDIO_MET`, `calcCardioKcal`, `calcCardioKcalTotal`, `_MET_REGIONS`, `getExerciseMET`, `calcSessionCalories` (et `_movPattern`, `_mscScores` dans `log.js`) |
| `screens.js` | `renderNutrition`, aide Nutrition | Accueil, calendrier, aide Séance | dans `renderNutrition`, **seule la tuile « Séance »** (F06, `S.sessions.find`) est à Séance |
| `coach.js` | aide détaillée Nutrition | aide détaillée Séance | `buildCoachContext` est un **carrefour** : toute différence du prompt de Milo, à données égales, est montrée avant / après (R34) |
| `setup.js` | restauration (favoris, masquage) | Progrès, édition d'une séance, export PDF (F23) | fonctions distinctes |
| `state.js` | une clé au plus (règle #17) | le brouillon sans `repos` (déjà fait) | `persist` et `load` sont des **carrefours** : annexe entière et passe complète |
| `constants.js` | `NEW_FEATURES` dans son bloc | `NEW_FEATURES` dans son bloc | jamais en tête du tableau |
| `Code.js` | ⚠️ **seulement si** le masquage ou la remise à zéro doivent se synchroniser : `saveProfile` n'enregistre que les champs de sa **liste blanche**, et `hiddenFoods` n'y est pas | — | cela ferait un **déploiement Apps Script à part**, avec son propre GO |
| `index.html`, `style.css` | section Nutrition | section Séance, sélecteur | blocs distincts |
| `tests/parcours/runner.js`, `tests/recette/registre.json`, documentation | oui | oui | conflits de liste attendus, résolus mécaniquement |

### 8.4 Numéros partagés : réservés pour que personne ne renumérote à la fusion

> ⚠️ **Corrigé à 20:55 UTC.** Ma première version (20:54) donnait `D-114` → `D-123` et §103 → §112 à Nutrition. La session Séance avait réservé `D-114` → `D-129` et §103 → §112 à 20:40, sur **sa** branche : le journal de master ne pouvait pas le montrer. **Le premier qui réserve garde** ; Nutrition et Principal prennent la suite. *C'est la faille écrite en tête du journal de partage — « un fichier ne prévient pas, il faut aller le lire » — et ici il fallait lire une autre branche que master.*

| Espace | Déjà pris | Prochain libre | Claude Nutrition | Claude Séance | Claude Principal |
|---|---|---|---|---|---|
| Décisions `D-` | master 096 à 099, 101, 103, 108 à 113 ; Séance 100, 102, 104 à 107 | D-114 | D-130 à D-139 | **D-114 à D-129** (réservés par sa session) | D-140 à D-144 |
| `BUGS.md` § | master 92, 94, 96 à 98, 101, 102 ; Séance 91, 93, 95, 99, 100 | §103 | §113 à §122 | **§103 à §112** (réservés par sa session) | §123 à §127 |
| Pop-up « Quoi de neuf » | v80 | v81 | v81, si elle est méritée (règle #11) | v82, si elle est méritée | confirmé à la publication |
| Version `ft-vNNNN`, clé `sw.js` | `ft-v1260` | `ft-v1261` | jamais pendant le travail | jamais pendant le travail | posée à la publication |
| Blocs de témoins | — | — | son préfixe, jamais renommé | `C-NUM-*`, `C-REC-*`, `C-REG-*`, `C-IMG-*` | `B-TRV` |

### 8.5 Tableau de coordination

**Claude Nutrition · `claude/nutrition-v2`**

| # | Chantier | État (24/10) | Dépend de | Risques | Tests attendus | Condition d'intégration |
|---|---|---|---|---|---|---|
| N-a | 40 g changés en 35 ou 50 g : quantités et macros recalculées ; protéine isolate figée | en cours, rien de poussé | une fiche fiable (`D-096`) | réécrire une ligne ancienne (interdit, `D-098`) | témoin rouge sur master puis vert ; ancienne ligne relue à l'octet | enregistré = affiché, pour une fiche CIQUAL, Open Food Facts et personnelle |
| N-b | Steak haché scanné (200 g / 130 kcal / 22 g) : quantité prise pour du « pour 100 g » | en cours | — | réparer le scan en cassant la saisie manuelle | le cas scanné rejoué sur données fictives, rouge puis vert | quantité scannée et valeur pour 100 g jamais confondues |
| N-c | Traçabilité CIQUAL / Open Food Facts | en cours | — | perdre la référence en modifiant | référence relue après modification, reprise et restauration | aucune ligne nouvelle sans sa source |
| N-d | Doublons et valeurs contradictoires (cas « Iso zero ») ; fiche personnelle corrigible | en cours | Q16 (le contrôle kcal / macros touche la douane gelée : feu vert explicite) | réécrire le journal passé | cas Iso zero (P 26 contre P 35) rouge puis vert | journal passé intact à l'octet |
| N-e | « ✕ », masquage, favoris, récents, « Déjà noté par toi » | en cours | Q14, Q16 ; `Code.js` si le masquage se synchronise | `_cloudSync` est un carrefour ; masquage perdu à « Restaurer » | « ✕ » respecté par « Déjà noté par toi » ; le masquage survit au rechargement, à « Restaurer » et à un 2ᵉ appareil simulé | sans redéploiement serveur, ou avec son GO |
| N-f | Remise à zéro des propositions (N1) | préparée, **sans exécution** | Q14, Q15 ; GO spécifique de Michel | confondre propositions et repas consommés | aperçu exact du périmètre sur données fictives ; journal identique avant / après | rien d'exécuté sur des données réelles |
| N-g | Enregistrement et restauration cohérents (`D-112` : « Restaurer » remplace les favoris ; 200 envoyés au plus) | à confirmer avec la session | Q17 ; `Code.js` possible | favoris perdus à la restauration | restauration sur appareil neuf simulé | `D-112` traitée ou laissée hors lot, et dit |
| N-h | Aides Nutrition (§2.6) et banc des aides étendu à la Nutrition | prévu (lot 6) | F13 (texte seulement) | une aide qui décrit l'ancien écran | `aides_audit` étendu, avec mutations | chaque phrase touchée dit ce que l'écran fait |
| N-i | Présentation du journal : kcal → quantité → P → G → L | annoncé par la session | — | surcharge ; rendu iPhone | capture à 390 px ; contrôle iPhone | cohérente avec le reste de Nutrition |

**Claude Séance · `claude/dreamy-bell-pu88ia`**

| # | Chantier | État (24/10) | Dépend de | Risques | Tests attendus | Condition d'intégration |
|---|---|---|---|---|---|---|
| S-a | Séance passée qui change en silence à « Enregistrer » (F21, F02, K1, K2) | à faire | Q4, Q5 | recalcul rétroactif (interdit) ; moteur MET gelé | F02 (600 → 300), F21 (97 → 112), K1, K2 rouges sur master puis verts | une séance non modifiée ne bouge pas, relue à l'octet |
| S-b | Tonnage unilatéral, les mêmes chiffres partout (F01, F25, F07, F23) | à faire | — | une formule par écran | F01 (1 100 kg contre « 0,8 t ») ; `B-TRV` | un seul calcul lu partout |
| S-c | Séries d'échauffement (F03, F25) | à faire | `D-092` (total et travail) | casser `D-092` | F03 (3 séries contre 2) | « travail » sans échauffement partout où il est écrit |
| S-d | Records (F08) | à faire | Q6 | effacer un record invérifiable | F08 (100 × 5 gardé) ; recalcul ciblé avec aperçu | aucun effacement silencieux |
| S-e | Muscles principaux et secondaires (F04) ; exercices perso (F05) | à faire | Q7, Q8 (F05 change les calories de certains exercices perso : accord de Michel) | toucher aux calories par la bande | F04 (8 zones contre 6), F05 ; banc calories avant / après | l'écart de calories montré à Michel avant |
| S-f | Chrono de repos persistant | **fait sur la branche** (banc 61 / 0, mutations 52 / 52) | Q1 (confirmer `D-102`) | iOS : rien ne sonne quand l'app est fermée | rejoué sur l'intégration ; iPhone : 1, 3, 5, 15 et 17 min, interruption, hors ligne | contrôles iPhone faits |
| S-g | Réglages Séance et Profil | à faire | Q2, Q18 | deux propriétaires pour une valeur | réglage changé d'un côté = même valeur de l'autre ; séances passées intactes | une seule source |
| S-h | Vignettes et illustrations | 8 vignettes **faites sur la branche** ; le reste à faire | Q3, Q12, Q13 | iPhone hors ligne ; poids de la vignette Mollets | `picker_vignettes` ; capture iPhone | jamais une image approximative à la place d'une image absente |
| S-i | Cohérence Progrès / Nutrition / Milo (F06, F19) | à faire | Q9, Q11 | `renderNutrition` partagé avec Nutrition | F06 (350 au lieu de 600 kcal), F19 | `B-TRV` vert |
| S-j | Contre-vérification des MET (F09 à F12 ; femmes et hommes, pratiques, intensités) | diagnostic seulement | accord de Michel pour toute modification | inventer une précision | propositions écrites et sourcées | **aucune** modification du moteur dans cette publication |

**Claude Principal · intégration**

| # | Chantier | État (24/10) | Dépend de | Risques | Tests attendus | Condition |
|---|---|---|---|---|---|---|
| P-a | Carte des branches, des conflits et des numéros | **fait** (§8.1 à §8.4) | — | une session qui ne la lit pas | — | réservations transmises aux deux sessions |
| P-b | Banc transversal `B-TRV` | à préparer maintenant | — | doublonner un banc d'une session | ses rouges sur master, chacun rattaché à son responsable | vert sur l'intégration |
| P-c | Données existantes et retour arrière | à préparer maintenant | — | — | dans les deux sens, à l'octet | verts |
| P-d | Branche d'intégration, fusions | après les deux livraisons | §8.7 | un conflit mal résolu | bancs des deux sessions rejoués sur l'arbre fusionné | aucun conflit de code non mécanique résolu seul |
| P-e | Qualification globale | après | R1 à R4 | passe périmée par une publication concurrente | sélecteur de recette, annexe, garde MET, prompt de Milo, passe classique | 0 rouge, ou rouge expliqué et accepté par Michel |
| P-f | Recette iPhone sur le clone | liste à préparer | Q22 (GO de déploiement du clone) | WebKit ≠ Chromium | contrôles T4 | faite par Michel |
| P-g | Publication et retour arrière | squelette (§8.9) | GO de Michel | publier sur la seule foi des tests verts | retour arrière rejoué à blanc | décision de Michel |
| P-h | Bande FORCE TRACKER sur l'Accueil seulement | **pas construite** (mesuré) | Q21 | le « ? » disparaît avec elle | sonde du 24/10 | Q21 tranchée |

### 8.6 Contrôles transversaux : ce qui existe déjà, ce qui manque

| Interaction | Déjà couvert sur master | Manque (préparé par Claude Principal) |
|---|---|---|
| Séance → Nutrition | contrat `nut_punch01` (date, heure, séries, codes) ; `nutri_moteur` ; TDEE identique avec ou sans séance (mesuré) | deux séances le même jour : la tuile (F06) dit la même somme que l'historique |
| Séance → Progrès | `progres_seances`, `d091_volume_prepare`, `session_integrity`, annexe calendrier ; F01, F02, F03, F08 mesurés par les harnais du 23/10, hors passe | une même séance (unilatéral, échauffements, record) donne les mêmes tonnage, séries de travail et record sur l'Accueil, le calendrier, Progrès, la fin de séance et l'export CSV |
| Séance → Milo | annexes `milo-noyau`, `donnees`, `calendrier-milo`, `discussions` ; `contrat_milo` ; bancs du débrief | Milo reçoit les chiffres de l'écran (tonnage, volume par muscle, records, récupération) ; prompt comparé avant / après l'intégration |
| Nutrition → Milo | prompt identique à l'octet avant / après V2 (contrôle ponctuel du 24/10) | une valeur inconnue n'est pas comptée comme 0 sans le dire ; la provenance arrive jusqu'à Milo |
| Nutrition → synchro | `foodlog_restore`, `nut_secu_p1`, `nut_v2_p1_croise`, chaos ; sonde du 24/10 (hors dépôt) | masquage, fiche corrigée et repas consommé survivent à « Restaurer » et à un 2ᵉ appareil simulé ; journal identique |
| Profil → Séance | le repos par défaut a un seul propriétaire (`REPOS_DEFAUT`) | une valeur changée d'un côté est la même de l'autre (repos, barre) ; séances passées intactes |
| Aides « ? » | `aides_audit` 18 / 0, sans la Nutrition | relecture finale de chaque phrase d'aide touchée par l'un ou l'autre couloir |
| Exports, restaurations, historique | contre-épreuves et retour arrière de `ft-v1260` (scripts de session) | **données existantes** écrites par `ft-v1260`, relues par l'intégration à l'octet (séances, journal, favoris, réglages, records) ; et l'inverse pour le retour arrière |

**Ce que je prépare maintenant, sans attendre les deux sessions** (≈ 6 h en tout, rien sur master, rien de publié) : ① le banc `B-TRV` sur données fictives, réseau coupé, rejoué sur master pour connaître les rouges d'aujourd'hui (≈ 3 h, plus ≈ 30 min d'exécution) · ② la contre-épreuve « données existantes » et le retour arrière, élargis aux séances, à partir du script de `ft-v1260` (≈ 1 h 30) · ③ une garde « moteur MET inchangé » sur les fonctions gelées du §8.3 (≈ 20 min) · ④ la liste des contrôles iPhone, tirée du sélecteur de recette et du cahier (≈ 30 min) · ⑤ le squelette de publication et de retour arrière (≈ 30 min).

### 8.7 Ce que chaque session livre pour entrer dans l'intégration

1. sa branche **à jour de master** (fusion faite par elle), poussée, avec le commit exact ;
2. chaque correction avec son **témoin vu rouge sur master puis vert**, son contrôle négatif et ses bancs voisins ;
3. tout témoin **réécrit ou retiré**, nommé, avec sa raison (les 130 annoncés côté Séance compris) ;
4. les décisions utilisées (dans ses numéros réservés) et celles qui attendent Michel ;
5. les fichiers touchés hors de son couloir, et pourquoi ;
6. la preuve qu'aucune séance ni aucun journal ancien n'est réécrit, et que le moteur MET n'a pas bougé ;
7. **aucune passe complète exigée à ce stade** : elle se fait une seule fois, sur l'intégration.

### 8.8 L'intégration : stratégie et ordre recommandé

1. Branche `claude/integration-nut-seance` créée depuis master à ce moment-là ; **master n'est pas touché**.
2. **Séance d'abord** : la plus grosse et la plus ancienne (42 commits, deux lots déjà qualifiés), déjà remise à jour de master par sa session. Ses bancs sont rejoués sur l'arbre intégré.
3. **Nutrition ensuite** : partie de master, plus petite ; ses conflits avec Séance tombent sur les zones communes du §8.3 et se règlent une fois.
4. Une fusion `--no-ff` par branche, pour que chaque lot reste traçable par ses commits. Aucune fonction recopiée à la main. Un conflit de code qui n'est pas mécanique repart chez son responsable.
5. Contrôles : sélecteur de recette sur le diff entier, `B-TRV`, contre-épreuves, garde MET, prompt de Milo avant / après, annexe entière (carrefours `persist`, `buildCoachContext`, `_cloudSync`).
6. **Une seule passe complète, la classique** : la publication tombera dans une semaine où aucune classique n'a encore tourné (le 24/10 est un samedi), donc R4 la demande de toute façon. Une correction après la passe est qualifiée selon son impact : bancs ciblés, puis répartie si elle reste locale.
7. Recette iPhone sur le clone (Q22), puis le rapport de publication en 10 points demandé par Michel, et sa décision.

### 8.9 Publication et retour arrière (squelette, complété à la livraison)

- **L'app (Pages)** : `ft-v1261`. Retour arrière : l'application de `ft-v1260` avec la clé `ft-v1262`, **rejoué à blanc avant de publier** ; et les données écrites par `ft-v1261` relues par `ft-v1260` (contre-épreuve inverse).
- **Le serveur (Apps Script)** : seulement si la synchro du masquage ou de la remise à zéro est retenue. `Code.js` part alors à part, avant ou après l'app (sans danger dans les deux sens : un champ inconnu est ignoré), avec son propre retour arrière (@193).
- **La remise à zéro réelle des propositions n'est jamais dans la publication** : GO spécifique, sauvegarde vérifiée, aperçu exact du périmètre, simulation sur données fictives. Les repas consommés n'en font jamais partie.

### 8.10 Deux nouvelles questions pour Michel

| # | Question | Ce que je propose |
|---|---|---|
| Q21 | « La bande FORCE TRACKER reste visible sur l'Accueil uniquement » : c'est cité comme une décision prise, mais elle n'est **pas dans le registre**, et elle n'est **pas construite** (mesuré sur `ft-v1260` : la barre fait 93 px et s'affiche sur les 6 onglets). Elle porte aussi le « ? », le partage et « Sheets » : la cacher ailleurs fait disparaître l'aide (mesuré). Où va le « ? » sur les autres onglets, qui la construit, et entre-t-elle dans cette publication ? | l'inscrire au registre ; choisir la place du « ? » sur une maquette avant de coder ; **hors de cette publication**, qui reste centrée sur la fiabilité des données |
| Q22 | Régénérer le clone pour la recette iPhone, c'est pousser le dossier `clone/` sur master, donc un déploiement Pages (la prod n'est pas touchée). GO au moment de la recette ? | oui, au moment de la recette, pas avant |
