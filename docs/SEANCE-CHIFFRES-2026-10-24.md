# Mission Séance du 24/10/2026 — corrections et fiabilisation de l'onglet Séance (P1)

> **Pour** : Michel (décisions) et Claude Principal (intégration, `docs/CHANTIER-NUTRITION-SEANCE.md` §8.7).
> **Par** : session-C (Claude Séance), branche **`claude/dreamy-bell-pu88ia`** uniquement, **à jour de master** (fusion de la
> coordination §8, documentation seulement).
> **État** : développé et testé sur la branche. ⛔ **Rien n'est fusionné, publié ni redéployé ; aucun numéro de version ;
> aucune donnée réelle touchée ; 0 appel à Milo.** Toutes les décisions prises sont **PROPOSÉES** (D-114 → D-126).

---

## 1. En bref

1. **Une séance enregistrée ne change plus en silence.** « Enregistrer » sans rien changer garde les calories et le volume ;
   corriger la durée met les calories à jour à l'échelle de la séance d'origine et ne perd plus une charge tapée.
2. **Les mêmes chiffres partout** : calendrier, tendance, historique, export, tableau de bord, Nutrition et Milo lisent la
   même règle de volume (unilatéral × 2, échauffements « W » exclus).
3. **Records** : supprimer ou baisser la séance d'un record ouvre un aperçu « avant → après » — rien sans ton geste.
4. **Figurine** : rouge = muscle moteur, orange = sollicité (un secondaire de deux exercices n'est plus « principal ») ; un
   exercice perso montre **ses** muscles cochés — **sans toucher aux calories** (écart chiffré, décision à toi).
5. **Repos par défaut** réglable **depuis la séance** (⋯), même valeur que le Profil — qui affichait une case vide pour 2:10.
6. **Images** : « Aucune illustration disponible » au lieu d'un muscle deviné ; 6 fichiers jamais affichés plus préchargés ;
   vignette Mollets 765 Ko → 34 Ko (**à valider à l'œil**).
7. **Diagnostic MET séparé** (`docs/DIAGNOSTIC-MET-2026-10-24.md`) : rien n'est modifié, tout est chiffré.

---

## 2. Anomalies → causes → corrections

| # | Ce qui n'allait pas (mesuré sur master) | Cause | Correction (branche) | Décision |
|---|---|---|---|---|
| **F21** | « Enregistrer » sans changement : calories recalculées au poids du jour (**97 → 112 kcal**) | un « Enregistrer » qui recalcule tout | même effort → calories et détail d'origine **gardés** ; effort changé → **rapport** après / avant appliqué aux calories d'origine | D-114 |
| **F02** | le même geste divisait le volume unilatéral par deux (**600 → 300**) | règle de volume recopiée sans l'unilatéral | « Enregistrer » lit `_workVol` | D-116 |
| **Q5** | séances déjà divisées depuis le 11/08 | — | **affichées justes** depuis leurs séries, **pas réécrites** | D-116 |
| **K1** | corriger la durée (60 → 90 min) gardait les calories de 60 min | la durée ne passait pas par les calories | calories mises à jour (≈ 440), à l'échelle de la séance | D-114 |
| **K2** | corriger la durée effaçait une charge tapée non enregistrée (120 → 100) | le détail se rouvrait depuis la séance stockée | durée enregistrée aussitôt, modification en cours gardée | D-115 |
| **F01 / F25** | calendrier « 0,8 t » pour 1 100 kg ; tendance de volume différente | copies de la règle | `_volTravail` lu partout (calendrier, tendance, carte, débrief, tableau de bord, Milo, CSV) | D-116 |
| **F03** | une ancienne série « W » comptait comme travail (3 séries de pecs au lieu de 2 ; Milo lisait 1,5/sem au lieu de 1) | « W » oublié dans `_volumeParMuscle` | « W » exclu partout comme « É » | — |
| **F07** | la couleur du calendrier ne suivait pas une série cochée de plus | clé de cache incomplète | la clé porte l'état des séries et les muscles cochés | — |
| **F06** | tuile « Séance » de Nutrition : 1ʳᵉ séance seulement (**350 au lieu de 600 kcal**) | `find` au lieu d'une somme | somme du jour, « 2 séances » ; rien ne déborde à 320 px | D-117 |
| **F23** | en-tête de l'export PDF : des jours comptés pour des séances | compte par date | « N séances sur J jours d'entraînement » | — |
| **F22** | « Walking » d'Apple Santé affiché « Elliptique » | table sans marche / course / natation | nommés à l'écran, **calculés comme « Autre »** (aucun barème inventé) ; un tapis importé reste « course », comme en `ft-v1260` (25/10, §12) | D-119 |
| **F19** | sans sommeil noté sur 3 jours : « Prêt à performer », invitation aux records | le score ne disait pas qu'il était estimé | « (estimé) », « Estimation sans sommeil », pas de records ; même consigne pour Milo | D-118 |
| **F08** | supprimer / baisser la séance d'un record le laissait en place | rien ne relisait le record | **aperçu** avant → après (outil existant), rien sans le geste, origine incertaine → rien | D-120 |
| **F04** | un secondaire de deux exercices passait « principal » (8 zones rouges au lieu de 6) | seuil « score ≥ 2 » | `prim` = moteur dans au moins un exercice ; « Secondaires … ×2 » | D-121 |
| **F05** | un perso coché mollets montrait des pectoraux (règle du nom avant le choix de la personne) | premier match gagnant | **affichage** : muscles cochés d'abord (`_mscScoresVus`) ; **calories : inchangées** (moteur gelé) | D-122 |
| **Profil** | « Repos défaut » **vide** pour 130 s (valeur d'installation absente de la liste) | une liste en dur dans `index.html` | une liste (`reposDefautChoix`), un écrivain (`choisirReposDefaut`) | D-126 |
| **Réglages** | aucun réglage depuis la séance | — | ⋯ → « **Repos par défaut** » (même valeur que le Profil) ; le réglage d'une séance reste distinct ; **pas de poids de barre** (retiré par toi en ft-v726) | D-126 |
| **F15** | 17 exercices : image de muscle **devinée** comme illustration | repli « muscle deviné » | « **Aucune illustration disponible** » aux 3 surfaces | D-124 |
| **Précache** | 6 fichiers jamais affichés préchargés (551 289 octets ; 386 881 à chaque version) | deux listes d'images | retirés du préchargement, fichiers gardés | D-125 |
| **Mollets** | 765 Ko pour une case de 88 × 51 (le fichier du lot vignettes, **sur cette branche**, jamais publié — absent de master) | fichier à la taille de la carte d'origine | 183 × 133, même cadrage, 33 747 octets | D-123 |
| **Aide pendant la séance** | — (vérifié) | — | l'aide se joint par **⋯ → « Aide de l'écran Séance »** (témoin C-REG-E1) | — |

---

## 3. Ce qui reste à décider (Michel) — et ce qui n'est PAS fait

| Sujet | Où en est-on | Ce que je propose |
|---|---|---|
| **F05 étendu aux calories** (R8) | **non appliqué** ; mesuré contre master : **0 écart sur les 322 exercices du catalogue** ; persos cochés au nom reconnu : **−6 à +4 kcal** par séance d'une heure (−4 % à +3 % ; −5 % à +3 % sur une séance de 20 min) ; ⚠️ un perso composé avec moins de 3 muscles cochés devient « isolation » (squat coché quadriceps seuls : 6,5 → 4,0) | **ne pas l'étendre maintenant** : le nombre de muscles cochés ne doit pas décider seul de la dépense — à trancher avec R6 (la règle des 3 muscles) |
| **Poids de la barre** | non remis : retiré avec le calculateur de plaques (ft-v726, ta décision), `S.barW` ne sert à aucun calcul | le laisser absent, sauf si tu veux qu'il serve à quelque chose (calculateur, échauffements) |
| **156 illustrations non préchargées** (15,3 Mo) | constat préexistant (`BUGS.md` §105) : absentes hors ligne tant qu'elles n'ont pas été vues une fois | à toi : précharger coûte 15 Mo de données mobiles à l'installation |
| **17 exercices sans illustration** | « Aucune illustration disponible » affiché ; aucune image attribuée | les produire puis te les faire valider une par une (liste au §8) |
| **21 noms sans tuile** (Avant-bras 5, Full Body 16) | trouvables par la recherche seulement | une tuile « Autres » sans nouvelle vignette — à valider (non faite) |
| **Vignette Mollets** (D-123) | appliquée sur la branche | **valider à l'œil** la comparaison avant / après jointe |
| **Recommandations MET R1 → R8** | simulées, chiffrées, **aucune appliquée** (moteur gelé : il faut ton GO distinct) | R1, R4, R5, R7 sont techniques, risque faible (R1 change les kcal des séances cochées en bloc : +60 % sur l'exemple) ; R2, R3, R6, R8 te reviennent |
| **Bande FORCE TRACKER sur l'Accueil seulement** (Q21) | **non construite** (mesuré par Claude Principal : 93 px sur les 6 onglets, elle porte le « ? ») | hors de cette mission, comme le propose Claude Principal ; pendant la séance, l'aide passe par ⋯ |
| **D-114 → D-126** | toutes **PROPOSÉES** (origine Claude, alternatives écrites) | les valider ou les corriger |

---

## 4. Les tests — avant (master) / après (branche)

**Banc de la mission** `tests/parcours/seance_chiffres.js` (blocs C-NUM, C-REC, C-MUS, C-REG, C-IMG), branché dans la passe
(`tests/parcours/runner.js`), lancé par `tools/banc_seance_chiffres.js` :

| Arbre | Résultat |
|---|---|
| **master** (`93dfbb75`, même application que `98c09ed9`) | **31 OK / 71 rouges** — les 31 verts sont des gardes de non-régression (« rien n'est réécrit », « le + ne bouge pas », « l'aide se joint par ⋯ », « un tapis importé coûte ce qu'il coûtait »…), verts par construction. *(30 / 72 le 24/10 : J4 est devenu une garde le 25/10, §12.)* |
| **branche** | **102 OK / 0 rouge** |

**Chaque correction et ses témoins** (§8.7, point 2) — rouges sur master, verts sur la branche ; à droite, les gardes vertes
des deux côtés (« rien n'est réécrit », « le + ne bouge pas », « aucune erreur de page ») :

| Correction | Rouges sur master → verts | Gardes (vertes partout) |
|---|---|---|
| F21 | C-NUM-A1, A2, A3, A6, A7 | A4, A5 |
| F02 · Q5 | C-NUM-B1, B2, B5, B6, B8 | B3, B4, B7, B9 |
| K1 · K2 | C-NUM-C1, C2, C3, C4, C5, C9, C11 | C6, C7, C8, C10 |
| F01 · F25 · export · Milo · tableau de bord | C-NUM-D1, D2, D3, D4, D5, D6, D8 | D7, D9 |
| F03 | C-NUM-E1, E2 | — |
| F07 | C-NUM-F1 | — |
| F06 | C-NUM-G1, G3 | G2 |
| F23 | C-NUM-H1 | — |
| F19 | C-NUM-I1, I2, I3, I4\*, I5 | — |
| F22 | C-NUM-J1, J3 | J2, J4 |
| F08 | C-REC-A1, B1, C1, E1 | A2, A3, D1, D2, F1, F2, G1 |
| F04 | C-MUS-A1\*, A2, A3\*, A4 | — |
| F05 (et son périmètre) | C-MUS-B1, B2, B3\*, B4\*, B5\*, C1, C2 | C3 |
| Repos par défaut (Profil + ⋯) | C-REG-A1, A2, B1, B2\*, B3, B4, B5, B9\*, C1\*, C2\*, C3, C4, D1, E2 | B6, B7, B8, D2, E1 |
| Images | C-IMG-A1, A2, A3, B1, C1 | A4, A5, A6 |

\* **10 de ces 71 rouges** ne montrent pas le défaut : ils échouent parce que la fonction ou le geste qu'ils conduisent
n'existe pas sur master (`_mscScoresVus`, le champ `sansSommeil`, la ligne « Repos par défaut » du ⋯). Pour eux, seule une
**mutation** prouve quelque chose — chacun a la sienne : C-MUS-A1 ← M41, M49 · A3 ← M42 · B3 ← M45, M46 · B4 ← M43 ·
**B5 ← M68** · **C-NUM-I4 ← M67** · **C-REG-B2 ← M69** · B9 ← M50 · C1 ← M53 · C2 ← M52. ⚠️ M67 → M69 ont été ajoutées **à la
clôture** : ces trois témoins n'étaient la cible d'aucune mutation, et **M68 a montré que B5 ne pouvait pas rougir** (sa
fixture était une isolation) — fixture corrigée (§5, `BUGS.md` §111), campagne complète rejouée (§4 bis).

**Contrôle négatif** `tools/mut_seance_chiffres.py` (**68 mutations** : M1 → M57 et M60 → M66 sur les lots 1 → 5, M67 → M69
ajoutées à la clôture, dont des **déguisées** et des **négatives**, plus « M00 = le code d'avant remis mot pour mot ») :
campagnes par lot toutes conformes après correction des témoins qui
manquaient (M1, M29, M36, M50 : un témoin ajouté chaque fois — §104 de `BUGS.md`) ; **campagne complète sur l'arbre
final : voir §4 bis**.

**Bancs voisins rejoués** sur l'arbre final (code de `35c058a0`, **25 bancs, tous en code 0** ; OK / rouges, sauf muscles,
calendrier et calendrier_milo : réussis / total) : fig_face_dos 77 / 0 · muscles 241 / 241 · progres_seances 80 / 0 · seance_recette 93 / 0 · calendrier 10 / 10 ·
calendrier_milo 25 / 25 · d091 8 / 0 · session_integrity 93 / 0 · debrief_provenance 24 / 0 · picker_vignettes 20 / 0 ·
travail_lot2 48 / 0 · seance_c1 29 / 0 · debrief_demande 62 / 0 · seance_c2 22 / 0 · seance_c3 35 / 0 ·
aides_audit 18 / 0 · seance_ux 69 / 0 · ux_d086 122 / 0 · motif_exercice 17 / 0 · notes_d087 70 / 0 ·
rir_superset 52 / 0 · seance_repos 61 / 0 · cc01_dropset 31 / 0 · seance_unicite 12 / 0 · seance_date 25 / 0.

**Calories — F05 et moteur** (outil hors passe, master contre branche, données fictives) : catalogue **322 noms, 0 MET
différent** ; 10 persos fictifs : **0 écart** (F05 n'atteint pas les calories). Tableau de l'écart SI F05 était étendu
(R8), remesuré sur l'arbre d'avant l'isolement (`b2a6280a`) : « Rowing Zorglub » (2 muscles cochés) 5,5 → 4,0, séance
d'une heure 137 → 133 kcal ; « Curl Spécial Zottman Maison » (3 cochés) 4,0 → 5,5, 133 → 137 ; « Développé Couché Maison »
(1 coché) 5,5 → 4,0, 137 → 133 ; « Squat Maison Sac De Sable » (1 coché) 6,5 → 4,0, 139 → 133 ; « Élévation Latérale Maison »
(3 cochés) 4,0 → 5,5, 133 → 137 ; persos au nom inconnu ou sans muscles cochés : inchangés.

**Ce que Milo reçoit (R34)** — `tools/r34_seance.js`, master contre branche, données égales, horloge gelée :
- séance normale (volume enregistré par la fin de séance, sommeil noté) : **contexte identique à l'octet** (77 327 car.) ;
- même séance **sans** volume enregistré (import) : master envoyait « **undefinedkg** vol total », la branche « 2920kg » ;
- unilatéral + série « W » + perso coché + **sans sommeil** : « Pectoraux 1,5 → **1** série/sem » (F03) · « Mollets 0,5 »
  ajouté (le perso coché, F05) · le volume de la séance (unilatéral × 2) · « 67/100 (Bon) » → « (Bon (estimé)) » et les deux
  lignes de conseil (F19).
👉 ⚠️ **Le banc de Milo avec appels réels (R34) n'a pas tourné** (pas de clé ici) : ces écarts sont *montrés*, pas *jugés*.

**Diagnostic MET** rejoué sur l'arbre final (`35c058a0`) : ses 13 scénarios donnent **exactement** les résultats de la
relecture précédente (`14153e66`), à l'octet ; celle-ci ne différait du brouillon que par la **date** affichée sur les cartes
d'AFFICHAGE (« ven. 23 oct. » → « sam. 24 oct. » : le banc date les séances de la veille et la relecture avait passé minuit,
heure de Paris) ; kg, durées et kcal identiques (`docs/DIAGNOSTIC-MET-2026-10-24.md`).

### 4 bis. Campagne complète sur l'arbre final

1. **Première campagne** (arbre `35c058a0`, 65 mutations) : **65 / 65 conformes**, en deux passages — le premier a été
   **coupé par la limite de temps des tâches de fond** (30 min) après **57** mutations jugées, toutes conformes ; le second a
   rejoué les 8 restantes (M15, M35, M44, M62 → M66) : **8 / 8**, arbre sain vert avant et après.
2. **Trois mutations ciblées ajoutées à la clôture** (M67 → M69), pour les trois témoins rouges sur master **par absence** qui
   n'avaient pas de mutation propre (I4, B5, B2) : M67 et M69 mordent ; **M68 ne mord pas** — C-MUS-B5 ne pouvait pas
   rougir (sa fixture était une isolation) → fixture corrigée (§5, `BUGS.md` §111).
3. **Campagne complète rejouée** sur `0f23b087` (fixture corrigée) : **68 / 68 conformes** — M00 (le code d'avant, 72 rouges)
   et 67 mutations, dont **18 déguisées**, **5 négatives** (une retouche sans effet ne doit **pas** rougir) et **1 équivalente**
   (M57, rien d'observable) ; arbre sain vert **avant et après** (banc stable), aucune mutation invalide ; **M68 fait
   maintenant rougir C-MUS-B5**.
4. **`tools/mut_picker_vignettes.py` entier : 25 / 25 conformes** (dont MV5, équivalente depuis le correctif de l'en-tête,
   comme attendu), arbre sain vert avant et après.

---

## 5. Témoins RÉÉCRITS ou RETIRÉS (§8.7, point 3)

**Retirés par la branche Séance : AUCUN.** ⚠️ **La « baisse de 130 témoins » annoncée ne vient pas de la branche Séance** :
la fusion de master du 24/10 (`ce45c79a`) reprend **à l'identique** le runner de master (vérifié nom par nom : 0 ajout, 0
retrait propres à la branche ; master avait retiré 243 témoins et en avait ajouté 113 depuis la base `d93cef0b`). Le retrait
est celui de **Nutrition V2, jalon 4** (`f5929540`), déclaré dans son message : *« le runner passe de 4164 à 4034… les neuf
blocs CCXCI · CCXCII · CCXCIII · CCXCIV · CCXCVI · CCXCVIII · CCXCIX · CCC · CCCI épinglaient `_provFood` et ses aides,
retirés au jalon 4 ; CCLXXXV ④ ⑤ ⑥ ⑪ ⑭ ⑮ éprouvaient la retouche de la définition d'une portion dans « Modifier », qui
n'existe plus »*.

**Réécrits par la branche Séance, chacun avec sa raison, chacun éprouvé par mutation :**

| Témoin | Avant | Après | Pourquoi | Rougit sous |
|---|---|---|---|---|
| `debrief_demande.js` — fixture de OD-12 | séries d'un total ≠ du marqueur 777 | séries qui font 777 (77 × 7 + 17 × 14) | le débrief lit maintenant le volume depuis les séries (D-116) : la fixture se contredisait | M00 |
| `session_integrity.js` F4 (`REF_PDF_SANS_F23`) | l'en-tête du PDF d'avant (le défaut F23) | « 4 séances sur 3 jours d'entraînement » | il épinglait le défaut | mutation de l'en-tête |
| `fig_face_dos.js` — l'oracle | « principal » = score ≥ 2 | moteurs lus dans la **fiche** | il recopiait la règle fausse que F04 corrige (B-FFD-⑥c rougissait) | M41, M42, M49 |
| `picker_vignettes.js` C-VIG-A3 | Mollets à 996 × 724 | 183 × 133 | la carte est réduite (D-123) | — (taille) |
| `picker_vignettes.js` C-VIG-A6 | garde « > 1 000 pixels orange » | garde « ≥ 5 % de l'image » | la garde dépendait de la taille du fichier | mutation « fond blanc » |
| `picker_vignettes.js` — empreinte Mollets | `59605168…` | `1495db12…` | nouveau fichier (D-123) | « un octet de plus » |
| `seance_chiffres.js` C-MUS-B3 (créé dans cette mission) | calories des muscles cochés (4,0) | calories de la règle du nom (5,5), figurine des muscles cochés | F05 isolé des calories (D-122) | M45, M46 |
| `seance_chiffres.js` C-MUS-B4 / B5 — la fixture (créée dans cette mission ; réécrite à la clôture) | 1ᵉʳ nom trouvé : « Croisé Poulie (Cable Crossover) », une isolation (4,0) | un composé dont le MET dépend des muscles : « Dips Triceps (Buste Droit) » (5,5) ; B5 exige en plus une fiche au-dessus de l'isolation | **B5 ne pouvait pas rougir** : un mollet coché seul reste une isolation (4,0 des deux côtés) — démasqué par la mutation ciblée M68 (`BUGS.md` §111) | M68 |
| `seance_chiffres.js` C-NUM-J4 (créé dans cette mission ; réécrit le 25/10) | « Treadmill » → barème « Tapis » | « Treadmill » reste « course », et ses calories en intensité forte = celles d'« Autre » (ft-v1260) | il exigeait un changement de calories fait sans décision (9,5 au lieu de 8,0) et contredisait D-119 et le témoin XXXII du runner | M31 (inversée) |
| `runner.js` XXXII « un type inconnu tombe sur « autre » » | — (**inchangé**) | — | c'est le **code** qui revient à master (`_typeCardioDepuisMontre` identique à l'octet) | RP1 |
| `runner.js` CCXXVI ter ② ③ — la fixture | `volume: 2560` pour **une** série de 80 × 8 (640 kg) | 4 séries de 80 × 8 = 2560 | depuis D-116 la carte lit les séries : la fixture se contredisait (comme OD-12) ; ⚠️ elle ne distingue plus « copie rangée » de « séries », exprès — C-NUM-B5 / B6 gardent ce point | RP2 |
| `runner.js` B-CCCVI ⑥ « la règle du VOLUME reste distincte de celle des records » | le **texte** de l'ancienne boucle de `saveSessEdits` | l'**invariant** : volume par `_workVol` (sans recopie), `_workVol` sans `_serieFaitFoiPourPR` et avec sa propre règle | il épinglait l'implémentation que D-116 a remplacée | RP3a (numériquement neutre), RP3b |

---

## 6. Fichiers touchés hors du couloir Séance (§8.3), et pourquoi

| Fichier | Quoi | Pourquoi / risque |
|---|---|---|
| `screens.js` — `renderNutrition` | **seulement la tuile « Séance »** (F06) | attribuée à Séance par le §8.3 |
| `index.html` — section Nutrition | l'étiquette de la tuile (`#nu-session-lbl`) | F06 ; une ligne |
| `coach.js` — `buildCoachContext` (carrefour) | lecteurs de volume (`_volTravail`), consigne F19 | **R34** : écarts montrés au §4 |
| `state.js` | `_volumeParMoitie` lit `_volTravail` (3 lignes) | ni `persist` ni `load` touchés |
| `dashboard.js` | lecteurs de volume, figurine (`_mscScoresVus`) | même règle que l'app |
| `setup.js` — Profil | sélecteur « Repos défaut » (liste commune, écrivain unique) | hors de la restauration (Nutrition) |
| `constants.js` | `NEW_FEATURES` : `repos-defaut-seance`, **dans le bloc Séance**, pas en tête | — |
| `app.js` | la diapo du Guide « Ton repos est un MAXIMUM » (une phrase) | le moteur MET n'est **pas** touché |

---

## 6 bis. Règle d'or #11 — prévenir l'utilisateur

- **« Repos par défaut » dans ⋯** (seule nouveauté visible) : point rouge `repos-defaut-seance` (bloc Séance de
  `NEW_FEATURES`), aide « ? » de l'écran Séance, aide détaillée (`coach.js`), diapo du Guide « Ton repos est un MAXIMUM »
  (`app.js`) — témoin C-REG-E2.
- **« Aucune illustration disponible »** : dit dans l'aide « ? » de l'écran Séance.
- **Pop-up « Quoi de neuf » v82 : NON utilisée**, ce n'est pas mérité : personne n'a de geste à faire, aucun repère ne bouge
  (le Profil garde son réglage ; ⋯ gagne une ligne) ; le reste sont des correctifs (« pas de pop-up pour un correctif »,
  décision du 28/07). Le numéro v82 reste libre.

---

## 7. Preuves : aucune séance ancienne réécrite, moteur MET inchangé

- **Séances** : C-NUM-B7 (une séance divisée n'est pas réécrite), C-NUM-D7, C-REG-B7 (`ft4_sessions` identique à l'octet
  après un réglage), C-NUM-C7 (« Annuler » ou une durée impossible ne change rien). Seule la séance que la personne enregistre
  elle-même change.
- **Moteur** : `git diff origin/master -- app.js` ne contient que la diapo du Guide et la reprise du repos au démarrage
  (SEANCE-REPOS-01) ; `CARDIO_MET`, `calcCardioKcal`, `calcCardioKcalTotal`, `_MET_REGIONS`, `getExerciseMET`,
  `calcSessionCalories`, `_movPattern` **inchangés** ; **`_mscScores` identique à l'octet à master** (témoin de périmètre
  C-MUS-C1 : 4 appelants exactement). Calories remesurées : 0 écart (§4).

---

## 8. Recettes iPhone à faire par Michel (sur le clone, après intégration — Q22)

**Repos (D-102, à ne pas refaire, seulement vérifier)** — une séance, une série cochée, un repos de 2:00 :

1. app ouverte jusqu'à la fin du repos, puis 1 min de plus : « +1:00 » en doré, « au-delà de ton repos max » ;
2. verrouiller le téléphone 1 min, 3 min, 5 min, puis revenir : le chrono est **à l'heure réelle** ;
3. fermer l'app (balayer) et rouvrir après 1, 3 et 5 min : le repos revient à l'heure réelle ;
4. revenir **14 min** après la fin théorique : encore là (+14:00) ; **17 min** après : plus de repos ;
5. hors ligne (mode avion) pendant le repos, puis rouvrir : idem ;
6. supprimer l'exercice pendant un repos, puis « Terminer » : la séance s'enregistre sans repos fantôme ;
7. ⛔ **aucune sonnerie n'est promise quand l'app est fermée** (une PWA iOS ne le peut pas).

**Nouveautés et corrections de cette mission** :

8. ⋯ → « Repos par défaut » : choisir 1:30, puis Profil → « Repos défaut » dit 90 s ; et l'inverse ;
9. Profil sans réglage : « Repos défaut » affiche **130 s** (plus une case vide) ;
10. une séance passée : « Enregistrer » sans rien changer → calories et volume identiques ; corriger la durée → calories
    mises à jour, la charge tapée reste ;
11. supprimer la séance d'un record → l'aperçu « avant → après » ; « Garder » ne change rien ;
12. figurine d'une séance « Développé Couché + Développé Incliné » (le triceps y est secondaire deux fois) : triceps **orange**
    (sollicité), pas rouge ; avec des Dips (triceps moteur), il redevient rouge ;
13. un exercice perso coché mollets : la figurine montre les mollets ;
14. un exercice sans illustration (ex. « Curl EZ ») : « Aucune illustration disponible » sur la vignette et dans la démonstration ;
15. « Choisir un exercice » → tuile Mollets : la vignette est nette à la taille de la case ;
16. Nutrition un jour à deux séances : « 2 séances » et la somme ;
17. Accueil sans sommeil noté depuis 3 jours : « Estimation sans sommeil », « (estimé) ».

**Les 17 exercices sans illustration** : Arraché Haltère (Dumbbell Snatch) · Curl EZ · Curl Poignet Barre · Extension Poignet
Barre · Fentes Arrière · Fentes Latérales · Hyperextension Lestée · Kickback Machine · Planche de Préhension · Pronation
Supination Haltère · Rotation Machine Obliques · Thrusters Haltères · Tirage Cable Fessiers (Cable Pull Through) · Tirage Nuque
· Triceps Corde Poulie · Élévations Frontales Machine · Élévations Mollets Unilatéral.

---

## 9. Risques d'intégration

- **Simulation mesurée** (`git merge-tree`, rien d'écrit, 24/10 vers 23 h 25 UTC) : cette branche contre
  `claude/nutrition-v2` @ `beda2652` (livrée par Claude Nutrition) → **aucun conflit de code** ; `app.js`, `coach.js`,
  `constants.js`, `index.html`, `screens.js`, `setup.js`, `state.js`, `tests/parcours/runner.js` et
  `tests/recette/registre.json` se fusionnent seuls. **5 conflits de documentation**, mécaniques : `BUGS.md` et
  `docs/DECISIONS.md` (deux ajouts en fin de fichier, numéros réservés distincts), `docs/CONTEXTE-ACTUEL.md`,
  `docs/JOURNAL-DE-PARTAGE.md` (garder les deux lignes), `DOSSIER-ATHLETE-SUIVI.md` (à **régénérer**, voir ci-dessous).
  ⚠️ Une fusion sans conflit n'est pas une preuve : les bancs des deux couloirs se rejouent sur l'arbre intégré.
- **Zones partagées à relire après la fusion** : `constants.js` (`NEW_FEATURES`), `screens.js` (`renderNutrition`, tuile
  Séance), `index.html`, `coach.js` (aides et `buildCoachContext`), `state.js` (Nutrition y modifie 52 lignes, Séance 3 dans
  `_volumeParMoitie`), `setup.js` (Nutrition : restauration ; Séance : sélecteur du Profil).
- **La branche porte aussi les lots déjà qualifiés** (SEANCE-REPOS-01 et son avenant, les 8 vignettes, `CHANTIER` §3) :
  leurs bancs `seance_repos` et `picker_vignettes` sont rejoués dans les voisins ci-dessus ; le témoin Nutrition `B-NP01-A`
  réécrit pour le repos persistant reste **à relire par Claude Nutrition** (`CHANTIER` §8.2).
- **Fichier généré** : `DOSSIER-ATHLETE-SUIVI.md` (tableau des briques, `tools/briques.py`) — la « porte » du Registre compte
  les usages de `_cloudSync` : **à régénérer** après la fusion, ne pas résoudre à la main.
- **Le prompt de Milo** change à données égales dans 3 cas (§4) : à juger au banc R34 quand une clé sera disponible.
- **`B-TRV`** (Claude Principal) : ses rouges « Séance » sur master devraient tomber avec cette branche ; à rejouer.
- **Nutrition V2** n'a touché ni `_workVol` ni `calcSessionCalories` à ma connaissance (à vérifier sur l'arbre intégré).

---

## 10. Règle d'or #17 — les 4 compteurs (code applicatif, depuis le début de la mission `5a7b0a57`)

| Compteur | Valeur |
|---|---|
| données persistées ajoutées | **0** (aucune clé ; le repos par défaut garde `ft4_rest`) |
| fichiers applicatifs touchés | **13** (`log.js`, `setup.js`, `screens.js`, `tracking.js`, `coach.js`, `dashboard.js`, `state.js`, `constants.js`, `app.js`, `index.html`, `style.css`, `sw.js`, `muscles/vignettes/08_mollets.png`) |
| lignes ajoutées − retirées | **+448 − 150** (commentaires compris ; +447 − 151 le 24/10, avant le retour au « course » du tapis importé) |
| anciens chemins supprimés / fusionnés | **9** : 6 recopies de la règle de volume → `_volTravail` / `_workVol` · le calcul de fin de séance et celui de l'édition → `_calDataSeance` · la liste du Profil en dur → `reposDefautChoix` · l'icône haltère en double → `_ICO_HALTERE` |

---

## 11. Commits de la mission (branche `claude/dreamy-bell-pu88ia`)

`5a7b0a57` ligne de journal · `a6e9e430` / `84ac1a81` lot 1 · `cff47f0d` / `81468296` lot 2 · `101bd21c` / `d67cf279` /
`b2a6280a` / `64d0d709` lot 3 (dont F05 isolé des calories) · `399c4c31` lot 4 · `14153e66` lot 5 · `54065ea3` diagnostic
MET + règle #11 · `58828924` décisions et BUGS · `35c058a0` fusion de master · (`3251c2ad`, `21d71bf8` : tableau des briques
régénéré) · `d403c862` passation · `cfcb45e3` campagne et M67 → M69 · `0f23b087` témoin C-MUS-B5 réécrit · la
clôture (documentation) · **25/10** : `8ff18b31` fusion de master (`93dfbb75`) · `093a42e7` retour de Claude Principal
(§12). **Code applicatif** : inchangé depuis `35c058a0`, sauf `_typeCardioDepuisMontre` (setup.js), revenu identique à
master le 25/10.

---

## 12. Retour de Claude Principal (25/10) — les 4 rouges de la passe sur l'arbre intégré

La passe répartie sur `claude/integration-nut-seance` a trouvé **4 rouges côté Séance**, que mes 25 bancs voisins ne
pouvaient pas voir : ils vivent dans le grand runner (`tests/parcours/runner.js`). Traités sur cette branche, master non
touché.

| # | Rouge | Cause | Ce qui est fait | Preuve |
|---|---|---|---|---|
| ① | XXXII « un type inconnu tombe sur « autre » » : « Treadmill Running » donnait « tapis » | le lot 2 (`cff47f0d`) envoyait un tapis importé sur le barème « Tapis » : 9,5 au lieu de 8,0 MET en intensité forte — **des calories changées sans décision**, contre D-119 | retour au comportement de `ft-v1260` (`_typeCardioDepuisMontre` **identique à l'octet** à master) ; D-119 précisée ; J4 réécrit sur l'invariant de calories. Le barème « Tapis » pour un tapis importé devient une **alternative pour Michel** | XXXII vert ; J4 vert sur la branche **et** sur master ; RP1 ; M31 inversée |
| ② | CCXXVI ter ② ③ (cartes de l'historique) | fixture `volume: 2560` pour une série de 640 kg ; depuis D-116 la carte lit les séries | fixture cohérente : 4 × 80 × 8 = 2560 (comme OD-12) | verts ; RP2 |
| ③ | B-CCCVI ⑥ (témoin de source) | il exigeait le texte de l'ancienne boucle de `saveSessEdits` | réécrit sur l'invariant : volume par `_workVol`, records par `_serieFaitFoiPourPR`, deux règles distinctes | vert ; RP3a (numériquement neutre : seul un témoin de source la voit), RP3b |
| ④ | le contexte de Milo (R34) : 3 lignes changent à données égales | — | **non touché — décision de Michel** : exception écrite à R34 (corrections de faits, réversibles), ou texte d'avant pour Milo jusqu'au banc réel | — |

**Contrôles du 25/10** : passe réduite aux blocs XXXII + CCXXVI ter + B-CCCVI (`tools/passe_reduite.js`, réseau isolé) :
**292 témoins, 0 rouge** ; contrôle négatif `tools/mut_seance_runner.py` (nouveau, le moteur de `mut_temoins_v2.py`
importé, pas recopié) : **5 / 5** (dont 1 négative) ; banc de la mission : branche **102 / 0**, master **31 / 71** ;
mutations du banc touchées par ① rejouées (`M00`, `M30` → `M32`) : **4 / 4**, arbre sain vert avant et après (M31 inversée
rougit J4 ; M00, le code d'avant, rougit 71 témoins au lieu de 72 : J4 est devenu une garde).
⚠️ **La leçon** (`BUGS.md` §112) : mon témoin J4 disait le contraire d'un témoin du runner (XXXII), et aucun de mes bancs
voisins ne le jouait. *Deux témoins qui portent la même règle en sens contraires : un seul peut être vert.*
