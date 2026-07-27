/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
const CACHE = 'ft-v624'; // 🛡️ ft-v624 = AUDIT SÉCURITÉ/ROBUSTESSE (demande Michel, fait en autonomie — uniquement les fixes SANS risque). ① XSS chat : renderCoachMsg échappe & < > AVANT le markdown → une balise HTML dans une réponse IA (ex. glissée via un document importé piégé) s'affiche comme du texte, ne s'exécute JAMAIS (gras/listes/partage PDF intacts). ② XSS carte Milo Accueil : le souvenir IA de _miloReturnHints passe par _obsEsc (m.txt part dans innerHTML). ③ Lecture localStorage RÉSILIENTE : _lsJson (state.js) = chaque grosse clé (sessions/prs/wkt/registre/photos/logs…) lue dans son propre try → une clé corrompue ne fait plus démarrer l'app « vidée » ; + toast quota clarifié + trace console pour les erreurs non-quota (avant : 100 % silencieux). Constat POSITIF de l'audit : le fallback quota existant sacrifie déjà la bonne donnée (sessions = récupérables du cloud ; exPhotos = local-only préservées). ④ ⚠️ RESTE À FAIRE AVEC MICHEL (préparé, PAS déployé — risque de panne Milo si raté sans test device) : verrouiller le Worker Cloudflare (AUCUNE vérif d'origine ni quota aujourd'hui → n'importe qui peut consommer l'API Anthropic aux frais de Michel). Patch complet + procédure 2 min + rollback : docs/worker-securise-PROPOSITION.txt. Testé Playwright 14/14 (balise neutralisée · rien ne s'exécute · markdown intact · carte Milo saine · _lsJson 4 cas · load() résilient bout en bout) + noyau dur 10/10. Fichiers : coach.js, screens.js, state.js, docs/worker-securise-PROPOSITION.txt, docs/GALERES-ET-LECONS.md. // 🔓 ft-v623 = OUVERTURE À TOUT LE MONDE des 4 features ex-« réservées testeurs » (décision Michel « tout pour tout le monde ») : ① réglage MANUEL des calories/macros (Nutrition, bouton sous l'anneau) ② objectif « Perte de gras + muscle » (recomposition — inscription + Profil) ③ « maxi » dans les reps (éditeur de programme, AMRAP) ④ pointeur Journal. Fix = _isNutriBeta() → return true (le verrou reste une fonction pour ne pas chasser les usages : app.js ob-gr, setup.js g-recomp, screens.js nu-adjust + nu-journal-ptr, log.js maxi). Checklist #11 rattrapée : WHATS_NEW v46 « maxi » + v47 « calories à la main » + v48 « objectif recomposition » (WHATS_NEW_MAX=48) + red dots reps-maxi (log) / manual-kcal (nutrition) / goal-recomp (setup). Les aides ?/détaillées décrivaient DÉJÀ ces features (laissées en place à l'époque, opt-in). ⚠️ Ce qui RESTE réservé (statut, pas des features) : carte dorée « Testeur Fondateur » + Espace testeur (TESTER_EMAILS) · suivi photos approfondi (SUPER_TESTER_EMAILS) · outils de test clone-only (badge Gardien, questions illimitées). // 🏋️ ft-v622 = PROFIL VIVANT, détecteur contextuel « STYLE » (force vs hypertrophie) — 2ᵉ détecteur déclaré/réalisé après la fréquence (ft-v614). L'app OBSERVE la signature d'entraînement (reps des séries FAITES sur les 10 dernières séances : ≤5 = force, 6-12 = hypertrophie). ⚠️ « observé ≠ intention » (Constitution/PROFIL-VIVANT) : le style est un INDICE FORT, jamais une preuve → Milo ne bascule JAMAIS l'objectif tout seul, il CONSTATE et DEMANDE. Ne s'active QUE si objectif ∈ {muscle, force} ET style observé clairement l'AUTRE (≥60% des séries, ≥25 séries = tendance stable). Sur l'Accueil (contextuel, prioritaire) : « J'observe que ton entraînement ressemble plutôt à du travail de force, alors que ton objectif est prise de muscle. Souhaites-tu passer sur force ? (rien d'obligatoire) » → applyStyleContext (change S.goal SEULEMENT sur tap + recalcule la nutrition) / dismissStyleContext (garde). Anti-nag S.registre.ctxStyle. Fonctions tracking.js (_sessionStyleStats/_pendingStyleContext/apply/dismiss), _renderObsCard branche style. EN PROD (déterministe, proposition seule = faible risque, testé Playwright 14/14 + noyau dur 10/10). Checklist #11 : WHATS_NEW v45 « Milo repère ton style d'entraînement » (WHATS_NEW_MAX=45, testeurs décalés v46/47/48) + red dot milo-style-detect + aide ? Accueil (🔎, complétée) + aide détaillée (🔎, complétée). ⏳ Détecteur « dérive de poids » REPORTÉ (action ambiguë, lié à la nutrition pas encore construite → à faire avec Michel/après nutrition). // 🫂 ft-v621 = MOMENT 2 « Milo se souvient de moi » (Phase A de la roadmap ; docs/PRESENCE-MILO.md — le 2ᵉ moment Milo). Au RETOUR après une pause, le message de l'Accueil devient chaleureux et BASÉ SUR LA MÉMOIRE : au lieu du froid « Ça fait X jours 👀 », Milo ressort un souvenir (obs validée « Je me souviens : … » · autre sport · objectif) → « Content de te revoir 👋 … On se refait une séance ? ». 100 % DÉTERMINISTE (LIT le profil unique = source de vérité, ne stocke RIEN), rotation par jour pour varier, FALLBACK sur le message froid si aucun souvenir (0 régression pour un nouveau). Enrichit les branches `retour` (≥10j) et `relance` (≥4j) de _miloMessage ; le bouton « J'y vais demain » reste. Fonctions screens.js (_miloReturnHints/_miloReturnHint). PAS de pop-up (choix assumé : ce moment se RESSENT, l'annoncer casserait la surprise — présence sans gadget). EN PROD (déterministe, testé Playwright 13/13 + noyau dur 10/10). ⏭️ v2 possible : même « je me souviens de toi » à l'ouverture du Coach. // 🧠 ft-v620 = PROFIL VIVANT, Brique 2 : « Milo a appris récemment » (2ᵉ idée de Michel) + checklist #11 (l'annonce forte gardée pour ce moment). Section VIVANTE en haut de « Ce que Milo sait de toi » (sous la phrase-bénéfice) : les 3 DERNIÈRES choses apprises, la + récente en haut, avec une date relative (« hier », « il y a 4 j »). Sources : observations validées (validatedAt) + infos de base réellement apprises via S.registre.learnedAt (posé UNIQUEMENT par fillGap/fillEnrich/applyFreqContext — JAMAIS par le lazy-init ni une re-confirmation → dates HONNÊTES, les vieux champs n'apparaissent pas avec un faux « aujourd'hui »). LIT le profil unique, ne stocke RIEN de neuf (respecte « le profil vivant = source de vérité », gravé 27/07 docs/PROFIL-VIVANT.md). Phrasing freq via _freqBucketLabel (« 4 fois »), time garde son « ~ ». Fonctions screens.js (_relLearned, _recentLearnedItems, _renderMiloRecent appelé par _renderMiloKnows), tracking.js (_stampLearned), style.css (.mk-recent), index.html (#milo-knows-recent). EN PROD (déterministe, testé Playwright 15/15 + noyau dur 10/10). Checklist #11 = l'ANNONCE FORTE des Briques 1+2 : WHATS_NEW v44 « Ta page Ce que Milo sait de toi devient vivante » (WHATS_NEW_MAX=44, réservés testeurs décalés v45/46/47) + red dot milo-knows-alive (menu-row-miloknows) + aide ? Accueil (🟢, complétée) + aide détaillée (🟢, complétée). ⏳ diapo guide = capture Michel. // 📚 ft-v619 = AIDES + DÉPLOIEMENT FIABLE. ① Aides de la phrase-bénéfice (ft-v618) : aide contextuelle « ? » de l'Accueil (🟢 « Milo te connaît de mieux en mieux ») + aide détaillée Menu→Aide (🟢) — expliquent la page « Ce que Milo sait de toi » (phrase orientée bénéfice, PAS un score, monte et ne redescend jamais). ② DÉPLOIEMENT : Pages « deploy from a branch » se bloquait par intermittence (site coincé à ft-v600 puis ft-v616 : ft-v617/618 poussés mais jamais construits, silencieux). FIX PERMANENT : nouveau workflow .github/workflows/deploy-pages.yml (Actions : configure-pages + upload-pages-artifact + deploy-pages) → déploie de façon FIABLE à chaque push + relançable à la main (workflow_dispatch). Vérifié via GitHub Actions (run vert). Gravé : docs/GALERES-ET-LECONS.md. ⏳ Pop-up « Quoi de neuf » de la phrase-bénéfice TOUJOURS reporté à la Brique 2 (annonce forte « ta page devient vivante »). // 🧠 ft-v618 = PROFIL VIVANT, Brique « fiabilité par champ » — étape 1 : la PHRASE-BÉNÉFICE sur « Ce que Milo sait de toi » (design Michel : PAS de %/score, orienté BÉNÉFICE, l'utilisateur ne se sent JAMAIS évalué). Un bandeau vert doux affiche une phrase qui MONTE avec l'étendue de ce que Milo sait (lieu/fréquence/durée/objectif/autre sport/zones fragiles + ce qu'on lui confie) : « Milo apprend à te connaître » → « commence à bien te connaître » → « te connaît bien — conseils personnalisés » → « connaît très bien ton profil — conseils sur-mesure ». Ne redescend JAMAIS (high-water mark S.registre.knowPeak) → aucun sentiment de punition si on efface une info ou dit « ça a changé ». La fiabilité/fraîcheur par champ (qui décroît, elle) reste INTERNE et ne sert qu'à piloter les questions (mode Confirmer) — jamais affichée. Fonctions screens.js (_MILO_LEVELS, _miloKnowledgeCount, _miloKnowledgeLevel, _renderMiloLevel appelé par _renderMiloKnows), style.css (.mk-level). index.html : conteneur #milo-knows-level. EN PROD directe (déterministe, tested Playwright 19/19 + noyau dur 10/10). ⏳ Checklist #11 VOLONTAIREMENT reportée : le pop-up sera fait avec la Brique 2 « Milo a appris quelque chose » pour UNE annonce forte « ta page devient vivante » (plutôt qu'un pop-up pour une phrase seule). ⏭️ Brique 2 = la liste vivante des choses récemment apprises. // ft-v617 = PROFIL VIVANT, mode « CONFIRMER » (le 4ᵉ et dernier mode, docs/PROFIL-VIVANT.md ; retour Michel « on continue »). Une info ENCORE là mais ANCIENNE (>90j sans confirmation) → Milo la re-valide en douceur sur l'Accueil (« tu t'entraînes toujours en salle basique ? », « une séance dure toujours ~45 min ? », « toujours du vélo à côté ? »). « Oui, toujours » ne change RIEN — il rafraîchit juste la DATE de dernière confirmation (backbone S.coachQuiz.confirmedAt) → ne re-pose pas de sitôt ; « Non, ça a changé » → supprime la valeur + gapForce → les options réapparaissent TOUT DE SUITE (bascule vers Compléter/Enrichir). PROACTIF (partage le plafond hebdo lastObsAt : ≤1 question/semaine), « Plus tard » = cooldown ~30j (confirmSkips). N'agit PAS sur la fréquence (déjà couverte par le détecteur déclaré/réalisé ft-v614). Lazy-init : les champs déjà remplis sans date sont ancrés à aujourd'hui (aucune question immédiate → pas de harcèlement au déploiement). Priorité Accueil : obs en cours → contextuel(freq) → Compléter → Enrichir → CONFIRMER → observation. Fonctions tracking.js (_pendingConfirm/confirmField/unconfirmField/skipConfirm/_stampConfirmed/_confirmPromptOf), screens.js (_renderObsCard branche Confirmer), _stampConfirmed câblé aussi dans fillGap/fillEnrich/applyFreqContext. EN PROD directe (déterministe, pas un comportement de prompt → clone inutile ici). Testé Playwright 21/21 + noyau dur 10/10. Checklist #11 : WHATS_NEW v43 « Milo garde ton profil à jour » (WHATS_NEW_MAX=43, réservés testeurs décalés v44/45/46) + red dot milo-confirm-profile + aide ? Accueil (🌿) + aide détaillée. ⏳ diapo guide = capture Michel. BILAN PROFIL VIVANT : les 4 modes livrés (Compléter ✅ · Confirmer ✅ · déclaré/réalisé ✅ (freq) · Enrichir ✅). Reste : fiabilité par champ (étoiles) + détecteurs contextuels (poids, style) + autres questions d'enrichissement. // ft-v616 = 🐛 FIX (retour Michel) : « Milo me relance "ça fait X jours" alors qu'il sait que je vais au sport demain ». Le chat→Accueil (ft-v601) dépend de Milo qui émet un marqueur caché quand on lui dit sa prochaine séance — pas fiable (prompt). Fix DÉTERMINISTE : sur la carte de relance/retour de l'Accueil, un bouton « 📅 J'y vais demain » pose directement S.nextPlanned (demain) → le rappel disparaît et devient « Séance prévue demain 💪 Je m'en souviens » (priorité HAUTE de _miloMessage). Ne dépend plus de Milo. Testé Playwright (nag→bouton→nextPlanned demain→message prévu, plus de relance) + noyau dur 10/10. Fichiers : screens.js (_planTomorrow + bouton), style.css (.milo-plan). // ft-v615 = mode Enrichir (autre sport)., 1ʳᵉ question : AUTRE SPORT (retour Michel « continue » ; levier TDEE souligné par lui). Un autre sport n'est PAS détectable dans les données (l'app ne logge que la muscu) → Milo DEMANDE (enrichissement, pas détection). Sur l'Accueil quand la base est complète (proactif, plafond hebdo partagé), chips vélo/course/foot/natation/martiaux/rando/autre/aucun → écrit S.coachQuiz.answers.othersport (persisté+cloud) + INJECTÉ dans buildCoachContext (_coachQuizContext) pour que Milo l'utilise vraiment (récup + calories, cf. NUTRITION-PHILOSOPHIE). Priorité Accueil : contextuel(freq) > Compléter > Enrichir > observation. Testé Playwright (pending/stored/contexte/aucun/skip/cap/render + priorité 3/3) + noyau dur 10/10. Checklist #11 : WHATS_NEW v42 + red dot + aides. // ft-v614 = détecteur fréquence déclaré/réalisé. « déclaré vs réalisé » : la FRÉQUENCE. L'app mesure les séances/semaine (4 sem), et sur un écart STABLE (≥3 sem du même sens, jamais un pic — cohérence avant réactivité) avec le déclaré (S.coachQuiz.answers.freq), Milo propose sur l'Accueil « ça a changé ? » (ton humble « petite vérification 😊 ») → applyFreqContext (met à jour + feedback) / dismissFreqContext (garde + anti-nag par niveau observé). CONTEXTUEL = passe outre le plafond hebdo proactif, une seule question à la fois, jamais auto. Fonctions tracking.js (_pendingFreqContext/apply/dismiss/_weeklyCounts), _renderObsCard priorise le contextuel. Testé Playwright 14/14 + noyau dur 10/10. Checklist #11 : WHATS_NEW v41 + red dot + aides. ⏭️ détecteurs suivants : autre sport, dérive de poids, style (=intention → questionner). // ft-v613 = cadence hebdo. (retour Michel) : les questions PROACTIVES (mode Compléter + observations) passent de « ≥3 jours » à « au plus 1 par SEMAINE » (filet de sécurité, pas règle absolue). Partagé via lastObsAt → jamais 2 questions proactives/semaine. Les futures questions CONTEXTUELLES (déclaré/réalisé, pic de séances, dérive de poids) pourront passer outre ce plafond. Gravé : docs/PROFIL-VIVANT.md (2 mécanismes : proactif=filet / contextuel=prioritaire). // ft-v612 = mode Compléter. (docs/PROFIL-VIVANT.md). Sur l'Accueil, si un champ de base d'entraînement manque (lieu/fréquence/durée — normalement posé à l'inscription ob-7), Milo propose de le remplir en 1 tap (vrais boutons, mêmes options que COACH_QUIZ) → écrit DIRECT dans S.coachQuiz.answers (déjà persisté + cloud, 0 backend). Cadence : ≥3 séances, ≥3 jours entre 2 questions (partagé avec les observations via lastObsAt), « Plus tard » = cooldown 7j. Feedback de valeur (toast). EN PROD directe (déterministe, clone inutile ici — accord Michel) mais testé Playwright 13/13 + noyau dur 10/10. Fichiers : tracking.js (_pendingGap/fillGap/skipGap), screens.js (_renderObsCard priorise le gap), style.css (.gap-opt), constants.js (WHATS_NEW v40 + red dot), coach.js/screens.js (aides). ⏳ diapo guide = capture Michel. ⏭️ tranches suivantes : Confirmer/Mettre à jour, déclaré/réalisé, Enrichir. // ft-v611 = badge quota compact (clone). (« 8 questions » au lieu de « 8 questions gratuites ») — petit gain de place, gaté __FT_CLONE__ → PROD garde le libellé complet. La grosse refonte du header (actions sur la ligne de date, 2 rangées) est PARKÉE pour une session dédiée avec Michel (visuel, à itérer en direct — pas de hack fragile). // ft-v610 = header compacté v2 (espacements). (cadrage GPT : garder le LOGO/titre/boutons = identité premium, gagner via les ESPACEMENTS). Remplace le shrink logo de ft-v609. Gains clone-only (gaté html.is-clone) : topbar marge basse 14→8 · coach-header 8/12→2/6 (resserre date→Milo) · sous-titre « Ton coach IA » 12→11px compacté · badge quota plus fin. ~20-30px pour le chat Milo. PROD inchangée. Idée future notée : header adaptatif (compact au scroll, façon iOS). À promouvoir si validé. // ft-v609 = shrink logo (remplacé). (clôt la checklist #11 de ft-v607) — capture recadrée (badge clone retiré) du plan direct « je veux faire de la force » (Full Body + amplitude contrôlée pour l'épaule) ajoutée après la diapo Coach (guide/milo-direct.jpg, 780px). Guide passe de 15 à 16 diapos. // ft-v607 = promotion en prod du lot anti-interrogatoire. (retrait du gate __FT_CLONE__ dans buildCoachContext) : « la valeur avant la question » + montrer le COMMENT sur la blessure + moment Milo + question guidée (réponses rapides) + mémoire de la prochaine séance → TOUS les utilisateurs (plus seulement le clone). Validé après le fix modèle (Haiku→Sonnet) qui a prouvé que ces règles tiennent sur un modèle capable. + Checklist #11 : WHATS_NEW v39 « Milo va droit au but » (WHATS_NEW_MAX=39, réservés testeurs décalés v40/41/42) + red dot milo-value-first + aide ? Coach + aide détaillée. ⏳ Diapo guide = capture Michel. // ft-v606 était : anti-interrogatoire durci (clone). — LA VALEUR AVANT LA QUESTION (retour Michel + GPT alignés, test réel « je veux faire de la force »). L'inscription ft-v604 marche (Milo connaît 4×/sem, ~1h, salle + protège épaule/fessiers) MAIS il posait encore 2 questions avant de proposer et repoussait le plan (« je reviens avec un vrai plan une fois que j'ai tes précisions »). Fix (prompt, gated clone, buildCoachContext) : ⛔ ne JAMAIS repousser le plan · rappeler les infos connues n'est PAS une proposition · Milo n'a pas peur de faire un 1er choix quand il a assez d'infos · la question restante PERSONNALISE (ne débloque plus rien) · montrer QUOI faire de la blessure (« amplitude contrôlée, progression adaptée ») pas juste « je protège » · nouvel exemple « force » · indicateur de succès = « combien de valeur AVANT la 1ʳᵉ question ». Gravé : docs/PROCESSUS-DEVELOPPEMENT.md (raffinement noyau cardinal ①). ⚠️ prompt-dépendant → à re-tester sur le clone. // ft-v605 était : PERMISSIONS BORNÉES (photo Imodium → n'invente plus « gastro »). (bug trouvé en test réel : sur le CLONE, photo d'Imodium → Milo invente « un gastro qui traîne » ; en PROD, photo de complément → analyse factuelle parfaite). Diagnostic (Michel + GPT) : pas une règle anti-invention manquante, mais une PERMISSION trop large (« fais des hypothèses par défaut », pensée pour l'entraînement) qui a débordé sur la SANTÉ — même schéma que ft-v603 (une règle « va vite » par-dessus la sécurité). Fix : ① règle UNIVERSELLE (prod+clone) « permissions bornées » à 3 niveaux (faits : jamais d'hypothèse · entraînement : hypothèses OK · santé/sécurité/médicaments : jamais) + frontière PHOTO PRODUIT (décrire + usage général + lien profil connu ; jamais déduire le pourquoi / inventer une maladie) ; ② clone : « hypothèses par défaut » bornées aux SEULS paramètres d'entraînement. Gravé : notion « les permissions sont hiérarchisées ET bornées à un domaine » (Constitution, MOTEUR-RAISONNEMENT, BUGS-DE-PHILOSOPHIE PB-005).
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
  './guide/programmes.jpg','./guide/progres.jpg','./guide/bilan.jpg','./guide/coach.jpg','./guide/milo-direct.jpg','./guide/milo-seance.jpg','./guide/milo-memoire.jpg',
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
