/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
const CACHE = 'ft-v590'; // 🗣️ Question guidée — 2 correctifs (retour Michel : « il me pose plein de questions et à la fin bim question écrite ; si le mec est freemium et qu'il n'a plus de questions gratuites il est nike »). ① ANTI-INTERROGATOIRE (prompt gated __FT_CLONE__) : Milo n'enchaîne JAMAIS plusieurs questions avant d'aider — il APPORTE de la valeur d'abord (1er programme avec hypothèses raisonnables « ~45 min, haltères+barre, dis-moi si différent et j'ajuste ») puis demande AU PLUS 1-2 infos décisives ; la personne repart avec quelque chose d'utile même sans répondre ; les réponses rapides ≠ licence à interroger. ② QUOTA (frontend) : répondre à une question POSÉE PAR Milo (pendant que des chips sont affichés) ne bloque/coûte JAMAIS à un freemium — tap déjà gratuit (v586) + réponse TAPÉE pendant que des chips sont là = gratuite aussi (opts.noQuota auto si `.coach-qr` présent, avant le mur). Effectivement clone-only (les chips n'existent qu'au clone). Prod inchangée. // (ancien) ft-v589 : // 🚨 FIX MAJEUR anti-INVENTION (retour Michel : « je n'ai jamais confirmé que j'ai eu un accident il y a plusieurs années » — Milo avait inventé « il y a quelques années » sur un simple « j'ai eu un accident de moto », et prétendait « je vois ça dans tes antécédents / d'après ce que je sais » pour une info dite à l'instant). Viole P18/P22/P23. Fix (NON gaté = prod + clone, car c'est un risque de confiance en direct pour tous et le fix ne peut que protéger) : buildCoachContext renforcé — ① ⛔ N'AJOUTE JAMAIS un détail non donné (date/gravité/cause) même à une info dite (« accident de moto » = SEULEMENT ça, pas « il y a quelques années ») → demande ou omets ; ② ⛔ ne FABRIQUE jamais de source (« je vois dans tes antécédents »/« d'après ce que je sais ») pour une info fraîche → accueille-la comme NOUVELLE ; ③ le bloc `retiens` (mémoire) = EXACTEMENT ce que la personne a dit, zéro détail ajouté. ⚠️ Le prompt RÉDUIT l'invention sans la garantir à 100 % — à re-tester sur device. // (ancien) ft-v588 : // 🩹 QUESTION GUIDÉE/MÉMOIRE — une CONSÉQUENCE de blessure confiée à Milo ATTEINT enfin le GARDIEN (piège de Michel : « l'accident de moto a une conséquence… il retient l'accident nickel et après plus rien »). Trou trouvé : ce que Milo « retient » (registre.observations) était injecté dans son CHAT mais le Gardien (_gardienRules) ne lit QUE le Profil Santé → une blessure retenue ne protégeait AUCUNE zone en séance. Fix (gated __FT_CLONE__, prod inchangée) : ① prompt — pour une BLESSURE/ACCIDENT/SANTÉ, Milo retient la CONSÉQUENCE (zone + limitation) pas l'anecdote, nomme la zone, et ENCHAÎNE (protège/adapte) au lieu de « c'est noté » ; ② câblage `_confirmMiloMemory` — si le trait retenu nomme une zone (`_gardienZonesFromText`), on l'ajoute AUSSI à `S.healthProfile.notes` → le Gardien protège la zone dans TOUTES les séances (automatique au « Oui, retiens », l'accord est donné). Toast « Zone ajoutée à ta santé — Milo la protège 🛡️ ». Domaine délicat = alimente le Gardien (adapte/protège, jamais diagnostique) ; Milo reste dans son couloir. À valider clone. // (ancien) ft-v587 : // 🗣️ Question guidée : PROMPT affiné (retour Michel « bien choisir les questions avec le tap ») — les réponses rapides sont RÉSERVÉES aux questions FACTUELLES/PRATIQUES à petit nombre de réponses (quand · fréquence · où · matériel · temps dispo · choix clair · oui-non) ; PAS de boutons pour les questions OUVERTES/personnelles/émotionnelles/« pourquoi » (là on laisse écrire librement). Sert la qualité (bon UX, pas de flicage) ET le coût (le tap étant gratuit ft-v586, Milo ne distribue pas de rounds gratuits à la pelle). Prompt-only, gated __FT_CLONE__, prod inchangée. // (ancien) ft-v586 : // 🗣️ QUESTION GUIDÉE — répondre à Milo est GRATUIT (retour Michel : « la question proposée ne rentre pas dans les questions gratuites ? »). Un tap sur une réponse rapide appelle `sendToCoach(t,null,{noQuota:true})` → ça NE consomme PAS une question gratuite et ne déclenche pas le mur premium (répondre à une question POSÉE PAR Milo ≠ TOI qui interroges). Le tap seul est gratuit ; une réponse TAPÉE à la main reste un message normal (compté) — évite l'abus « tout message après une question de Milo serait gratuit ». Toujours EN TEST SUR LE CLONE (gated __FT_CLONE__, prod inchangée). // (ancien) ft-v585 : 🗣️ QUESTION GUIDÉE (réponses rapides à taper) — EN TEST SUR LE CLONE (gated `__FT_CLONE__`, prod inchangée). Quand Milo pose UNE question, il peut proposer 2-4 réponses courtes tappables sous sa bulle → un tap = la réponse est envoyée (le champ texte reste toujours dispo). Milo émet un bloc caché ```json {"reponses":["Récent","Il y a des mois","Il y a des années"]}``` (clé `reponses` ajoutée à _stripCoachTech → jamais affiché). Frontend coach.js : `_extractQuickReplies`/`_appendQuickReplies` (chips), câblés dans sendToCoach (à côté séance/mémoire) + nettoyage des chips périmés au prochain envoi. Prompt (buildCoachContext) GATÉ `window.__FT_CLONE__` = ACTIF seulement sur le clone : garde-fous P17/P22/P23 (UNE question à la fois jamais un interrogatoire · réponses OPTIONNELLES · 1-4 mots · porte de sortie douce si perso · jamais un sondage · ne parle jamais du bloc). ⚠️ Émission = prompt → à valider iPhone sur le clone ; PROD inchangée (Milo n'émet pas le bloc hors clone). Frontend inoffensif en prod (ne fait rien sans bloc). // (ancien) ft-v584 : 📖 Guide de l'appli : diapo « Milo retient ce que tu lui confies 🧠 » (capture PROD de Michel → `guide/milo-memoire.jpg` 780px, doigt sur le bouton « Oui, retiens ») ajoutée à APP_GUIDE_SLIDES (app.js) après « Milo démarre ta séance » + PRECACHE. Clôture le ⏳ de la checklist #11 de ft-v583 (mémoire durable) → checklist 100% complète (pop-up + red dot + ? + aide détaillée + guide). // (ancien) ft-v583 : ✅ Checklist #11 pour la MÉMOIRE DURABLE (ft-v582, VALIDÉE sur iPhone/clone par Michel : la ligne « 🧠 Je retiens : tu as déjà eu une tendinite à l'épaule ? [Oui, retiens][Non] » apparaît bien sous la réponse de Milo). WHATS_NEW v38 🧠 « Milo retient ce que tu lui confies » + WHATS_NEW_MAX=38 (slots testeurs décalés v39/40/41) + red dot `milo-remember` (screen coach) + aide `?` Coach (🧠) + aide détaillée « Milo retient ce que tu lui confies » (coach.js). ⏳ Diapo du Guide de l'appli = à faire quand Michel fournit une capture prod propre. // (ancien) ft-v582 : 🧠 Cerveau de Milo, 2ᵉ PIÈCE — étape 2 : la MÉMOIRE DURABLE (profil conversationnel). Quand la personne confie un trait DURABLE en discutant (« je m'entraîne le matin », « que des haltères chez moi », une préférence forte, une contrainte de vie), Milo PROPOSE de le retenir pour de bon — avec VALIDATION (rien mémorisé sans accord, Principe 3). Mécanique (prompt + infra Observations réutilisée, 0 backend) : Milo termine son message par un bloc CACHÉ ```json {"retiens":["tu t'entraînes le matin…"]}``` (retiré de l'affichage par _stripCoachTech, clé "retiens" ajoutée à sa regex) → sous sa bulle, une ligne « 🧠 Je retiens : <trait> ? [Oui, retiens][Non] » par trait NOUVEAU → Oui = rangé en mémoire durable dans `S.registre.observations` (status:'validated', source:'conversation') → réutilise l'injection contexte (filtre validated → fait confirmé de buildCoachContext) + la page « Ce que Milo sait de toi ». Fonctions coach.js : `var _pendingMiloMemory`, `_slugTrait` (clé de dédup), `_extractMemory(reply)` (parse le bloc retiens), `_appendMemoryBtns(traits)` (filtre les clés déjà connues), `_confirmMiloMemory(idx,ok,btn)` (push observation + persist + _cloudSyncDebounced + _renderMiloKnows + toast) ; câblé dans sendToCoach (à côté de la séance ft-v578). Bloc prompt « RETENIR DURABLEMENT CE QUE TU APPRENDS » (buildCoachContext) : ne retenir qu'une info DURABLE et NOUVELLE, jamais un état du jour, jamais inventer, ne jamais parler du bloc. registre.observations déjà synchronisé cloud → 0 backend. ⚠️ L'ÉMISSION du bloc dépend du prompt → à valider sur iPhone (comme ft-v578). Rétrocompatible (pas de bloc → rien proposé). Testé Playwright. // (ancien) ft-v581 : ⚕️ TRT (traitement de testostérone PRESCRIT par un médecin) — option privée réservée à l'ADMIN pour l'instant (demande Michel : « juste pour moi, j'ai l'avis de mon médecin »). Toggle « ⚕️ Sous TRT (prescrit par un médecin) » dans Profil → Santé, visible SEULEMENT si `_isAdminUnlocked()` (setup.js `_renderHealthSection`/`toggleTrt`). Stocké dans `S.healthProfile.trt` → déjà privé + synchronisé cloud + restauré (0 backend). Milo (buildCoachContext, section PROFIL SANTÉ) : quand `hp.trt`, il ADAPTE l'entraînement/la récup/les attentes + rappelle le suivi médical & bilan sanguin, mais ⛔ NE conseille JAMAIS sur le traitement lui-même (dose/molécule/ajustement) — domaine EXCLUSIF du médecin, il y renvoie systématiquement ; n'encourage jamais un usage non prescrit. Contexte médical légitime, cadre de sécurité strict (cohérent Constitution : jamais de diagnostic, oriente vers un pro). Testé Playwright. — option privée réservée à l'ADMIN pour l'instant (demande Michel : « juste pour moi, j'ai l'avis de mon médecin »). Toggle « ⚕️ Sous TRT (prescrit par un médecin) » dans Profil → Santé, visible SEULEMENT si `_isAdminUnlocked()` (setup.js `_renderHealthSection`/`toggleTrt`). Stocké dans `S.healthProfile.trt` → déjà privé + synchronisé cloud + restauré (0 backend). Milo (buildCoachContext, section PROFIL SANTÉ) : quand `hp.trt`, il ADAPTE l'entraînement/la récup/les attentes + rappelle le suivi médical & bilan sanguin, mais ⛔ NE conseille JAMAIS sur le traitement lui-même (dose/molécule/ajustement) — domaine EXCLUSIF du médecin, il y renvoie systématiquement ; n'encourage jamais un usage non prescrit. Contexte médical légitime, cadre de sécurité strict (cohérent Constitution : jamais de diagnostic, oriente vers un pro). Testé Playwright. // (ancien) ft-v580 : 📖 Guide de l'appli : diapo « Milo démarre ta séance ⚡ » (capture iPhone de Michel → `guide/milo-seance.jpg` 780px, doigt sur le bouton « Commencer cette séance ») ajoutée à APP_GUIDE_SLIDES (app.js) après la diapo Coach + PRECACHE (sw.js). Clôture le ⏳ de la checklist #11 de ft-v579. // (ancien) ft-v579 : ✅ Checklist #11 pour « Milo → séance en 1 clic » (ft-v578, VALIDÉ sur iPhone Michel : bouton apparaît + séance injectée avec types É/X + 1RM + pré-remplissage). WHATS_NEW v37 ⚡ « Milo démarre ta séance » + WHATS_NEW_MAX=37 (slots testeurs décalés v38/39/40) + red dot `milo-start-session` (screen coach) + aide `?` Coach (⚡) + aide détaillée « Milo démarre ta séance » (coach.js). ⏳ Diapo du Guide de l'appli = à faire quand Michel fournit une capture. // (ancien) ft-v578 : ⚡ Milo → SÉANCE en 1 clic (demande Michel : « lors de la discussion avec Milo je fixe mon programme du jour et il l'intègre dans la séance direct »). Quand l'utilisateur fixe sa séance du jour (ou Milo la propose), Milo termine par un bloc caché ```json {"seance":{label,exs:[{name,sets:[{reps,kg,type}]}]}}``` (retiré de l'affichage par _stripCoachTech) → bouton « ⚡ Commencer cette séance » sous sa bulle → injecte direct dans l'écran Séance. `_extractDaySession`/`_appendStartSessionBtn`/`var _pendingMiloSessions` (coach.js, clé "seance" distincte du programme force "days"/"exs") + `_normalizeMiloSession`/`_startSessionFromMilo` (log.js : construit S.wkt.exs avec pré-remplissage par série via getPrev comme loadProgDay ; séance en cours → AJOUTE jamais n'écrase, règle #3 ; sinon nouvelle séance) + instruction dans buildCoachContext (format + « n'émets ce bloc que pour une séance à faire MAINTENANT »). Réutilise le mécanisme du programme force (ft-v225). Testé Playwright (extraction, normalisation, nouvelle séance + append, JSON caché de l'affichage, instruction dans le contexte, 0 erreur JS). // (ancien) ft-v577 : 🍽️ ESPRIT NUTRITION gravé (croisement Gemini + Mistral + Claude + synthèse Michel) — on cadre la philosophie AVANT de coder une brique. Cerveau de Milo (buildCoachContext, coach.js) : bloc « NUTRITION — UN LEVIER AU SERVICE DE L'OBJECTIF, JAMAIS UNE SOURCE DE STRESS » (levier pas finalité ; accès au coaching jamais conditionné = affine pas déverrouille ; précision au CHOIX qualitatif→portions→macros→suivi précis, jamais imposée ; anti-faux-précis = tendances + fourchettes ±20-50 % ; ton éducatif non culpabilisant « carburant/cycle/tendance » pas « bon/mauvais/triche » ; garde-fous santé < 1500/1200 kcal · perte > 1 %/sem · prot > 3 ou < 0,8 g/kg · < 2 repas/j → oriente vers un pro ; règle d'or P21 : jamais un stress > bénéfice). Gouvernance : CONSTITUTION-MILO **Principe 21** (v2.0) « une donnée ne doit jamais coûter plus qu'elle n'apporte » + nouveau doc `docs/NUTRITION-PHILOSOPHIE.md` (4 niveaux · Gardien nutrition · 1ʳᵉ brique = journal « à la portion » sur Open Food Facts + Nutri-Score/NOVA · couche future chronobiologie/montre). Prompt + docs, 0 backend, 0 feature codée (la 1ʳᵉ brique = étape suivante). Testé Playwright (bloc présent, principes précédents intacts, 0 erreur JS). // (ancien) ft-v576 : 🧭 « RÉPONDRE D'ABORD, PROPOSER ENSUITE » — l'absence d'une donnée est une OPPORTUNITÉ, jamais une erreur ni un blocage. buildCoachContext (coach.js) : Milo répond D'ABORD avec ce qu'il a (profil incomplet = jamais un blocage), PUIS à la fin seulement propose UNE piste d'amélioration si elle apporte une vraie valeur (« si tu renseignes ta nutrition, je pourrai affiner »), jamais un reproche ; une seule suggestion à la fois ; + FIABILITÉ : n'exploite nutrition/journal/tracker que s'il est FIABLE (un suivi sporadique ne pilote pas les conclusions). Corollaire du Principe 19 (pertinence appliquée à ce que Milo DEMANDE) → gravé aussi dans CONSTITUTION-MILO P19. Prompt-only, 0 backend, rétrocompatible. Testé Playwright (bloc présent, principes précédents intacts, 0 erreur JS). // (ancien) ft-v575 : 🧭 PRINCIPE DE CONCEPTION gravé : « La pertinence avant la disponibilité » (+ « la cohérence avant la réactivité ») — né du sujet IMC, croisement Michel + GPT + Gemini + Mistral + Claude. DEUX ÉTAGES : ① Milo RAISONNE (buildCoachContext, coach.js) — bloc « CHOISIR LES BONNES DONNÉES » : une donnée n'est utilisée que si elle AMÉLIORE la décision (pas parce qu'elle existe) ; pertinence contextuelle (ex. IMC secondaire chez un sportif sec → masse grasse/tour de taille/WHtR/tendance ; utile chez un sédentaire) ; pertinence ≠ minimalisme (croiser plusieurs données OK) ; transparence CIBLÉE (expliquer quand ça compte, pas à chaque message) + bloc « LA COHÉRENCE AVANT LA RÉACTIVITÉ » (raisonner sur les tendances, pas le bruit : 84,8→84,5 kg = bruit ; 6 sem de stagnation = signal). ② Le GARDIEN PROTÈGE (_gardienRules, coach.js) — SEUILS ABSOLUS de sécurité qui s'allument TOUJOURS (IMC ≥ 40 · tour de taille > 120 cm), vigilance jamais diagnostic ; le Gardien s'active désormais même sans blessure. Gravé aussi : CONSTITUTION-MILO Principes 19 & 20 (v1.9) + docs/MOTEUR-RAISONNEMENT-MILO. ⏳ Couche future : veille longitudinale signaux faibles + montre connectée (non collectées). Prompt + 2 seuils, 0 backend, rétrocompatible. Testé Playwright (blocs présents ; Gardien vigil IMC≥40 se déclenche même sans blessure ; silencieux si rien ; 0 erreur JS). // (ancien) ft-v574 : 🎯 Milo connaît enfin tes OBJECTIFS CHIFFRÉS (retour Michel : il a « piégé » Milo — l'objectif de force 130 kg au couché + le poids objectif n'étaient PAS envoyés au cerveau ; Milo parlait du record au lieu de la vraie cible). `buildCoachContext` (coach.js) : nouveau bloc « OBJECTIFS FIXÉS PAR L'ATHLÈTE » = objectifs de FORCE par exercice (`S.strengthGoals`, ft-v559) avec le 1RM actuel + l'écart (« Développé Couché: objectif 130 kg (actuel ~100 kg, encore ~30 kg) ») + le POIDS objectif (`S.targetWeight`, ft-v229) vs poids actuel. Consigne : sur « est-ce atteignable / combien de temps », s'appuyer sur cible+1RM actuel, donner une estimation RÉALISTE et honnête (~2-5 kg/mois sur un gros mouvement, jamais linéaire), expliquer ce qui accélère/freine, ne JAMAIS promettre de date. Anti-fuite VC (`_vcApplyPersona` reset `S.strengthGoals`). Cerveau 1 = COMPRENDRE (les objectifs font partie de qui est la personne). Prompt-only, 0 backend, rétrocompatible. Testé Playwright (objectif force + écart + poids objectif présents dans le contexte Milo, absents si non fixés, 0 erreur JS). // (ancien) ft-v573 : 🧠 Cerveau de Milo, 2ᵉ PIÈCE (Cerveau 1 = COMPRENDRE) : le PROFIL CONVERSATIONNEL — étape 1 « le comportement » (prompt-only, validé Michel). buildCoachContext (coach.js) enrichi d'un bloc « APPRENDRE À CONNAÎTRE LA PERSONNE EN DISCUTANT » : profil VIVANT (s'enrichit au fil des échanges, pas besoin d'un questionnaire rempli) · pose LA bonne question au bon moment (1 seule à la fois, seulement si l'info manque ET change le conseil, aide d'abord — cohérent « moins mais mieux ») · ÉCOUTE ET MONTRE QU'IL RETIENT (prend en compte ce que la personne confie : horaires/matériel/préférences/travail de nuit → adapte) · RELIE la nouvelle info à ce qu'il sait déjà (profil/ADN/historique/récup) · RESPECTE le rythme (s'efface si la personne veut juste agir, jamais un interrogatoire). Concrétise le Principe 18 (« le profil est vivant, jamais complet »). Prompt-only, 0 backend, invisible (comme ft-v571/572), rétrocompatible. ⏳ Étape 2 (plus tard) = mémoire DURABLE de ce que Milo apprend (extraction + validation, façon Observations). Doc : `docs/MOTEUR-RAISONNEMENT-MILO.md`. Testé Playwright (bloc présent dans le contexte Milo, 0 erreur JS). // (ancien) ft-v572 : 🧠 Cerveau de Milo, 1ʳᵉ PIÈCE : exercices « ANCRE » vs « ACCESSOIRE » (connaissance métier du Cerveau 2, brique du moteur de raisonnement ft-v571). Nouveau `_exRole(name)` (log.js, 0 IA, déterministe) dérivé du schéma moteur (`_movPattern`) : ANCRE = grand polyarticulaire de base qui porte la progression (squat/hip-hinge/poussée horiz.+vert./tirage horiz.+vert.) ; ACCESSOIRE = isolation/mouvement secondaire (curls, extensions, élévations, leg curl/ext, mollets, écarté/pec deck, fentes, gainage) ; garde-fou isolation (écarté/pec deck/croisé poulie/pull-over/face pull → accessoire même dans un schéma poussée/tirage) ; exo inconnu → accessoire (prudent). `buildCoachContext` (coach.js) : ① bloc de connaissance « STRUCTURER UN PROGRAMME — ANCRE vs ACCESSOIRE » (construire AUTOUR des ancres, priorité = ancre + accessoires ciblés, stagnation ancre ≠ manque de volume accessoire) ; ② chaque exo de la SÉANCE EN COURS étiqueté [ancre]/[accessoire]. Prompt + helper déterministe (0 backend, invisible à l'utilisateur comme ft-v571). Rétrocompatible. Testé Playwright (_exRole correct sur ~15 exos, bloc + étiquettes dans le contexte Milo, 0 erreur JS). // (ancien) ft-v571 : 🧠 Le MOTEUR DE RAISONNEMENT de Milo (base, prompt-only) — réflexion fondatrice de Michel (du « générateur de programmes » au « raisonnement »). Enrichi buildCoachContext (coach.js) : bloc « SAVOIR RAISONNER AVEC L'INFO DISPONIBLE — ET SAVOIR S'ARRÊTER » (fiabilité AVANT intelligence) = pipeline COMPRENDRE → DIAGNOSTIQUER (la CAUSE probable parmi fréquence/volume/intensité/technique/choix d'exercices/récup/nutrition/régularité/progression/priorité, viser 1-2 causes) → décider → EXPLIQUER ; décider avec les infos d'AUJOURD'HUI (profil VIVANT, jamais complet) ; ⛔ ne jamais faire semblant de savoir (meilleure décision + confiance honnête + dire ce qui limite + 1-2 questions utiles ; posture « Avec ce que je sais, je te conseille X aujourd'hui. Si tu me dis Y et Z, j'affinerai ») ; pas toujours UNE bonne réponse ; savoir S'ARRÊTER (ne pas surinterpréter). Gouvernance : CONSTITUTION-MILO Principe 18 (v1.8) + doc `docs/MOTEUR-RAISONNEMENT-MILO.md` (boussole du « cerveau de Milo » : chaque brique = une PIÈCE du moteur). Prompt-only (0 backend). Chaque future brique (ancre/accessoire, observations, profil conversationnel, générateur) = une pièce de ce moteur. Testé Playwright (contexte Milo contient le bloc, 0 erreur JS). // (ancien) ft-v570 : Fin du polish Progrès (3 derniers retours GPT) : ① liste d'exos des cartes d'historique DÉPLIABLE (clampée 2 lignes + bouton « voir tout ›/replier ▴ » si >4 exos ou >70 car, `toggleSessExs`, sans ouvrir le détail) ② FIGURINE musculaire plus GRANDE sur les cartes (32→46px) ③ libellé Accueil « Big 3 · 1RM » → « Force · Squat+DC+SDT » (nomme les 3 mouvements, plus clair que le jargon « Big 3 »). Fichiers : setup.js (renderSessions + toggleSessExs), style.css (.sess-exs2.expanded/.sess-exs-more), screens.js. Polish (pas de pop-up). Testé Playwright + captures (déplier/replier, figurine 46px, tuile relibellée, 0 erreur JS). // (ancien) ft-v569 : priorités musculaires Phase 1 ; (demande Michel sur les vrais programmes de Cyril Staal, validé GPT — « améliore la qualité du coaching, pas un gadget »). L'utilisateur choisit jusqu'à 2 muscles à développer EN PRIORITÉ (Profil → Objectif, `S.priorities` [] max 2, ft4_priorities) → injecté dans buildCoachContext → Milo donne plus de fréquence/volume/variantes à ces muscles (conseils + programmes générés), l'objectif reste le pilote, la nutrition n'est PAS touchée. `PRIORITY_MUSCLES` (10 groupes) + `togglePriority`/`_renderPriorities` (setup.js), section `#priorities-section` (chips rouges) sous la priorité complémentaire. Cloud : payload + restore + backend Code.js `_pa_` (auto-déployé). Reset harnais VC. La carte des 4 axes (objectif/priorité complémentaire/morpho/priorités musculaires) gravée dans IDEES-FUTURES. Phase 2 (Milo SUGGÈRE depuis la progression) → future brique Observations. Checklist #11 : WHATS_NEW v36 💪 + red dot muscle-priorities + aides ?/détaillée. Testé Playwright + captures jour/nuit (max 2, toggle, injection Milo, 0 erreur JS). // (ancien) ft-v568 : deux objectifs ; (demande Michel, validé GPT — option A). L'objectif PRINCIPAL (`S.goal`) pilote la nutrition comme avant ; la priorité complémentaire (`S.goal2`, ft4_goal2) ne touche PAS la nutrition, elle affine SEULEMENT Milo + l'entraînement (injecté dans buildCoachContext). UI Profil → Objectif : en-tête « 🎯 Objectif principal » (grille existante) + section « 💡 Priorité complémentaire » (`_renderGoal2`/`setGoal2`/`_goal2Options`, setup.js) = chips des objectifs COMPATIBLES (masque les incompatibles) + phrase « la nutrition suit uniquement le principal » + nudge recomposition si principal muscle/perte. `_goal2Options` : muscle/perte → exclut l'opposé (→ recompo), recomp → exclut muscle+perte. Cloud : payload + restore + backend Code.js `_ps_` (auto-déployé). Reset dans le harnais VC. Checklist #11 : WHATS_NEW v35 🎯 + red dot goal2 (setup/menu-row-profil) + aides ?/détaillée. Testé Playwright + captures jour/nuit (options masquées, nudge, toggle, 0 erreur JS). // (ancien) ft-v567 : tous les muscles cliquables ; (retour Michel : dorsaux/biceps/triceps/avant-bras/tibia n'étaient pas tapables). 4 nouvelles zones de douleur (dorsaux, biceps, triceps, avant-bras) + tibialis→mollet. Branché partout : `_GRP2PAIN` (log.js, +lats/biceps/triceps/forearms/tibialis), `_DAY_ZONES` (screens.js), `_ZL` bandeau (tracking.js), Gardien de Milo `_GARDIEN_ZONE`/`_GARDIEN_ZLABEL`/`_gardienZonesFromText` (coach.js). Nuque reste en bouton (pas un muscle) ; le dos est couvert sur la figurine (dorsaux + bas du dos). Testé Playwright (15 zones muscles cliquables, muscles s'allument rouge, 0 erreur JS). // (ancien) ft-v566 : discipline Powerbuilding ; (demande Michel) : 5ᵉ option du Profil → Discipline (mélange force athlé + bodybuilding : soulever lourd ET construire du muscle). Bouton `disc-powerbuilding` (index.html, icône barre + étincelle) + `DISC_LABELS.powerbuilding`/`DISC_DESCS.powerbuilding` + ajout à la liste de `setDiscipline` (setup.js) → injecté au Coach Milo via DISC_LABELS. Aide ? Profil mise à jour. Testé Playwright + capture (5 boutons, powerbuilding sélectionnable, desc OK, 0 erreur JS). // (ancien) ft-v565 : schéma douleurs (figurine anatomique) ; — RÉUTILISE la vraie figurine anatomique (retour Michel : « pourquoi pas cette figurine ? »). Dans « Ton check-in du jour » (Accueil), pour signaler une gêne on tape directement le MUSCLE sur la figurine `_painFig` (dérivée de `_mscSVG`, VUE AVANT/ARRIÈRE, `_FP`/`_BP`/`_MG`) → il passe en ROUGE ; mapping `_GRP2PAIN` (groupe muscle → zone douleur, adducteurs séparés des fléchisseurs), onclick=toggleDayPain. Les ARTICULATIONS (nuque/coude/poignet/genou/cheville, pas des muscles) restent en boutons compacts dessous. Sélecteur G/D/Les 2 inchangé. ⚠️ 1ʳᵉ version (mon bonhomme SVG crude) rejetée par Michel « super pas pro » → remplacée par la vraie figurine. Checklist #11 : WHATS_NEW v34 🩹 + red dot pain-body (home/home-daystate) + aide ? Accueil + aide détaillée. Testé Playwright + captures jour/nuit (pectoraux/bas du dos rouges, articulations en boutons, 0 erreur JS). // (ancien) ft-v564 : « Pourquoi ce score ? » ; Lien tappable sous la carte récup de l'Accueil (_renderHomeHero, screens.js) → feuille `#ov-reco-why` (poignée glissable ft-v551) : gros score + « à quel point ton corps est prêt à s'entraîner », puis CHAQUE facteur (sommeil/séance récente/âge/jours enchaînés/tabac/cycle/forme du jour) avec sa raison EN CLAIR (nouveau champ `why` sur chaque facteur de `calcRecoveryDetail`) + son +/−, conseil du jour, « ton ressenti prime toujours ». `openRecoWhy`/`closeRecoWhy`. Checklist #11 : WHATS_NEW v33 💡 + red dot `reco-why` (home/home-hero) + aide ? Accueil + aide détaillée. Testé Playwright + capture (4 facteurs expliqués, score 49/Modéré, 0 erreur JS). // (ancien) ft-v563 : filtre historique par présence ; — une séance apparaît sous « Pectoraux » dès que le pec y est TRAVAILLÉ (score ≥2 = primaire ≥1 exo), même si le muscle DOMINANT (= titre de la carte) est autre (ex. Push épaule-dominante → visible sous Pectoraux). `_sessMusclesPresent(s)` (setup.js) ; le filtre teste `.includes(code)`. Chips inchangés = muscles DOMINANTS (jeu compact, évite 15 chips). Titre de carte = dominant (inchangé). Testé Playwright (Push front-delt-dominant + pec présent → apparaît sous Pectoraux, jambes exclues, 0 erreur JS). // (ancien) ft-v562 : favoris en tête de recherche ; dans le sélecteur d'exercices en séance (filterEx, log.js), les résultats de recherche sont triés par FRÉQUENCE d'utilisation (comptée sur S.sessions via `_exUsageMap`) → les exos les plus utilisés remontent en tête (tri stable → alpha conservé à usage égal). Les habitués (≥3 utilisations, `_exFavSet`) reçoivent une petite ★ dorée (via `_exPickRow`, visible aussi en vue groupe). Aucune donnée touchée, pas de persistance (usage recalculé à l'ouverture). Checklist #11 : WHATS_NEW v32 🔎 (couvre le lot cartes+filtre+favoris) + red dots `sess-filter`/`ex-favorites` + aides ?/détaillée. Testé Playwright (exo utilisé 4× remonte en #1 avec ★, reste alpha, 0 erreur JS). // (ancien) ft-v561 : filtre historique par groupe musculaire ; rangée de chips (« Tous » + un chip par muscle PRINCIPAL présent dans l'historique, triés par fréquence) sous le titre « Historique séances » → tape un muscle = ne montre que les séances dont le muscle dominant correspond. `_sessFilter` (état module, non persisté), `_sessTopMuscle(s)` (via `_mscScores`), `setSessFilter(code)`, filtrage dans renderSessions AVANT le slice(20). Chips masqués si <2 muscles présents ; garde-fou si le muscle filtré disparaît → repasse « Tous » ; index `showSessMuscleMap` via `S.sessions.indexOf(s)` (robuste au filtre). CSS `#sess-filter`/`.sessf-chip`/`.sessf-chip.on` (accent rouge). Div `#sess-filter` dans index.html. Testé Playwright (chips triés fréquence, filtrage → n cartes du bon muscle, Tous rétablit, 0 erreur JS ; capture OK).
const PRECACHE = [
  './', './index.html', './style.css', './confidentialite.html',
  './constants.js', './state.js', './screens.js', './log.js',
  './setup.js', './tracking.js', './coach.js', './app.js', './food-health.js',
  './manifest.json', './logo.png', './female-body.png',
  // Librairie PDF (hébergée en local pour marcher hors-ligne — chargée à la demande)
  './lib/jspdf.umd.min.js', './lib/jspdf.plugin.autotable.min.js',
  // Lecteur Excel (SheetJS, local) — import de fichiers balance .xlsx/.xls, chargé à la demande
  './lib/xlsx.full.min.js',
  // Lecteur code-barres (ZXing, local) — scan produit dans le journal alimentaire, chargé à la demande
  './lib/zxing.min.js',
  // Polices (hébergées localement — plus de dépendance Google Fonts)
  './fonts/manrope-variable.woff2', './fonts/spacegrotesk-variable.woff2', './fonts/pacifico-400.woff2',
  './force-tracker-logo-gray.png', './force-tracker-logo-splash.gif', './force-tracker-logo-topbar.gif', './force-tracker-logo-final.png',
  // Captures d'écran du guide-film (Menu → Guide de l'application)
  './guide/home.jpg','./guide/etat-du-jour.jpg','./guide/profil.jpg','./guide/seance.jpg',
  './guide/programmes.jpg','./guide/progres.jpg','./guide/bilan.jpg','./guide/coach.jpg','./guide/milo-seance.jpg','./guide/milo-memoire.jpg',
  // Photos accessoires (Guide de la muscu → Matériel) — les fichiers absents ne sont PAS listés ici (sinon l'install du SW échoue)
  './accessoires/ceinture-souple.jpg','./accessoires/ceinture-cuir-levier.jpg','./accessoires/ceinture-cuir-ardillon.jpg',
  './accessoires/sangles.jpg','./accessoires/genouilleres.jpg','./accessoires/chaussures.jpg',
  './accessoires/wrist-wraps.jpg','./accessoires/magnesie-bloc.jpg','./accessoires/magnesie-liquide.jpg',
  // Muscles SVG + PNG
  './muscles/abs.svg','./muscles/arms.svg','./muscles/back.svg','./muscles/calves.svg',
  './muscles/chest.svg','./muscles/glutes.svg','./muscles/legs.svg','./muscles/shoulders.svg',
  // Icônes muscle réalistes (vignettes programme + picker)
  './muscles/muscle pectoreaux.png','./muscles/muscles dorsaux trapeze.png','./muscles/epaule trapeze.png',
  './muscles/muscle bras.png','./muscles/muscle avant cuisse.png','./muscles/fessiers ischios.png',
  './muscles/muscle abdominaux.png','./muscles/muscle mollet.png',
  // GIFs exercices pectoraux + fessiers
  './exercises/developpe-couche.webp',
  './exercises/developpe-couche-halteres-exercice-musculation.webp',
  './exercises/developpe-couche-smith-machine.webp',
  './exercises/developpe-decline-barre.webp',
  './exercises/developpe-incline-barre.webp',
  './exercises/ecarte-poulie-vis-a-vis-exercice-musculation-pectoraux.webp',
  './exercises/ecartes-decline-avec-halteres.webp',
  './exercises/pec-deck-butterfly-exercice-musculation.webp',
  './exercises/developpe-incline-halteres-exercice-musculation.webp',
  './exercises/ecartes-poulie-vis-a-vis.webp',
  './exercises/developpe-machine-assis-pectoraux.webp',
  './exercises/developpe-incline-machine-convergente-exercice-musculation.webp',
  './exercises/dips-pectoraux.webp',
  './exercises/glute-bridge.webp',
  // Fessiers / Ischios / Jambes / Soulevés de terre
  './exercises/souleve-de-terre.webp','./exercises/souleve-de-terre-sumo.webp','./exercises/rack-pull.webp',
  './exercises/good-morning-exercice.webp','./exercises/extension-lombaire-au-banc-45.webp',
  './exercises/homme-faisant-un-squat-avec-barre.webp','./exercises/front-squat-avec-halteres.webp',
  './exercises/squat-goblet-kettlebell.webp','./exercises/squat-sumo-avec-haltere.webp','./exercises/fente-avant-barre-femme.webp',
  './exercises/leg-curl-allonge.webp','./exercises/leg-curl-assis-machine.webp',
  './exercises/souleve-de-terre-jambes-tendues.webp','./exercises/souleve-de-terre-roumain-kettlebell.webp','./exercises/souleve-de-terre-roumain-landmine.webp',
  './exercises/deadlift-sumo-halteres-exercice-jambes-fessiers.webp','./exercises/souleve-de-terre-sumo-kettlebell.webp','./exercises/souleve-de-terre-sumo-landmine.webp',
  './exercises/souleve-de-terre-a-la-trap-bar.webp','./exercises/souleve-de-terre-avec-deficit.webp','./exercises/souleve-de-terre-avec-machine.webp',
  './exercises/zercher-deadlift.webp','./exercises/reeves-deadlift.webp','./exercises/glute-ham-developer-ghd.webp','./exercises/kettlebell-swing.webp',
  './exercises/squat-pistol.webp','./exercises/kettlebell-back-squat.webp','./exercises/fentes-avant-kettlebell.webp',
  './exercises/leg-curl-avec-elastique-musculation.webp','./exercises/leg-curl-decline-haltere.webp','./exercises/leg-curl-inverse-machine-tirage-vertical.webp','./exercises/leg-curl-unilateral-debout-machine.webp',
  // Dos / Trapèzes / Lombaires
  './exercises/rowing-barre.webp','./exercises/rowing-haltere-un-bras.webp','./exercises/tirage-horizontal-poulie.webp',
  './exercises/rowing-assis-machine-prise-pronation.webp','./exercises/rowing-assis-machine-hammer-strenght.webp','./exercises/rowing-halteres-banc-incline-prise-neutre.webp',
  './exercises/tirage-vertical-poitrine.webp','./exercises/tirage-vertical-prise-serree.webp','./exercises/tirage-horizontal-prise-large.webp',
  './exercises/traction-musculation-dos.webp','./exercises/traction-assistee-machine.webp','./exercises/traction-prise-neutre.webp',
  './exercises/pullover-haltere.webp','./exercises/musculation-pull-over-assis-machine.webp',
  './exercises/shrug-barre.webp','./exercises/shrugs-avec-halteres.webp','./exercises/shrug-poulie-haussement-epaules.webp',
  './exercises/extension-lombaire-a-la-machine.webp',
  './exercises/rowing-smith-machine.webp','./exercises/rowing-t-bar-machine.webp','./exercises/rowing-barre-t-landmine.webp',
  './exercises/bent-over-row-avec-halteres.webp','./exercises/rowing-unilateral-landmine-meadows-row.webp','./exercises/seal-row-halteres.webp','./exercises/renegade-row.webp',
  './exercises/tirage-avant-iso-laterale-hammer-strength.webp','./exercises/tirage-incline-poulie-haute.webp','./exercises/tirage-vertical-prise-inversee.webp',
  './exercises/traction-barre-derriere-rear-oull-up.webp','./exercises/rocky-pull-up.webp','./exercises/sled-pull.webp',
  './exercises/pull-over-barre.webp','./exercises/pull-over-poulie.webp','./exercises/superman.webp','./exercises/overhead-shrug.webp',
  // Cuisses / Quadriceps
  './exercises/squat-bulgare-halteres-exercice-musculation.webp','./exercises/squat-smith-machine-exercice-musculation.webp','./exercises/leg-extension-exercice-musculation.webp',
  './exercises/fentes-marchees-avec-sandbag.webp','./exercises/split-squat-smith-machine.webp','./exercises/hip-thrust-a-la-machine.webp','./exercises/marche-du-fermier-avec-kettlebells.webp',
  './exercises/leg-extension-iso-lateral-unilateral-hammer-strenght.webp','./exercises/hack-squat-inverse.webp','./exercises/pendulum-squat.webp','./exercises/belt-squat.webp','./exercises/safety-bar-squat.webp',
  './exercises/overhead-squat.webp','./exercises/pin-squat.webp','./exercises/sissy-squat.webp','./exercises/cossack-squat.webp','./exercises/squat-bande-elastique.webp',
  './exercises/squat-statique-contre-mur-exercice-chaise.webp','./exercises/presse-cuisse-iso-laterale-hammer-stenght.webp','./exercises/sled-push-hyrox.webp','./exercises/croix-de-fer-halteres.webp',
  './exercises/leg-abduction-machine.webp','./exercises/leg-adduction-machine.webp',
  './exercises/chest-press-machine-declinee.webp','./exercises/dips-triceps-paralleles.webp','./exercises/montees-banc-lateral-halteres.webp',
  './exercises/dips-assiste-machine.webp','./exercises/developpe-nuque-barre-guidee.webp',
  './exercises/dips-assis-machine-avec-poids.webp',
  // Épaules + Trapèzes (lot 2026-07-06)
  './exercises/developpe-arnold-exercice-musculation.webp','./exercises/developpe-epaule-halteres.webp','./exercises/developpe-militaire-exercice-musculation.webp',
  './exercises/elevation-laterale-machine.webp','./exercises/elevations-frontales-exercice-musculation.webp','./exercises/elevations-laterales-exercice-musculation.webp',
  './exercises/elevations-laterales-poulie.webp','./exercises/face-pull.webp','./exercises/pec-deck-inverse.webp',
  './exercises/presse-epaule-exercice-musculation.webp','./exercises/elevation-en-y-a-la-poulie.webp','./exercises/oiseau-assis-sur-banc.webp',
  './exercises/tirage-menton-machine-guidee.webp','./exercises/tirage-menton-avec-kettlebell.webp','./exercises/developpe-epaule-avec-kettlebell.webp',
  './exercises/developpe-landmine.webp','./exercises/ecarte-arriere-elastique.webp','./exercises/elevation-frontale-allongee-a-la-barre.webp',
  './exercises/elevation-laterale-a-la-poulie-en-inclinaison.webp','./exercises/elevation-laterale-landmine-exercice-musculation.webp','./exercises/elevation-laterales-avec-kettlebell.webp',
  './exercises/exercice-rotation-interne-epaule-elastique-renforcement-coiffe-rotateurs-prevention-blessures-musculation.webp','./exercises/face-pull-couche-a-la-poulie.webp','./exercises/oiseau-a-la-poulie-a-45.webp',
  './exercises/passage-depaule-avec-elastique.webp','./exercises/rotation-externe-de-epaule-en-abduction.webp','./exercises/rotation-externe-epaule-exercice-renforcement-elastique.webp',
  './exercises/rotation-interne-a-90-a-la-poulie.webp',
  // Épaules + Trapèzes — 2e partie (lot 2026-07-06)
  './exercises/developpe-epaules-smith-machine.webp','./exercises/elevation-frontale-poulie-basse.webp','./exercises/elevation-frontale-banc-incline.webp',
  './exercises/elevation-laterale-incline-haltere.webp','./exercises/rotation-externe-epaule-haltere.webp','./exercises/tirage-menton-avec-elastique.webp',
  './exercises/thruster.webp','./exercises/thruster-kettlebell.webp','./exercises/russian-twist-avec-developpe-epaule.webp',
  './exercises/shoulder-press-machine.webp',
  // Images machines press jambes
  './machine/press-jambes-1.png','./machine/press-jambes-2.jpg','./machine/press-jambes-3.jpg',
  './machine/press-jambes-4.jpg','./machine/press-jambes-5.jpg','./machine/press-jambes-6.jpg',
  // Anatomie
  './anatomy/corps entier/schema homme entier face avant arriere et côté.png',
  './anatomy/pectoreaux/schema pectoreaux.png',
  './anatomy/dos_dorsaux/schema dorsaux arriere + trapeze.png',
  './anatomy/epaules/schéma epaule arriere.png',
  './anatomy/bras biceps triceps/schema muscles bras et avant bras.png',
  './anatomy/abdominaux/schema abdominaux.png',
  './anatomy/jambes/jambes avant/jambes face avant.png',
  './anatomy/jambes/jambes arrieres mollets/arriere cuisses mollets.png',
  './anatomy/fessiers lombaires/schema lombaires fessiers.png',
  './anatomy/Vue des Nerfs/vue nerf.png',
  './anatomy/Vue des Os avec nerfs sciatiques/os et nerfs.png',
];

// Sentinelle de « santé du cache » : un fichier du CORE (précaché à l'install). S'il manque, c'est
// que le cache a été vidé (iOS/manuel) → on réinstalle le CORE (rapide). ⚠️ NE PAS pointer sur
// une figurine (le CORE seul ne les contient pas → fausse « absence »). Fix 2026-07-13.
const PRECACHE_SENTINEL = './style.css';

// ── DEUX TIROIRS SÉPARÉS (fix 2026-07-16, demande Michel) ─────────────────────
// CACHE (versionné, tout en haut) = le CODE (html/js/css/polices/libs/logos) : petit, change à
//   chaque mise à jour → renouvelé à chaque version (garantit qu'on reçoit bien le nouveau code).
// IMG_CACHE (nom STABLE ci-dessous) = les IMAGES (exercices/anatomie/guide/accessoires/muscles) :
//   ~15 Mo, ne changent quasi jamais. Ce tiroir n'est JAMAIS vidé par une mise à jour → les images
//   sont téléchargées UNE SEULE FOIS (1re install) puis CONSERVÉES sur le téléphone. Fini le
//   re-téléchargement des 15 Mo à chaque MAJ (qui mangeait la data et saturait la 4G).
const IMG_CACHE = 'ft-images';
const IMG_RE = /\/(exercises|anatomy|guide|accessoires|muscles)\//;
const IMG_ASSETS = PRECACHE.filter(u => IMG_RE.test(u));

// Fichiers ESSENTIELS (code + polices + libs + logos) — petits → install RAPIDE.
// ⚠️ On ne bloque PAS l'install sur les ~15 Mo d'images : sur iOS/5G ça faisait traîner/échouer
// l'install → skipWaiting jamais atteint → utilisateur COINCÉ sur l'ancienne version (bug 2026-07-13).
const CORE = PRECACHE.filter(u => !IMG_RE.test(u));
async function precacheCore(){
  const cache = await caches.open(CACHE);
  for (const url of CORE){ try { await cache.add(url); } catch (e) {} }
}

// Télécharge SEULEMENT les images MANQUANTES dans le tiroir stable IMG_CACHE, une par une, en
// notifiant la progression (barre « 📦 Installation… X% »). Résumable. La barre n'apparaît donc
// QUE quand il y a vraiment quelque chose à télécharger : 1re installation, ou nouvelles figurines
// ajoutées. Sur une mise à jour normale (images déjà présentes) → rien à faire, AUCUNE barre, 0 data.
async function precacheImages(){
  const cache = await caches.open(IMG_CACHE);
  const missing = [];
  for (const url of IMG_ASSETS){ if (!(await cache.match(url))) missing.push(url); }
  if (!missing.length){                          // tout est déjà là → pas de barre
    const clients = await self.clients.matchAll({includeUncontrolled:true});
    clients.forEach(c => c.postMessage({type:'PRECACHE_DONE', done:1, total:1}));
    return;
  }
  const total = missing.length;
  let done = 0;
  const notify = async (type) => {
    const clients = await self.clients.matchAll({includeUncontrolled:true});
    clients.forEach(c => c.postMessage({type, done, total}));
  };
  for (const url of missing){
    try { await cache.add(url); } catch (err) { /* asset manquant sur le serveur → on continue */ }
    done++;
    if (done === total || done % 4 === 0) await notify('PRECACHE_PROGRESS');
  }
  await notify('PRECACHE_DONE');
}
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    await precacheCore();      // rapide : uniquement le code (+ polices, libs, logos)
    await self.skipWaiting();  // → la nouvelle version s'active immédiatement, sans attendre les images
  })());
});

// Messages venant de l'app :
//  - REPRECACHE      : réinstalle TOUT de force (bouton « Vider le cache ») → montre la barre.
//                      C'est EXPLICITE : l'utilisateur le déclenche (à faire en wifi de préférence).
//  - ENSURE_PRECACHE : envoyé à chaque ouverture. Répare le CORE (code) si le cache a été vidé, PUIS
//                      lance l'installation COMPLÈTE des images en arrière-plan AVEC la barre
//                      « 📦 Installation… X% » — SEULEMENT si le marqueur FULL_MARKER manque (donc
//                      1 fois par version = à chaque mise à jour). Résumable : reprend là où ça s'est
//                      arrêté, saute ce qui est déjà en cache. (Choix Michel 2026-07-15 : barre auto à
//                      chaque MAJ, compromis assumé vs data mobile — la lecture bilan/import passe
//                      désormais par le serveur Cloudflare, plus par Google, donc moins de contention.)
self.addEventListener('message', e => {
  const t = e.data && e.data.type;
  if (t === 'REPRECACHE') {
    // « Vider le cache » (explicite) → tout réinstaller : code + images (les images ont été vidées).
    e.waitUntil((async () => { await precacheCore(); await precacheImages(); })());
  } else if (t === 'ENSURE_PRECACHE') {
    e.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      const coreOk = await cache.match(PRECACHE_SENTINEL);
      if (!coreOk) { await precacheCore(); }        // cache CODE vidé → répare le code d'abord (rapide)
      await precacheImages();                        // télécharge les images MANQUANTES → barre SI besoin, sinon rien
    })());
  }
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({includeUncontrolled:true}).then(clients =>
        clients.forEach(c => c.postMessage({type:'SW_UPDATED'}))
      ))
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Requêtes externes (Apps Script, Google Fonts, etc.) : réseau uniquement
  if (url.origin !== self.location.origin) return;

  // Navigation HTML : cache d'abord (instantané) + mise à jour silencieuse en fond
  // → ouverture immédiate depuis le cache même sans réseau ou réseau lent
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        // Revalidation en arrière-plan — met à jour le cache pour la prochaine ouverture
        const netFetch = fetch(e.request).then(r => {
          if (r && r.status === 200) {
            const cl = r.clone();
            caches.open(CACHE).then(c => c.put(e.request, cl));
          }
          return r;
        }).catch(() => null);
        // Cache dispo → affiche immédiatement, réseau en fond
        if (cached) { netFetch.catch(() => {}); return cached; }
        // Pas de cache (1re installation) → attend le réseau
        return netFetch.then(r => r || caches.match('./'));
      })
    );
    return;
  }

  // logo.png : réseau d'abord (toujours à jour), cache en fallback offline
  if (url.pathname.endsWith('/logo.png')) {
    e.respondWith(
      fetch(e.request).then(r => {
        if (r && r.status === 200) { const cl=r.clone(); caches.open(CACHE).then(c => c.put(e.request, cl)); }
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Autres assets locaux : cache d'abord (cherche dans les DEUX tiroirs), réseau en fallback.
  // Au téléchargement à la demande : les images vont dans IMG_CACHE (stable), le reste dans CACHE.
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r && r.status === 200) {
          const cl=r.clone();
          const target = IMG_RE.test(url.pathname) ? IMG_CACHE : CACHE;
          caches.open(target).then(c => c.put(e.request, cl));
        }
        return r;
      });
    })
  );
});
