# 📍 Contexte actuel — Force Tracker

> **Le PREMIER document à lire avant toute nouvelle tâche.** Une page maximum.
> Il donne l'état du projet en un coup d'œil, sans relire tout le reste.
> ⚠️ À tenir à jour EN TEMPS RÉEL (règle d'or #12).

---

- **Version en ligne (live) :** `ft-v894` — c'est ce que `master` porte, donc ce que les gens ont.
- **Sur la branche `claude/claude-md-docs-ytabnv`, PAS ENCORE DÉPLOYÉ :** `ft-v895`, `ft-v896` et `ft-v897`.
  ⚠️ Le déploiement Pages ne se déclenche que sur `master` : tant que la branche n'est pas fusionnée,
  ces deux versions n'existent que dans le dépôt (R18 — « j'ai poussé » ≠ « c'est en ligne »). Déploiement Pages via GitHub Actions (`.github/workflows/deploy-pages.yml`) — fiable + relançable à la main.

> ## 📍 OÙ ON EN EST — 17/08/2026 au soir (à lire en premier)
>
> **Journée d'AUDIT, pas de développement.** Quatre allers-retours avec une autre instance de Claude
> et avec GPT sur l'export complet de Michel. **Tout est écrit** dans `docs/AUDIT-CONTEXTE-MILO.md`
> (nouveau) et `docs/CALORIES-SOURCES.md` **§17**. Michel a posé le cadre lui-même :
> *« on creuse tellement, j'espère qu'on va pas se perdre »* → on écrit d'abord, on répare ensuite.
>
> ### ⛔ CE QU'IL NE FAUT PAS FAIRE MAINTENANT
> **Ne pas retoucher le modèle physiologique des calories pour obtenir un meilleur chiffre.**
> Les deux auditeurs extérieurs et ce dossier sont d'accord : *d'abord une chaîne de calcul
> cohérente et rejouable, l'audit MET reprendra sur une base saine.*
>
> ### ✅ RÉGLÉ EN ft-v895 (soirée du 17/08)
> · **Le détail par exercice écrasait au lieu d'additionner** — un même exercice fait deux fois dans
>   une séance perdait les calories de la 1ʳᵉ occurrence. **C'était la cause des 2 seules séances
>   (28/06, 07/07) dont le résidu résistait**, et les 4 autres « détails incomplets » signalés par
>   l'audit n'étaient **pas des bugs** (aucune série validée = rien à compter). 6 signalés = 2 vrais.
> · **`engineVersion` posé sur chaque nouvelle séance** (`CAL_ENGINE = 3`).
> · **La boîte de la montre écrivait dans la clé du profil santé** (`ft4_health`) — donc elle ne
>   survivait à **aucune** sauvegarde : ft-v880 ne pouvait pas marcher. Clé propre `ft4_healthbox`.
> · **L'export embarquait 146 160 car. d'images pour 3 photos** (31 % du fichier).
> · **La fixture des tests a enfin des profils avec blessure** (bloc XLIV).
>
> ### ⏭️ CE QUI RESTE SUR LES CALORIES — un seul point
> Le **`breakdown` des 29 séances recalées** n'a pas suivi le `total` (état `total` v2 /
> `breakdown` v1). Les séances **nouvelles** sont désormais cohérentes ; c'est l'**historique migré**
> qui reste dans un état mixte. ⚠️ Le corriger veut dire **recalculer des séances déjà enregistrées** :
> c'est exactement le geste qui a déclenché quatre audits. À faire **explicitement**, marqué, et
> réversible — ou pas du tout.
>
> ### ✅ CE QUI EST RÉGLÉ ET NE DOIT PAS ÊTRE ROUVERT
> · Le **« forfait de 50 kcal »** n'existe pas : c'est `warmupCals = 3.5 × poids × warmupMin/60`
>   (`app.js:677`), volontairement hors `breakdown`. **30 séances sur 32 s'expliquent à ±2,3 kcal.**
>   Le contrat est `total = Σbreakdown + cardio + warmup`, et la séance du **15/08** le prouve
>   (`warmupMin = 0` ce jour-là → égalité juste à 1 kcal près).
> · Le **« +38 % cardio »** est **+6 %** (comparaison brut/net) · **CAL-012** est sans objet ·
>   le **« forfait de 156 kcal »** était un artefact · la migration ×1,55 est **explicite, marquée
>   (`calSource`) et réversible (`caloriesAvant`)**.
>
> ### ✅ CHANTIER ① FAIT en ft-v896 — le bloc personnel est réordonné
> Les blocs mutables sont descendus et classés par mutabilité **croissante** (POIDS → CHECK-IN →
> DERNIÈRES SÉANCES → SÉANCE EN COURS). Mesuré avec le nouvel outil `node tools/cache-coupure.js` :
> **valider une série 15 253 → 20 caractères réécrits**, **noter une pesée 12 995 → 2 329**.
> Rien n'a changé dans le texte envoyé à Milo (258 lignes des deux côtés), sauf **un renvoi de
> position qui était FAUX** (« sa MÉMOIRE LONGUE plus bas » — elle est 6 266 car. plus HAUT) :
> le bloc est désormais **nommé** au lieu d'être pointé par une direction.
> ⚠️ **Ce qui n'est pas prouvé** : `tests/milo` est déterministe — il dit que rien ne manque, pas
> que le modèle réagit pareil. L'ordre n'est pas neutre pour un modèle ; seul un A/B le dirait.
> ⏭️ **Reste** : battre un record réécrit toujours 16 130 car. (RECORDS est haut dans le bloc) —
> non touché **exprès**, c'est rare (quelques fois par mois contre 30-40 séries par séance).
>
> ### 🧠 LE CHANTIER SUIVANT — scinder le Gardien (② ci-dessous)
> Tout est dans **`docs/AUDIT-CONTEXTE-MILO.md`**. Mesuré : **~97 000 caractères par message**,
> identiques quelle que soit la question (voulu, R30).
>
> **⚠️ CE QUI RESTE À FAIRE :**
>
> **✅ ② OPTION 1 LIVRÉE en ft-v897** — la note du jour est descendue, empreintes **9/16 → 5/16**.
> La règle et les zones nommées n'ont pas bougé (R11). ⏭️ **L'option 2 reste ouverte** (5 → 2), et
> c'est elle qui déplacerait les zones loin de la règle — décision de sécurité, non prise.
>
> **② (contexte de la mesure du 17/08)**
> La mesure a trouvé un étage de plus que l'audit (`docs/AUDIT-CONTEXTE-MILO.md` **§12**) : le bloc
> contient une **note sur la séance DU JOUR**, donc pour quelqu'un de blessé l'empreinte change
> **pendant** la séance — **46 741 car. du bloc commun refacturés** dès qu'un exercice sollicitant la
> zone entre ou sort. Deux correctifs possibles : ① sortir la note du jour du bloc de tête (peu
> risqué, gain énorme, la règle ET les zones restent en tête) · ② scinder pour de bon.
> ⛔ **Rien livré exprès** : les deux changent un comportement de SÉCURITÉ, et `tests/milo` est
> déterministe — il prouve la PRÉSENCE, pas la protection. État figé par le témoin XLVI.
>
> **② (description d'origine de l'audit)** (§3) — le bloc « commun » n'est commun que pour les gens **sans blessure**
> (8 profils = **7 entrées de cache**). L'auditeur extérieur a montré que mon « pas de correctif
> évident » était faux : le bloc contient **1 234 car. génériques** (la priorité, le principe) et
> **1 578 car. personnels** (les zones nommées). Descendre **la donnée** et garder **la règle** en
> tête respecte R11 et ramène 8 profils à **1 seule empreinte**.
>
> **③ FIXTURE `tests/parcours`** — ✅ **FAIT en ft-v895** (bloc XLIV : 3 profils de santé).
>
> **✅ CE QUI EST VÉRIFIÉ ET NE DOIT PAS ÊTRE ROUVERT** : aucun autre chemin IA ne tourne sans cache
> (les 10 autres appels du Worker traitent une image ou un PDF **différent** à chaque fois — un cache
> y coûterait 1,25× pour zéro lecture) · et **le cache RAPPORTE depuis le 08/08** (ratio 1,14 : 1,
> gain 11 %). La « perte » mesurée par l'audit extérieur est le coût des deux semaines de
> construction, pas celui du service.
>
> ### 🔒 EN ATTENTE D'UNE DÉCISION DE MICHEL
> **Sécurité — Option 1** (secret d'appareil + récupération par e-mail). Il l'avait choisie, puis :
> *« avant de le faire j'ai fait une petite trouvaille pas top lol donc mets-toi en attente »*.
> C'est le seul chantier de la file **sans filet de tests**.

> ## 🔥 CHANTIER — LES CALORIES : l'état du 10-11/08 (⚠️ largement DÉPASSÉ, voir le bloc du 17/08 ci-dessus)
>
> **Michel a relevé le niveau d'exigence** : *« si on veut que l'application soit sérieuse, il faut
> des données sérieuses et scientifiquement prouvé ET prouvable »*. Contexte : *« moi je ne
> l'utilise pas mais Tatiana est à fond dedans, et si l'appli va à des coachs faut qu'on soit
> sérieux »*. Dossier sourcé : `docs/CALORIES-SOURCES.md` · contre-expertise GPT annotée :
> `docs/CALORIES-SYNTHESE-GPT.md`.
>
> **✅ FAIT (ft-v833)** — le **métabolisme de base** tient compte de la masse maigre
> (Katch-McArdle), avec refus explicite si le bilan est vieux ou si le poids a dérivé. C'était le
> plus gros poste (60-70 % de la dépense) et le seul qu'on pouvait resserrer sans matériel.
>
> **⏭️ CARDIO — CREUSÉ le 11/08, chiffres dans `docs/CALORIES-SOURCES.md` §12. Rien n'est encore
> modifié dans le code.** Ce qui est établi :
> · la **formule** du cardio est juste (`MET × poids × durée`) — le défaut est dans le **choix du
>   MET** : l'étiquette « modéré » couvre de la marche rapide (4,1 MET) à la course à 10 km/h
>   (10,5 MET), donc elle est **jusqu'à ×1,9 trop basse** face à l'ACSM ;
> · **🐛 BUG NET** : l'échauffement est compté **deux fois** — un forfait de 10 min (49 kcal) ajouté
>   sans condition, **plus** le cardio d'échauffement réellement noté. 126 kcal pour 10 minutes ;
> · **🐛** la durée de la partie muscu est **reconstruite** (24 min pour une séance qui en prend 50)
>   alors que `sess.duration` la mesure ;
> · **❓ il manque 4 nombres à Michel** pour refermer le cas « 57 kcal » : durée saisie · type ·
>   intensité choisie · ce qu'affichait le tapis (vitesse/pente/distance).
>
> **⚠️ CORRIGÉ le 12/08** : j'avais écrit que la durée de la muscu était « reconstruite à 24 min
> pour une séance qui en prend 50 ». **C'était une supposition** — le rythme MESURÉ de Michel
> (3,0 min/série, ft-v826) donne 21 min. La durée est correcte à ±20 %. **Le vrai écart est le
> RYTHME** : Force Tracker tourne à 4,15-4,50 kcal/min, soit très exactement la catégorie la plus
> LÉGÈRE des barèmes (« repos longs »), quand les séances de Michel relèvent de l'« hypertrophie
> classique » (7,44 kcal/min à 85 kg). Écart réel ≈ **1,7×**, pas 3,4×.
>
> **Nouvelle source au dossier** (apportée par Michel, relue par GPT, `CALORIES-SOURCES.md` §13) :
> 4 niveaux en kcal/min — 4 / 7 / 10 / 14 à 80 kg. **Statut : méthode en compétition, pas
> référence** (la formule qui produit ces 4 chiffres n'est pas publiée). ⭐ **Son idée forte** :
> elle classe la **SÉANCE**, pas l'exercice — l'inverse de ce que fait Force Tracker, qui est
> précis sur ce qui compte peu (quel exercice) et muet sur ce qui compte beaucoup (la **densité**).
> ⭐⭐ Et la densité règle l'objection de Michel (« si on n'arrête pas la séance, les calories
> montent ») : un repos rallongé **fait baisser** la densité, donc le total se tasse au lieu de
> s'envoler. **1ᵉʳ geste de code du chantier, avant tout choix de barème : horodater chaque série
> validée** (`doneAt`) — sinon un « Terminer » oublié fausse tout, et aucune des 3 approches n'est
> mesurable.
>
> **Direction validée (GPT + mesures)** : *les paramètres physiques de la modalité d'abord*
> (vitesse/pente → équations ACSM ; watts pour le vélo), l'étiquette d'intensité en **repli assumé**,
> et la FC **seulement** si les 10 séances montrent qu'elle apporte quelque chose.
>
> **Ensuite** : durée réelle mesurée + classification MET pour la musculation (le modèle actuel
> reconstruit les temps et invente 10 min d'échauffement), et l'affichage en **fourchette** au lieu
> d'un nombre unique. ⚠️ Point de GPT à traiter : `MET × poids × durée` contient déjà le
> métabolisme de repos — l'ajouter au TDEE le compte **deux fois**.

> ## 🔀 LIVRÉ CETTE NUIT — les exercices unilatéraux (ft-v832, 11/08)
>
> Les 48 exercices tranchés un par un avec Michel sont **dans le code**. Le critère est de lui :
> *« met uni vu que ça doit être fait de l'autre côté aussi »*. On saisit **3 séries, pas 6**, le
> tonnage double tout seul, et la charge obéit à **une seule phrase** pour les 355 exercices :
> **« on note le poids qui BOUGE pendant la répétition »**.
>
> **⚠️ CE QU'IL FAUT SAVOIR EN REPRENANT** : l'**historique d'avant n'est pas corrigé** (marqueur
> `sess.uniConv`) — le curl de Michel noté 60 kg (2 × 30) deviendrait **quadruple** en volume s'il
> était recalculé. Il a dit *« laisse pour l'instant »*. Toute correction future doit être une
> **migration explicite**, jamais un changement de `_workVol`.
>
> **⏭️ À vérifier à sa prochaine séance** : que la pastille 🔀 s'affiche bien sur ses exercices, et
> qu'il pense à noter **28** et non 56 sur le rowing haltère (la pop-up v56 le lui dit).

> ## 💡 IDÉE GARDÉE — « le dessin pour les muscles, la photo pour le geste » (09/08)
>
> Michel envoie une **photo** de Kickback poulie (vraie personne, fond noir, 2 poses) et propose :
> *« sinon on met les 2, l'image fixe et l'animé qui est classe »*. **L'idée est bonne et elle est
> pédagogique** : le **dessin** dit QUELS muscles travaillent (le rouge), la **photo** dit COMMENT
> on fait le geste. Ce ne sont pas deux fois la même information.
>
> **Pourquoi ce n'est pas fait** : les 304 figurines sont des dessins sur fond BLANC ; une photo sur
> fond noir serait la seule de son espèce et se verrait immédiatement (**règle d'or #7** — garder
> l'identité « figurines muscles »). Ce n'est donc pas une décision « Kickback », c'est une décision
> **catalogue** : soit une, soit toutes. Et une photo pèse ~2× une figurine (médiane 96 Ko).
>
> **Le seuil pour rouvrir le sujet** : une vingtaine de photos du même style, sur les mouvements où
> la technique compte. En dessous, ça fait une exception ; au-dessus, ça devient un vrai parti pris.
> La photo animée existe déjà (montée le 09/08 pour montrer le rendu, non intégrée).

> ## 📌 EN ATTENTE DE MICHEL — posé le 08/08 (il était au sport : *« montre-moi plus tard »*)
>
> **① La page « ce qui existe / ce qui manque, par muscle ».** Née de sa question — *« tu peux pas
> classer chaque exercice dans un sous-dossier ? »*. **Réponse donnée : les sous-dossiers, non** —
> le groupe musculaire est **déjà** dans `EXLIB`, un dossier le redirait une 2ᵉ fois (**R2**), le
> Squat appartient à Jambes **ET** Fessiers (le dossier force un choix que la donnée n'a pas), et
> déplacer 296 fichiers = réécrire 294 chemins, dont une faute de frappe ne lèverait **aucune
> erreur**. **Mais le besoin est réel** : voir d'un coup d'œil quoi chercher avant de m'envoyer une
> archive. L'info EXISTE déjà (`python3 tools/images.py etat` : **41 sans image**, dont 7 Fessiers,
> 7 Biceps, 5 Abdominaux) — mais elle est **enfermée dans un outil que Michel ne peut pas lancer**.
> ✅ **FAIT le 08/08** — `docs/FIGURINES.html`, générée par `python3 tools/images.py page` :
> https://michdu75-commits.github.io/forcetracker/docs/FIGURINES.html
> Groupes les plus démunis en premier, filtre « ne montrer que ce qui manque » actif par défaut,
> bouton « copier la liste ». **Générée depuis le code** (EXLIB + EX_YT) — à relancer après chaque
> ajout d'images, sinon elle ment. Ne touche pas l'app.
>
> **② Les 8 fichiers image inutilisés (~700 Ko)** — mesurés le 08/08, décision non prise :
> `front-squat-avec-halteres`, `montees-banc-lateral-halteres`, `shrug-machine-mollets`,
> `triceps-haltere-un-bras` (dans `exercises/`) + `press-jambes-1/3/4/5` (dans `machine/`).
> **Aucun chemin cassé en revanche** : les 294 pointent tous vers un fichier existant.
>
> **③ Deux images en attente d'arbitrage** (depuis ft-v798) : `Crunch Oblique` (seule image
> disponible = flexion latérale sur banc à 45°) et `Relevé de Buste (Sit-up)` (seul candidat =
> sit-up **décliné**). Plus **~35 fichiers d'archive** ne correspondant à aucun exercice du
> catalogue (Dead Bug, V-ups, Pallof Press, Swiss Ball, TRX…) → décision **produit**.

> ## ✅ 09/08 — LE BLOC PERSONNEL PASSE EN 1 H AUSSI (ft-v815)
>
> **Michel a inventé la bonne mesure** : exporter la console Anthropic **avant** et **après** une
> conversation — la différence EST son coût. Le total mensuel, lui, était inexploitable (**78 %**
> venaient de nos essais des 3-5 août).
>
> **Ses 3 tests** : une conversation coûte **0,12 à 0,17 $**, et la répartition est constante —
> **écriture du cache 5 min : 42-47 %**, texte jamais caché 33 %, réponse de Milo 17 %, lectures 8 %,
> **écriture 1 h : 0 %**. Le bloc commun (passé en 1 h le 08/08) n'a été réécrit **aucune fois**.
>
> **⏭️ À MESURER MAINTENANT** : refaire un export avant/après. L'écriture 5 min doit s'effondrer.
> Attendu ≈ **0,08 $** au lieu de 0,15 $. Rollback : retirer `, ttl: '1h'` de `_TTL_PERSO` (worker.js).

> ## ⏳ EXPÉRIENCE EN COURS — verdict attendu le **11/08/2026**
>
> **Lancée le 08/08 (ft-v796), à la décision de Michel.** Le bloc **commun** du prompt de Milo est
> passé en cache **1 heure** ; le bloc **personnel** reste en **5 minutes**. Rien ne change pour
> l'utilisateur — **seule la facture bouge**.
>
> **⚠️ C'est un PARI** : écrire en 1 h coûte **2×** le tarif d'entrée contre **1,25×** en 5 min.
> Il n'est gagné que si le bloc est **relu ≥ 2 fois par écriture** (seuil : `2 + 0,1N < N + 1` → N > 1,11).
>
> **🎯 COMMENT TRANCHER** — demander à Michel l'export de la console Anthropic (Usage → Tokens, CSV),
> puis comparer sur les jours du 08 au 11 :
> | | |
> |---|---|
> | `usage_input_tokens_cache_read` ≥ **1,11 ×** `usage_input_tokens_cache_write_1h` | ✅ **gagné, on garde** |
> | en dessous | ❌ retirer `, ttl: '1h'` dans `worker.js` (une ligne, sans effet sur les réponses) |
>
> **📌 Contexte utile pour lire les chiffres** : la mesure du 1ᵉʳ au 6 août (0,08 lecture par écriture)
> décrivait la fenêtre de **5 minutes** — elle ne dit rien de celle d'une heure. Elle était en plus
> **polluée** par le laboratoire de personas (Profil → Admin), qui écrit à chaque appui un cache jamais
> relu. Le compteur d'appels IA (ft-v793) sépare désormais les essais de l'usage réel : Profil → Admin → 🩺.
>
> **Repères mesurés le 08/08** (utiles pour tout calcul de coût) : prompt **59 356 car.** pour un
> utilisateur normal (bloc commun **37 237** · perso **~4 600** · jamais cachable **17 527**, dont
> **9 514** de catalogue d'exercices) · **~10,2 centimes** le message aujourd'hui, **~3,7** si le cache
> est relu · un abonné à 6,99 € est rentable jusqu'à **2,4 messages/jour** (6,5 avec le cache).
> Détail complet et briefing pour audit externe : **`docs/BRIEFING-GPT-COUT-IA.md`**.

> 🌙 **AUDIT NOCTURNE du 29-30/07 (demandé par Michel) : TOUT l'ancien code vérifié** — 2 nouvelles familles permanentes (`tests/calculs/` 79/79 linéaires · `tests/parcours/` 40/40 croisés + perfs), les 9 familles existantes re-passées vertes, retouches quantifiées. **Verdict : les formules fondatrices sont justes, aucun ralentissement.** Trouvailles : bouton « Hier » = bug de Greenwich (minuit-2 h) + 5 cousins **✅ corrigés ft-v671** · « marche de midi » de la récup **✅ corrigée ft-v671** (fatigue en continu sur 36 h, repos en jours calendaires) · « autre sport » **✅ corrigé ft-v672** (+150 kcal/j dans le TDEE, anti-double-comptage ; la récup reste chez Milo — décision assumée, pas de fatigue inventée). **Les 3 trouvailles de l'audit sont closes.** **Tout le détail : `docs/AUDIT-NOCTURNE-2026-07-29.md`.**

> ### 🌅 À LIRE AU RÉVEIL — nuit du 04 au 05/08 (Michel : « rappelle-moi tout ça demain »)
>
> **✅ CE QUI A ÉTÉ FAIT PENDANT QUE TU DORMAIS**
>
> | | Quoi | Preuve |
> |---|---|---|
> | 🛟 | **Sauvegarde de nuit RÉPARÉE** — elle ne tournait plus depuis 36 jours | 1 déclencheur · `backup-2026-08-04-23-20.json`, **811 Ko**, écrit **par le planificateur** à 23h20 |
> | 🔌 | **Miroir Supabase branché** (ft-v763) | projet **séparé** de celui de Tatiana · table en écriture seule |
> | 🚪 | **`.claspignore` refermé par défaut** — le bug qui cassait le déploiement backend tous les 15 jours | run vert, `Pushed 2 files` |
> | 💸 | **Ton compte est passé en Sonnet** | dans `worker.js`, PAS dans les Script Properties (voir ci-dessous) |
> | ✂️ | **Prompt allégé de 9 507 caractères** (ft-v764/765) | 60 085 → 49 362 sur un message hors sujet |
> | 🔐 | **Milo ne récite plus ses consignes, sauf à toi** (ft-v766/767) | 205 tests verts, les 2 branches |
>
> **🎯 LES 3 CHOSES À FAIRE AUJOURD'HUI**
> 1. **Vérifier que la sauvegarde de 2h est bien passée** → Profil → Admin → 🩺 Santé du système. Elle doit être datée de **cette nuit**. C'est le seul contrôle qui reste.
> 2. **Tester la copie miroir Supabase** → Profil → Admin → 🪞 (il faut que le SQL de la table `ft_comptes` soit passé). ✅ = ça marche · 404 = SQL non lancé · 401/403 = règles RLS.
> 3. **Vérifier dans la console Anthropic** qu'il n'y a plus de barre `claude-opus-4-6` à partir du 5/08.
>
> **🧨 LA DÉCOUVERTE DE LA NUIT, à retenir** : **DEUX endroits prétendaient régler le modèle de Milo, un seul agissait.** La Script Property `COACH_MODEL_MICHEL` est **du code mort** depuis que le coach passe par le Worker Cloudflare — le modèle est **en dur dans `worker.js`** (constante `MODELE_MICHEL`). J'ai cherché une heure du mauvais côté, et le bouton que j'avais fabriqué côté Apps Script t'aurait affiché un « ✅ Sonnet » **sans rien changer**. Supprimé.
>
> **📏 DEUX CHIFFRES QUE J'AVAIS ANNONCÉS FAUX** (corrigés par la mesure) : la nutrition ne fait pas 26 % du prompt mais **3,7 %** · filtrer le catalogue par lieu d'entraînement ne te ferait gagner que **29 caractères** (tu es en salle complète).
>
> **⏭️ LE CHANTIER SUIVANT — le régime du prompt, mesuré et priorisé**
> | Bloc | Poids | Piste |
> |---|---:|---|
> | `TA MÉTHODE DE COACH` | 6 322 | redondance avec 3 autres blocs |
> | `INTERDICTION D'INTERROGATOIRE` | 4 769 | dit 3 fois ailleurs — **priorité n°1**, désignée par ChatGPT ET par Milo |
> | `INTÉGRER LA SÉANCE` | 3 198 | même conditionnement que le catalogue |
> | `ÉTAT DU JOUR` | 2 832 | à condenser |
>
> ⚠️ **La règle de méthode qui sort de la nuit** : **l'audit se délègue, la coupe non.** ChatGPT a bien audité (il a trouvé le catalogue), puis a proposé **−85 %** sur un bloc en faisant disparaître, sans les mentionner, des règles nées de vrais bugs. Michel : *« tu déconnes sur ce coup là sérieux »*. Milo a produit le même audit, de l'intérieur. **Les trois lectures convergent sur les mêmes cibles** — ça, c'est utilisable. Les coupes se font ici, où l'on sait de quel incident est née chaque ligne.
>
> **✅ MIROIR SUPABASE OPÉRATIONNEL** (05/08, 8h) — testé en vert depuis l'app. Quatrième copie des comptes, sur une infrastructure indépendante de Google. *(Les bugs d'affichage du « Créateur de programme » signalés le 04/08 au soir concernaient le projet de Tatiana, pas Force Tracker — retirés d'ici.)*
> **🔒 Toujours ouvert (sécurité)** : `loadProfile` sert un compte entier sans code perso · le jeton de la boîte à idées est en clair dans `app.js`. Correctifs prêts, **non déployés** — c'est la production, ça se fait avec toi.
>
> **↩️ Rollback de la nuit** : `git reset --hard sauvegarde-avant-allegement` *(⚠️ sur ce dépôt, les **tags** sont refusés — on utilise une **branche**.)*

> ### 🔁 ÉTAT AU 04/08 (nuit) — remplace la photo précédente
> ⚠️ **Ce bloc se REMPLACE, il ne s'empile pas.** Instantané, pas journal.
>
> **🔥 Les deux derniers jours : 18 versions (ft-v739 → ft-v756)**
> - ✍️ **Les muscles ÉCRITS** : les 337 exercices relus un par un, ~120 fiches corrigées. La devinette par 69 règles ordonnées ne sert plus qu'aux exercices inconnus. Fragilité **60 (18 %) → 0**.
> - 🧍 **La figurine passe de 18 zones à 41 muscles** (ft-v751) → nouvelle règle **R31** : *la figurine est le vocabulaire du système, sa finesse est le plafond de tout le reste* (13 lecteurs dans 4 fichiers).
> - 🧠 **Trois bugs de mémoire chez Milo**, tous signalés par Michel sur capture : il croyait ne voir qu'une semaine (**ft-v752**, une phrase du prompt niait la mémoire longue) · sa progression basculait sur UNE séance, +23 % ou −20 % au choix (**ft-v753**) · il n'avait aucun détail entre la semaine écoulée et les moyennes (**ft-v754**).
> - 📣 **La règle #11 enfin appliquée** (ft-v756) — et 2 annonces découvertes **jamais affichées** (`screen:'menu'`, comparé nulle part).
>
> **✋ DEUX GESTES QUE MICHEL DOIT FAIRE (dit « je vois ça en rentrant », 04/08 soir)**
> 1. **🛟 Réinstaller le trigger de sauvegarde** — `…/exec?action=installDailyBackup&t=FT_BACKUP_INIT_2026`. Doit répondre `1 trigger(s) actif(s)`. ⚠️ **Puis REVÉRIFIER LE LENDEMAIN** dans Santé du système : une sauvegarde manuelle qui marche ne prouve pas que la NOCTURNE est repartie (même leçon que R18 — on vérifie le résultat, pas le geste).
> 2. **💸 Passer son compte en Sonnet** — Script Properties → `COACH_MODEL_MICHEL` = `claude-sonnet-4-6` (la valeur éprouvée, celle de Christophe). Aucun déploiement nécessaire, effet immédiat. Diviserait sa facture par ~5. ⚠️ Ne PAS photographier cette page : elle affiche `ANTHROPIC_API_KEY` et `ADMIN_TOKEN` en clair.
>
> ⚠️ **Et ce que le passage en Sonnet NE règle pas** (R9) : Michel verra alors Milo comme un utilisateur *premium*, toujours pas comme Eline sur Haiku. L'interrupteur « voir Milo comme un utilisateur normal », proposé le 29/07, n'est **toujours pas construit** — c'est lui qui aurait montré le bug du bouton de sa fille.

> **🔴 CONSTATÉ LE 04/08 (16 h 58), NON TRAITÉ — décision de Michel de laisser pour l'instant**
> - **🛟 LES SAUVEGARDES NE TOURNENT PLUS DEPUIS 36 JOURS.** Panneau Santé, point rouge : dernier fichier `backup-migration-2026-06-29-2003.json`. La sauvegarde nocturne (2 h du matin, `backupAllUserData_`) n'a rien produit depuis le 29 juin. Le stockage est à 31 % et tout va bien **aujourd'hui** — mais s'il retombe comme le 29/07, **il n'y a aucun filet**. C'est le point le plus grave ouvert.
> - **💸 Le coût de l'IA, c'est Michel.** Facture du 03/08 : **5,65 $**, dont **5,26 $ d'Opus (93 %)** — son propre compte (`COACH_MODEL_MICHEL`). Christophe (Sonnet) : 0,27 $. **Tous les autres testeurs réunis (Haiku) : 0,12 $.** ⚠️ Et le contexte a grossi le 04/08 (45 000 → 59 600 caractères) : chaque question lui coûte plus qu'avant. Leviers : passer son compte en Sonnet (une Script Property), ou finir le **régime du prompt**.
> - **🤖 « Désolé, réessaie » ment.** Quand le crédit API est épuisé, l'app invite à réessayer quelque chose qui ne peut pas marcher (vécu le 04/08 : Michel a réessayé deux fois). Le code sait pourtant reconnaître l'état (« Milo muet », `coach.js:2400`) — l'information ne remonte pas à l'écran. ⏭️ À faire : message honnête + alerte AVANT la panne.

> **🔴 À TRAITER EN PREMIER AU RÉVEIL**
> 1. **`docs/ALERTE-SECURITE-BOITE-IDEES.md`** — le jeton de lecture des idées est **en clair dans `app.js`**, servi publiquement depuis un dépôt public : n'importe qui peut lire **nom, e-mail et message de tous les testeurs**. Correctif écrit, **non déployé** (impossible de vérifier un déploiement backend depuis la session web, domaine bloqué). *Ça date du 12/07.*
> 2. **Brancher `listUsers` dans Profil → Admin** : on ne sait pas combien de séances Emma a faites, ni personne d'autre. On mesure tout sauf l'usage.
>
> **📊 Ce que les retours ont appris sur la MÉTHODE**
> - Christophe trouve en une minute (« il manque lombaires ») ce que **dix versions de relecture** n'ont pas vu : on a audité le contenu du catalogue sans jamais ouvrir **l'écran qui sert à créer un exercice**. *Un audit exhaustif d'un domaine ne dit rien de sa porte d'entrée.*
> - **Tatiana « a du mal »** alors que son retour du 19/07 était très positif. L'écart entre « ça me plaît » et « je m'en sers » ne se comble pas en ajoutant des fonctionnalités. **À comprendre avant de construire quoi que ce soit pour elle.**
> - **Eline s'y met** — moment fragile, l'app doit être simple, pas complète.
>
> **⏭️ Le grand chantier, toujours ouvert : le RÉGIME DU PROMPT** — ~58 000 caractères envoyés à Milo, dont l'écrasante majorité en consignes. Les rendre **conditionnelles à la mission**, avec un plancher inconditionnel : la **sécurité** part toujours. ⚠️ Ne PAS rogner sur les faits (calendrier, dates, prénom, historique) : ils coûtent peu et évitent les erreurs.
>
> **📏 En attente d'arbitrage Michel** : ouvrir la mémoire élargie à tout le monde (aujourd'hui michdu75 + christophe, `_memoireLargeOn()`) · les 19 anciennes pop-ups trop longues (R25) · faire descendre les distinctions fines de la figurine dans les fiches (pectoral en 3 = 55 fiches, adducteurs 9, soléaire 3, trapèze inférieur 7) · étapes 2 et 3 de l'identifiant stable.

> ### 🗄️ ÉTAT AU 28/07 (soir) — conservé pour mémoire
> ⚠️ **Ce bloc se REMPLACE, il ne s'empile pas.** C'est un instantané, pas un journal (le journal est dans `CLAUDE.md`). Un fichier « à lire en premier » qui s'allonge cesse d'être lu.
>
> **🔥 Ce qui a occupé les deux derniers jours**
> - 💚 **La carte de récupération** : l'anneau fini (dégradé conique rouge→vert, relief de tube, lueur qui tourne, ft-v640→644) **puis une DEUXIÈME apparence au choix** dessinée par Michel — le style « moniteur » (chiffre à gauche, jauge ouverte à droite, tracé d'ECG au centre), ft-v645→648. **L'anneau reste le défaut** : ce n'est pas un remplacement, c'est un choix dans Menu → Apparence.
> - 🧩 **Le check-in replié passe en 3 tuiles** (sommeil / énergie / moral) avec relief, ft-v650/651. On lit son état **sans lire**.
> - ⚖️ **Règle d'or #11 amendée** (décision de Michel) : **la pop-up se mérite** — seulement si la personne doit *faire* quelque chose, ou si un repère a bougé. Les points 2 à 5 (point rouge · aide `?` · aide détaillée · guide) restent systématiques. Déclencheur : 3 pop-ups en deux jours, dont 2 sur la même carte.
> - ✂️ **`CLAUDE.md` scindé en deux** : 33 000 → ~13 000 mots. Les 12 règles d'or **en entier** vivent désormais dans `docs/REGLES-OR.md` ; `CLAUDE.md` n'en garde qu'une ligne chacune. Cohérence vérifiée par `python3 tools/check_regles.py` (qui surveille aussi la longueur du journal récent).
> - 🙋 **Le bug du PRÉNOM** (ft-v652) : Milo ne l'avait **jamais** reçu — alors que le prompt lui demandait de l'employer (R8 : *un prompt ne compense jamais une donnée absente*). Et le prénom était **introuvable dans l'écran Profil**. Les deux corrigés.
> - 🛡️ **LE GARDE-FOU DES DONNÉES** (né de l'intuition de Michel après le prénom) : `node tests/donnees/runner.js` exige que **chaque** donnée chargée par `load()` soit classée face à Milo — transmise · exclue avec la raison écrite · trou connu. Une donnée non classée **bloque la livraison**. → règle **R4a**.
>
> **📏 Ce que la mesure a révélé — le sujet du moment**
> Le contexte envoyé à Milo fait **~45 400 caractères** : **91 % de consignes**, **9 % de connaissance sur la personne** (144 lignes d'instructions, 42 « JAMAIS »), et il ne voit que les **5 dernières séances** (`S.sessions.slice(0, 5)`).
> ⚠️ **À ne pas mal lire** : ce n'est pas « Milo n'a que 9 % de mémoire » — **48 des 90 données lui sont bien transmises**. Le 9 % est un volume de **texte**. Le problème, ce ne sont pas les 4 000 caractères de données, ce sont les 41 400 de consignes qui les **noient**.
>
> **⏭️ LA PROCHAINE GRANDE TÂCHE (spécifiée, PAS commencée)** : **le régime du prompt** — rendre les consignes **conditionnelles à la mission en cours** (pas besoin des règles de nutrition quand on demande une séance), **avec un plancher inconditionnel** : les règles de **sécurité** (blessures, contre-indications, Gardien) partent **toujours**.
>
> **🕳️ Les trous connus : 3 restants** (ft-v654 a comblé le pire — `nextPlanned` : Milo reçoit enfin la séance que tu lui as annoncée, et l'Accueil et le chat lisent désormais la MÊME règle). Restent : ① `programmes` (il ne connaît pas ton planning quand tu lui demandes quoi faire) ② `customExercises` ③ `exRestPref` (tes 240 s au squat, ignorés).
>
> **🐛 Deux bugs trouvés dans la foulée du garde-fou (28/07, tard)** : ① **la date du jour était celle de Greenwich** → entre minuit et 2 h, une séance était datée de la veille (corrigé ft-v655, `tests/dates/runner.js`) ② **« Mes discussions » s'ouvre sur une liste vide** alors qu'une conversation est à l'écran — le bouton s'affiche dès qu'un fil existe, mais seul le « + » range une discussion. **⏭️ À FAIRE, validé avec Michel** : la discussion en cours apparaît en tête marquée « en cours » · le bouton ne s'affiche que s'il y a quelque chose à ouvrir · **et surtout : on arrête de couper le fil aux 20 derniers messages** (aujourd'hui, fermer l'app perd silencieusement le début d'une longue conversation — c'est le seul des trois où on perd vraiment quelque chose).
>
> **✅ LES 4 CHANTIERS DES 28-29/07 SONT TOUS CLOS** — conversation coupée **(ft-v656)** · questionnaire qui se répète **(ft-v657)** · check-in déplié **(ft-v661)** · « c'était celle-là ✓ » **(ft-v662)**. S'y sont ajoutés en cours de route, tous livrés : la date du jour à l'heure du téléphone **(ft-v655)**, le calendrier donné à Milo **(ft-v658/659)** et les jours du passé **(ft-v660)**.
>
> **⏭️ LE GRAND CHANTIER QUI RESTE — le régime du prompt** : ~46 000 caractères envoyés à Milo, dont **91 % de consignes** contre 9 % de connaissance sur la personne. Rendre les consignes **conditionnelles à la mission**, avec un **plancher inconditionnel** : les règles de **sécurité** partent toujours. ⚠️ **Ne PAS rogner sur les faits** (le calendrier, les dates, le prénom) — ce sont eux qui empêchent les erreurs, et ils ne coûtent presque rien.
>
> **⏭️ Angle mort signalé par Michel (29/07), à traiter avec le régime** : il teste Milo sur le **modèle haut de gamme**, les utilisateurs ont le cran en dessous (**R9**). Les bugs de **donnée** (dates, prénom) touchent tout le monde pareil, mais les règles de **comportement** (ton, anti-interrogatoire, Gardien) se relâchent sur un modèle plus léger — et il ne peut pas le voir. Proposition en attente : un interrupteur « voir Milo comme un utilisateur normal » dans l'Admin.
>
> **✅ COMBLÉ (ft-v667) — les 86 exercices sans muscles.** Trouvé le 29/07 en répondant à *« sur tous les mouvements tu as vérifié ? »* : 86 des 287 exercices (30 %) n'avaient aucune correspondance musculaire (figurine vide). Réglé par ~25 règles de **rattrapage par famille** placées **à la fin de `_MEX`** (le moteur s'arrête au 1ᵉʳ motif → zéro régression par construction). Vérifié exercice par exercice : **0 modifié · 81 nouveaux · 0 restant**. Garde-fou : `node tests/muscles/runner.js` refuse que le compte remonte au-dessus de 0. ⚠️ **Règle à tenir** : ne JAMAIS insérer une règle précise APRÈS le bloc de rattrapage — elle serait morte (un test structurel le vérifie).
>
> **⏭️ OUVERTS avec Michel le 29/07 (soir)** — ① **Le CARDIO début vs fin de séance** : l'app ne stocke qu'un type + une intensité + une durée, sans savoir **quand**. Or un vélo d'échauffement (monter en température) et un cardio de fin (conditionnement, dépense, effet réel sur la récup) n'ont rien à voir. ⚠️ **Et il y a un double comptage** : `calcSessionCalories` ajoute **systématiquement** 10 min d'échauffement forfaitaires — si tu enregistres en plus ton vélo d'échauffement dans le bloc cardio, il compte deux fois. À faire : un champ « avant / après », l'échauffement remplaçant le forfait. ② **Enrichir le catalogue** : exercices à l'**élastique**, **mobilité**, **abdos et variantes**. Les règles par famille de `_MEX` (ft-v667) attraperont automatiquement les nouvelles variantes. ⚠️ **La mobilité posera une question à part** : ce n'est ni de la force ni du cardio — lui donner une intensité de musculation serait faux.
>
> **✅ COMBLÉ (ft-v670) — les schémas de mouvement.** 27 exercices (11 %) n'en avaient aucun → « accessoire » par défaut pour Milo + garde-fou anti-fusion désactivé. Ajout de **`porte`**, **`halterophilie`** et **`saut-plyo`** d'après la taxonomie de référence (pousser · tirer · flexion de genou · charnière de hanche · rotation · porter), + les 4 mal classés rattachés. **27 → 7**, et les 7 restants sont de vrais accessoires. `halterophilie` est une ANCRE (un arraché n'est pas un accessoire) ; `porte` et `saut-plyo` **non** (un burpee ne doit pas devenir le pivot d'une séance) — R29.
>
> **⏳ En attente de Michel** : les captures pour les diapos du Guide (ft-v612/614/615/617/620/622) · la règle de limitation de débit Cloudflare.
> **⏳ Dettes connues** : ① **ce fichier doit être retaillé à 1 vraie page** (de vieilles photos empilées plus bas) ② refonte 2-rangées du header (parkée depuis ft-v611) ③ le logo (« il est moche », 6 juillet).
> **⏳ Restent clone-only** (ne pas promouvoir tel quel) : badge Gardien, questions illimitées, couplage blessure-retenue→Santé (ft-v588).

---

## 🎯 RESTE À FAIRE (état au 23/07 au soir — reprise ici)

**Fait ce soir :** allègement CLAUDE.md (451→84 Ko + `docs/JOURNAL-ARCHIVE.md`) · Gardien de la Constitution **Étage 1** (clone, ft-v591) · **P24 « engagement responsable »** gravé (Constitution v2.2) · **les 2 moments Milo** gravés (`docs/PRESENCE-MILO.md`) · **Moment 1** fix comportemental (mal au ventre / docteur / re-demande, prod, ft-v593/595) · toggle clone **10 ⇄ illimité** (ft-v594) · **FRAMEWORK DE TESTS DE MILO** (noyau dur, 9 scénarios verts, `node tests/milo/runner.js` — `docs/FRAMEWORK-TESTS-MILO.md`).

**À reprendre :**
1. **[Michel] Valider le clone (ft-v595)** : refaire l'inscription, tester « j'ai mal au ventre » + demander une séance → Milo aide d'abord, ne redemande pas la salle, ne joue pas au docteur, pas d'interrogatoire.
2. **[Claude, après ①] Promouvoir en prod** le lot « comportement » (anti-interrogatoire + moment-Milo + blessure retenue → Gardien ft-v588) + checklist #11.
3. **[Claude] Lancer proprement la QUESTION GUIDÉE** (chips réponses rapides, clone-only ft-v585→590) quand validée = checklist #11 complète.
4. **[Chantier] MOMENT 2 « Milo se souvient de moi »** : surfacer la mémoire au retour (session 2). Pas commencé = la prochaine grande brique.
5. **[Tests] Élargir le corpus** au fil des bugs · construire le **Tier 2** (éval IA, minimal) · éventuelle GitHub Action pour le noyau dur.
6. **[Cross-IA en cours]** retours attendus : GPT/Gemini/Mistral sur le **framework de tests** · GPT sur le **« moment Milo »** · Gemini/Mistral sur l'**archi cerveau/cervelet** (pas encore envoyé). → à leur retour : synthèse + graver (dont le principe archi durable « **les faits viennent des moteurs, jamais inventés par le LLM** »).
7. **[Ne JAMAIS promouvoir — reste clone]** questions illimitées (toggle) + badge « 🛡️ Gardien » (outil de mesure).
8. **[Ouvert, rien à coder]** modèle éco (P24 gravé, implémentation LAISSÉE OUVERTE ; intermittence Gemini notée dans `IDEES-FUTURES.md`) · Gardien Étage 2 (option future).

⚠️ **Note dette technique :** ce fichier CONTEXTE-ACTUEL est devenu trop long (comme l'était CLAUDE.md) — à alléger un jour (garder 1 page + déplacer le vieux vers l'archive).

---

- **⚖️ PHILOSOPHIE DE MILO gravée — Constitution v2.1 (22/07, soirée, doc-only)** : reframe **confiance > empathie** (on ne fait pas un Milo « empathique », on fait un Milo digne de confiance ; l'empathie est dans ses **actes**, pas ses mots). **Principe 22 (capstone) « Le respect de la liberté de l'utilisateur »** (ne présume pas · ne décide pas à ta place · ne passe pas outre une limite · garde sa franchise mais te laisse le dernier mot · mémoire = tremplin jamais prison · **l'humilité** = diagnostique la barre jamais l'âme). **Principe 23 « Ne jamais confisquer le récit ; le réconfort n'est jamais une stratégie »**. Renfort P17 (interdits femmes). Mission : que chacun·e se sente compris·e, en particulier les **femmes** (phrase de Tatiana : « à quoi sert une appli à une femme si c'est juste pour rentrer des données ? »). Synthèse Michel + Claude + GPT + Gemini + Mistral. Détail : `CONSTITUTION-MILO.md`, `docs/VISION-FORCE-TRACKER.md`, `docs/MOTEUR-RAISONNEMENT-MILO.md`, `docs/PRESENCE-MILO.md`.

- **📱 NATIF — stratégie cadrée (22/07, croisement Gemini + Mistral + Claude + synthèse Michel · `docs/STRATEGIE-NATIF.md`)** : intention de passer en natif/hybride, **préparé sans rien coder ni bloquer les chantiers en cours**. Principe directeur (Michel) : *« le natif n'apporte que ce que le web ne peut pas offrir »*. Chemin = **coque Capacitor, zéro réécriture** (on garde tout) ; approche **progressive** des plugins (au besoin réel, pas « tous en V1 ») ; priorité objets connectés > push > stores ; monétisation au lancement = premium **serveur** (esquive la taxe Apple). Le **modèle est déjà prêt** (`MODELE-METIER.md` Principe n°2 : indépendant du mode d'acquisition). **⏭️ À décider avec Michel : le TEMPO** (quand démarrer) — pour l'instant, cap futur préparé.

- **🍽️ NUTRITION — esprit gravé (ft-v577, croisement Gemini + Mistral + Claude + synthèse Michel)** : phrase-boussole *« la nutrition est un moyen d'améliorer santé/récup/perf ; jamais une source de stress > bénéfice »* (**P21**). Principes : levier au service de l'objectif · optionnelle jamais bloquante · **précision au CHOIX (4 niveaux : qualitatif → portions → macros → suivi précis)** · fiabilité > exhaustivité (±20-50 %, tendances + fourchettes) · local d'abord + fallback fait-maison · qualité gratuite Nutri-Score/NOVA · anti-TCA (Gardien nutrition = seuils d'alerte). **1ʳᵉ brique proposée** = journal léger « à la portion » sur Open Food Facts. **⏭️ Prochaine étape avec Michel : choisir/prioriser cette 1ʳᵉ brique à coder.** Détail : `docs/NUTRITION-PHILOSOPHIE.md`.

- **🧠 CHANTIER ACTIF — LE MOTEUR DE RAISONNEMENT DE MILO (le « cerveau »)** *(réflexion fondatrice Michel 22/07, cadre : `docs/MOTEUR-RAISONNEMENT-MILO.md`)* : passer du « générateur de programmes » au **raisonnement** (Compréhension → **Diagnostic** → décision → explication). Chaque brique = une **PIÈCE** du moteur, prompt-only (0 backend), invisible à l'utilisateur. **Pièces posées :**
  - `ft-v571` — **base du moteur** : bloc « savoir raisonner + savoir s'arrêter » (Constitution **Principe 18**).
  - `ft-v572` — **1ʳᵉ pièce (Cerveau 2)** : exercices **« ancre » vs « accessoire »** (`_exRole`, déterministe) — construire autour des ancres.
  - `ft-v573` — **2ᵉ pièce (Cerveau 1)** : **profil conversationnel** (étape 1 « comportement ») — Milo apprend en discutant.
  - `ft-v582` — **2ᵉ pièce, étape 2 : la MÉMOIRE DURABLE** — Milo propose de retenir un trait durable confié en discutant (bloc caché `{"retiens":[…]}` → « 🧠 Je retiens : … ? [Oui][Non] ») → validé = rangé dans `S.registre.observations` (`source:'conversation'`), réutilise l'infra Observations + « Ce que Milo sait de toi ». Rien sans accord (P3). ⚠️ émission = prompt → à valider iPhone.
  - `ft-v574` — Milo connaît enfin tes **objectifs chiffrés** (force par exo + poids objectif) → répond à « c'est atteignable en combien de temps ? ».
  - `ft-v575` — **PRINCIPE DE CONCEPTION** « **La pertinence avant la disponibilité** » (+ « la cohérence avant la réactivité ») — né du sujet IMC, croisement GPT/Gemini/Mistral/Claude. **DEUX ÉTAGES : Milo raisonne · le Gardien protège** (seuils absolus IMC ≥ 40 · tour de taille > 120). Constitution **Principes 19 & 20 (v1.9)**.
  - `ft-v576` — nuance UX « **répondre d'abord, proposer ensuite** » : l'absence d'une donnée = une opportunité, jamais un blocage (corollaire P19).
  - ⏭️ **Prochaine pièce** : Observations (Cerveau 1 affine + Cerveau 2 réévalue) · générateur de programme (sortie du Cerveau 2). ⏳ **Couche future** : veille longitudinale des signaux faibles + montre connectée (non collectées).
- *(⏸️ parqué en arrière-plan : INDUSTRIALISATION VM — étapes 1/2 faites `ft-v526/527` ; restent ③ couche machine user-fed · ④ tests réels · ⑤ enrichir EXLIB. À reprendre après le cerveau.)*
- *(ancienne note ft-v526 : VM câblé sur l'import HISTORIQUE — `_vmMatchHist`, plus de doublons ; ~378 alias GPT, `_EX_EQUIV`=406 clés)*
  - **🏗️ Phase industrialisation lancée (GO Michel)** — ordre : **① VM finalisé ✅ (import historique câblé, ft-v526)** → **② Confirm en un geste ✅ (figurine + ✓/✕, import prog+journal, ft-v527)** → ③ couche machine (MVP user-fed) → ④ tests réels programmes variés → ⑤ enrichir EXLIB au fil du réel. **⏳ À TESTER PAR MICHEL (iPhone)** : importer un vrai programme + un vrai journal → vérifier les rattachements auto (verts) + les propositions ✓/✕.

- **🔭 TOUR DE TABLE IA EXTÉRIEURES (20/07) — décisions d'archi VM prises** (détail : CLAUDE.md, méthode : `docs/PROCESSUS-DEVELOPPEMENT.md`) : avis croisés GPT + Gemini + Mistral sur le chantier VM. **Méthode adoptée** : convergence de regards indépendants = décision d'archi ; divergence = débat. **2 décisions** : ① couche machine = **user-fed d'abord** (le risque = les médias, pas le code) ; ② graphe **simple & dérivé** (14 schémas, pas de parsing exhaustif). **+ Principe** : palier « confirm » de l'import = **un TAP, pas un formulaire**. **Prématuré → IDEES-FUTURES** : matériel connecté (montre), modèle éco approfondi, export JSON/CSV. **Prochaine brique quand on construira = la couche machine.**
  - **🏛️ FRONTIÈRE VM / GARDIEN actée** (dernier doc GPT) : *le moteur VM identifie/structure les MOUVEMENTS ; le Gardien décide quoi FAIRE de cette connaissance* (remplacements, contre-indications, adaptations douleurs = métier du Gardien, pas du parsing). ✅ **Ratifiée par Michel → Constitution v1.5, Principe 15 « Le moteur comprend, le Gardien décide » (20/07)**.
  - **🏗️ CHANGEMENT DE PHASE — GO donné par GPT (20/07) → en attente GO Michel** : fin de la phase « grandes idées », début de l'**industrialisation**. **Ordre convenu (GPT + Claude)** : ① **finaliser VM** (câbler import historique) → ② **construire Confirm** (validation reconnaissance en un geste) → ③ **couche machine (MVP user-fed)** → ④ **tester avec de vrais programmes variés** → ⑤ **enrichir EXLIB uniquement à partir des cas réels**. Nuance actée : **Confirm AVANT Machine** (le confirm de reconnaissance ✓/✕ se construit d'abord, la photo machine s'y greffe ensuite). Conseil GPT : « ne plus chercher de grandes idées — le moteur doit apprendre du réel ». Les 4 IA (GPT/Gemini/Mistral/Claude) alignées sur « construire ».
- **Branche de travail :** `claude/claude-md-docs-ytabnv` — **publiée aussi sur `master`** (donc live = ft-v670). *(session Claude Code web)*
- **Dernier point de sauvegarde :** ⭐ `backup-2026-07-20-pt001-valide-ft-v504` (milestone à jour)
  *(voir la table complète dans `DOSSIER-ATHLETE-SUIVI.md`)*

- **🧪 PROTOCOLE DE VALIDATION (nouveau, `ft-v497`) — PT-001 « Continuité mémoire »** :
  outil **admin** qui rejoue TOUT l'historique → Milo débriefe chaque séance + vérifie
  l'objectif de la fois d'avant, finit par « Qui suis-je en tant que sportif ? », et
  produit un **rapport exportable** (texte + PDF : timing, saturation, continuité,
  verdict + 7 axes GPT). Valide à 3 (Michel/GPT/Claude). C'est le **1ᵉʳ d'une série de
  protocoles** (PT-002 Gardien · PT-003 Observations · PT-004 ADN · PT-005 Onboarding).
  → **✅ 1ᵉʳ RUN RÉEL FAIT ET VALIDÉ (20/07)** : 20 séances, **20/20 réponses valides**
  (après le fix du bug 400), mémoire 20/20, **continuité d'objectif réelle ~95 %**
  (détecteur corrigé v504), **portrait « Qui suis-je ? » réussi** (décrit la personne).
  Preuves de suivi : saga hip thrust + « 105 OBJECTIF TENU, bravo ». Seul 🔴 = saturation
  = **artefact du rejeu Opus en rafale**, PAS Milo en réel (~14 s/débrief en vrai).
  Détail : `DOSSIER-ATHLETE-SUIVI.md` (§ Résultats du 1ᵉʳ run). *« On construit une méthode
  de validation reproductible, plus seulement des fonctionnalités » (GPT).*
  - **🏛️ CADRE ADOPTÉ — Laboratoire à 2 piliers VT / VC** (idée Michel, structurée GPT,
    19-20/07) : **VT** = Vérifications Techniques = les PT-xxx (le système marche) ·
    **VC** = Vérifications Comportementales = rejouer des **personas** (sportifs fictifs
    détaillés avec « attendus ») pour garder Milo cohérent/bienveillant/fidèle = filet
    **anti-régression de personnalité**. Garde-fous Claude : juge humain d'abord (IA-juge
    plus tard si prouvé), chaque persona a son « attendu », **semer depuis les VRAIS
    testeurs** (Tatiana = 1ᵉʳ VC) + la Constitution, **commencer PETIT** (5-6), le labo
    SERT la feuille de route sans la remplacer. Détail : `DOSSIER-ATHLETE-SUIVI.md`.
    ✅ **FAIT (`ft-v505`)** : format persona **v1.0 (7 rubriques)** figé + **harnais VC** (injection
    sûre : gel + snapshot + `load()` → données réelles intactes, testé) + **VC-001 Tatiana bâti**.
  - **🎭 VC-001 — état (20/07) :** **le COMPORTEMENT de Milo est conforme** (runs 3→6 : 5/5 attendus —
    il DEMANDE l'objectif, ne présume pas, n'invente pas « rattrape ton haut du corps »). MAIS les
    runs sur l'iPhone de Michel **fuitent encore ses données dans le contexte** — non pas un bug du
    code (v507 prouvé propre : git HEAD OK + Playwright 0 fuite), mais **iOS qui garde le vieux SW
    v506 en service** malgré l'affichage « 507 ». **→ SOLUTION : le `/clone/` devient le labo**
    (idée GPT). Le clone a un SW `cache:'no-store'` → exécute TOUJOURS le dernier code (aucune version
    périmée) + isolation `cl_`. Clone régénéré depuis prod ft-v507 (porte le harnais VC/PT + le fix).
    ✅ **VC-001 VALIDÉ (20/07, `ft-v508`)** : sur le clone (code frais), run 8 = contexte propre + Milo
    **5/5 attendus** (ne présume/impose rien, n'invente plus les genoux — ils sont déclarés cette fois).
    **Verdict CONFORME acté à 3** (Michel + GPT + Claude). 2ᵉ fuite trouvée+corrigée au passage
    (`coachQuiz`/`coachQuizPro`). Leçon GPT adoptée : *les attendus doivent coller EXACTEMENT au persona envoyé*.
  - **🎭 Bibliothèque VC (au 20/07, `ft-v509`) :** **VC-001 Tatiana** ✅ validé · **VC-002 Christophe**
    (confirmé qui a déjà un coach humain → Milo respecte/complète ? · testé **sur Sonnet**, son vrai modèle) ·
    **VC-003 Emma** (femme en règles + keto → ressenti prime, adaptation cycle, respect keto · Haiku).
    Harnais gère le **modèle-par-persona** (`coachEmail`) + cycle simulé (`cycleStartDaysAgo`) + keto.
    **✅ Conception validée par GPT (20/07)** : « attendus précis, observables, adaptés à une validation humaine ».
    Ses 2 points de vigilance sont **déjà couverts par les attendus** (VC-002 = Milo trop effacé → attendu 3 « compléter » ;
    VC-003 = reconnaître la fatigue avant les scores → attendu 1). 3 piliers couverts : comprendre avant de conseiller ·
    respecter un coach humain · faire primer le ressenti. ⏳ **PROCHAIN PAS : Michel lance VC-002 & VC-003 sur le clone** → verdict par attendus.

- **Chantier actif :** 🧠 **Dossier Athlète / Milo** (donner à Milo une mémoire
  durable + une vraie personnalité de coach).
- **Brique en cours :** — **3B CLÔTURÉE** (`ft-v471`, **validée Michel** : « 3B
  validé », « nickel »). Affinée (`ft-v472→v473`) : le ressenti nourrit le score —
  l'énergie l'ajuste en douceur, une **douleur ne fait pas chuter le chiffre** mais
  affiche un bandeau ⚠️ (« adapter, pas interdire »). Testeurs prévenus par un
  pop-up dédié (`ft-v474`). ⏳ À faire plus tard (IDEES-FUTURES) : **réduire la
  carte** de l'état du jour (elle encombre le haut de l'Accueil). **Restent en
  attente de validation réelle : 5A · 6A · 6B.** Briques 0–4A + 3B CLÔTURÉES ;
  Constitution v1.3 ; **Vision** gravée. Toutes les briques 0→6B **bâties** ;
  ensuite **5B** (observations IA).

- **Dernières décisions validées :**
  - Ton de Milo : « Laisse Milo choisir » (auto) par défaut, manuel = secours.
  - Registre Athlète (mémoire) + 7 faits mesurés, invisibles, règle d'or « un fait = une décision ».
  - Milo « comprendre avant de conseiller » (rupture d'habitude → question douce d'abord).
  - **Le ressenti de la personne prime toujours sur les chiffres** (ne jamais
    contredire « je suis HS » avec « ta récup est au top »).
  - **Nouvelle méthode de validation : les 4 axes** (fonctionnelle · technique ·
    situation réelle · philosophie de Milo) — adoptée à la clôture de la brique 3.
  - **Devise officielle** : « Force Tracker s'adapte au sportif. Le sportif ne
    s'adapte jamais à Force Tracker. »
  - **Le Gardien (brique 6) ADAPTE, il n'interdit pas** — adaptation par défaut,
    arrêt total = exception (Principe 13). Pas de « moteur de décision » séparé :
    c'est le rôle du Gardien.
  - Constitution de Milo **v1.9** (20 principes). Derniers en date (22/07) :
    **P15** « Le moteur comprend, le Gardien décide » · **P16** respecter le
    travail des coachs · **P17** l'accompagnement jamais la thérapie · **P18**
    fiabilité avant intelligence (savoir raisonner + savoir s'arrêter) · **P19
    « La pertinence avant la disponibilité »** (une donnée n'est utilisée que si
    elle améliore la décision ; deux étages Milo/Gardien ; transparence ciblée ;
    l'absence d'une donnée = opportunité, répondre d'abord proposer ensuite) ·
    **P20 « La cohérence avant la réactivité »** (raisonner sur les tendances, pas
    le bruit). Rappel P14 « Miroir, jamais prophète » (garde-fou des briques 7 & 8).
  - Méthode de documentation : CLAUDE.md = page d'accueil, détails dans `/docs/`.
  - **Vision d'identité « présence de Milo »** (`docs/PRESENCE-MILO.md`) : Milo → App,
    présence sans gadget, jamais un passage obligé — **cerveau d'abord, présence ensuite**.
  - **La DESTINATION = architecture en 8 briques** (cadrage ChatGPT, gravé dans la
    Vision) : 0 Personnalité · 1 Mémoire · 2 Cerveau · 3 État du jour · 4 ADN ·
    5 Observations · 6 Gardien · **7 Mémoire vivante** (tendances sur plusieurs
    années) · **8 Synthèse** (prendre du recul sur toute son histoire). **7 et 8 =
    la finalité** (miroir jamais prophète ; dernières par nécessité — besoin de
    temps + données). Tout le reste (5B, « Milo construit ta séance »…) = affinages
    À L'INTÉRIEUR des briques, pas de nouvelles grandes briques.

- **🎯 ORDRE DES PRIORITÉS (recentrage GPT du 19/07 — « revenir au cœur du projet ») :**
  **1. Effet Waouh à l'inscription** (accueil perso et marquant — le nouveau comprend tout
  de suite que ce n'est pas un carnet) · **2. Débrief auto de fin de séance** *(déjà
  LARGEMENT FAIT : écran de fin `ft-v492` + débrief à l'ouverture du Coach `ft-v491`)* ·
  **3. Mémoire réellement exploitable** (Milo ressort l'info au bon moment, des semaines/mois
  après = Étapes 2/3 du débrief + brique 7 — « le plus important » selon GPT) · **4. Import
  auto des programmes** (Milo agit, en 1 clic — *à moitié bâti* : `_saveForceProgram`) ·
  **5. Traduction ensuite** (levier de croissance Tatiana, mais après le cœur ; déjà bien
  avancée sur le clone — voir `IDEES-FUTURES.md` + `RETOURS-TESTEURS.md`).
  → **✅ SÉQUENCEMENT TRANCHÉ = OPTION C (alignés à 3, Michel/GPT/Claude, 19/07)** : GPT
  distingue *priorités de dev* vs *priorités d'impact utilisateur* — la **mémoire (#3)** sert les
  utilisateurs **déjà là**, l'**onboarding (#1)** sert les **nouveaux** (pas le même problème).
  Donc : **(1)** Claude construit la **mémoire (#3)** + boucle l'**import (#4)** (déjà engagé) ;
  **(2)** EN PARALLÈLE, Michel + GPT **conçoivent** l'onboarding à fond (UX, dialogues, parcours,
  perso) **sans le coder tout de suite** ; **(3)** mémoire finie → on **enchaîne sur un onboarding
  déjà mûri**. ⚠️ L'onboarding n'est plus un simple écran = **mini-projet** (accueil perso, niveaux,
  effet Waouh) → concevoir avant de coder. Répartition qui colle au modèle « équipe IA »
  (`README-IA.md`) : Claude=dev, Michel+GPT=vision/UX, puis Claude exécute.
- *(ancienne note : « Inscription + premier accueil » restait le prochain gros chantier ;
  le moteur nutrition local vient après. Toujours valable, replacé dans l'ordre ci-dessus.)*
- **En parallèle (Milo) :** Michel teste en réel les briques encore en attente
  (**5A / 6A / 6B**) → validation 4 axes → clôtures. Ensuite **5B** (observations
  IA générées) ou la **réduction de la carte état du jour** (compacte repliée).
- **En discussion (gouvernance, non bloquant) :** le Principe 14 « Milo enrichit le
  jugement… » est **tranché** → devenu **Principe 14 « Miroir, jamais prophète »**
  (Constitution v1.4). Reste ouverte : la posture d'équilibre exigence/protection
  dans le comportement de Milo (à mûrir tranquillement).

- **Blocages :** aucun.

---

### 🗺️ Où lire quoi
- **Règles + vision + version** → `CLAUDE.md` (page d'accueil, auto-chargé chaque session).
- **Principes permanents** → `CONSTITUTION-MILO.md`.
- **Méthode de travail** → `docs/PROCESSUS-DEVELOPPEMENT.md`.
- **Chantier Milo (détail brique par brique)** → `DOSSIER-ATHLETE-SUIVI.md`.
- **Idées / à faire plus tard** → `IDEES-FUTURES.md`.
- **Backend à déployer depuis le PC** → `A-FAIRE-SUR-PC.md`.
