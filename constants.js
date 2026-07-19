/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
// ─── EXERCISE LIBRARY ────────────────────────────────────────
const EXLIB=[
  // ── Pectoraux ──────────────────────────────────────────────
  {n:'Développé Couché',g:'Pectoraux'},{n:'Développé Couché Haltères',g:'Pectoraux'},
  {n:'Développé Incliné',g:'Pectoraux'},{n:'Développé Incliné Haltères',g:'Pectoraux'},
  {n:'Développé Décliné',g:'Pectoraux'},{n:'Développé Décliné Haltères',g:'Pectoraux'},
  {n:'Écarté Haltères',g:'Pectoraux'},{n:'Écarté Poulie',g:'Pectoraux'},
  {n:'Croisé Poulie (Cable Crossover)',g:'Pectoraux'},
  {n:'Pec Deck',g:'Pectoraux'},
  {n:'Chest Press Machine Horizontale',g:'Pectoraux'},{n:'Chest Press Machine Inclinée',g:'Pectoraux'},{n:'Chest Press Machine Déclinée',g:'Pectoraux'},
  {n:'Dips',g:'Pectoraux'},{n:'Dips Parallèles',g:'Pectoraux'},{n:'Dips Machine Assistée',g:'Pectoraux'},{n:'Dips Assis Machine (Seated Dip)',g:'Pectoraux'},
  {n:'Pompes Lestées',g:'Pectoraux'},{n:'Pompes Déficit (Deficit Push-up)',g:'Pectoraux'},{n:'Pompes Diamant',g:'Pectoraux'},
  {n:'Smith Machine Développé Couché',g:'Pectoraux'},{n:'Smith Machine Développé Incliné',g:'Pectoraux'},
  // ── Dos / Dorsaux ──────────────────────────────────────────
  {n:'Soulevé de Terre',g:'Dos'},{n:'Soulevé de Terre Sumo',g:'Dos'},
  {n:'Tirage en Rack (Rack Pull)',g:'Dos'},{n:'Inclinaison Lombaire (Good Morning)',g:'Dos'},
  {n:'Rowing Barre',g:'Dos'},{n:'Rowing Haltère',g:'Dos'},{n:'Rowing Cable',g:'Dos'},
  {n:'Rowing Yates (Supination)',g:'Dos'},{n:'Rowing Poitrine Appuyée (Chest Supported)',g:'Dos'},
  {n:'Rowing Machine',g:'Dos'},{n:'Rowing Hammer Strength',g:'Dos'},
  {n:'Tirage Poulie Haute',g:'Dos'},{n:'Tirage Poulie Haute Prise Serrée',g:'Dos'},{n:'Tirage Nuque',g:'Dos'},
  {n:'Tirage Poulie Basse Prise Large',g:'Dos'},{n:'Tirage Poulie Basse Prise Serrée',g:'Dos'},
  {n:'Traction Lestée',g:'Dos'},{n:'Traction Assistée',g:'Dos'},{n:'Traction Prise Neutre',g:'Dos'},
  {n:'Pull-over',g:'Dos'},{n:'Pull-over Haltère',g:'Dos'},{n:'Pullover Machine',g:'Dos'},
  {n:'Pull-over Barre',g:'Dos'},{n:'Pull-over Poulie',g:'Dos'},
  {n:'Rowing Smith Machine',g:'Dos'},{n:'Rowing T-Bar Machine',g:'Dos'},{n:'Rowing Landmine (T-Bar)',g:'Dos'},
  {n:'Rowing Haltères Buste Penché',g:'Dos'},{n:'Meadows Row',g:'Dos'},{n:'Seal Row',g:'Dos'},{n:'Renegade Row',g:'Dos'},
  {n:'Tirage Iso-Latéral Hammer Strength',g:'Dos'},{n:'Tirage Incliné Poulie Haute',g:'Dos'},{n:'Tirage Poulie Haute Prise Inversée',g:'Dos'},
  {n:'Traction Derrière la Nuque',g:'Dos'},{n:'Rocky Pull-up',g:'Dos'},{n:'Sled Pull',g:'Dos'},
  // ── Trapèzes ───────────────────────────────────────────────
  {n:'Haussements d\'Épaules (Shrugs)',g:'Trapèzes'},{n:'Haussements d\'Épaules Barre',g:'Trapèzes'},
  {n:'Haussements d\'Épaules Haltères',g:'Trapèzes'},{n:'Haussements d\'Épaules Câble',g:'Trapèzes'},
  {n:'Tirage Menton',g:'Trapèzes'},{n:'Farmer\'s Walk',g:'Jambes'},
  {n:'Haussements d\'Épaules Overhead',g:'Trapèzes'},
  // ── Épaules ────────────────────────────────────────────────
  {n:'Développé Militaire',g:'Épaules'},{n:'Développé Militaire Haltères',g:'Épaules'},
  {n:'Développé Haltères Assis',g:'Épaules'},{n:'Développé Arnold (Arnold Press)',g:'Épaules'},
  {n:'Développé Épaules Machine',g:'Épaules'},{n:'Smith Machine Développé Militaire',g:'Épaules'},
  {n:'Élévations Latérales',g:'Épaules'},{n:'Élévations Latérales Câble',g:'Épaules'},{n:'Élévations Latérales Machine',g:'Épaules'},
  {n:'Élévations Frontales',g:'Épaules'},{n:'Élévations Frontales Câble',g:'Épaules'},{n:'Élévations Frontales Machine',g:'Épaules'},
  {n:'Oiseau',g:'Épaules'},{n:'Machine Oiseau',g:'Épaules'},
  {n:'Tirage Visage (Face Pull)',g:'Épaules'},{n:'Tirage Vertical (Upright Row)',g:'Épaules'},
  {n:'Y Raise / W Raise',g:'Épaules'},{n:'Développé Nuque',g:'Épaules'},
  // Épaules + Trapèzes — figurines (lot 2026-07-06)
  {n:'Développé Épaules Kettlebell',g:'Épaules'}, {n:'Développé Landmine (Épaules)',g:'Épaules'}, {n:'Écarté Arrière Élastique',g:'Épaules'}, {n:'Élévation Frontale Allongée Barre',g:'Épaules'}, {n:'Élévation Latérale Poulie Inclinée',g:'Épaules'}, {n:'Élévation Latérale Landmine',g:'Épaules'}, {n:'Élévations Latérales Kettlebell',g:'Épaules'}, {n:'Rotation Interne Épaule Élastique',g:'Épaules'}, {n:'Face Pull Couché Poulie',g:'Épaules'}, {n:'Oiseau Poulie 45°',g:'Épaules'}, {n:'Passage d\'Épaule Élastique',g:'Épaules'}, {n:'Rotation Externe Épaule Abduction',g:'Épaules'}, {n:'Rotation Externe Épaule Élastique',g:'Épaules'}, {n:'Rotation Interne 90° Poulie',g:'Épaules'},
  // Épaules + Trapèzes — figurines 2e partie (lot 2026-07-06)
  {n:'Élévation Frontale Banc Incliné',g:'Épaules'}, {n:'Élévation Latérale Inclinée Haltère',g:'Épaules'}, {n:'Rotation Externe Épaule Haltère',g:'Épaules'}, {n:'Tirage Menton Élastique',g:'Trapèzes'}, {n:'Thruster',g:'Full Body'}, {n:'Thruster Kettlebell',g:'Full Body'}, {n:'Russian Twist Développé Épaules',g:'Abdominaux'},
  // ── Biceps ─────────────────────────────────────────────────
  {n:'Curl Barre',g:'Biceps'},{n:'Curl Haltères',g:'Biceps'},{n:'Curl Poulie',g:'Biceps'},
  {n:'Curl EZ',g:'Biceps'},{n:'Curl Barre EZ Prise Large',g:'Biceps'},
  {n:'Curl Incliné',g:'Biceps'},{n:'Curl Concentré',g:'Biceps'},
  {n:'Curl Câble en Croix (Bayesian Curl)',g:'Biceps'},{n:'Curl Araignée (Spider Curl)',g:'Biceps'},
  {n:'Curl Zottman',g:'Biceps'},{n:'Marteau',g:'Biceps'},
  {n:'Curl Machine',g:'Biceps'},{n:'Curl Pupitre Machine',g:'Biceps'},
  // ── Triceps ────────────────────────────────────────────────
  {n:'Dips Lestés',g:'Triceps'},{n:'Bench Dips',g:'Triceps'},
  {n:'Barre au Front',g:'Triceps'},{n:'Skull Crusher Barre EZ',g:'Triceps'},
  {n:'Extension Triceps',g:'Triceps'},{n:'Extension Triceps Couché Haltères',g:'Triceps'},
  {n:'Extension Nuque Haltère',g:'Triceps'},{n:'Extension Nuque Poulie Haute',g:'Triceps'},
  {n:'Triceps Poulie',g:'Triceps'},{n:'Triceps Corde Poulie',g:'Triceps'},{n:'Triceps Poulie Basse',g:'Triceps'},
  {n:'Extension Triceps Arrière (Kickback)',g:'Triceps'},{n:'Triceps Haltère',g:'Triceps'},
  {n:'Triceps Machine',g:'Triceps'},
  // ── Jambes ─────────────────────────────────────────────────
  {n:'Squat à la Barre',g:'Jambes'},{n:'Squat Avant',g:'Jambes'},{n:'Squat Bulgare',g:'Jambes'},
  {n:'Squat Gobelet (Goblet Squat)',g:'Jambes'},{n:'Squat Sumo',g:'Jambes'},
  {n:'Smith Machine Squat',g:'Jambes'},{n:'Squat Hack (Hack Squat)',g:'Jambes'},
  {n:'Press Jambes 45°',g:'Jambes'},{n:'Press Jambes Horizontale',g:'Jambes'},
  {n:'Press Jambes Verticale',g:'Jambes'},{n:'Press Jambes Inclinée',g:'Jambes'},
  {n:'Press Jambes Levier',g:'Jambes'},
  {n:'Extension Quadriceps (Leg Extension)',g:'Jambes'},
  {n:'Leg Curl Couché Machine',g:'Fessiers'},{n:'Leg Curl Assis Machine',g:'Fessiers'},
  {n:'Leg Curl Unilatéral Debout',g:'Fessiers'},{n:'Leg Curl Haltère',g:'Fessiers'},{n:'Leg Curl Élastique',g:'Fessiers'},{n:'Leg Curl Inversé',g:'Fessiers'},
  {n:'Squat Pistol',g:'Jambes'},{n:'Squat Kettlebell',g:'Jambes'},{n:'Fentes Kettlebell',g:'Jambes'},
  {n:'Fentes',g:'Jambes'},{n:'Fentes Marchées',g:'Jambes'},{n:'Fentes Arrière',g:'Jambes'},{n:'Fentes Latérales',g:'Jambes'},
  {n:'Smith Machine Fentes',g:'Jambes'},
  {n:'Montée sur Box (Step-up)',g:'Jambes'},{n:'Montée sur Box Haltères',g:'Jambes'},
  {n:'Abduction Cuisses (Leg Abduction)',g:'Fessiers'},{n:'Adduction Cuisses (Leg Adduction)',g:'Jambes'},
  {n:'Extension Quadriceps Unilatérale',g:'Jambes'},{n:'Hack Squat Inversé',g:'Jambes'},
  {n:'Pendulum Squat',g:'Jambes'},{n:'Belt Squat',g:'Jambes'},{n:'Safety Bar Squat',g:'Jambes'},
  {n:'Overhead Squat',g:'Jambes'},{n:'Pin Squat',g:'Jambes'},{n:'Sissy Squat',g:'Jambes'},
  {n:'Cossack Squat',g:'Jambes'},{n:'Squat Bande Élastique',g:'Jambes'},{n:'Chaise (Wall Sit)',g:'Jambes'},
  {n:'Presse à Cuisses Iso-Latérale',g:'Jambes'},{n:'Sled Push',g:'Jambes'},{n:'Croix de Fer Haltères',g:'Épaules'},
  // ── Fessiers ───────────────────────────────────────────────
  {n:'Poussée de Hanche (Hip Thrust)',g:'Fessiers'},{n:'Poussée de Hanche Haltère',g:'Fessiers'},{n:'Poussée de Hanche Machine',g:'Fessiers'},
  {n:'Pont Fessier (Glute Bridge)',g:'Fessiers'},
  {n:'Extension Fessiers Arrière (Kickback)',g:'Fessiers'},{n:'Kickback Machine',g:'Fessiers'},{n:'Kickback Cable',g:'Fessiers'},
  {n:'Soulevé de Terre',g:'Fessiers'},
  {n:'Soulevé de Terre Roumain Barre',g:'Fessiers'},{n:'Soulevé de Terre Roumain Haltères',g:'Fessiers'},
  {n:'Soulevé de Terre Roumain Unilatéral',g:'Fessiers'},{n:'Soulevé de Terre Sumo',g:'Fessiers'},
  {n:'Tirage Cable Fessiers (Cable Pull Through)',g:'Fessiers'},
  {n:'Curl Ischio-jambiers (Leg Curl)',g:'Fessiers'},
  {n:'Abducteurs Machine Debout',g:'Fessiers'},
  {n:'Soulevé de Terre Jambes Tendues',g:'Fessiers'},
  {n:'Soulevé de Terre Roumain Kettlebell',g:'Fessiers'},{n:'Soulevé de Terre Roumain Landmine',g:'Fessiers'},
  {n:'Soulevé de Terre Sumo Haltères',g:'Fessiers'},{n:'Soulevé de Terre Sumo Kettlebell',g:'Fessiers'},{n:'Soulevé de Terre Sumo Landmine',g:'Fessiers'},
  {n:'Soulevé de Terre Trap Bar',g:'Fessiers'},{n:'Soulevé de Terre avec Déficit',g:'Fessiers'},{n:'Soulevé de Terre Machine',g:'Fessiers'},
  {n:'Zercher Deadlift',g:'Fessiers'},{n:'Reeves Deadlift',g:'Fessiers'},
  {n:'Glute Ham Raise (GHD)',g:'Fessiers'},{n:'Kettlebell Swing',g:'Fessiers'},
  // ── Squats / fentes / presses / montées : AUSSI en Fessiers (cuisses + fessiers = 2 muscles principaux, retour Michel 2026-07-16) ──
  {n:'Squat à la Barre',g:'Fessiers'},{n:'Squat Avant',g:'Fessiers'},{n:'Squat Bulgare',g:'Fessiers'},
  {n:'Squat Gobelet (Goblet Squat)',g:'Fessiers'},{n:'Squat Sumo',g:'Fessiers'},{n:'Smith Machine Squat',g:'Fessiers'},
  {n:'Squat Hack (Hack Squat)',g:'Fessiers'},{n:'Squat Pistol',g:'Fessiers'},{n:'Squat Kettlebell',g:'Fessiers'},
  {n:'Belt Squat',g:'Fessiers'},{n:'Safety Bar Squat',g:'Fessiers'},{n:'Overhead Squat',g:'Fessiers'},
  {n:'Pin Squat',g:'Fessiers'},{n:'Cossack Squat',g:'Fessiers'},{n:'Squat Bande Élastique',g:'Fessiers'},
  {n:'Pendulum Squat',g:'Fessiers'},{n:'Hack Squat Inversé',g:'Fessiers'},
  {n:'Press Jambes 45°',g:'Fessiers'},{n:'Press Jambes Horizontale',g:'Fessiers'},{n:'Press Jambes Verticale',g:'Fessiers'},
  {n:'Press Jambes Inclinée',g:'Fessiers'},{n:'Press Jambes Levier',g:'Fessiers'},{n:'Presse à Cuisses Iso-Latérale',g:'Fessiers'},
  {n:'Fentes',g:'Fessiers'},{n:'Fentes Marchées',g:'Fessiers'},{n:'Fentes Arrière',g:'Fessiers'},
  {n:'Fentes Latérales',g:'Fessiers'},{n:'Fentes Kettlebell',g:'Fessiers'},{n:'Smith Machine Fentes',g:'Fessiers'},
  {n:'Montée sur Box (Step-up)',g:'Fessiers'},{n:'Montée sur Box Haltères',g:'Fessiers'},
  // ── Lombaires ──────────────────────────────────────────────
  {n:'Hyperextension (Back Extension)',g:'Lombaires'},{n:'Hyperextension Inverse (Reverse Hyper)',g:'Lombaires'},
  {n:'Hyperextension Lestée',g:'Lombaires'},{n:'Hyperextension Machine',g:'Lombaires'},
  {n:'Inclinaison Lombaire (Good Morning)',g:'Lombaires'},{n:'Good Morning Haltères',g:'Lombaires'},
  {n:'Soulevé de Terre',g:'Lombaires'},{n:'Soulevé de Terre Roumain Barre',g:'Lombaires'},
  {n:'Jefferson Curl',g:'Lombaires'},{n:'Tirage en Rack (Rack Pull)',g:'Lombaires'},
  {n:'Superman',g:'Lombaires'},
  // ── Abdominaux ─────────────────────────────────────────────
  {n:'Gainage',g:'Abdominaux'},{n:'Planche Latérale (Side Plank)',g:'Abdominaux'},{n:'Hollow Body',g:'Abdominaux'},
  {n:'L-Sit',g:'Abdominaux'},{n:'Windshield Wiper',g:'Abdominaux'},
  {n:'Crunch',g:'Abdominaux'},{n:'Crunch Poulie',g:'Abdominaux'},{n:'Crunch Oblique',g:'Abdominaux'},{n:'Crunch Machine',g:'Abdominaux'},
  {n:'Câble Crunch',g:'Abdominaux'},{n:'Rotation Machine Obliques',g:'Abdominaux'},
  {n:'Relevé de Jambes',g:'Abdominaux'},{n:'Relevé de Buste (Sit-up)',g:'Abdominaux'},
  {n:'Chaise Romaine',g:'Abdominaux'},
  {n:'Roue Abdominale (Ab Wheel)',g:'Abdominaux'},{n:'Rotation Russe (Russian Twist)',g:'Abdominaux'},
  {n:'Drapeau (Dragon Flag)',g:'Abdominaux'},{n:'Grimpeur (Mountain Climber)',g:'Abdominaux'},
  // ── Mollets ────────────────────────────────────────────────
  {n:'Élévations Mollets Debout',g:'Mollets'},{n:'Élévations Mollets Assis',g:'Mollets'},
  {n:'Élévations Mollets Unilatéral',g:'Mollets'},
  {n:'Presse Mollets (Leg Press)',g:'Mollets'},{n:'Élévations Mollets Penché (Donkey Calf Raise)',g:'Mollets'},
  {n:'Mollets Machine Debout',g:'Mollets'},{n:'Mollets Machine Assise',g:'Mollets'},
  {n:'Sauts à la Corde',g:'Mollets'},
  // ── Avant-bras ─────────────────────────────────────────────
  {n:'Curl Poignet Barre',g:'Avant-bras'},{n:'Extension Poignet Barre',g:'Avant-bras'},
  {n:'Pronation Supination Haltère',g:'Avant-bras'},
  {n:'Farmer\'s Walk (Grip)',g:'Avant-bras'},{n:'Planche de Préhension',g:'Avant-bras'},
  // ── Full Body / Fonctionnel ────────────────────────────────
  {n:'Burpees',g:'Full Body'},{n:'Kettlebell Swing',g:'Full Body'},
  {n:'Arraché Haltère (Dumbbell Snatch)',g:'Full Body'},{n:'Thrusters Haltères',g:'Full Body'},
  {n:'Clean & Jerk',g:'Full Body'},{n:'Turkish Get-Up',g:'Full Body'},
  {n:'Battle Rope',g:'Full Body'},{n:'Box Jump',g:'Full Body'},
];
const BIG3=['Squat à la Barre','Développé Couché','Soulevé de Terre'];
const BIG4=['Squat à la Barre','Soulevé de Terre','Développé Couché','Développé Militaire'];
const PCT_IDS=['p100','p95','p90','p85','p80','p75','p70','p60'];
const PCT_VALS=[100,95,90,85,80,75,70,60];
const DEFAULT_URL='https://script.google.com/macros/s/AKfycbxWUsEFIlmx-Jxh9jWmEkvXl6rYXk5pR__u5i_GhnOtXua_f6W8wPNqCztZNDMD9N4qbA/exec';
// Serveur IA Cloudflare (worker.js / GUIDE-CLOUDFLARE.md) : appelle Anthropic EN DIRECT (sans la
// redirection Google qui casse en 4G/5G) → validé en 5G le 2026-07-14 (bilan photo lu ✅).
const AI_PROXY_URL='https://dry-field-e931.forcetracker-app.workers.dev';
// Actions traitées EN DIRECT par le Worker (marchent en 4G). Les AUTRES (coach, importProgram…)
// restent sur Apps Script tant qu'elles n'ont pas été ajoutées au Worker → à étendre ensuite.
const AI_PROXY_ACTIONS=['importBodyScan','foodLabel','readBarcode','coach','importProgram','importHistory','morphoAnalysis','bodyStudy','importBloodTest','summarizeCoach','estimateFood','importMealPlan','generateMealPlan'];
// URL pour un appel IA : le Worker si l'action y est gérée en direct, sinon Apps Script (S.url).
function _aiUrl(action){
  try{ if(typeof AI_PROXY_URL!=='undefined'&&AI_PROXY_URL&&action&&AI_PROXY_ACTIONS.indexOf(action)>=0) return AI_PROXY_URL; }catch(e){}
  return (typeof S!=='undefined'&&S&&S.url)?S.url:DEFAULT_URL;
}
const SET_TYPES=['N','É','X'];
const SET_TYPE_LABELS={N:'Normal',É:'Échauffement',X:'Échec'};

// ─── NOUVELLES FONCTIONNALITÉS (indicateur pastille) ─────────
// Ajouter ici chaque nouvelle feature avec un id unique + l'écran concerné.
// La pastille disparaît au premier accès à l'écran.
const NEW_FEATURES=[
  // Accueil
  {id:'home-calendar', screen:'home', desc:'Nouveau : un calendrier de ton mois sur l\'Accueil — tes jours de séance en rouge, les jours de RECORD cerclés en or. Navigue sur les mois, tape une semaine pour le détail'},
  {id:'day-state', screen:'home', spot:'home-daystate', desc:'Nouveau : « Comment tu te sens aujourd\'hui ? » — indique ton énergie et une éventuelle douleur du jour ; Milo adapte ses conseils et protège la zone douloureuse'},
  {id:'day-pain-detail', screen:'home', spot:'home-daystate', desc:'Nouveau : plus de zones de douleur (trapèze, cuisse, ischio, mollet…) + précise le côté (gauche/droite/les deux)'},
  // Séance
  {id:'chain-sets',  screen:'log',      desc:'Chaînes d\'exercices : super set, drop set, pyramide'},
  {id:'ex-history',  screen:'log',      desc:'Mini graphique historique poids par exercice (📊)'},
  {id:'wkt-pause',   screen:'log',      desc:'Mettre la séance en pause (le chrono se fige)'},
  {id:'superset-drag', screen:'log',    desc:'Nouveau : glisse un exercice (via la poignée 6 points) sur un autre pour créer un superset en un geste'},
  {id:'wkt-vider',   screen:'log',      desc:'Vider la séance si mauvais programme chargé'},
  {id:'custom-ex-photo',screen:'log',   desc:'Ajouter une photo à un exercice que tu crées (📷)'},
  {id:'custom-ex-edit', screen:'log',   desc:'Modifier un exercice perso (nom, groupe, muscles) après création (✏️)'},
  {id:'photo-any-ex',   screen:'log',   desc:'Photo sur n\'importe quel exercice + tap sur la photo pour la voir en grand'},
  {id:'beginner-prog',  screen:'log',   desc:'Parcours débutant : programme sur mesure (choix 2/3 séances + style Full Body ou Split, machines guidées) — dans 📋 Mes Programmes'},
  {id:'prog-export',    screen:'log',   desc:'Exporter un programme en vrai PDF (bouton 📄 PDF sur chaque programme — partage iPhone ou téléchargement, marche hors-ligne)'},
  // Progrès — spot = id de l'élément (onglet) où poser le point rouge « ici »
  {id:'weight-edit', screen:'progress', spot:'ptab-poids', desc:'Nouveau : tape un point du graphique de poids pour modifier/supprimer la pesée + navigation par période (1M/3M/6M/Tout)'},
  {id:'bodyfat-track', screen:'progress', spot:'ptab-poids', desc:'Nouveau : suivi de la masse grasse dans le temps (calcul US Navy ou saisie) + bascule Poids ↔ Masse grasse sur le graphique'},
  {id:'target-weight', screen:'progress', spot:'ptab-poids', desc:'Nouveau : fixe un poids objectif (ligne repère sur le graphique + kg restants)'},
  {id:'prog-chips',  screen:'progress', desc:'Barre de progression personnalisable (✏️)'},
  {id:'prog-badges', screen:'progress', spot:'ptab-badges', desc:'Onglet Badges (🏅)'},
  {id:'hist-ex-perf', screen:'progress', desc:'Nouveau : dans le détail d\'une séance passée, une icône 📊 sur chaque exercice → voir ta progression (ton poids sur les dernières séances)'},
  // Coach — spot = carte/bouton précis de l'écran Coach
  {id:'coach-photo', screen:'coach', spot:'coach-cam-btn', desc:'Envoi de photo au Coach IA (📷)'},
  {id:'coach-morpho',screen:'coach', spot:'coach-morpho-btn-wrap', desc:'Analyses photo de Milo (morpho + étude du corps, 📸 Premium)'},
  {id:'coach-share', screen:'coach',    desc:'Nouveau : partager ou copier une réponse du Coach'},
  {id:'body-study',  screen:'coach',    desc:'Nouveau : Étude du corps — 4 photos, bilan posture/insertions/équilibre + exercices (📐 Premium)'},
  {id:'force-prog',  screen:'coach', spot:'coach-action-force', desc:'Nouveau : Gagner en force (Big 3) — Milo te génère un programme powerlifting à enregistrer (🏋️)'},
  {id:'coach-quiz',  screen:'coach', spot:'coach-quiz-card', desc:'Nouveau : réponds au questionnaire « Milo apprend à te connaître » (gratuit, ça ne compte pas dans tes questions) — Milo te donne des conseils bien plus personnalisés'},
  {id:'milo-natural',screen:'coach', desc:'Nouveau : Milo (Coach IA) tient compte de l\'heure qu\'il est et du temps écoulé depuis votre dernière discussion — il t\'accueille naturellement'},
  {id:'milo-coach-pro',screen:'coach', desc:'Nouveau : Milo coache comme un vrai coach — il t\'évalue, croise tes données, justifie ses choix et s\'adapte à ta vie (horaires, travail, temps)'},
  {id:'gardien-securite',screen:'coach', desc:'Nouveau : Milo veille sur ta sécurité — il tient compte en priorité de ta santé et de tes zones fragiles, et ADAPTE au lieu d\'interdire. Renseigne-les dans Profil → Santé'},
  // Profil (setup) — anchor = id de la ligne de menu où le point rouge s'affiche (ici la carte Profil)
  {id:'morpho-setup',screen:'setup', anchor:'menu-row-profil', desc:'Section morphologie dans Profil'},
  {id:'discipline',  screen:'setup', anchor:'menu-row-profil', desc:'Nouveau : choisis ta Discipline (muscu, bodybuilding, force athlé, haltéro) — le Coach s\'y adapte'},
  {id:'profil-accordion',screen:'setup', anchor:'menu-row-profil', desc:'Profil réorganisé en sections repliables'},
  {id:'level-evolutif',screen:'setup', anchor:'menu-row-profil', desc:'Ton niveau (débutant/intermédiaire/confirmé) dans Profil → Discipline — le Coach s\'adapte et ton niveau évolue tout seul avec tes séances'},
  {id:'adn-sportif', screen:'setup', anchor:'menu-row-profil', desc:'Nouveau : « Mon ADN sportif » dans ton Profil — dis à Milo ce qui te caractérise durablement (motivation, mode de vie, préférences, expérience) pour des conseils vraiment personnels'},
  {id:'work-actif',  screen:'setup', anchor:'menu-row-profil', desc:'Nouveau : niveau de travail « Actif » (serveuse, infirmier, vendeur : debout + en déplacement) dans ton Profil — tes calories et macros sont plus justes'},
  {id:'app-guide',   screen:'setup', anchor:'menu-row-appguide', desc:'Nouveau : Menu → « Guide de l\'application » — un diaporama qui explique comment marche l\'app (séance, programmes, Milo, photos…)'},
  {id:'milo-knows',  screen:'setup', anchor:'menu-row-miloknows', desc:'Nouveau : Milo apprend à te connaître — il te pose de petites questions sur l\'Accueil, et tu retrouves tout ce qu\'il a retenu dans Menu → « Ce que Milo sait de toi »'},
  {id:'coach-history', screen:'coach', desc:'Nouveau : Milo se souvient de vos échanges (même en gratuit) + le bouton « + » range tes discussions dans « Mes discussions » (icône horloge) au lieu de les effacer'},
  // Nutrition — spot = onglet où poser le point rouge « ici »
  {id:'food-journal', screen:'nutrition', spot:'ntab-journal', desc:'Nouveau : Journal alimentaire — note tes repas et suis tes calories/macros du jour vs ton objectif'},
  {id:'food-barcode', screen:'nutrition', spot:'ntab-journal', desc:'Nouveau : scan d\'un code-barres dans le journal — le produit est reconnu automatiquement (base mondiale)'},
  {id:'food-score',   screen:'nutrition', spot:'ntab-journal', desc:'Nouveau : le score santé des produits (Nutri-Score + niveau de transformation) au code-barres — gratuit pour tout le monde'},
  {id:'food-bc-photo', screen:'nutrition', spot:'ntab-journal', desc:'Nouveau : photographie le code-barres, l\'IA lit les chiffres pour toi (plus besoin de les taper)'},
  // ⏳ Réservé testeurs — red dots manual-kcal/goal-recomp/reps-maxi à réactiver à l'ouverture générale.
  {id:'meal-import',  screen:'nutrition', desc:'Nouveau : importer le plan alimentaire de ta diététicienne (photo/PDF) — l\'IA range les repas'},
  // Accueil — Sommeil déplacé ici + historique (spot = la barre « Historique du sommeil »)
  {id:'sleep-home',    screen:'home', spot:'sleep-hist-toggle', desc:'Nouveau : ton sommeil est maintenant sur l\'Accueil (juste sous ton score de récup) + tu peux noter un jour oublié'},
  {id:'sleep-history', screen:'home', spot:'sleep-hist-toggle', desc:'Nouveau : « Historique du sommeil » — un mini-graphique (7/30 jours) + la liste jour par jour, tape un jour pour l\'ajouter/corriger'},
];

// ─── « QUOI DE NEUF » — pop-up de nouveautés versionnée ──────
// Liste des nouveautés notables, de la PLUS RÉCENTE (v le plus grand) à la plus ancienne.
// À l'ouverture de l'app, la pop-up affiche toutes les entrées dont `v` > au dernier
// numéro vu par l'utilisateur (localStorage ft4_wn_seen). Donc quelqu'un qui n'a pas
// ouvert l'app depuis longtemps voit TOUTES les nouveautés manquées d'un seul coup ;
// un utilisateur à jour ne voit que la (ou les) toute(s) dernière(s).
// ➕ Pour annoncer une nouveauté : ajoute une entrée en HAUT avec v = WHATS_NEW_MAX+1,
//    puis incrémente WHATS_NEW_MAX. Ne jamais réutiliser un ancien numéro.
// ⏳ Réservé testeurs (calories manuelles, objectif recomposition, « maxi ») —
//    à RÉACTIVER (remettre les 3 entrées en v26/27/28 + WHATS_NEW_MAX=28) quand on ouvre à tout le monde.
//    (v15 = excuses réseau 4G ; v16 = sommeil ; v17 = ADN ; v18 = Milo apprend ; v19 = Milo veille sur ta sécurité ; v20 = état du jour ; v24 = mémoire pour tous + historique discussions ; v25 = douleurs précises gauche/droite — déjà pour tout le monde.)
const WHATS_NEW=[
  {v:25, ic:'🎯', t:'Tes douleurs, en plus précis', d:'La carte « Comment tu te sens aujourd\'hui ? » (sur l\'Accueil) et l\'écran des blessures à l\'inscription reconnaissent maintenant BEAUCOUP plus de zones (trapèze, pectoraux, cuisse, ischio, fessier, adducteur, mollet, abdos… en plus des articulations). Et pour une zone comme le genou ou l\'épaule, tu peux préciser le CÔTÉ : gauche, droite ou les deux. Résultat : Milo protège encore plus finement la bonne zone. 🎯 (Merci Christophe pour l\'idée !)'},
  {v:24, ic:'💬', t:'Tes discussions avec Milo sont gardées', d:'Deux nouveautés côté Coach 💬 : 1) Milo se souvient maintenant de l\'essentiel de vos échanges MÊME sans être Premium — il te connaît un peu plus à chaque conversation. 2) Le bouton « + » (nouvelle discussion) n\'efface plus rien : ta discussion en cours est RANGÉE dans « Mes discussions » (l\'icône horloge en haut du Coach). Tape-la pour la rouvrir quand tu veux, ✕ pour la supprimer. Fini les conversations perdues !'},
  {v:20, ic:'🌡️', t:'Dis à Milo comment tu te sens aujourd\'hui', d:'Nouveau sur ton Accueil : une petite carte « Comment tu te sens aujourd\'hui ? » (optionnelle). En 1-2 taps, indique ton énergie du jour et, si besoin, une gêne ou une douleur (épaule, genou, dos…). Milo adapte alors ses conseils DU JOUR — et surtout, s\'il y a une douleur, il PROTÈGE cette zone en priorité (il allège ou propose une alternative, sans t\'interdire de bouger). Ça repart à zéro chaque jour, et le ressenti prime toujours. 🌡️'},
  {v:19, ic:'🛡️', t:'Milo veille sur ta sécurité', d:'Milo tient maintenant compte EN PRIORITÉ de ta santé et de tes zones fragiles (épaule, genou, dos, arthrose…) avant de te conseiller. Sa règle d\'or : ADAPTER, jamais t\'interdire bêtement — il cherche toujours le moyen le MOINS contraignant de continuer à progresser en sécurité, et te propose des alternatives. 👉 Renseigne tes zones fragiles, vieilles blessures et soucis de santé dans Profil → Santé, pour qu\'il les protège. 🛡️'},
  {v:18, ic:'🧠', t:'Milo apprend à te connaître', d:'Milo va commencer à te poser de petites questions sur ta page d\'Accueil (par ex. « tu t\'entraînes plutôt le matin, non ? »). À chaque fois que tu confirmes, il RETIENT — et ses conseils deviennent plus justes, plus personnels. Rien n\'est mémorisé sans ton accord : tu réponds « Oui, c\'est vrai » ou « Pas vraiment ». Et tu peux voir ou effacer tout ce qu\'il a retenu dans Menu → « Ce que Milo sait de toi ». 🧠'},
  {v:17, ic:'🧬', t:'Ton ADN sportif', d:'Nouveau dans ton Profil (Menu → Profil → « Mon ADN sportif ») : dis à Milo ce qui te caractérise DURABLEMENT dans ta façon de t\'entraîner — ta motivation profonde, ton mode de vie (temps, lieu, matériel), ce que tu aimes/détestes et ton expérience. Résultat : des conseils bien plus personnels et RÉALISTES (il ne te proposera pas une séance d\'1h30 si tu as 45 min, ni des squats si tu les détestes). Tout est optionnel et privé. 🧬'},
  {v:16, ic:'😴', t:'Ton sommeil sur l\'Accueil + son historique', d:'Le sommeil est maintenant sur la page d\'Accueil, juste sous ton score de récup (avant il était dans Séance et on ne le trouvait pas). Nouveau aussi : tu peux NOTER UN JOUR OUBLIÉ (choisis la date, ex. hier) et ouvrir « 📊 Historique du sommeil » → un petit graphique (7 ou 30 jours) + la liste nuit par nuit ; tape n\'importe quel jour pour l\'ajouter ou le corriger. 😴'},
  {v:15, ic:'🙏', t:'Petit souci réglé — merci de votre patience', d:'Ces derniers jours, les lectures par PHOTO (bilan de balance, code-barres, étiquette nutrition) et le Coach Milo pouvaient échouer quand tu n\'étais pas en wifi (4G/5G). Désolé pour la gêne ! 😅 C\'est RÉPARÉ ✅ — tout ça fonctionne maintenant PARTOUT, même sans wifi (à la salle, au magasin…). ⚠️ C\'est encore en cours de test : si tu remarques un souci, dis-le-nous (Menu → Espace testeur, ou par email). Merci de votre patience, et bon entraînement ! 💪'},
  {v:14, ic:'🧠', t:'Milo coache comme un vrai coach', d:'Ton Coach IA a franchi un cap : il RAISONNE comme un vrai coach. Il t\'évalue avant de te conseiller (et te pose des questions si besoin), croise tes records, ta morpho et ton bilan corporel, justifie ses choix, s\'adapte à ta vie (horaires, travail, temps dispo) et te dit la vérité sans langue de bois. Demande-lui un programme ou « pourquoi je stagne ? » — tu vas voir la différence !'},
  {v:13, ic:'✋', t:'Superset par glisser-déposer', d:'En séance, attrape la petite poignée (6 points) sur un exercice et glisse-le sur un autre → le superset (enchaînement sans repos) se crée tout seul. Plus rapide que de passer par le menu. Marche sur les exercices pas encore groupés.'},
  {v:12, ic:'📷', t:'Photographie le code-barres', d:'Dans le Journal alimentaire, plus besoin de taper les chiffres : appuie sur « 📷 Photographier le code-barres », prends-le en photo, et l\'IA lit le numéro pour toi → le produit et son score santé s\'affichent tout seuls. Pratique quand les chiffres sont petits ou abîmés.'},
  {v:11, ic:'🥗', t:'Score santé des produits', d:'Dans le Journal alimentaire, tape le code-barres d\'un produit → tu vois son SCORE SANTÉ : Nutri-Score (A à E) et niveau de transformation. Pour manger plus clair, sans te prendre la tête. Gratuit pour tout le monde.'},
  {v:10, ic:'📅', t:'Calendrier sur ton Accueil', d:'Un calendrier de ton mois directement sur la page d\'accueil : tes jours de séance ressortent en rouge, et les jours où tu as BATTU UN RECORD sont cerclés en or 🏆. Navigue sur les mois précédents, et tape une semaine pour voir le détail jour par jour.'},
  {v:9, ic:'🔒', t:'Mise à jour de sécurité en approche', d:'On renforce la protection de tes données 🛡️. Plusieurs améliorations sont DÉJÀ en place (invisibles pour toi). Et très bientôt : tu pourras protéger ton compte avec un CODE PERSO — comme un mot de passe — pour que toi seul(e) puisses accéder à tes séances, ton poids et tes infos. Aucune action à faire maintenant : on te guidera pas à pas le moment venu, et tes données restent en sécurité entre-temps. 👊'},
  {v:8, ic:'🎨', t:'Ton app à ta couleur', d:'Nouveau : un halo d\'ambiance en mode nuit ✨. Dans Menu → Apparence, choisis TA couleur (8 teintes), le sens du halo (haut/bas), ou un fond uni tout noir. Le thème Jour/Nuit est aussi regroupé là.'},
  {v:7, ic:'🏋️', t:'Séances : cardio & corrections', d:'Tu peux maintenant enregistrer une séance de cardio seul (sans muscu). Et sur une séance passée, tu peux ajouter un exercice oublié, des séries, ou le cardio.'},
  {v:6, ic:'🏃', t:'Niveau de travail « Actif »', d:'Nouveau réglage dans ton Profil pour les métiers debout ET en déplacement toute la journée (serveuse, infirmier, vendeur) — entre « Debout » et « Physique ». Tes calories et macros de la Nutrition sont plus justes.'},
  {v:5, ic:'💬', t:'Milo (Coach IA) plus naturel', d:'Le Coach sait maintenant l\'heure qu\'il est (jour / nuit) et depuis combien de temps vous vous êtes parlé (hier, il y a quelques jours…) — il t\'accueille comme il faut au lieu de reprendre comme si tu venais de partir.'},
  {v:4, ic:'📓', t:'Journal alimentaire', d:'Onglet « Journal » dans Nutrition : note ce que tu manges et suis tes calories + macros du jour face à ton objectif.'},
  {v:3, ic:'📷', t:'Scan de code-barres', d:'Scanne un produit dans le journal : il est reconnu automatiquement et ses valeurs se remplissent — tu ajustes juste la quantité.'},
  {v:2, ic:'🤖', t:'Estimation par l\'IA', d:'Décris ton repas (« 200g poulet, riz, brocolis ») et l\'IA remplit les calories. 25 gratuites, illimité en Premium. La saisie à la main reste gratuite.'},
  {v:1, ic:'📥', t:'Importer un plan diététicien', d:'Une photo ou un PDF de ta diététicienne → l\'IA range tous les repas, jour par jour.'},
];
const WHATS_NEW_MAX=25;     // = plus grand `v` ci-dessus (les features testeurs réactivées prendront v26/27/28)
const WHATS_NEW_SHOW_MAX=6; // n'affiche jamais plus de N nouveautés d'un coup (évite une pop-up à rallonge)

// ─── ACCÈS ADMIN ─────────────────────────────────────────────
// Le panneau admin (5 taps sur le logo) ne s'ouvre QUE si :
//   - le compte connecté est un email admin, OU
//   - l'appareil a été déverrouillé une fois avec le code de secours.
// ⚠️ Sécurité « anti-curieux » : le code est dans le JS public (GitHub Pages) →
//    ça bloque 99,9 % des gens, mais pas quelqu'un qui lirait le code source.
//    Un vrai verrou nécessiterait une authentification côté serveur (chantier futur).
const ADMIN_EMAILS=['michdu75@gmail.com'];
const ADMIN_CODE='0115'; // code de secours (modifiable sur demande)

// ─── TESTEURS FONDATEURS ─────────────────────────────────────
// Les tout premiers testeurs de Michel — récompensés par un statut exclusif
// (carte dorée sur l'Accueil) + fonctions réservées à venir.
// ⚠️ Emails en minuscules (comparaison via _isTester()). Reconnaissance « anti-curieux »
//    côté client (comme le code admin) : suffisant pour une récompense cosmétique.
const TESTER_EMAILS=['christophe@famillelanglois.fr','elineazs32@gmail.com','emma.david16@gmail.com','tanna.valery.studio@gmail.com'];
// « Super testeur » : celui qui teste vraiment à fond → espace exclusif (analyse photos approfondie + boîte à idées remontée à Michel).
// michdu75 y est aussi pour le suivi photos (accès via le panneau Admin) — mais PAS de carte « Testeur Fondateur » ni de message « Michel te remercie » (voir _isTester / checkSuperTesterWelcome).
const SUPER_TESTER_EMAILS=['christophe@famillelanglois.fr','michdu75@gmail.com','emma.david16@gmail.com'];
// ─── PREMIUM CÔTÉ CLIENT (fondateurs / testeurs premium À VIE) ────────────────
// Miroir de PREMIUM_HARDCODED_ (Code.js). Comme la boîte à idées (TESTER_EMAILS),
// le premium de ces comptes est accordé DIRECTEMENT dans l'app — sans dépendre de
// l'appel serveur (loadProfile), qui peut échouer (réseau faible, code d'accès,
// erreur) et laisser le mur premium affiché alors qu'ils sont premium à vie.
// « Anti-curieux » comme le reste : seul un email de cette liste devient premium.
// ⚠️ Garder synchronisé avec PREMIUM_HARDCODED_ dans Code.js.
const PREMIUM_CLIENT_EMAILS=['michdu75@gmail.com','elineazs32@gmail.com','christophe@famillelanglois.fr','apollonone75@gmail.com','emma.david16@gmail.com','tanna.valery.studio@gmail.com'];
function _isClientPremium(){ try{ const e=((typeof S!=='undefined'&&S.email)||'').trim().toLowerCase(); return !!e && PREMIUM_CLIENT_EMAILS.indexOf(e)>=0; }catch(_){ return false; } }
// Email où remontent les idées de la boîte à idées → compte dédié de l'app (séparé du mail perso de Michel).
const TESTER_FEEDBACK_EMAIL='forcetracker.app@gmail.com';

// ─── COACH IA — identité ─────────────────────────────────────
const COACH_NAME='Milo';   // nom affiché + signature (modifiable)
// Pas de ton figé : Milo a un penchant « franc/direct » par défaut MAIS s'adapte à la personne
// (niveau, état du jour, façon de parler) — voir buildCoachContext.

// ─── STRENGTH STANDARDS (ratio 1RM / poids corps) ────────────
// [Débutant, Novice, Intermédiaire, Avancé] seuils
const STD={
  H:{
    'Squat à la Barre':            [0.75,1.00,1.25,1.50],
    'Développé Couché': [0.50,0.65,0.85,1.05],
    'Soulevé de Terre': [1.00,1.25,1.50,1.75],
  },
  F:{
    'Squat à la Barre':            [0.50,0.70,0.90,1.10],
    'Développé Couché': [0.30,0.40,0.55,0.70],
    'Soulevé de Terre': [0.65,0.85,1.10,1.35],
  }
};
const LVL_NAMES=['Débutant','Novice','Intermédiaire','Avancé','Élite'];
const LVL_CSS  =['lvl-D','lvl-N','lvl-I','lvl-A','lvl-E'];

// Age correction: facteur appliqué aux seuils (plus âgé = seuil réduit = même mérite)
function ageCorr(age){
  if(age<20)return 0.95; if(age<24)return 0.98; if(age<=35)return 1.0;
  if(age<=45)return 0.95; if(age<=55)return 0.90; if(age<=65)return 0.85;
  return 0.80;
}

function getLevel(exercise, rm1, bw, gender, age){
  const std=STD[gender]&&STD[gender][exercise];
  if(!std||!rm1||!bw) return {name:'—',cls:'lvl-D',idx:-1};
  const corr=ageCorr(age||30);
  const ratio=rm1/bw;
  const thresholds=std.map(t=>t*corr);
  let idx=0;
  for(let i=0;i<thresholds.length;i++){ if(ratio>=thresholds[i]) idx=i+1; }
  return {name:LVL_NAMES[idx]||'Élite',cls:LVL_CSS[idx]||'lvl-E',idx};
}

