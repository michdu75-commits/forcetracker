/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
const CACHE = 'ft-v544'; // Fix figurines aperçu d'import (retour Michel « il y a des figurines qu'on a déjà ») : _impThumb tombe désormais sur la SILHOUETTE DU GROUPE pour un exo RÉEL de la biblio sans gif ni muscle deviné (ex. Développé Haltères Assis → épaules), au lieu de l'icône neutre ; neutre réservé aux exos vraiment hors biblio (Vélo, Power Clean). + fix rattachement « Assis Abducteurs Machine » → Abducteurs Machine Debout (le mot « assis » ne doit pas gagner sur « abducteurs »). Testé : Dev Halteres Assis→épaules, Vélo→neutre, gifs intacts, VM 21/21, EXLIB 287/287, 0 erreur JS. Précédent ft-v543 : VM 11e vague (retour GPT prog femme) : Développé Épaules Haltères → Développé Haltères Assis (un exo HALTÈRES ne doit pas tomber sur une MACHINE — était Développé Épaules Machine). Testé : auto, 0 casse, VM 21/21, EXLIB 287/287, 0 erreur JS. Précédent ft-v542 : Enrichissement VM 10e vague (rapport PERTE DE POIDS FEMME — fitness/muscu, PRIORITAIRE) : 5 exos qu'on A mais qui étaient ratés → auto. Abducteurs Machine→Abducteurs Machine Debout, Tirage Horizontal Poulie→Rowing Cable, Step Ups→Montée sur Box (Step-up), Extension Triceps Corde→Triceps Corde Poulie, Corde à Sauter→Sauts à la Corde (faux ami « corde » ≠ Triceps Corde). Testé : 5 en auto, 0 casse, VM 21/21, EXLIB 287/287, 0 erreur JS. Précédent ft-v541 : Fix figurines de l'aperçu d'import (retour Michel « ça ne va pas du tout ») : vignette COHÉRENTE sur chaque carte via _impThumb (vraie image > muscle deviné SEULEMENT si fiable > icône haltère neutre) — les exos rattachés en auto montrent enfin leur figurine, et un exo inconnu (Power Clean) affiche une icône neutre au lieu du torse rouge « pecs » (défaut chest.svg de _exMuscleImg évité). _vmConfirmRow gagne un param noThumb (pas de doublon de vignette dans l'aperçu programme ; l'aperçu historique garde sa vignette inline). Testé : vignette gauche sur chaque carte, réel→image / inconnu→neutre, 0 doublon, 0 erreur JS. Précédent ft-v540 : Enrichissement VM 9e vague (rapport FORCE/HALTÉRO — powerlifting) : 8 corrections en auto. Abréviations BS→Squat Barre, FS→Squat Avant, GHR→Glute Ham Raise. Variantes bench (Comp/Paused Bench→Développé Couché). Pendlay Row→Rowing Barre (était Cable). Conventional DL→Soulevé de Terre, Block Pull→Rack Pull. L'haltéro olympique (Clean/Snatch) reste non couvert = normal. Testé : 8 en auto, 0 casse, VM 21/21, EXLIB 287/287, 0 erreur JS. Précédent ft-v539 : Enrichissement VM 8e vague (rapport OLD SCHOOL — muscu classique, PRIORITAIRE) : 17 corrections en auto. Abréviations FR (DI/DD/DM/EL/SDT JT étaient « nouveau »), suggestions fausses (Lat Raise→Élévations Latérales [était dos !], Planche→Gainage [était préhension !], Pec Deck Inversé→Machine Oiseau, Extension Corde→Triceps Corde, Shoulder BB→Militaire), + fiabilisation (Row Poulie/Cable Row→Rowing Cable, T-Bar→Rowing T-Bar, Incline/Decline Bench). Testé : 0 casse (Lat Pull→Tirage / Planche Latérale+Préhension à 100%), VM 21/21, EXLIB 287/287, 0 erreur JS. Précédent ft-v538 : Enrichissement VM 7e vague (rapport CrossFit/haltéro) : 5 suggestions absurdes corrigées — Push Press/Strict Press/Push Jerk→Développé Militaire (étaient Couché/Sled Push !), Chest To Bar→Traction, Wall Ball→Thruster (était Wall Sit). Le reste (haltéro olympique/gym CrossFit/ergs cardio/strongman) = disciplines absentes d'EXLIB → décision produit. Les 15 auto étaient tous justes (Thruster/Burpees/KB Swing/Deadlift/OHS/Box Jump/Pistol…). Testé : 5 en auto 95%, 0 détournement (Couché/Wall Sit/Sled Push/Thruster à 100%), VM 21/21, EXLIB 287/287, 0 erreur JS. Précédent ft-v537 : Enrichissement VM 6e vague (rapport TRX/poids du corps) : 3 suggestions absurdes corrigées — TRX Ham Curl→Curl Ischio (était Curl Barre=biceps !), Nordic Curl→Curl Ischio, Chin Up→Traction Prise Neutre (était Montée sur Box=jambes !). Le reste du rapport (TRX/callisthénie) = famille absente d'EXLIB → décision produit (nouveaux exos ?), pas des bugs. Testé : 3 en auto 95%, Curl Barre se reconnaît toujours, VM 21/21, EXLIB 287/287, 0 erreur JS. Précédent ft-v536 : MODE TEST VM : « Tester MON programme » accepte un PDF (bouton « 📄 Importer un PDF »). _pdfToText (log.js) lit la COUCHE TEXTE du PDF en LOCAL (0 IA, PDF.js getTextContent, regroupement par ligne via Y) → remplit le textarea → mêmes nettoyage/en-têtes/moteur que le collage. PDF scanné (sans texte) → message clair « colle la liste à la main ». Admin-only. Testé : overlay + bouton + input accept .pdf + fonctions définies, 0 erreur JS (extraction réelle = validée sur iPhone, PDF.js CDN bloqué en test). Précédent ft-v535 : Enrichissement VM 5e vague (rapport HELL MODE v2, validé GPT) : ATG Squat→Squat à la Barre + Mollet Presse→Presse Mollets (Leg Press) en auto (95%). Testé : les 2 en auto, VM 21/21, EXLIB 287/287, 0 erreur JS. Précédent ft-v534 : « Tester MON programme » ignore les EN-TÊTES (===== PUSH =====, PROGRAMME…, PULL/LEGS…) via _vmIsHeader — avant, « PUSH » matchait « Sled Push », etc. + enrichissement VM 4e vague (rapport HELL MODE) : Tri Rope→Triceps Corde Poulie (était Sauts à la Corde !), Push Down→Triceps Poulie (était Sled Push), DC BB/Dév Couché/CG Bench→Développé Couché, Butter Fly/Pec Machine/Fly Machine→Pec Deck, Lat Machine/Lat PD→Tirage Poulie Haute, Row Assis→Rowing Cable. Testé : en-têtes ignorés, vrais exos gardés, 12 corrections en auto, VM 21/21, EXLIB 287/287, 0 erreur JS. Précédent ft-v533 : Enrichissement VM 3e vague : +12 rattachements — Dual Cable Cross→Croisé Poulie, High Pulley Close Grip→Tirage Prise Serrée, Close Grip Bench→Développé Couché (était un tirage !), Incl DB Press→Développé Incliné Haltères, Bench BB/Leg Ext en auto, Matrix/Panatta Super/Hammer Iso→machines pecs, Atlantis High Row→Rowing Machine. + « super » ajouté aux mots-bruit (Superman non impacté, vérifié). Banc : 94%→98% reconnaissance (65%→73% auto, plus que 2 nouveau/120). Testé : VM 21/21, EXLIB 287/287, 0 erreur JS. Précédent ft-v532 : MODE TEST VM v3 : « Tester MON programme » — bouton admin « 📋 Tester MON programme (coller une liste) » → overlay textarea : on colle N'IMPORTE quelle liste d'exercices (un par ligne), les séries/reps/repos/puces sont nettoyés auto (_vmCleanExName), et ça passe dans le moteur → même rapport que le banc (direct/alias/confirm/nouveau, %, export texte/CSV), SANS comparaison référence (programme ad hoc). _vmBenchRun(benchDef, compare) rendu réutilisable. Répond à « on insère pas de programme ? ». Testé : nettoyage lignes OK, rapport « Mon programme », banc normal intact, 0 erreur JS. Précédent ft-v531 : MODE TEST VM v2 (évolution GPT) : le banc d'essai devient un vrai framework anti-régression. +2 catégories (Powerlifting, Bodybuilding → 6 batteries, ~120 exos), SCORE PAR CATÉGORIE, et surtout RÉFÉRENCE + COMPARAISON de versions : bouton « 💾 Référence » enregistre un run, chaque run suivant affiche +N améliorations / 🔴 M régressions (LISTÉES EN PRIORITÉ, exercice qui était reconnu et ne l'est plus) + ↔ rattachements changés. Export TEXTE + CSV. Résultat actuel : 94% (78 auto/35 confirm/7 nouveaux). Admin-only. Testé : régression détectée (RDL cassé → signalé), 0 erreur JS. Précédent ft-v530 : MODE TEST VM — banc d'essai (idée GPT) : bouton admin « 🧪 Mode Test VM » qui passe 92 noms de programmes « tordus » (4 batteries : Salle commerciale/Coach américain/Cauchemar/Niveau Expert) dans le moteur local et sort un RAPPORT (direct/alias/confirm/nouveau + taux de reconnaissance %) exportable en texte — fini les captures d'écran manuelles. Résultat actuel : 93% reconnus (57 auto/29 confirm/6 nouveaux). + 3 corrections (Chest BB→Développé Couché, Hack Sq→Squat Hack, LP→Press Jambes 45°). Testé : VM 21/21, EXLIB 287/287, 0 erreur JS. Précédent ft-v529 : Enrichissement VM 2e vague : +5 corrections — Ischios assis → Leg Curl Assis Machine (était Développé Haltères Assis, faux), Hack → Squat Hack, High Pulley / Pulley Wide → Tirage Poulie Haute, Presse (seul) → Press Jambes 45° (sans écraser Presse Mollets/Presse à Cuisses). Rappel : les corrections de la 1re vague (Lat Pull/Tirage Devant → Tirage Poulie Haute, Low Row → Rowing Cable, LP45 → Press Jambes 45°) étaient déjà dans ft-v528. Testé : VM 21/21, EXLIB 287/287, 0 erreur JS. Précédent ft-v528 : INDUSTRIALISATION étapes 4+5 : enrichissement VM « au fil du réel » (stress-test des programmes GPT — noms commerciaux/marques/nightmare). ① mots BRUIT commercial ignorés (Evolution/Ultra/Elite/Pro/Max/X900/V4 + marques Panatta/Matrix/Technogym/Cybex/Nautilus/Atlantis/Prime… — aucun présent dans EXLIB) + codes modèles (regex [a-z]{1,3}\d+). ② familles ratées ajoutées à _EX_EQUIV (leg press LP45/Horizontale/Inclinée/Hammer, poulie croisée, machine fessier Booty Builder/Glute Drive). ③ garde-fous muscle (soleus→mollet, quad→quadriceps) + corrections (Tirage Devant→Tirage Poulie Haute [était Menton], Lat Pull→Tirage Poulie Haute [était Rack Pull], Reverse Pec Fly→Machine Oiseau [était Pec Deck]). Résultat stress-test 72 noms : 15→45 AUTO, confirm 40→20, nouveau 17→7. Testé : VM 21/21, EXLIB 287/287 (rien cassé), 0 erreur JS. Précédent ft-v527 : INDUSTRIALISATION étape 2 : Confirm « en un geste » (spec GPT+Gemini). Le rattachement en zone grise (import programme ET journal) affiche désormais la FIGURINE de l'exo proposé (gif/photo sinon muscle deviné) + « ✓ Oui » / « ✕ Non » explicites (avant : juste « Oui », refus implicite). Helper partagé _vmConfirmRow + impRejectMatch/histRejectMatch (refus = garde le nom importé tel quel). Pensé pour un sportif fatigué : décider d'un coup d'œil, zéro formulaire. Testé Playwright (figurine+✓/✕ sur les 2 flux, refus garde le nom + stoppe le nag, VM 21/21, 0 erreur JS). Précédent ft-v526 : INDUSTRIALISATION étape 1 : VM câblé sur l'import HISTORIQUE (avant, seul l'import de PROGRAMME en profitait → le journal fragmentait les stats). _vmMatchHist() rattache chaque exo du journal à sa référence EXLIB (auto ≥90 = renommé, confirm = proposé « Oui », nouveau = laissé) + histAcceptMatch/histUndoMatch + aperçu qui montre les rattachements. Résultat : « Peck deck machine »/« Bench press » → Pec Deck/Développé Couché = plus de doublon (finalImportHist ne crée un perso que pour un nom absent d'EXLIB). Champs _vm transitoires (finalImportHist ne recopie que name/note/sets). Testé Playwright : auto/confirm/nouveau OK, accept+undo, doublons 3→1, VM 21/21, 0 erreur JS. Précédent ft-v525 : VM lot 3 des dicts d'alias GPT (spéciales Add/Abd hanche, Box Jump, Battle Rope, Farmer's/Grip) — 28 exos, on en a 5 (Adduction/Abduction Cuisses, Box Jump, Battle Rope, Farmer's Walk) → +7 alias (cable hip add/abd, battle rope waves…). Testé lot3 9/9, VM 21/21, 287/287 EXLIB intacts, _EX_EQUIV=406 clés, 0 erreur JS. 23 absents = encore des nouvelles familles (plyo/carries/grip/Dead Hang) = décision produit. Précédent ft-v524 : // VM : intégration du LOT 2 des dicts d'alias GPT (familles 6-14 + spéciales : Fentes, Quadriceps, Ischios, Mollets, Gainage, Curl, Triceps, Épaules, Poussée verticale) → +181 alias rattachés à 61 exos EXLIB (Object.assign, clés déjà présentes exclues). Testé : lot2 164/172 (les 8 écarts tombent sur un exo valide, souvent + juste — ex. Dumbbell Thruster→Thrusters Haltères), lot1 190/191, VM 21/21, 287/287 noms EXLIB intacts, 0 erreur JS. ⏳ 119 exos GPT ABSENTS de notre base = familles qu'on n'a pas (cardio complet, mobilité/étirements, haltéro/strongman) → décision produit (les ajouter ?) à prendre avec Michel/GPT. Précédent ft-v523 : // VM : intégration des 5 dictionnaires d'alias GPT (EXLIB v3 — Poussées H, Tirages H/V, Squats, Hip Hinge) → 190 alias rattachés aux 56 exos EXLIB correspondants (Object.assign sur _EX_EQUIV, la table curatée reste prioritaire). Corrige 54 mauvais rattachements (« Barbell Row »→Rowing Barre au lieu de Rowing Cable ; « Développé haltères »→Développé Couché Haltères au lieu de Militaire ; « Cable Fly »→Écarté Poulie…) + ajoute les synonymes EN/marques. Testé : 190/191 alias OK, VM 21/21, 287/287 noms EXLIB se reconnaissent eux-mêmes (0 détournement), 0 erreur JS. ⏳ 32 noms canoniques GPT ≠ nos noms EXLIB (décision de nommage à prendre) non câblés. Précédent ft-v522 : reconnaissance tolérante au mot « machine ».
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
  './guide/home.jpg','./guide/profil.jpg','./guide/seance.jpg',
  './guide/programmes.jpg','./guide/progres.jpg','./guide/bilan.jpg','./guide/coach.jpg',
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
