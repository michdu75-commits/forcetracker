/*!
 * Force Tracker — © 2026 Michel (michdu75@gmail.com). Tous droits réservés.
 * Code propriétaire. Toute reproduction, copie, distribution ou réutilisation,
 * totale ou partielle, est INTERDITE sans autorisation écrite de l'auteur.
 * All Rights Reserved — unauthorized copying or reuse is prohibited.
 */
// ─── EXERCISE LIBRARY ────────────────────────────────────────
// ⚠️ RETIRÉS DU SÉLECTEUR le 09/08/2026, à la demande de Michel — faute de figurine trouvable :
//   · Glissement au Mur (Wall Slide)   · Dips Lestés   · Turkish Get-Up
// Puis le 09/08 au soir, même raison (Michel, après relecture de la page FIGURINES) :
//   · Abducteurs Machine Debout · Curl Câble en Croix (Bayesian Curl) · Curl Barre EZ Prise Large
//   · Windshield Wiper · Relevé de Buste (Sit-up) · L-Sit · Crunch Oblique
// ⚠️ ON NE RETIRE QUE DE CETTE LISTE. Leur identifiant (EX_IDS) et leur correspondance
// musculaire (_MEX) sont GARDÉS EXPRÈS : quelqu'un qui en a déjà dans son historique garde
// sa figurine, ses couleurs de calendrier et ses calories. On les retire du CHOIX, pas de la
// MÉMOIRE. (R30 : un retrait volontaire s'écrit, sinon le suivant le « répare ».)
const EXLIB=[
  // ── Pectoraux ──────────────────────────────────────────────
  {n:'Développé Couché',g:'Pectoraux'},{n:'Développé Couché Haltères',g:'Pectoraux'},
  {n:'Développé Incliné',g:'Pectoraux'},{n:'Développé Incliné Haltères',g:'Pectoraux'},
  {n:'Développé Décliné',g:'Pectoraux'},{n:'Développé Décliné Haltères',g:'Pectoraux'},
  {n:'Écarté Haltères',g:'Pectoraux'},{n:'Écarté Poulie',g:'Pectoraux'},
  {n:'Croisé Poulie (Cable Crossover)',g:'Pectoraux'},
  {n:'Pec Deck',g:'Pectoraux'},
  {n:'Chest Press Machine Horizontale',g:'Pectoraux'},{n:'Chest Press Machine Inclinée',g:'Pectoraux'},{n:'Chest Press Machine Déclinée',g:'Pectoraux'},
  {n:'Dips',g:'Pectoraux'},{n:'Dips Triceps (Buste Droit)',g:'Triceps'},{n:'Dips Machine Assistée',g:'Pectoraux'},{n:'Dips Assis Machine (Seated Dip)',g:'Pectoraux'},
  {n:'Pompes Lestées',g:'Pectoraux'},{n:'Pompes Déficit (Deficit Push-up)',g:'Pectoraux'},{n:'Pompes Diamant',g:'Pectoraux'},
  // ── 14 exercices ajoutés le 01/08/2026 (animations du dossier source de Michel, décision « ok pour ajouter les 14 ») ──
  {n:'Pompes (Push-up)',g:'Pectoraux'},
  {n:'Développé Couché avec Chaînes',g:'Pectoraux'},{n:'Développé Couché Larsen (Larsen Press)',g:'Pectoraux'},
  {n:'Développé Couché Unilatéral Kettlebell',g:'Pectoraux'},{n:'Développé Incliné Poulie',g:'Pectoraux'},
  // — Lots « pecs » et « épaules » du 01/08 : beaucoup d'élastique et de TRX (matériel dans le NOM) —
  {n:'Développé Couché au Sol (Floor Press)',g:'Pectoraux'},{n:'Développé Couché Élastique',g:'Pectoraux'},
  {n:'Développé Décliné Élastique',g:'Pectoraux'},{n:'Écarté Poulie Haute à Genoux',g:'Pectoraux'},
  {n:'Écarté Élastique',g:'Pectoraux'},{n:'Écarté TRX (Sangles)',g:'Pectoraux'},
  {n:'Chest Press TRX (Sangles)',g:'Pectoraux'},{n:'Pompes Inclinées TRX (Sangles)',g:'Pectoraux'},
  {n:'Développé Épaules Élastique',g:'Épaules'},{n:'Développé Épaules Assis Élastique',g:'Épaules'},
  {n:'Développé Épaules Unilatéral Élastique',g:'Épaules'},{n:'Élévations Latérales Unilatérale Poulie',g:'Épaules'},
  {n:'Oiseau Élastique',g:'Épaules'},{n:'Oiseau Inversé TRX (Sangles)',g:'Épaules'},
  {n:'Rotation Externe Épaule Poulie',g:'Épaules'},{n:'Handstand Push-up Suspendu (Sangles)',g:'Épaules'},
  {n:'Écarté Incliné Haltères',g:'Pectoraux'},{n:'Écarté Décliné Haltères',g:'Pectoraux'},{n:'Écarté Hyght (Hyght Fly)',g:'Pectoraux'},
  {n:'Hex Press Smith Machine',g:'Pectoraux'},{n:'Chest Press Poulie Assis',g:'Pectoraux'},
  {n:'Svend Press (Serrage de Plaque)',g:'Pectoraux'},
  {n:'Smith Machine Développé Couché',g:'Pectoraux'},{n:'Smith Machine Développé Incliné',g:'Pectoraux'},
  // ── Dos / Dorsaux ──────────────────────────────────────────
  {n:'Soulevé de Terre',g:'Dos'},{n:'Soulevé de Terre Sumo',g:'Dos'},
  {n:'Tirage en Rack (Rack Pull)',g:'Dos'},{n:'Inclinaison Lombaire (Good Morning)',g:'Fessiers'},
  {n:'Rowing Barre (Tirage Horizontal)',g:'Dos'},{n:'Rowing Haltère (Tirage Horizontal)',g:'Dos'},{n:'Rowing Câble (Tirage Horizontal)',g:'Dos'},
  {n:'Rowing Yates (Supination)',g:'Dos'},{n:'Rowing Poitrine Appuyée (Chest Supported)',g:'Dos'},
  {n:'Rowing Machine (Tirage Horizontal)',g:'Dos'},{n:'Rowing Hammer Strength',g:'Dos'},
  {n:'Tirage Poulie Haute (Lat Pulldown)',g:'Dos'},{n:'Tirage Poulie Haute Prise Serrée',g:'Dos'},{n:'Tirage Nuque',g:'Dos'},
  {n:'Tirage Poulie Basse Prise Large',g:'Dos'},{n:'Tirage Poulie Basse Prise Serrée',g:'Dos'},
  {n:'Traction Lestée',g:'Dos'},{n:'Traction Assistée',g:'Dos'},{n:'Traction Prise Neutre',g:'Dos'},
  // ⛔ « Pull-over » TOUT COURT RETIRÉ DU CHOIX le 25/08/2026 — décision de Michel, après deux
  //    versions passées à essayer de l'illustrer : *« le pull over tout seul on peut le retirer »*.
  //    Il faisait DOUBLON avec les 4 variantes (Barre · Haltère · Poulie · Machine) et, n'ayant
  //    pas de matériel, il ne pouvait ni être rangé ni illustré sans devenir le jumeau de l'une
  //    d'elles — le contrôle croisé ② a d'ailleurs refusé de lui prêter l'animation haltère.
  // ⭐⭐ C'EST UN RETRAIT, PAS UNE FUSION, et la nuance protège son historique : son identifiant
  //    `pull-over` reste dans EX_IDS (voir RETIRES_VOLONTAIREMENT), donc les séances et records
  //    déjà faits sous ce nom gardent leur nom, leurs muscles, leur figurine et leurs calories.
  //    ⛔ Une FUSION les aurait RENOMMÉS (state.js réécrit les noms stockés) — or Michel fait le
  //    pull-over « beaucoup à l'haltère mais aussi à la barre » : on ne sait pas lesquels étaient
  //    lesquels, et deviner aurait mélangé ses records (R29). *On retire du CHOIX, jamais de la
  //    MÉMOIRE.*
  {n:'Pull-over Haltère',g:'Dos'},{n:'Pullover Machine',g:'Dos'},
  {n:'Pull-over Barre',g:'Dos'},{n:'Pull-over Poulie',g:'Dos'},
  {n:'Rowing Smith Machine',g:'Dos'},{n:'Rowing T-Bar Machine',g:'Dos'},{n:'Rowing Landmine (T-Bar)',g:'Dos'},
  {n:'Rowing Haltères Buste Penché',g:'Dos'},{n:'Meadows Row',g:'Dos'},{n:'Seal Row',g:'Dos'},{n:'Renegade Row',g:'Dos'},
  {n:'Tirage Iso-Latéral Hammer Strength',g:'Dos'},{n:'Tirage Incliné Poulie Haute',g:'Dos'},{n:'Tirage Poulie Haute Prise Inversée',g:'Dos'},
  {n:'Traction Derrière la Nuque',g:'Dos'},{n:'Rocky Pull-up',g:'Dos'},{n:'Sled Pull',g:'Dos'},
  // — Lot « dos » du 01/08. ⚠️ « Tractions (Pull-up) » MANQUAIT au catalogue : il n'y avait que les
  //   variantes (lestée, assistée, prise neutre, nuque) — et la démo de la traction CLASSIQUE se
  //   retrouvait collée sur « Traction Lestée », qui montrait donc une traction sans lest.
  {n:'Tractions (Pull-up)',g:'Dos'},{n:'Traction Supination (Chin-up)',g:'Dos'},
  {n:'Muscle-up',g:'Dos'},{n:'Tractions aux Anneaux',g:'Dos'},
  {n:'Traction Australienne (Poids du Corps)',g:'Dos'},{n:'Traction Assistée avec Banc',g:'Dos'},
  {n:'Suspension Passive (Dead Hang)',g:'Dos'},{n:'Rowing Inversé sous une Table',g:'Dos'},
  {n:'Rowing Buste Penché Élastique',g:'Dos'},{n:'Rowing Horizontal Élastique',g:'Dos'},
  {n:'Rowing Unilatéral Élastique',g:'Dos'},{n:'Tirage Vertical Alterné Élastique',g:'Dos'},
  {n:'Rowing TRX (Sangles)',g:'Dos'},{n:'Traction Australienne TRX (Sangles)',g:'Dos'},
  // ── Trapèzes ───────────────────────────────────────────────
  {n:'Haussements d\'Épaules Barre',g:'Trapèzes'},
  {n:'Haussements d\'Épaules Haltères',g:'Trapèzes'},{n:'Haussements d\'Épaules Câble',g:'Trapèzes'},
  {n:'Tirage Menton',g:'Trapèzes'},{n:'Farmer\'s Walk',g:'Avant-bras'},
  {n:'Haussements d\'Épaules Overhead',g:'Trapèzes'},
  // ── Épaules ────────────────────────────────────────────────
  {n:'Développé Militaire',g:'Épaules'},{n:'Développé Militaire Haltères',g:'Épaules'},
  {n:'Développé Haltères Assis',g:'Épaules'},{n:'Développé Arnold (Arnold Press)',g:'Épaules'},
  {n:'Développé Épaules Machine',g:'Épaules'},{n:'Smith Machine Développé Militaire',g:'Épaules'},
  {n:'Élévations Latérales (Lateral Raise)',g:'Épaules'},{n:'Élévations Latérales Câble',g:'Épaules'},{n:'Élévations Latérales Machine',g:'Épaules'},
  {n:'Élévations Frontales',g:'Épaules'},{n:'Élévations Frontales Câble',g:'Épaules'},{n:'Élévations Frontales Machine',g:'Épaules'},
  {n:'Oiseau',g:'Épaules'},{n:'Machine Oiseau',g:'Épaules'},
  {n:'Tirage Visage (Face Pull)',g:'Épaules'},{n:'Tirage Menton Kettlebell',g:'Épaules'},
  {n:'Y Raise / W Raise',g:'Épaules'},{n:'Développé Nuque',g:'Épaules'},
  // Épaules + Trapèzes — figurines (lot 2026-07-06)
  {n:'Développé Épaules Kettlebell',g:'Épaules'}, {n:'Développé Landmine (Épaules)',g:'Épaules'}, {n:'Écarté Arrière Élastique',g:'Épaules'}, {n:'Élévation Frontale Allongée Barre',g:'Épaules'}, {n:'Élévation Latérale Poulie Inclinée',g:'Épaules'}, {n:'Élévation Latérale Landmine',g:'Épaules'}, {n:'Élévations Latérales Kettlebell',g:'Épaules'}, {n:'Rotation Interne Épaule Élastique',g:'Épaules'}, {n:'Face Pull Couché Poulie',g:'Épaules'}, {n:'Oiseau Poulie 45°',g:'Épaules'}, {n:'Passage d\'Épaule Élastique',g:'Épaules'},{n:'Rotation Externe Épaule Abduction',g:'Épaules'}, {n:'Rotation Externe Épaule Élastique',g:'Épaules'}, {n:'Rotation Interne 90° Poulie',g:'Épaules'},
  // Épaules + Trapèzes — figurines 2e partie (lot 2026-07-06)
  {n:'Élévation Frontale Banc Incliné',g:'Épaules'}, {n:'Élévation Latérale Inclinée Haltère',g:'Épaules'}, {n:'Rotation Externe Épaule Haltère',g:'Épaules'}, {n:'Tirage Menton Élastique',g:'Trapèzes'}, {n:'Thruster',g:'Full Body'}, {n:'Thruster Kettlebell',g:'Full Body'}, {n:'Russian Twist Développé Épaules',g:'Abdominaux'}, {n:'Développé Épaules Assis Machine (Shoulder Press)',g:'Épaules'},
  // ── Biceps ─────────────────────────────────────────────────
  {n:'Curl Barre',g:'Biceps'},{n:'Curl Haltères',g:'Biceps'},{n:'Curl Poulie',g:'Biceps'},
  {n:'Curl EZ',g:'Biceps'},  {n:'Curl Incliné',g:'Biceps'},{n:'Curl Concentré',g:'Biceps'},
  {n:'Curl Araignée (Spider Curl)',g:'Biceps'},
  {n:'Curl Zottman',g:'Biceps'},{n:'Marteau',g:'Biceps'},
{n:'Curl Pupitre Machine',g:'Biceps'},{n:'Curl Pupitre Barre EZ (Larry Scott)',g:'Biceps'},{n:'Waiter Curl',g:'Biceps'},
  // ── Triceps ────────────────────────────────────────────────
  {n:'Bench Dips',g:'Triceps'},
  {n:'Barre au Front',g:'Triceps'},{n:'Skull Crusher Barre EZ',g:'Triceps'},
  {n:'Extension Triceps',g:'Triceps'},{n:'Extension Triceps Couché Haltères',g:'Triceps'},
  {n:'Extension Nuque Haltère',g:'Triceps'},{n:'Extension Nuque Poulie Haute',g:'Triceps'},
  {n:'Triceps Poulie',g:'Triceps'},{n:'Triceps Corde Poulie',g:'Triceps'},{n:'Triceps Poulie Basse',g:'Triceps'},
  {n:'Extension Triceps Arrière (Kickback)',g:'Triceps'},
  {n:'Triceps Machine',g:'Triceps'},
  // — Lot « triceps » du 01/08 (même principe que le lot quadri : matériel dans le NOM) —
  {n:'Dips aux Anneaux',g:'Triceps'},{n:'Dips entre Deux Bancs',g:'Triceps'},
  {n:'Tate Press',g:'Triceps'},{n:'Handstand Push-up (ATR)',g:'Épaules'},
  {n:'Extension Triceps Banc Incliné Haltères',g:'Triceps'},{n:'Extension Triceps Décliné Haltères',g:'Triceps'},
  {n:'Extension Triceps Concentrée Poulie',g:'Triceps'},
  {n:'Extension Triceps Nuque Élastique',g:'Triceps'},{n:'Extension Triceps Verticale Élastique',g:'Triceps'},
  {n:'Extension Triceps TRX (Sangles)',g:'Triceps'},{n:'Extension Triceps Allongée TRX (Sangles)',g:'Triceps'},
  // ── Jambes ─────────────────────────────────────────────────
  {n:'Squat à la Barre',g:'Jambes'},{n:'Squat Avant',g:'Jambes'},{n:'Squat Bulgare',g:'Jambes'},
  // ⛔ « Squat Sumo » RETIRÉ DU CHOIX le 25/08/2026 — décision de Michel (« squat sumo on
  //    supprime »), 12 jours après avoir retiré son illustration. Le 13/08 son image avait
  //    déjà sauté (elle montrait un HALTÈRE entre les jambes, c'est-à-dire le geste du Squat
  //    Gobelet), et on gardait le fichier « le jour où Michel trouve une figurine de sumo À LA
  //    BARRE ». Ce jour n'est pas venu. ⭐ RETRAIT et non FUSION : l'identifiant `squat-sumo`
  //    reste dans EX_IDS (voir RETIRES_VOLONTAIREMENT), donc les séances et records déjà faits
  //    gardent leur nom, leurs muscles et leurs calories. *On retire du CHOIX, jamais de la
  //    MÉMOIRE.*
  {n:'Squat Gobelet (Goblet Squat)',g:'Jambes'},
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
  {n:'Presse à Cuisses Iso-Latérale',g:'Jambes'},
  {n:'Presse à Cuisses sur le Côté',g:'Jambes'},{n:'Hack Squat Assis',g:'Jambes'},{n:'Overhead Squat Haltères',g:'Jambes'},{n:'Sled Push',g:'Jambes'},{n:'Croix de Fer Haltères',g:'Épaules'},
  // — Lot « quadri » du 01/08 (décision Michel : « on ajoute les 8 exercices et mettre une indication
  //   élastique et TRX »). Le MATÉRIEL est écrit dans le NOM : on peut s'entraîner à la maison, et la
  //   recherche « élastique » ou « TRX » les trouve tous d'un coup. Chacun est classé dès son entrée
  //   (muscles, schéma de mouvement, calories, terme YouTube) — jamais d'exercice muet.
  {n:'Squat Poids du Corps (Air Squat)',g:'Jambes'},{n:'Fentes Croisées (Curtsy Lunge)',g:'Jambes'},
  {n:'Jefferson Squat',g:'Jambes'},{n:'Soulevé de Terre Valise (Suitcase)',g:'Jambes'},
  {n:'Squat Sauté (Jump Squat)',g:'Jambes'},{n:'Squat avec Rotation du Tronc',g:'Jambes'},
  {n:'Sissy Squat Machine',g:'Jambes'},{n:'Extension Quadriceps Unilatérale Machine à Dips',g:'Jambes'},
  {n:'Squat Bulgare Élastique',g:'Jambes'},{n:'Extension Quadriceps Élastique',g:'Jambes'},
  {n:'Overhead Squat Élastique',g:'Jambes'},{n:'Split Squat Élastique (Fente Statique)',g:'Jambes'},
  {n:'Squat Barre avec Bandes Élastiques',g:'Jambes'},
  {n:'Squat TRX (Sangles)',g:'Jambes'},{n:'Split Squat TRX (Sangles)',g:'Jambes'},
  {n:'Squat Pistol TRX (Sangles)',g:'Jambes'},
  // ── Fessiers ───────────────────────────────────────────────
  {n:'Hip Thrust Barre (Poussée de Hanche)',g:'Fessiers'},{n:'Hip Thrust Haltère (Poussée de Hanche)',g:'Fessiers'},{n:'Hip Thrust Machine (Poussée de Hanche)',g:'Fessiers'},{n:'Hip Thrust Unilatéral (Poussée de Hanche)',g:'Fessiers'},
  {n:'Pont Fessier (Glute Bridge)',g:'Fessiers'},
  {n:'Extension Fessiers Arrière (Kickback)',g:'Fessiers'},{n:'Kickback Machine',g:'Fessiers'},
  {n:'Soulevé de Terre',g:'Fessiers'},
  {n:'Soulevé de Terre Roumain Barre',g:'Fessiers'},{n:'Soulevé de Terre Roumain Haltères',g:'Fessiers'},
  {n:'Soulevé de Terre Roumain Unilatéral',g:'Fessiers'},{n:'Soulevé de Terre Sumo',g:'Fessiers'},
  {n:'Tirage Cable Fessiers (Cable Pull Through)',g:'Fessiers'},
  
    {n:'Soulevé de Terre Jambes Tendues',g:'Fessiers'},
  {n:'Soulevé de Terre Roumain Kettlebell',g:'Fessiers'},{n:'Soulevé de Terre Roumain Landmine',g:'Fessiers'},
  {n:'Soulevé de Terre Sumo Haltères',g:'Fessiers'},{n:'Soulevé de Terre Sumo Kettlebell',g:'Fessiers'},{n:'Soulevé de Terre Sumo Landmine',g:'Fessiers'},
  {n:'Soulevé de Terre Trap Bar',g:'Fessiers'},{n:'Soulevé de Terre avec Déficit',g:'Fessiers'},{n:'Soulevé de Terre Machine',g:'Fessiers'},
  {n:'Zercher Deadlift',g:'Fessiers'},{n:'Reeves Deadlift',g:'Fessiers'},
  {n:'Glute Ham Raise (GHD)',g:'Fessiers'},{n:'Kettlebell Swing',g:'Fessiers'},
  // ── Squats / fentes / presses / montées : AUSSI en Fessiers (cuisses + fessiers = 2 muscles principaux, retour Michel 2026-07-16) ──
  {n:'Squat à la Barre',g:'Fessiers'},{n:'Squat Avant',g:'Fessiers'},{n:'Squat Bulgare',g:'Fessiers'},
  {n:'Squat Gobelet (Goblet Squat)',g:'Fessiers'},{n:'Smith Machine Squat',g:'Fessiers'},
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
  {n:'Bird Dog',g:'Lombaires'},{n:'Extension Lombaire sur Ballon',g:'Lombaires'},{n:'Planche Inversée',g:'Abdominaux'},
  {n:'Inclinaison Lombaire (Good Morning)',g:'Lombaires'}, // « Good Morning Haltères » supprimé le 01/08 (décision Michel)
  {n:'Soulevé de Terre',g:'Lombaires'},{n:'Soulevé de Terre Roumain Barre',g:'Lombaires'},
  {n:'Jefferson Curl',g:'Lombaires'},{n:'Tirage en Rack (Rack Pull)',g:'Lombaires'},
  {n:'Superman',g:'Lombaires'},
  // ── Abdominaux ─────────────────────────────────────────────
  {n:'Gainage',g:'Abdominaux'},{n:'Planche Latérale (Side Plank)',g:'Abdominaux'},{n:'Hollow Body',g:'Abdominaux'},
   {n:'Crunch',g:'Abdominaux'},{n:'Crunch Poulie',g:'Abdominaux'},{n:'Crunch Machine',g:'Abdominaux'},
  {n:'Rotation Machine Obliques',g:'Abdominaux'},
  {n:'Relevé de Jambes',g:'Abdominaux'},  {n:'Chaise Romaine',g:'Abdominaux'},
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
  {n:'Planche de Préhension',g:'Avant-bras'},
  // ── Full Body / Fonctionnel ────────────────────────────────
  {n:'Burpees',g:'Full Body'},{n:'Kettlebell Swing',g:'Full Body'},
  {n:'Arraché Haltère (Dumbbell Snatch)',g:'Full Body'},{n:'Arraché Debout (Muscle Snatch)',g:'Full Body'},{n:'Thrusters Haltères',g:'Full Body'},
  {n:'Clean & Jerk',g:'Full Body'},
  {n:'Battle Rope',g:'Full Body'},{n:'Box Jump',g:'Full Body'},
  // — Lots « cardio » et « chariot » du 01/08 (fin de soirée). Le chariot de puissance (power sled)
  //   sert à bien plus que pousser/tirer : une famille entière d'exercices s'y fait, d'où les 9. —
  {n:'Assault Air Bike',g:'Full Body'},{n:'Ergomètre de Ski (Ski Erg)',g:'Full Body'},
  {n:'Jumping Jack',g:'Full Body'},{n:'Marche de l\'Ours (Bear Crawl)',g:'Full Body'},
  {n:'Wall Ball',g:'Full Body'},
  {n:'Chariot de Puissance — Poussée',g:'Full Body'},{n:'Chariot de Puissance — Tirage en Avançant',g:'Full Body'},
  {n:'Chariot de Puissance — Tirage Dos',g:'Dos'},{n:'Chariot de Puissance — Tirage de Côté',g:'Dos'},
  {n:'Chariot de Puissance — Tirage Inversé Jambes',g:'Jambes'},{n:'Chariot de Puissance — Tirage Épaules',g:'Épaules'},
  {n:'Chariot de Puissance — Fentes Arrière',g:'Jambes'},{n:'Chariot de Puissance — Curl Biceps',g:'Biceps'},
  {n:'Chariot de Puissance — Extension Triceps',g:'Triceps'},
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
const AI_PROXY_ACTIONS=['importBodyScan','foodLabel','readBarcode','coach','importProgram','importHistory','morphoAnalysis','bodyStudy','importBloodTest','summarizeCoach','estimateFood','importMealPlan','generateMealPlan','seanceJson'];
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
// ─── AVANTAGES PREMIUM — SOURCE UNIQUE (R2, 31/07/2026) ──────────────────────
// Servie par le mur du Coach ET la fiche Menu → Premium (_renderPremiumPerks, coach.js).
// AVANT : le mur listait 5 avantages en dur pendant que le vrai périmètre en comptait
// le double — la liste avait divergé de la réalité. Retour Michel : « il manque des
// trucs pour le premium et pas qu'un peu ». ⚠️ N'ajouter ici QUE des choses réellement
// réservées au Premium dans le code (vérifier la porte S.premium correspondante).
const PREMIUM_PERKS=[
  {i:'♾️', t:'<b>Milo en illimité</b> — questions, séances, conseils, à toute heure'},
  {i:'📝', t:'<b>Le récap de chaque séance</b> — Milo débriefe tes perfs et fixe le prochain objectif'},
  {i:'🧠', t:'<b>Contexte complet</b> — profil, records, cycle, nutrition : il te connaît vraiment'},
  {i:'💪', t:'<b>Programme sur mesure</b> — généré et ajusté avec toi, envoyé dans ta séance'},
  {i:'🤖', t:'<b>Analyse IA de tes programmes</b> importés (équilibre, volume, conseils)'},
  {i:'🧍', t:'<b>Étude du corps</b> par photos (4 angles) — posture, équilibres, exercices conseillés'},
  {i:'📸', t:'<b>Analyse morphologique</b> par photos (3 angles)'},
  {i:'🍽️', t:'<b>Nutrition IA en illimité</b> — étiquette en photo, repas estimé en une phrase, plan de repas'},
  {i:'🥗', t:'<b>Combinaisons d\'aliments</b> Premium'},
  {i:'📖', t:'<b>Import de ton journal de séances</b> en illimité (1 offert en gratuit)'},
  {i:'🎯', t:'<b>Questionnaire avancé + question de la semaine</b> — Milo affine ton profil'},
  {i:'📊', t:'<b>Analyse de progression</b> personnalisée'},
  {i:'📋', t:'<b>Import de programmes en illimité</b> — scan photo/PDF lu par l\'IA (2 offerts en gratuit)'},
  {i:'⚖️', t:'<b>Pesée / bilan corporel en photo</b> en illimité — la balance lue par l\'IA (2 offertes ; la saisie à la main reste gratuite)'},
  {i:'🩸', t:'<b>Analyse de prise de sang</b> — lecture IA de ton bilan, résultats expliqués et connus de Milo'},
];

/* 🎽 LE CADRE DE CHAQUE DISCIPLINE — DES NOMBRES, PLUS UN ADJECTIF (16/08/2026, ft-v877)
   Michel : *« ma fille a le profil musculation et moi powerlifting, et on a pratiquement la
   même séance d'entraînement »*.

   ⭐⭐ LE DIAGNOSTIC ÉTAIT NET, ET C'EST **R7/R8** DANS SA FORME LA PLUS PURE. La discipline
   n'existait qu'à **deux** endroits dans tout le code : une ligne envoyée à Milo — *« adapte tes
   conseils (exercices, répétitions, périodisation) à cette discipline »* — et un choix
   d'affichage. **Aucune structure derrière.** On DEMANDAIT au modèle d'adapter sans jamais lui
   dire à QUOI : une consigne qui nomme une source absente du contexte. Une ligne parmi 46 000
   caractères, en concurrence avec tout le reste — le résultat était prévisible.
   *Le correctif n'est pas de durcir la phrase, c'est de fournir la donnée qui manquait.*

   ⚠️ CE QUI REND CE TABLEAU LÉGITIME : il n'est pas inventé pour l'occasion, il reprend les
   fourchettes du **position stand de l'ACSM** (« Progression Models in Resistance Training for
   Healthy Adults ») et des **NSCA Essentials of Strength Training** — force 1-6 répétitions au
   -delà de 85 % avec 2 à 5 min de repos · hypertrophie 6-12 répétitions à 67-85 % avec des repos
   plus courts · endurance musculaire 12 et plus. Les spécificités par sport (mouvements de
   compétition, technique olympique) viennent de la programmation standard de ces disciplines.
   ⚠️ CE SONT DES **FOURCHETTES DE TRAVAIL**, PAS DES LOIS : elles cadrent ce que Milo propose,
   elles ne remplacent ni le ressenti ni ce que la personne demande explicitement. Si elle dit
   « aujourd'hui je veux du volume », c'est elle qui décide (Constitution : la personne d'abord).
   ⚠️⚠️ UN CADRE NE DOIT JAMAIS DEVENIR UN REPROCHE — corrigé le soir même, sur les données de
   Michel. Il s'est signalé (« moi je suis en powerlifting, attention ») et il avait raison : sur
   ses **489 séries de travail**, seules **30 %** sont sur les 3 mouvements de compétition et
   **34 %** sont à 9 répétitions ou plus. Ses exercices les plus fréquents après le big 3 sont un
   Tirage Visage, un Leg Curl, une Abduction et un Pec Deck, tous entre 8 et 12. La 1ʳᵉ version
   du champ `evite` disait « une séance construite autour de machines et d'isolation » : Milo
   aurait donc pu reprocher à un powerlifter **exactement ce qu'il fait vraiment**, et ce qui est
   par ailleurs recommandé (accessoires, prévention). *C'est le défaut de ft-v861, à trois jours
   d'écart : un reproche injuste coûte la confiance dans l'outil, bien plus qu'un conseil manqué*
   (R29). Le champ `evite` ne vise donc plus que ce qui contredit VRAIMENT l'objectif, il dit
   explicitement ce qui a sa place, et le contexte envoyé porte la répartition RÉELLE de la
   personne à côté du cadre — pour que Milo compare au lieu de présumer.
   ⚠️ ET « NON RENSEIGNÉE » N'EST PAS « MUSCULATION » : sans discipline choisie, on n'injecte
   RIEN et Milo demande. Une fourchette par défaut serait une supposition sur la personne (R29).

   ⚙️ POURQUOI L'APP N'A PAS BESOIN DE CE TABLEAU POUR SES PROPRES CALCULS — vérifié avant de
   l'écrire, pour ne pas dupliquer une information (R2) : ses couches déterministes s'adaptent
   DÉJÀ, mais par les **répétitions** et par la **charge**, pas par l'étiquette. `_classeRepos`
   donne 300 s de repos à une série de 3 et 120 s à une série de 15 ; `_monteeEnCharge` produit
   plus de paliers sur une barre lourde ; et depuis ft-v876 le temps d'une série suit ses reps.
   Un powerlifter était donc déjà traité comme tel PAR SES SÉANCES. Ce qui ne s'adaptait pas,
   c'est la séance que Milo ÉCRIT — et c'est exactement là qu'on injecte. */
/* ══ 🏋️ CE QUE CHAQUE DISCIPLINE DONNE COMME SÉANCE (ft-v1026) ═══════════════════════════
   Brique §2.1 du parcours de découverte (`docs/SEANCE-DESSAI.md`) : remplir l'écran Séance
   vide avec les types de séances, au lieu des ~700 px de rien.

   ⛔⛔ POURQUOI CETTE TABLE EXISTE — C'EST R4, DANS SA FORME LA PLUS PURE. `DISC_CADRE.coeur`
   dit « SQUAT · DÉVELOPPÉ COUCHÉ · SOULEVÉ DE TERRE — les 3 mouvements passent avant tout le
   reste ». C'est **exact, utile, et totalement inexploitable** : c'est de la PROSE, aucun code
   ne peut en tirer une séance. *L'information restait dans le TEXTE et n'atteignait jamais la
   DONNÉE.* Cette table est la descente manquante.

   ⛔ ELLE NE REMPLACE PAS `DISC_CADRE`, ELLE LE PROLONGE (R2) : les libellés restent dans
   `DISC_LABELS`, le cadre chiffré dans `DISC_CADRE`. On n'écrit PAS une 2ᵉ liste de types —
   le doc de cadrage l'interdit explicitement, et il a raison : elles divergeraient, et Milo
   lirait l'une pendant que l'écran afficherait l'autre.

   ⛔ CHAQUE NOM EST VÉRIFIÉ CONTRE LE CATALOGUE (324 exercices), pas écrit de mémoire — la
   leçon de ft-v1023, où 7 de mes 16 cibles n'existaient pas sous le nom que je croyais. Un nom
   inventé produirait un exercice sans animation, sans muscles et sans MET, que personne ne
   verrait avant la salle (R29).

   ⚠️ UNE RÉSERVE HONNÊTE SUR L'HALTÉROPHILIE : le catalogue ne porte PAS l'arraché complet,
   seulement `Arraché Debout (Muscle Snatch)` — une décomposition. La séance proposée est donc
   une séance de TRAVAIL, pas une séance de compétition. On ne fait pas semblant d'avoir un
   mouvement qu'on n'a pas ; si l'arraché entre au catalogue un jour, cette ligne le prend.

   ⚠️ Les `reps` et le `rest` de chaque ligne SUIVENT le cadre de la discipline — c'est là toute
   la différence entre les types. Une séance de force et une séance de bodybuilding peuvent
   partager un exercice ; elles ne partagent jamais le nombre de répétitions ni le repos. */
const DISC_SEANCE = {
  // « un équilibre poussée / tirage / jambes, des mouvements polyarticulaires en tête »
  muscu:[
    {n:'Squat à la Barre',                 sets:4, reps:10, rest:120},
    {n:'Développé Couché',                 sets:4, reps:10, rest:120},
    {n:'Rowing Barre (Tirage Horizontal)', sets:4, reps:10, rest:120},
    {n:'Développé Militaire',              sets:3, reps:10, rest:120},
    {n:'Gainage',                          sets:3, reps:30, rest:60}
  ],
  // « du volume par MUSCLE et non par mouvement, de l'isolation, de la variété d'angles »
  bodybuilding:[
    {n:'Développé Couché',                    sets:4, reps:10, rest:90},
    {n:'Développé Incliné Haltères',          sets:4, reps:12, rest:90},
    {n:'Écarté Haltères',                     sets:3, reps:15, rest:75},
    {n:'Élévations Latérales (Lateral Raise)',sets:4, reps:15, rest:60},
    {n:'Extension Triceps',                   sets:3, reps:15, rest:60}
  ],
  // « un mouvement de compétition en OUVERTURE, puis du volume esthétique derrière »
  powerbuilding:[
    {n:'Squat à la Barre',                sets:4, reps:5,  rest:240},
    {n:'Développé Couché',                sets:4, reps:5,  rest:240},
    {n:'Press Jambes 45°',                sets:3, reps:12, rest:105},
    {n:'Tirage Poulie Haute (Lat Pulldown)',sets:3, reps:12, rest:105},
    {n:'Élévations Latérales (Lateral Raise)',sets:3, reps:15, rest:90}
  ],
  // « SQUAT · DÉVELOPPÉ COUCHÉ · SOULEVÉ DE TERRE passent avant tout le reste »
  powerlifting:[
    {n:'Squat à la Barre',                sets:5, reps:3, rest:300},
    {n:'Développé Couché',                sets:5, reps:3, rest:300},
    {n:'Soulevé de Terre',                sets:3, reps:3, rest:300},
    {n:'Rowing Barre (Tirage Horizontal)',sets:3, reps:8, rest:120}
  ],
  // « ARRACHÉ · ÉPAULÉ-JETÉ et leurs décompositions (tirages, réceptions, squats avant) »
  haltero:[
    {n:'Arraché Debout (Muscle Snatch)', sets:5, reps:3, rest:180},
    {n:'Clean & Jerk',                   sets:5, reps:2, rest:240},
    {n:'Squat Avant',                    sets:4, reps:5, rest:180},
    {n:'Gainage',                        sets:3, reps:30,rest:60}
  ]
};
const DISC_CADRE={
  muscu:{
    reps:'8-12 répétitions sur les séries de travail (5-8 possible sur un gros mouvement)',
    charge:'65-80 % du maximum',
    repos:'90 à 150 s entre les séries de travail',
    volume:'10 à 20 séries de travail par groupe musculaire et par semaine',
    echec:'garder 1 à 3 répétitions en réserve — on ne va pas à l\'échec à chaque série',
    coeur:'un équilibre poussée / tirage / jambes, des mouvements polyarticulaires en tête de séance',
    evite:'les singles maximaux réguliers, et un programme qui ne travaillerait QUE les bras et les pectoraux sur la durée'
  },
  bodybuilding:{
    reps:'6-12 sur les polyarticulaires, jusqu\'à 15-20 sur l\'isolation',
    charge:'65-80 % du maximum',
    repos:'60 à 120 s — les repos courts font partie du travail',
    volume:'12 à 22 séries de travail par groupe musculaire et par semaine, réparties sur 2 séances',
    echec:'0 à 2 répétitions en réserve sur les dernières séries ; techniques d\'intensification possibles',
    coeur:'du volume par MUSCLE et non par mouvement, de l\'isolation, de la variété d\'angles, la connexion muscle-esprit',
    evite:'faire de CHAQUE séance une séance de singles lourds — ça coûte cher en fatigue pour peu d\'hypertrophie. ⚠️ Du lourd ponctuel reste utile et ne se reproche pas'
  },
  powerbuilding:{
    reps:'3-6 sur les 2 premiers mouvements lourds, 8-12 sur tout le reste',
    charge:'80-90 % sur les mouvements lourds, 65-75 % sur les accessoires',
    repos:'3 à 5 min après un mouvement lourd, 90 à 120 s sur les accessoires',
    volume:'2 à 4 séries lourdes puis 8 à 14 séries d\'accessoires par séance',
    echec:'jamais à l\'échec sur le lourd ; 1 à 2 répétitions en réserve sur les accessoires',
    coeur:'un mouvement de compétition en OUVERTURE, puis du volume esthétique derrière',
    evite:'mettre systématiquement l\'isolation AVANT le lourd — l\'ordre est le cœur de cette pratique'
  },
  powerlifting:{
    reps:'1-5 sur les mouvements de compétition ; 6-12 sur les accessoires, qui se travaillent en hypertrophie',
    charge:'80-95 % du maximum sur les mouvements de compétition',
    repos:'3 à 5 min entre les séries lourdes — c\'est long, et c\'est nécessaire',
    volume:'peu de séries, beaucoup de qualité : 3 à 6 séries de travail par mouvement',
    echec:'JAMAIS à l\'échec sur un mouvement de compétition ; 1 à 3 répétitions en réserve',
    coeur:'SQUAT · DÉVELOPPÉ COUCHÉ · SOULEVÉ DE TERRE — les 3 mouvements passent avant tout le reste, et leurs variantes proches (squat pause, soulevé déficit, développé prise serrée) avant l\'isolation',
    evite:'les séries de 12-15 SUR LES MOUVEMENTS DE COMPÉTITION, et aller à l\'échec dessus. ⚠️ En revanche machines, poulies et isolation ont toute leur place en ACCESSOIRE (dos, épaules, ischios, gainage) : c\'est du renforcement et de la prévention, pas une erreur — ne le reproche jamais'
  },
  haltero:{
    reps:'1-3 sur l\'arraché et l\'épaulé-jeté, 3-5 sur les tirages et les squats',
    charge:'70-90 % — la technique commande, la charge suit',
    repos:'2 à 5 min ; sur le technique, on récupère entre CHAQUE répétition si besoin',
    volume:'beaucoup de séries très courtes plutôt que peu de séries longues',
    echec:'jamais — une répétition ratée en haltérophilie est une répétition mal apprise',
    coeur:'ARRACHÉ · ÉPAULÉ-JETÉ et leurs décompositions (tirages, réceptions, squats avant/nuque), la mobilité de cheville et d\'épaule',
    evite:'les séries longues sur les mouvements olympiques, où la technique se dégrade. ⚠️ Le travail de force et d\'accessoires (squats, tirages, gainage) reste indispensable et ne se reproche pas'
  }
};

/* 🔒 LES ANNONCES CONDITIONNELLES — « ne l'annonce qu'à ceux qui peuvent s'en servir »
   (30/08/2026, ft-v1072). Michel, en voyant partir la pop-up des pas : *« sauf que les pas ne
   sont que pour moi attention »*.

   ⛔⛔ IL AVAIT RAISON, ET LE DÉFAUT ÉTAIT DANS L'ANNONCE, PAS DANS LE COMPORTEMENT. Mesuré :
   `WHATS_NEW` et `NEW_FEATURES` n'avaient **aucun filtre par personne** — seulement « déjà vu ».
   Le sommeil mesuré (v64) et les pas (v65) exigent un **raccourci iOS que seul Michel a
   installé** : Christophe, Eline, Emma et Tatiana recevaient donc une pop-up et des points
   rouges pour une fonctionnalité qu'ils ne peuvent pas avoir. ⭐ Le CODE, lui, était déjà
   correct (carte masquée, aucune ligne sous le TDEE, TDEE inchangé) — *ce n'est pas la
   fonctionnalité qui débordait, c'est sa publicité*.

   👉 UN PRÉDICAT OPTIONNEL `si`. Sans lui, une entrée se comporte exactement comme avant
   (rétrocompatible, comme `refTs` en ft-v1017). Avec, elle n'apparaît que le jour où la
   personne peut vraiment s'en servir — *l'annonce attend la donnée au lieu de la précéder*.
   ⛔ Et c'est un NOM, pas une fonction : ces tableaux partent dans le cloud et sont relus par
   des outils ; une fonction n'y survivrait pas. Le nom est résolu par `_featSi` (screens.js),
   seul propriétaire de « cette personne peut-elle s'en servir ? » (R2). */
const FEAT_SI = {
  /* ⌚ a-t-on DÉJÀ reçu quelque chose de la montre ? On ne demande pas « as-tu une montre »
     (l'app ne le sait pas), on regarde si la donnée est arrivée — c'est le seul fait vérifiable. */
  montreSommeil: () => { try{ return ((S&&S.healthDaily)||[]).some(x=>x&&x.sleep>0); }catch(e){ return false; } },
  montrePas:     () => { try{ return ((S&&S.healthDaily)||[]).some(x=>x&&x.steps>0); }catch(e){ return false; } }
};
const NEW_FEATURES=[
  /* 📉 POINT ROUGE **ET** POP-UP (règle d'or #11) — les deux, et c'est argumenté :
     la pop-up annonce le déplacement du chiffre (ce qui se lirait comme un retrait) ; le point
     rouge, lui, sert à celui qui ferme la pop-up sans la lire et ouvre l'onglet trois jours
     plus tard. *La pop-up passe une fois, le point rouge attend.* */
  {id:'nutri-evolution', screen:'nutrition', desc:'\u{1F4C9} <b>Nutrition \u2192 la carte du jour a chang\u00e9 d\u2019ordre</b>, et une carte <b>\u00ab Ton \u00e9volution \u00bb</b> est apparue sous le bouton \u00ab noter \u00bb. \u2b50 Ce qu\u2019elle fait : elle regarde <b>ton poids, tes charges et tes repas not\u00e9s sur 14 jours</b> et dit si tout va dans le sens de ton objectif. \u26d4 Elle ne consulte <b>aucun serveur</b> et ne co\u00fbte <b>aucune question \u00e0 Milo</b> \u2014 tout est calcul\u00e9 sur ton t\u00e9l\u00e9phone, m\u00eame hors ligne. \u26a0\uFE0F Et \u00ab X kcal restantes \u00bb n\u2019a pas disparu : il est devenu la ligne \u00ab ce qu\u2019il te reste, en vrai \u00bb, juste en dessous.'},
  /* 🔭 POINT ROUGE, PAS DE POP-UP `WHATS_NEW` (règle d'or #11), et c'est argumenté :
     ① il y a bien quelque chose à découvrir — une ligne apparaît sur la carte du jour et les
     DEUX bouts de la semaine s'affichent dans « comment c'est calculé » ;
     ② mais **rien à faire**, et **aucun repère ne bouge** : la carte garde son ordre, les trois
     anneaux sont inchangés, le bouton « noter » est à la même place.
     ⚠️ Le seul chiffre qui bouge est la CIBLE de quelqu'un qui a moins de 4 semaines
     d'historique — et il bouge de quelques grammes, vers le juste. *La pop-up se mérite*
     (R25 : la pop-up ANNONCE, l'aide EXPLIQUE) ; l'aide `?` porte les deux explications. */
  {id:'zone-jour', screen:'nutrition', desc:'\u{1F52D} <b>Nutrition \u2192 ta cible n\u2019est pas la m\u00eame tous les jours</b>, et l\u2019\u00e9cran le dit enfin. Les jours o\u00f9 tu t\u2019entra\u00eenes, l\u2019app te donne <b>plus de glucides</b> et <b>moins de lipides</b> ; les jours de repos, l\u2019inverse \u2014 tes calories, elles, ne bougent pas. \u2b50 Ce qui change : la carte du jour dit <b>o\u00f9 tu en es</b> (\u00ab \u{1F35A} Jour de s\u00e9ance \u00bb / \u00ab \u{1F634} Jour de repos \u00bb), et <b>les DEUX chiffres</b> sont d\u00e9sormais dans \u00ab Comment c\u2019est calcul\u00e9 \u00bb : tu peux pr\u00e9voir ton jour de repos sans attendre qu\u2019il arrive. \u26d4 <b>Les prot\u00e9ines n\u2019y sont pas</b> : elles se calculent sur ton poids, pas sur ta s\u00e9ance \u2014 elles n\u2019ont pas de fourchette, et on ne leur en invente pas une. \u26a0\uFE0F Et si tu viens d\u2019arriver, <b>tes chiffres sont plus justes</b> : l\u2019app divisait ta fr\u00e9quence par 4 semaines m\u00eame quand tu n\u2019en avais v\u00e9cu que deux.'},
  /* 📤 POINT ROUGE MAIS PAS DE POP-UP `WHATS_NEW` (règle d'or #11), et c'est argumenté :
     deux boutons APPARAISSENT, donc il y a bien quelque chose à découvrir — mais rien n'oblige
     à agir, aucun repère existant ne bouge et aucun chiffre affiché ne change. *La pop-up se
     mérite* (R25 : la pop-up ANNONCE, l'aide EXPLIQUE). ⛔ Deux entrées et pas une : les
     boutons vivent sur DEUX écrans, et un point rouge posé sur le mauvais onglet envoie
     chercher au mauvais endroit. */
  {id:'export-nutri', screen:'nutrition', desc:'\u{1F4E4} <b>Nutrition \u2192 ton journal alimentaire</b> : un bouton \u{1F4E4} en haut du journal cr\u00e9e un <b>tableur (CSV)</b> dat\u00e9 du jour \u2014 une ligne par aliment, avec <b>date, repas, quantit\u00e9, calories et macros</b>, ouvrable dans Excel, Numbers ou Google Sheets. \u2b50 Il dit aussi <b>d\u2019o\u00f9 vient chaque valeur</b> (scann\u00e9e au code-barres, tap\u00e9e \u00e0 la main, ou estim\u00e9e) : sans la provenance, un chiffre douteux est invérifiable six mois plus tard. \u26a0\uFE0F Rien n\u2019est envoy\u00e9 nulle part \u2014 le fichier reste sur ton t\u00e9l\u00e9phone.'},
  {id:'export-poids', screen:'progress', desc:'\u{1F4E4} <b>Progr\u00e8s \u2192 Corps &amp; sant\u00e9</b> (l\u2019onglet qui s\u2019appelait \u00ab Poids \u00bb) : un bouton \u{1F4E4} au-dessus de tes pes\u00e9es cr\u00e9e un <b>tableur (CSV)</b> dat\u00e9 du jour \u2014 une ligne par pes\u00e9e, avec <b>la date, le poids et ton taux de masse grasse</b> quand tu l\u2019as not\u00e9. \u2b50 <b>Le nouveau nom de l\u2019onglet</b> dit enfin ce qu\u2019il contient : il porte aussi les corr\u00e9lations, le bilan corporel et le bilan sanguin. \u26a0\uFE0F Le fichier reste sur ton t\u00e9l\u00e9phone : rien n\u2019est envoy\u00e9.'},
  /* 🚶 PAS DE POP-UP POUR CELLE-CI (règle d'or #11), et c'est argumenté : ft-v1070 vient
     d'annoncer que les pas comptent (`WHATS_NEW` v65). Une 2ᵉ pop-up le lendemain pour dire
     « et voilà où les voir » serait du bruit — *la pop-up ANNONCE, l'aide EXPLIQUE* (R25).
     ⛔ Et on ne RÉÉCRIT pas la v65 : réécrire une annonce datée falsifie ce qui a été annoncé
     ce jour-là. Rien ne se déplace ici, rien à faire : une carte s'ajoute. */
  {id:'pas-courbe', screen:'progress', si:'montrePas', desc:'\u{1F6B6} <b>Progr\u00e8s \u2192 Corps &amp; sant\u00e9</b> : une carte <b>\u00ab Tes pas \u00bb</b> montre tes pas du jour, et d\u00e9pli\u00e9e, ta <b>courbe sur 7 ou 30 jours</b>. \u2b50 Le <b>trait vert</b> est <b>ton habitude</b> \u2014 pas un objectif de 10 000 pas que personne n\'a choisi. Les <b>barres vertes</b> sont les journ\u00e9es qui la d\u00e9passent : ce sont exactement celles qui s\'ajoutent \u00e0 ta d\u00e9pense dans l\'onglet Nutrition. \u26d4 Si tu n\'envoies pas tes pas depuis Sant\u00e9, <b>la carte ne s\'affiche pas du tout</b>. \u26a0\uFE0F Et elle dit ce qu\'elle ignore : des pas ne disent pas <b>ce que</b> tu as fait.'},
  /* 🚶 CELLE-CI A SA POP-UP (v65) : un chiffre sur lequel la personne AGIT — ses calories du
     jour — peut maintenant changer d'un jour à l'autre. Sans un mot, ça se lit comme un bug. */
  {id:'pas-surplus', screen:'nutrition', si:'montrePas', desc:'\u{1F6B6} Si ta montre envoie tes <b>pas</b> \u00e0 Sant\u00e9, une grosse journ\u00e9e de marche compte enfin dans ta d\u00e9pense. \u2b50\u2b50 <b>Mais seulement ce qui D\u00c9PASSE ta journ\u00e9e habituelle</b>, jamais le total \u2014 et c\'est tout ce qui rend le chiffre juste : ton niveau d\'activit\u00e9 (\u00ab Mod\u00e9r\u00e9 3-4j \u00bb\u2026) contient <b>d\u00e9j\u00e0</b> la marche d\'une journ\u00e9e normale. Ajouter tes pas bruts te compterait deux fois la m\u00eame marche, <b>tous les jours</b>. \u2b50 <b>Exemple</b> : tu fais 6 000 pas d\'habitude, tu pars en rando \u00e0 15 000 \u2192 les <b>9 000 pas en plus</b> valent ~290 kcal, ajout\u00e9es \u00e0 ta d\u00e9pense du jour. Un tapis que tu fais toutes les semaines est <b>dans</b> ton habitude : rien n\'est compt\u00e9 deux fois. \u26d4 L\'app <b>se tait</b> tant qu\'elle n\'a pas 7 jours de mesures (sans habitude connue, il n\'y a pas de \u00ab en plus \u00bb), une journ\u00e9e calme ne <b>retire</b> rien, et le bonus est <b>born\u00e9 \u00e0 500 kcal</b> \u2014 un capteur qui d\u00e9raille ne doit pas faire exploser tes macros. \u26a0\uFE0F C\'est une <b>estimation</b> (~1 300 pas au km), pas une mesure.'},
  /* 😴 CELLE-CI A SA POP-UP (v64), et c'est le cas « UN REPÈRE A BOUGÉ » à l'état pur : le
     chiffre de sommeil affiché peut désormais DIFFÉRER de celui qu'on a saisi soi-même, et le
     score de récup peut bouger avec lui. Sans un mot, ça se lit comme un bug — ou pire, comme
     si l'app avait perdu ce qu'on lui avait donné. */
  {id:'sommeil-mesure', screen:'home', si:'montreSommeil', desc:'\u{1F634} Si ta montre envoie ton sommeil \u00e0 Sant\u00e9 (Garmin, Apple Watch\u2026), l\'app prend maintenant <b>la dur\u00e9e mesur\u00e9e</b> plut\u00f4t que celle que tu notes \u2014 et elle te le <b>dit</b> : \u00ab Mesur\u00e9 par ta montre \u00bb, avec un rappel de ce que tu avais not\u00e9. \u2b50 <b>Pourquoi</b> : compar\u00e9 sur 10 semaines, la saisie \u00e0 la main est bonne en moyenne mais elle <b>lisse les mauvaises semaines</b> \u2014 une semaine \u00e0 5 h 38 r\u00e9elles \u00e9tait not\u00e9e 6 h 43. Ton score de r\u00e9cup\u00e9ration \u00e9tait donc le plus optimiste <b>exactement quand tu \u00e9tais le plus fatigu\u00e9</b>, et Milo aussi. \u26d4 <b>Ta saisie n\'est jamais effac\u00e9e</b> : elle reste visible \u00e0 c\u00f4t\u00e9, et c\'est toujours <b>toi</b> qui donnes la <b>qualit\u00e9</b> de ta nuit \u2014 une montre mesure une dur\u00e9e, elle ne sait pas comment tu t\'es senti. \u26a0\uFE0F Si tu n\'envoies pas ton sommeil depuis Sant\u00e9, <b>rien ne change pour toi</b>.'},
  /* 👎 PAS DE POP-UP `WHATS_NEW` POUR CELLE-CI (règle d'or #11), et c'est un cas limite
     qu'il faut argumenter plutôt que subir. Un bouton APPARAÎT sous chaque réponse de Milo,
     donc un repère bouge — mais il ne DÉPLACE rien, ne cache rien, et s'explique en un tap :
     la lecture naturelle de « 👎 à côté » est exactement ce qu'il fait. *La pop-up se mérite*
     (R25) ; interrompre tout le monde pour annoncer un bouton facultatif serait du bruit. */
  {id:'milo-a-cote', screen:'coach', desc:'\u{1F44E} Sous chaque r\u00e9ponse de Milo, un bouton <b>\u00ab \u{1F44E} \u00e0 c\u00f4t\u00e9 \u00bb</b>. Si sa r\u00e9ponse ne r\u00e9pond pas \u00e0 ta question, est <b>trop vague</b>, contient quelque chose de <b>faux</b>, ou s\'il a <b>oubli\u00e9</b> un truc que tu lui avais dit \u2014 un tap, et c\'est not\u00e9. \u26d4 <b>Rien de ta conversation n\'est envoy\u00e9</b> : seul le motif est compt\u00e9, sur ton t\u00e9l\u00e9phone. Si tu veux <b>en plus</b> montrer l\'\u00e9change \u00e0 Michel pour qu\'il corrige, il y a une case \u00e0 cocher \u2014 <b>d\u00e9coch\u00e9e par d\u00e9faut</b>, c\'est toi qui d\u00e9cides. \u2b50 \u00c0 quoi \u00e7a sert : chaque signalement devient un <b>cas de test</b> pour corriger Milo pour de bon. \u26a0\uFE0F Il n\'y a <b>pas de pouce vert</b>, expr\u00e8s : on ne veut pas transformer tes conversations en formulaire de satisfaction.'},
  /* 📅 PAS DE POP-UP `WHATS_NEW` POUR CELLE-CI, ET C'EST DÉLIBÉRÉ (règle d'or #11).
     La carte s'explique ENTIÈREMENT toute seule le jour où elle s'affiche — elle nomme la
     séance, sa date, et pose sa question. Et surtout elle est RARE : annoncer aujourd'hui
     quelque chose que le lecteur ne verra peut-être pas avant un mois, c'est du bruit
     (R19/R25). *La pop-up se mérite* ; le point rouge, lui, ne coûte rien. */
  {id:'seance-manquee', screen:'home', desc:'\U0001F4C5 Quand une s\u00e9ance que tu avais <b>annonc\u00e9e</b> n\'a pas eu lieu, l\'app ne l\'efface plus en silence : elle te demande <b>ce qui s\'est pass\u00e9</b> \u2014 fatigue, boulot, emp\u00each\u00e9, douleur, flemme. Un tap, c\'est not\u00e9, et on repart. \u26d4 <b>Aucun rattrapage propos\u00e9</b> : une s\u00e9ance loup\u00e9e n\'est pas grave \u00e0 l\'\u00e9chelle d\'une semaine. Tu peux aussi fermer la carte sans r\u00e9pondre.'},
  {id:'seance-convient', screen:'coach', desc:'⚡ <b>« Cette séance te convient ? »</b> — quand Milo te propose une séance, la question apparaît sous sa réponse. <b>« Oui, on démarre »</b> est exactement le bouton rouge d\'avant : même place, même tap, <b>rien de plus à faire</b>. Ce qui est nouveau c\'est le <b>« Non, retravaille »</b> : tu tapes ce qui ne va pas (<b>trop lourd</b>, <b>trop long</b>, <b>pas les bons exercices</b>) et Milo te refait la séance — plus besoin de tout retaper. ⭐ Et surtout : <b>la question s\'affiche dès que tu demandes une séance</b>, même si Milo l\'a écrite d\'une façon que l\'app n\'avait pas prévue. Avant, le bouton pouvait tout simplement <b>ne pas apparaître</b> — c\'est fini. Si vraiment sa réponse est illisible, l\'app te le <b>dit</b> et propose de lui demander de la réécrire.'},
  {id:'repos-charge', screen:'coach', desc:'🎽 <b>Le repos suit la charge, plus l\'objectif.</b> Quand Milo te propose une série <b>lourde</b> (à partir de 80 % de ton max) avec un repos court, deux choses changent : ① <b>il ne le fait plus</b> — il sait maintenant qu\'une série lourde demande <b>3 min minimum</b>, quel que soit ton objectif ; ② si ça arrive quand même, <b>l\'avertissement s\'affiche directement sous sa séance, dans le chat</b> — avant, il n\'apparaissait qu\'une fois la séance lancée, donc tu ne le voyais pas. ⚠️ <b>Rien n\'est bloqué et rien n\'est corrigé à ta place</b> : le bouton reste, la charge ne bouge pas. C\'est toi qui décides.'},
  {id:'export-histo', screen:'progress', desc:'📤 Tu peux maintenant <b>exporter ton historique de séances</b> : bouton <b>📤 Exporter</b> à côté de « Historique séances », dans <b>Progrès</b>. Deux formats : <b>CSV</b> (s\'ouvre dans Excel ou Numbers, une ligne par série) et <b>PDF</b> (document lisible, une séance par bloc — bon à montrer à un coach ou un kiné). ⛔ <b>Aucune donnée de santé</b> n\'y entre : ni ton poids de corps, ni ton âge, ni ton sexe, ni ton e-mail. ⓘ L\'export <b>complet</b> de tes données (en JSON, pour une sauvegarde) reste dans <b>Menu → Exporter mes données</b>.'},
  {id:'echelle-rpe', screen:'setup', desc:'🎚️ Si tu travailles en <b>RPE</b>, l\'app parle maintenant ta langue : <b>Profil → Échelle d\'effort</b>, tu choisis <b>RIR</b> (par défaut) ou <b>RPE</b>. La question posée après chaque série, la colonne « précédent » et <b>Milo</b> suivent. ⛔ <b>Rien n\'est converti ni perdu</b> : c\'est la <b>même mesure</b> dite dans l\'autre sens (<i>RPE = 10 − RIR</i>), donc ton historique se relit tout seul, et tu peux revenir quand tu veux. ⚠️ <b>Sans demi-points</b> (pas de 8,5) : l\'app ne les mesure pas.'},
  {id:'progres-repli', screen:'progress', desc:'🗂️ <b>Le haut de Progrès est rangé.</b> Les <b>trois onglets</b> (Exercices · Poids · Badges) sont maintenant <b>tout en haut</b> — tu passes de l\'un à l\'autre sans faire défiler. ⭐ Et les deux cartes du haut — <b>« Ce que ton histoire montre »</b> et <b>« Ce que tu travailles, par semaine »</b> — sont <b>repliées</b> : un tap sur le titre les ouvre. ⛔ <b>Rien n\'est perdu</b> : leurs titres restent à l\'écran, et <b>l\'app retient ton choix</b> — si tu en déplies une, elle sera dépliée la prochaine fois. ⚠️ <b>Pourquoi</b> : elles prenaient <b>561 px</b>, soit les deux tiers de l\'écran. Ta progression et la recherche d\'exercice commençaient <b>hors écran</b>.'},
  {id:'volume-semaine', screen:'progress', desc:'📊 Dans <b>Progrès</b> : <b>« Ce que tu travailles, par semaine »</b> — tes <b>séries de travail</b> par groupe musculaire, en <b>moyenne par semaine, mesurée sur 14 jours</b>. ⭐ La fenêtre est passée de 7 à 14 jours : une seule semaine est un échantillon trop court, une semaine chargée et une semaine creuse alternent normalement. ⛔ Mais les chiffres <b>ne sont pas doublés</b> — ils restent <b>par semaine</b>, donc comparables au repère de ta discipline. ⚠️ Une moyenne peut cacher une semaine à zéro : le <b>nombre de séances</b> est affiché à côté, il dit ce que la moyenne ne dit pas. ⚠️ Ce sont des <b>faits, sans objectif affiché</b> : un mercredi, tout le monde est en dessous de son cadre, et te le reprocher n\'aurait aucun sens. 👉 <b>Milo</b>, lui, reçoit ces chiffres — il connaissait la règle de ta discipline (<i>« 10 à 20 séries par groupe et par semaine »</i>) <b>sans jamais savoir combien tu en faisais</b>. ⚠️ Les séries sont comptées sur le <b>muscle principal</b> de chaque exercice.'},
  {id:'synthese-constantes', screen:'progress', desc:'🔭 En haut de <b>Progrès</b>, une nouvelle section : <b>« Ce que ton histoire montre »</b>. Elle dégage des <b>constantes</b> de tout ton historique — ton rythme réel, l\'exercice qui revient le plus, la région que tes séances travaillent le plus souvent. ⚠️ Ce sont des <b>faits comptés</b>, pas des conseils : elle ne te dira jamais ce que tu « devrais » faire. Chaque ligne dit sur quoi elle porte. Et tant qu\'il n\'y a pas assez de séances, elle te le dit au lieu d\'inventer.'},
  {id:'histoire-souvenir', screen:'home', desc:'🕰️ <b>Ton histoire sportive</b> commence à parler. Quand tu notes une douleur que tu avais <b>déjà eue il y a longtemps</b>, une carte te le rappelle sur l\'Accueil : <i>« Bas du dos : tu avais déjà noté cette douleur à partir du 25 juin — elle apparaissait sur 4 jours parmi ceux que tu avais notés. »</i> ⚠️ Elle <b>décrit</b>, elle ne prédit rien et ne conseille rien. Elle n\'apparaît que quand il y a vraiment quelque chose à relier, et tu peux la refermer.'},
  {id:'rir-reserve', screen:'log', desc:'💪 Après une série de travail, la barre de repos te demande <b>« il t\'en restait combien ? »</b> — un tap : <b>échec · 1 · 2 · 3 · 4+</b>. C\'est le <b>RIR</b> (répétitions en réserve). ⚠️ <b>Facultatif</b>, et retirable. 👉 Tu le revois <b>la fois d\'après</b> dans la colonne « précédent » (<i>8×80·2r</i>), et <b>Milo le reçoit</b> — il connaissait la règle de ta discipline sans jamais pouvoir vérifier si tu la suivais.'},
  {id:'repos-discipline', screen:'log', desc:'🎽 L\'avertissement sur le <b>repos trop court</b> suit maintenant <b>ta discipline</b>. Avant, l\'app appliquait <b>un seul chiffre à tout le monde</b> (150 s) — alors qu\'elle affiche à chacun un cadre différent : <i>« 3 à 5 min entre les séries lourdes »</i> en force athlétique, <i>« 60 à 120 s »</i> en bodybuilding. 👉 Un powerlifter qui prenait <b>160 s</b> entre deux séries à 88 % ne recevait <b>rien</b> ; il est prévenu, et le conseil cite <b>sa</b> plage. ⚠️ Le contrôle ne s\'est <b>jamais relâché</b> : il ne fait que resserrer là où ton cadre est plus exigeant. Tu changes de discipline dans <b>Profil</b>.'},
  {id:'charge-sans-repere', screen:'log', desc:'📍 Quand <b>Milo</b> te propose une séance, il arrive qu\'il mette une charge sur un exercice que <b>tu n\'as jamais noté dans l\'app</b> — il n\'a alors <b>aucun repère dans ton historique</b>, même si tu le pratiques depuis des années ailleurs. L\'app le <b>dit</b> maintenant, sur l\'exercice concerné : « Aucun repère dans ton historique pour cet exercice — 60 kg est un <b>point de départ à ajuster</b>, pas une mesure. » ⚠️ <b>La charge n\'est pas retirée</b> : elle te fait gagner du temps en salle. On te dit juste qu\'elle n\'est pas calibrée sur toi — dès ta 1re série notée, l\'app aura son repère et ce message disparaîtra.'},
  {id:'repos-palier', screen:'log', desc:'🔥 <b>Ton échauffement se dose à ta charge</b>, sur deux points. ① <b>LE REPOS ENTRE PALIERS.</b> Il valait <b>45 s à plat</b>, quel que soit le poids : sur une montée vers 130 kg, tu passais donc à <b>115 kg</b> (88 % de ta charge du jour) quarante-cinq secondes après un palier à 100. Le repos suit maintenant la charge du palier <b>qui vient</b> : <b>45 s</b> tant qu\'on est léger, <b>90 s</b> à partir de 75 % de ta charge de travail, <b>2 min</b> à partir de 85 %. L\'étiquette de la barre dit « palier lourd » quand c\'est le cas. ⛔ <b>Ça ne dépasse jamais ton propre repos de travail</b> : si tu l\'as réglé à 1 min, un palier lourd prend 1 min, pas 2. ⏳ Et comme toujours, <b>c\'est un maximum</b> — tu peux repartir avant. ② <b>LE NOMBRE DE PALIERS.</b> L\'app complétait la montée de Milo jusqu\'à <b>5 paliers quelle que soit la charge</b> — mesuré, un squat à 60 kg recevait exactement le protocole d\'un squat à 150 kg (5 paliers, 19 répétitions d\'échauffement). Elle en ajoute désormais autant que la charge le demande — mesuré : <b>2 paliers jusqu\'à 50 kg, 3 de 60 à 80 kg, 4 à partir de 90 kg</b>. ⛔ <b>Elle n\'enlève jamais un palier que Milo a écrit</b> — elle arrête seulement d\'en rajouter.'},
  {id:'repos-maximum', screen:'log', desc:'⏳ Ton temps de repos est un <b>MAXIMUM</b>, pas un compte à rebours qu\'il faut attendre. 👉 CE QUI CHANGE À L\'ÉCRAN : le chrono ne s\'arrête plus à zéro et la barre ne disparaît plus — il continue en <b>+0:12</b>, <b>+0:45</b>…, avec la mention « au-delà de ton repos max ». ⚠️ <b>Ce n\'est pas un reproche</b> : un repos plus long est parfois exactement ce qu\'il faut, et l\'app ne juge pas. C\'est une information que tu n\'avais pas — mesuré sur de vraies séances, le repos réellement pris vaut <b>2 à 3 fois</b> le repos réglé. 👉 <b>Tu peux repartir avant, c\'est permis</b> : c\'est comme ça que les coachs écrivent leurs programmes (« repos maximum : 1 à 2 min »). ⚠️ Rien d\'autre ne bouge : le décompte des 10 dernières secondes, la vibration et l\'écran GO sont identiques, et l\'enchaînement des super-séries aussi. ⏹️ Au-delà de 15 minutes le chrono s\'arrête tout seul — ce n\'est plus un repos, c\'est une séance interrompue.'},
  {id:'macros-range', screen:'nutrition', desc:'\u{1F37D}\uFE0F L\'onglet <b>Macros</b> a \u00e9t\u00e9 rang\u00e9. Avant, il fallait faire d\u00e9filer <b>3 \u00e9crans</b> pour savoir o\u00f9 tu en \u00e9tais, et le bouton \u00ab noter ce que je mange \u00bb \u00e9tait tout en bas. \u{1F449} CE QUI CHANGE POUR TOI : en arrivant, tu vois d\'abord <b>ta journ\u00e9e</b> \u2014 ce que tu as mang\u00e9 en gros, ta cible en petit (elle \u00e9tait \u00e9crite deux fois), <b>trois anneaux</b> (prot\u00e9ines, glucides, lipides) et \u00ab ce qu\'il te reste, en vrai \u00bb. Juste dessous : le bouton pour noter. \u26a0\uFE0F <b>RIEN N\'A \u00c9T\u00c9 SUPPRIM\u00c9</b> \u2014 ton BMR, ton TDEE, la r\u00e9partition en %, charge/d\u00e9charge et ton hydratation sont dans <b>\u00ab Comment c\'est calcul\u00e9 \u00bb</b>, et ton mode alimentaire + ton r\u00e9gime dans <b>\u00ab Mes r\u00e9glages alimentaires \u00bb</b>, tout en bas. Un appui les d\u00e9plie, et le titre te dit d\u00e9j\u00e0 l\'essentiel sans ouvrir. \u{1F9E0} La carte \u00ab ce que l\'app a appris de ton alimentation \u00bb a d\u00e9m\u00e9nag\u00e9 du Journal vers Macros. \u26a0\uFE0F Et le \u00ab plan de repas \u00bb est repli\u00e9 par d\u00e9faut, <b>expr\u00e8s</b> : il n\'est <b>pas encore adapt\u00e9 \u00e0 ce que tu manges vraiment</b> (c\'est une liste \u00e9crite \u00e0 l\'avance, la m\u00eame pour tout le monde). Le jour o\u00f9 il le sera, il se d\u00e9pliera tout seul.'},
  {id:'pdf-partage', screen:'coach', desc:'📄 Le bouton <b>PDF</b> sous chaque réponse de Milo est réparé. Si tu as essayé et que tu n\'as reçu qu\'une ligne « Conseil de Milo » au lieu de ton document : ce n\'était pas un PDF vide, c\'était le TITRE de la feuille de partage — ton fichier, lui, était bon et complet, mais il se perdait en route. 👉 Il n\'y a plus de titre du tout : la feuille de partage n\'a plus que le fichier à te donner. ⚠️ On l\'a corrigé sur les 10 boutons qui partagent un fichier, pas seulement celui de Milo — le PDF de programme et l\'étude du corps avaient le même défaut. ⚠️ Et on te dit ce qu\'on ne sait pas : le problème n\'a pas pu être reproduit en laboratoire (il faut un vrai iPhone), donc si ça t\'arrive encore, dis-le — c\'est probablement l\'application que tu choisis dans la feuille de partage qui refuse le fichier. 🍽️ Au passage, une phrase de l\'écran Nutrition a été corrigée : sous le plancher calorique, l\'app disait « on y perd du muscle avant du gras ». C\'est faux — ton corps n\'a pas d\'interrupteur qui basculerait de la graisse au muscle. Ce qui est vrai : plus le déficit est fort et long, plus il devient difficile de GARDER ton muscle, et les protéines et la muscu aident sans compenser tout.'},
  {id:'bilan-local', screen:'setup', anchor:'menu-row-profil', desc:'📷 Quand tu importes la PHOTO d\'un rapport de balance (Profil → Bilan corporel), l\'app essaie maintenant de le lire DIRECTEMENT SUR TON TÉLÉPHONE. 👉 Ce que ça change pour toi : c\'est GRATUIT (ça ne consomme aucune de tes lectures), ça marche SANS RÉSEAU, et la photo ne part nulle part. Le geste, lui, ne change pas : tu prends ta photo comme avant. ⚠️ La toute première fois, l\'app télécharge son lecteur (≈ 2 Mo) — seulement à ce moment-là, jamais à l\'ouverture de l\'app, et une seule fois pour toujours. ⭐ ET ELLE VÉRIFIE CE QU\'ELLE A LU AVANT DE TE LE MONTRER : les lignes d\'un rapport se recoupent (gras + eau + protéine + os = ton poids). Si ça ne tombe pas juste, elle ne te propose RIEN et repasse par la lecture précédente. C\'est le point qui compte : quand une virgule est mal lue, le résultat reste parfaitement crédible — sur un vrai rapport, une protéine de 13,8 kg est sortie à 18,8 — et seule cette vérification l\'attrape. ⚠️ Relis quand même tes chiffres avant d\'enregistrer, comme avant. ⚠️ Deux valeurs ne sont volontairement PAS lues : la « graisse sous-cutanée » (mal lue 4 fois sur 5, sa virgule est mangée par le tableau d\'à côté) et le « poids cible » du fabricant, qui sort d\'un modèle qu\'on ne peut pas ouvrir et n\'a rien à faire dans ton objectif.'},
  {id:'swap-pourquoi', screen:'log', desc:'\u{1F501} Quand tu remplaces un exercice pendant ta s\u00e9ance (\u22ef \u2192 Remplacer l\'exercice), l\'app te demande maintenant POURQUOI, en un seul appui : il te g\u00eane \u00b7 trop long \u00b7 machine prise \u00b7 envie de varier. \u{1F449} \u00c0 QUOI \u00c7A SERT : jusqu\'ici tu pouvais dire \u00e0 Milo \u00ab cet exercice ne me convient pas \u00bb, il comprenait\u2026 et il te le reproposait la fois suivante, parce que rien ne l\'\u00e9crivait nulle part. D\u00e9sormais si, et il te propose directement celui que tu pr\u00e9f\u00e8res. \u26a0\ufe0f \u00ab Machine prise \u00bb et \u00ab envie de varier \u00bb ne comptent PAS comme une pr\u00e9f\u00e9rence : ce sont des circonstances, il serait absurde que Milo arr\u00eate de te proposer la presse parce qu\'elle \u00e9tait occup\u00e9e un mardi. \u26a0\ufe0f Tu peux ne pas r\u00e9pondre (rien n\'est \u00e9crit), et tout relire ou effacer dans Profil \u2192 Mon ADN sportif.'},
  {id:'echauff-dose', screen:'log', desc:'\u{1F525} L\'app ajoutait trop de paliers d\'\u00e9chauffement. Sur une vraie s\u00e9ance du 16 ao\u00fbt, un tirage \u00e0 la poulie plac\u00e9 en 2\u1d49 exercice, sur machine, apr\u00e8s un soulev\u00e9 de terre \u00e0 130 kg, recevait 5 paliers pour 3 s\u00e9ries de travail \u2014 la moiti\u00e9 de l\'exercice pass\u00e9e \u00e0 s\'\u00e9chauffer. \u{1F449} CE QUI CHANGE : la mont\u00e9e compl\u00e8te est r\u00e9serv\u00e9e \u00e0 la PREMI\u00c8RE grosse barre de la s\u00e9ance ; ensuite tu es d\u00e9j\u00e0 chaud, et l\'app n\'ajoute plus rien \u00e0 ce qui \u00e9tait pr\u00e9vu. C\'est ce que dit la litt\u00e9rature : 2 \u00e0 4 paliers sur une 2\u1d49 grosse barre, 0 \u00e0 2 sur un accessoire, moins encore sur une machine (moins technique). \u26a0\ufe0f Ton soulev\u00e9 de terre, lui, GARDE ses 4-5 paliers : sur la premi\u00e8re barre lourde les sources sont unanimes, et on ne raccourcit pas ce qui est justifi\u00e9. \u{1F449} Et les r\u00e9p\u00e9titions ne remontent plus en montant en charge (tu avais 5-3-5-3-3) : elles se lisent d\u00e9sormais sur la charge du palier.'},
  {id:'kcal-repos', screen:'log', desc:'🫀 Le temps ENTRE tes séries ne compte plus comme « debout à ne rien faire ». Après une série lourde, ton corps continue de consommer de l\'oxygène pendant plusieurs minutes — il ne revient pas au repos entre deux séries de soulevé de terre. 👉 Ce temps est maintenant compté à sa vraie valeur, et tes calories de séance montent nettement (environ +85 kcal sur une séance d\'une heure). ⚠️ Ce n\'est pas un réglage au doigt mouillé : la valeur PUBLIÉE pour une séance de musculation modérée (3,5 MET, repos compris) impose mathématiquement ce chiffre, puisque le temps de travail effectif ne représente que ~20 % d\'une séance. Deux calculs indépendants tombent au même endroit. Mesuré sur 27 séances : l\'app passe de 2,55 à 3,28 en intensité moyenne, contre 3,50 publié.'},
  {id:'rhr-recup', screen:'home', desc:'❤️ Ton score de récupération peut maintenant tenir compte de ta FRÉQUENCE CARDIAQUE AU REPOS, mesurée par ta montre pendant la nuit. Jusqu\'ici ce score ne reposait que sur du déclaratif — ton sommeil noté, ta dernière séance, ton âge, tes jours enchaînés. C\'est la première mesure de ton CORPS qui y entre. 👉 On ne te compare jamais à une norme : une FC de 62 ne veut rien dire dans l\'absolu (haute pour un athlète, basse pour un sédentaire). Ce qui compte c\'est l\'écart à TA propre moyenne des 30 derniers jours. Au-dessus, ton corps n\'a probablement pas fini de récupérer ; en dessous, tu es plutôt frais. ⚠️ Il faut au moins 7 nuits avant que l\'app dise quoi que ce soit, une variation de 2 battements ne change rien, et l\'effet est plafonné à 8 points : c\'est un indice parmi d\'autres. Une FC haute peut aussi venir d\'un rhume ou d\'une chambre trop chaude — l\'app te donne les chiffres dans « Pourquoi ce score ? » et te laisse juger. ⚠️ Elle n\'entre dans AUCUN calcul de calories.'},
  {id:'montre-directe', screen:'progress', desc:'⌚ Ta montre peut maintenant envoyer ses activités DIRECTEMENT dans l\'app, sans export ni fichier à donner. Comment ça marche : ta montre écrit déjà dans l\'app Santé de ton iPhone ; un raccourci iOS (à créer une fois, 5 minutes) lit Santé chaque soir et pousse tes activités vers ton compte. Elles apparaissent ensuite dans le détail de chaque séance, sous « ⌚ Ta montre a enregistré ce jour-là », avec l\'heure, le type et la durée. Un bouton « Utiliser » les rattache au cardio de la séance. 👉 RIEN n\'est écrit tout seul : l\'app propose, tu choisis — et elle te demande si c\'était avant ou après ta séance, parce qu\'elle ne peut pas le deviner. ⚠️ Les calories de la montre sont affichées mais JAMAIS utilisées dans les calculs : en musculation elles ne valent rien (mesuré). C\'est son HORLOGE qui nous intéresse, pas son estimation. 👉 DEUX FAÇONS DE BRANCHER ÇA : soit un raccourci iOS que tu fabriques (gratuit, ~5 min), soit une app d\'export de Santé à qui tu donnes juste une adresse — le serveur accepte les deux formats, tu n\'as aucun texte technique à écrire.'},
  {id:'kcal-charge', screen:'log', desc:'Tes calories tiennent maintenant compte du POIDS SUR LA BARRE, pas seulement du temps. Une série à 90 % de ton maximum ne coûte plus la même chose qu\'une série à 60 % — et un palier d\'échauffement, léger, coûte moins qu\'une série de travail. 👉 C\'est ton MAXIMUM SUR CET EXERCICE qui sert de repère (celui que l\'app calcule à partir de tes records), donc c\'est la même échelle pour tout le monde : 90 % de ton max et 90 % du max de quelqu\'un d\'autre comptent pareil. ⚠️ Si l\'app n\'a pas encore de repère sur un exercice, elle ne module rien — elle ne devine pas. ⚠️ Et l\'effet reste volontairement modeste (environ 6 % entre une série légère et une série maximale) : c\'est l\'écart que les valeurs publiées autorisent entre un effort modéré et un effort vigoureux, pas plus.'},
  {id:'discipline-reel', screen:'coach', desc:'Milo reçoit maintenant DEUX choses au lieu d\'une : le cadre de ta discipline (répétitions, repos, mouvements clés) ET la répartition RÉELLE de tes séries — combien tu fais à 1-5 reps, à 6-8, à 9-12, et quelle part sur les mouvements de base. 👉 Pourquoi c\'est important : un cadre décrit une DISCIPLINE, pas une PERSONNE. Beaucoup de powerlifters font l\'essentiel de leur volume en 8-12 sur des machines, et c\'est normal et utile. Milo a désormais l\'interdiction explicite de te reprocher cet écart : il s\'en sert pour te proposer des séances qui ressemblent à ce que tu fais vraiment, et n\'en parle que si tu poses la question. ⚠️ Moins de 20 séries dans ton historique ? Rien n\'est envoyé — on ne calcule pas un pourcentage sur trois séries.'},
  {id:'discipline-cadre', screen:'setup', anchor:'menu-row-profil', desc:'Ta DISCIPLINE (Profil → Discipline) ne servait presque à rien : Milo recevait le mot, jamais ce qu\'il implique. Résultat mesuré — en retirant la ligne du nom, le texte envoyé à Milo pour un powerlifter et pour quelqu\'un en musculation était RIGOUREUSEMENT IDENTIQUE. 👉 Chaque discipline porte maintenant un vrai cadre de travail : fourchette de répétitions, charge, temps de repos, volume par semaine, proximité de l\'échec, les mouvements qui font le cœur de la pratique, et ce qui n\'y a pas sa place. Powerlifting : 1-5 reps, 3 à 5 min de repos, squat/couché/soulevé avant tout, jamais l\'échec. Musculation : 8-12 reps, 90 à 150 s. Bodybuilding : jusqu\'à 15-20 en isolation, repos courts. Haltérophilie : 1-3 reps, jamais de série ratée. Tu vois ce cadre à l\'écran quand tu choisis ta discipline — c\'est exactement ce que Milo reçoit. ⚠️ Ça oriente, ça n\'interdit pas : si tu demandes autre chose, Milo te suit.'},
  {id:'seance-3temps', screen:'log', desc:'Tes calories de séance distinguent maintenant TROIS moments au lieu de deux. ① La série elle-même — et sa durée suit tes RÉPÉTITIONS : une série de 3 reps lourdes ne dure pas comme une série de 12, l\'app comptait 30 secondes pour les deux. ② Le repos entre deux séries, où tu es debout à souffler. ③ 🔄 NOUVEAU : le passage d\'un exercice à l\'autre — décharger la barre, ranger les disques, traverser la salle. Ce temps-là n\'est PAS du repos : après un soulevé de terre lourd il peut prendre 5 à 7 minutes, et pendant ce temps tu portes de la fonte. Il est donc compté comme de la marche avec charge légère, pas comme quelqu\'un qui ne fait rien. 👉 Concrètement : deux personnes qui font les mêmes exercices pendant le même temps, l\'une en 3 répétitions et l\'autre en 12, n\'ont plus le même chiffre — et c\'est normal.'},
  {id:'milo-budget-temps', screen:'coach', desc:'Quand tu demandes à Milo une séance d\'une durée précise (« j\'ai 45 minutes »), il tient maintenant compte des séries d\'échauffement que l\'APP ajoute toute seule — la montée en charge sur le premier exercice lourd de chaque mouvement. Il ne les écrit pas, donc il ne les comptait pas : une séance de 3 exercices passe de 9 séries écrites à 15 réellement faites, et les 45 minutes annoncées en devenaient 65. Il les déduit désormais de son budget AVANT de choisir tes exercices. 👉 Et son estimation de ce que te coûte une série se base sur tes durées de séance RÉELLES, en ignorant celles que l\'app juge douteuses (le ⚠️ de ton historique).'},
  {id:'duree-seance', screen:'log', desc:'Tes calories de séance tiennent enfin compte du TEMPS que tu as réellement passé. Jusqu\'ici l\'app ne mesurait pas la durée : elle la déduisait de ton nombre de séries — une séance d\'1 h 50 pouvait être comptée 28 minutes. 👉 Elle prend maintenant, dans cet ordre : la durée que tu as corrigée toi-même · sinon l\'heure de tes séries · sinon ton chrono · sinon une estimation à partir de ton temps de repos. ⚠️ Une durée qui n\'a pas de sens (chrono oublié en marche, séance ressaisie le lendemain) est écartée du calcul ET signalée par un ⚠️ dans ton historique : tape dessus pour la corriger, les calories suivent. Tes anciennes séances ne bougent pas toutes seules. 🛋️ Au passage, le temps PASSÉ ENTRE tes séries est maintenant compté comme « debout, activité légère » (la valeur publiée) au lieu d\'une valeur trop haute qui correspondait à de la marche lente — ça retire une trentaine de calories par séance, et c\'est plus juste.'},
  {id:'guide-methode', screen:'setup', desc:'Le Guide de l\'application (Menu ☰ → Guide) ne montre plus seulement OÙ sont les choses : il explique maintenant COMMENT ça marche. Trois nouvelles pages : pourquoi le muscle se construit APRÈS la séance (elle envoie le signal, les protéines apportent les matériaux) · pourquoi pour perdre du gras c\'est l\'assiette qui décide, et ce que la musculation protège pendant ce temps-là · et pourquoi le sommeil (7 à 9 h) est le levier le plus efficace et le seul gratuit.'},
  {id:'bilan-mois', screen:'setup', desc:'Nouveau : les BILANS MENSUELS (Menu ☰ → Bilans mensuels). Au début de chaque mois, l\'app t\'annonce ce que tu as fait le mois écoulé — séances, jours d\'entraînement, séries de travail, volume, calories, records, badges, et ton poids de corps du début à la fin. Chaque mois se compare au précédent, et TOUS restent consultables quand tu veux : il suffit de choisir le mois en haut de l\'écran. Les bilans se recalculent depuis tes séances, donc ils restent justes même si tu corriges un ancien entraînement.'},
  {id:'nutri-3voies', screen:'nutrition', desc:'Le Journal montre maintenant les TROIS façons d\'ajouter un aliment, au lieu d\'un seul bouton : 📷 Code-barres (gratuit et illimité — tape les chiffres ou photographie-le) · 📸 Étiquette (l\'IA lit le tableau nutritionnel) · ✏️ À la main. Rien de nouveau derrière : ces trois chemins existaient déjà, ils étaient simplement cachés derrière « Ajouter un aliment » et personne ne pouvait les deviner. Le code-barres est en premier parce que c\'est le plus rapide ET le seul qui ne consomme aucun essai IA.'},
  {id:'exos-2langues', screen:'log', desc:'Les exercices les plus répandus portent maintenant LES DEUX NOMS — celui qu\'on dit à la salle, et l\'autre langue entre parenthèses : « Rowing Barre (Tirage Horizontal) », « Tirage Poulie Haute (Lat Pulldown) », « Pompes (Push-up) », « Élévations Latérales (Lateral Raise) ». Tu les trouves donc en cherchant dans la langue que tu veux. Tes records et tes séances passées ont suivi automatiquement — rien n\'est perdu.'},
  {id:'modes-alim', screen:'nutrition', desc:'Nouveaux modes alimentaires : Cétogène · Low carb · Paléo · Méditerranéen — et le jeûne intermittent (16/8, 18/6, 20/4). Tes macros ET tes repas suggérés s\'adaptent'},
  {id:'cardio-2moments', screen:'log', desc:'Le cardio se note maintenant AVANT (échauffement) ET APRÈS ta séance — les deux séparément, avec leurs calories additionnées. Parce que 10 min de vélo pour t\'échauffer et 25 min de tapis en fin de séance, ce n\'est pas la même chose'},
  {id:'exos-materiel', screen:'log', desc:'La liste des exercices est maintenant rangée PAR MATÉRIEL pour tout le monde : 🏋️ Barre · 💪 Poids libre · ⚙️ Guidé · 🤸 Poids du corps · 🎗️ Élastique · 🪢 TRX/Sangles · 🏃 Cardio. Tu t\'entraînes à la maison ? Cherche « élastique » ou « TRX »'},
  {id:'exos-maison', screen:'log', desc:'Nouveau : 16 exercices jambes ajoutés avec leur animation — dont les versions ÉLASTIQUE et TRX (le matériel est écrit dans le nom : cherche « élastique » ou « TRX » pour les trouver d\'un coup). Pratique pour s\'entraîner à la maison'},
  {id:'prog-note', screen:'log', desc:'Nouveau : un champ 💬 Commentaire par exercice dans l\'éditeur de programme (✏️ dans Mes Programmes) — écris ta consigne (réglage machine, prise, posture…), elle s\'affiche à chaque séance. Et rappel : la colonne « Repos » y règle le temps de repos série par série'},
  {id:'exos-aout', screen:'log', desc:'Nouveau : 14 exercices ajoutés au catalogue avec leurs animations (Pompes, Larsen press, Svend press, Hex press, écartés inclinés/Hyght, presses à cuisses, Hack Squat assis, Overhead Squat haltères, Muscle Snatch…) — et les presses à cuisses + le Hack Squat ont maintenant de vraies animations'},
  // ── Chantier du 03-04/08 : figurine détaillée, catalogue relu, Milo ──
  {id:'figurine-41', screen:'log', desc:'La figurine des muscles travaillés passe de 18 zones à 41 muscles dessinés : le pectoral en 3 faisceaux (supérieur/moyen/inférieur), la cuisse en 3 (vaste externe, droit fémoral, vaste interne), le trapèze en 3 étages, et 3 muscles qui n\'existaient pas — adducteurs, soléaire, trapèze inférieur. Tape un muscle : il te donne son nom PRÉCIS (« Pectoral supérieur ») au lieu du nom du groupe. ⚠️ Le ventre a changé d\'aspect : l\'ancien découpage « haut/bas » était en réalité gauche/droite — c\'est le dessin qui devient juste, rien n\'est cassé.'},
  {id:'exos-renommes', screen:'log', desc:'Quelques exercices ont changé de nom ou ont été fusionnés après relecture du catalogue : « Dips Parallèles » est devenu « Dips Triceps (Buste Droit) » et se range maintenant dans les TRICEPS ; « Câble Crunch », « Kickback Cable » et « Extension Nuque Haltère » faisaient double emploi et ont rejoint leur jumeau. 🛡️ Tes records et tes séances passées ont suivi automatiquement, et la recherche comprend toujours les ANCIENS noms : tape « Dips Parallèles », tu le trouveras.'},
  {id:'milo-remplace', screen:'coach', desc:'Quand tu demandes à Milo de changer un exercice pendant une séance EN COURS, il te demande maintenant ce que tu veux faire : ➕ Ajouter à ta séance · 🔄 Remplacer les exercices · Annuler. Il t\'affiche ce qui est en jeu (combien de séries sont déjà validées) avant que tu choisisses. « Remplacer » garde ton chrono et ton cardio : tu ne recommences pas ta séance.'},
  {id:'muscles-verifies', screen:'log', desc:'Les 337 exercices du catalogue ont été relus un par un : quels muscles travaillent vraiment, lesquels ne font que stabiliser. Une centaine de fiches corrigées — le leg curl ne comptait plus les fessiers (la hanche ne bouge pas), les crunchs ne comptaient plus les fléchisseurs de hanche, les rowings à poitrine appuyée ne comptaient plus le bas du dos. Ça change ta figurine, tes calories estimées et ce que Milo sait de ta séance.'},
  {id:'groupes-complets', screen:'log', desc:'En créant ton propre exercice, tu peux enfin choisir les groupes Lombaires, Avant-bras et Full Body — ils existaient dans l\'app mais étaient absents du menu (merci Christophe pour le signalement).'},
  {id:'bmr-masse-maigre', screen:'nutrition', desc:'Ton métabolisme de base peut maintenant être calculé sur ta MASSE MAIGRE (le muscle), et plus seulement sur ton poids total. Si tu as renseigné un bilan corporel (Progrès → Corps &amp; santé) ou un % de masse grasse, l\'app utilise la formule de Katch-McArdle au lieu de la formule générique — chez quelqu\'un de musclé, ça change souvent de 100 à 200 kcal par jour, tous les jours. Sous le chiffre, une ligne dit laquelle des deux formules est utilisée : tape-la, le calcul est posé avec tes vrais nombres. ⚠️ Un bilan de plus de 3 mois, ou un poids qui a bougé de plus de 5 % depuis, n\'est pas utilisé — l\'app le dit plutôt que de deviner.'},
  {id:'unilateral', screen:'log', desc:'48 exercices sont maintenant reconnus comme UNILATÉRAUX (rowing haltère, curl haltères, fentes, squat bulgare, élévations à un bras…) : une pastille 🔀 « par bras » ou « par jambe » s\'affiche à côté de leur nom en séance. Tu saisis toujours 3 séries, pas 6 — l\'app sait qu\'elles se refont de l\'autre côté et compte ton tonnage en double. ⚠️ La charge se note comme ceci : tu notes LE POIDS QUI BOUGE pendant la répétition. Un seul haltère monte (rowing, curl alterné) → note son poids à lui (28), pas le double. Les deux bougent (squat bulgare avec 2 haltères) → note le total. Tape la pastille, tout y est expliqué.'},
  {id:'echauffement-2fois', screen:'log', desc:'Correction : quand tu notais un cardio d\'échauffement, ses minutes étaient comptées DEUX FOIS dans les calories de la séance — une fois en estimation forfaitaire, une fois pour de vrai. 10 minutes de tapis pouvaient ainsi être facturées 126 kcal. Maintenant, dès que tu mesures un moment (avant ou après), c\'est ta mesure qui compte et l\'estimation s\'efface. ⚠️ Tes séances où tu ne notes AUCUN cardio ne changent pas d\'un kcal, et tes séances déjà enregistrées gardent leur chiffre — rien n\'est réécrit derrière toi.'},
  {id:'milo-superset', screen:'coach', desc:'Milo peut maintenant créer de VRAIS supersets dans ta séance : quand tu appuies sur « ⚡ Commencer cette séance », les exercices qu\'il a groupés arrivent liés — enchaînement automatique, vibration entre les deux, un seul repos à la fin du bloc. ⚠️ Il ne le propose que si ta séance ne rentre pas dans ton temps, et seulement sur les accessoires : le superset fait gagner du TEMPS, pas du muscle. 🚫 Jamais sur le squat, le soulevé de terre ou les développés — l\'app refuse ces groupes, parce que la performance du 2ᵉ exercice chute et que c\'est là que la charge compte. Et Milo sait désormais combien de temps durent VRAIMENT tes séances (chronométrées), pas seulement ce que tu as déclaré à l\'inscription.'},
  {id:'milo-repos-regles', screen:'coach', desc:'Milo connaît maintenant les temps de repos que tu as réglés exercice par exercice. Quand tu changes le chrono pendant une séance, l\'app retient ta valeur pour cet exercice — et jusqu\'ici Milo l\'ignorait : il pouvait te proposer « repos 2 min » sur un mouvement où tu en prends 4. Il reprend désormais tes réglages, et s\'il propose autre chose il te dit pourquoi. Ça rend aussi ses calculs de durée justes : un squat à 4 min de repos ne coûte pas le même temps qu\'un curl à 60 s.'},
  // ⚠️ `screen` doit valoir home · progress · log · nutrition · coach · setup — RIEN D'AUTRE.
  // L'onglet « Menu » est l'écran `setup` : 2 annonces écrites avec screen:'menu' (le style
  // Moniteur, la page Premium) n'ont JAMAIS été affichées, faute de correspondance. Un test
  // refuse désormais tout écran inconnu — une annonce invisible ne prévient personne.
  // Accueil
  {id:'home-calendar', screen:'home', desc:'Nouveau : un calendrier de ton mois sur l\'Accueil — tes jours de séance en rouge, les jours de RECORD cerclés en or. Navigue sur les mois, tape une semaine pour le détail'},
  {id:'day-state', screen:'home', spot:'home-daystate', desc:'Nouveau : « Comment tu te sens aujourd\'hui ? » — indique ton énergie et une éventuelle douleur du jour ; Milo adapte ses conseils et protège la zone douloureuse'},
  {id:'day-pain-detail', screen:'home', spot:'home-daystate', desc:'Nouveau : plus de zones de douleur (trapèze, cuisse, ischio, mollet…) + précise le côté (gauche/droite/les deux)'},
  {id:'day-mood', screen:'home', spot:'home-daystate', desc:'Nouveau : indique aussi ton MORAL du jour (😔 → 😄) — Milo t\'accompagne dans les coups de mou (dédramatise, valorise, sans jamais te juger)'},
  {id:'pain-body', screen:'home', spot:'home-daystate', desc:'Nouveau : pour signaler une gêne, tape directement le muscle sur une figurine anatomique (face + dos) ; articulations en boutons dessous'},
  {id:'calendar-memory', screen:'home', spot:'home-secondary', desc:'Nouveau : ton check-in du jour est gardé — tape une semaine du calendrier pour revoir, jour par jour, ta séance ET comment tu te sentais (sommeil, humeur, douleur)'},
  {id:'reco-why', screen:'home', spot:'home-hero', desc:'Nouveau : « Pourquoi ce score ? » sous ta récup — une fiche claire explique ce que le chiffre veut dire et d\'où il vient (sommeil, séance récente, âge…)'},
  {id:'milo-fill-profile', screen:'home', desc:'Nouveau : Milo complète ton profil tout seul — s\'il manque une info de base (lieu, fréquence, durée d\'entraînement), il te propose de la remplir en 1 tap sur l\'Accueil. Ta réponse va direct dans ton profil'},
  {id:'milo-declared-realized', screen:'home', desc:'Nouveau : Milo compare ce que tu as déclaré à ce que tu fais VRAIMENT — si ta fréquence de séances change durablement, il te propose (jamais tout seul) de mettre ton profil à jour. Un coach qui se cale sur ta réalité'},
  {id:'milo-style-detect', screen:'home', desc:'Nouveau : Milo repère ton STYLE d\'entraînement (force vs prise de muscle) d\'après tes séries/reps. Si ça ne colle pas avec ton objectif, il te propose (jamais tout seul) de le mettre à jour'},
  {id:'milo-othersport', screen:'home', desc:'Nouveau : Milo te demande de temps en temps si tu pratiques un autre sport (vélo, course, foot, natation…) — ça change ta récup et tes calories, il en tient compte. Optionnel, en 1 tap sur l\'Accueil'},
  {id:'milo-confirm-profile', screen:'home', desc:'Nouveau : Milo garde ton profil à jour — de temps en temps il te fait une petite vérification (« toujours en salle basique ? », « toujours ~45 min ? »). « Oui » ne change rien (il note juste que c\'est à jour), « Non » → tu corriges en 1 tap. Jamais plus d\'une petite question par semaine'},
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
  {id:'ex-favorites',   screen:'log',   desc:'Nouveau : tes exercices favoris (les plus utilisés) remontent en tête de la recherche, avec une ★'},
  // Progrès — spot = id de l'élément (onglet) où poser le point rouge « ici »
  {id:'prog-chart-interactive', screen:'progress', spot:'ptab-exo', desc:'Nouveau : graphe 1RM interactif — périodes (3M/6M/1an/Tout) + tape un point → « Voir cette séance »'},
  {id:'strength-goal', screen:'progress', spot:'ptab-exo', desc:'Nouveau : fixe un OBJECTIF DE FORCE (1RM visé) par exercice → barre de progression + ligne repère sur le graphe'},
  {id:'sess-filter', screen:'progress', spot:'ptab-exo', desc:'Nouveau : filtre ton historique de séances par groupe musculaire (chips sous « Historique séances »)'},
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
  /* ⚠️ LIBELLÉ MIS À JOUR EN ft-v1053 (« Commencer cette séance » → « Oui, on démarre »).
     ⛔ Ce `desc` n'est pas une archive : il alimente l'AIDE DÉTAILLÉE, qui doit décrire l'app
     telle qu'elle est aujourd'hui. Laisser le nom d'un bouton qui n'existe plus, c'est
     exactement ce que R23 décrit — un document d'état périmé fait dire des bêtises à celui qui
     le lit. ⭐ La pop-up `WHATS_NEW` v37, elle, n'est PAS retouchée : c'est une annonce datée,
     et réécrire une annonce passée falsifierait ce qui a été annoncé ce jour-là. */
  {id:'milo-start-session', screen:'coach', desc:'Nouveau : dis à Milo ta séance du jour → il te demande « Cette séance te convient ? » et le bouton « ⚡ Oui, on démarre » l\'ouvre direct dans l\'onglet Séance, poids pré-remplis'},
  {id:'milo-remember', screen:'coach', desc:'Nouveau : confie un truc durable à Milo en discutant (« je m\'entraîne le matin », « une vieille tendinite à l\'épaule »…) → il te propose de le RETENIR (« 🧠 Je retiens : … ? Oui/Non »). Retrouve tout dans Menu → « Ce que Milo sait de toi »'},
  {id:'milo-value-first', screen:'coach', desc:'Nouveau : Milo t\'aide d\'abord — il te propose un vrai plan dès ton 1er message (plus d\'interrogatoire), protège tes zones fragiles en te montrant comment, et t\'affiche parfois des réponses rapides à taper (répondre ne coûte pas de question gratuite)'},
  {id:'coach-quiz',  screen:'coach', spot:'coach-quiz-card', desc:'Nouveau : réponds au questionnaire « Milo apprend à te connaître » (gratuit, ça ne compte pas dans tes questions) — Milo te donne des conseils bien plus personnalisés'},
  {id:'milo-natural',screen:'coach', desc:'Nouveau : Milo (Coach IA) tient compte de l\'heure qu\'il est et du temps écoulé depuis votre dernière discussion — il t\'accueille naturellement'},
  {id:'milo-coach-pro',screen:'coach', desc:'Nouveau : Milo coache comme un vrai coach — il t\'évalue, croise tes données, justifie ses choix et s\'adapte à ta vie (horaires, travail, temps)'},
  {id:'gardien-securite',screen:'coach', desc:'Nouveau : Milo veille sur ta sécurité — il tient compte en priorité de ta santé et de tes zones fragiles, et ADAPTE au lieu d\'interdire. Renseigne-les dans Profil → Santé'},
  // Profil (setup) — anchor = id de la ligne de menu où le point rouge s'affiche (ici la carte Profil)
  {id:'morpho-setup',screen:'setup', anchor:'menu-row-profil', desc:'Section morphologie dans Profil'},
  {id:'discipline',  screen:'setup', anchor:'menu-row-profil', desc:'Nouveau : choisis ta Discipline (muscu, bodybuilding, force athlé, haltéro) — le Coach s\'y adapte'},
  {id:'profil-accordion',screen:'setup', anchor:'menu-row-profil', desc:'Profil réorganisé en sections repliables'},
  {id:'level-evolutif',screen:'setup', anchor:'menu-row-profil', desc:'Ton niveau (débutant/intermédiaire/confirmé) dans Profil → Discipline — le Coach s\'adapte et ton niveau évolue tout seul avec tes séances'},
  {id:'goal2', screen:'setup', anchor:'menu-row-profil', desc:'Nouveau : dans Profil → Objectif, ajoute une « priorité complémentaire » à ton objectif principal (Milo et ton entraînement en tiennent compte ; la nutrition suit le principal)'},
  {id:'muscle-priorities', screen:'setup', anchor:'menu-row-profil', desc:'Nouveau : dans Profil → Objectif, choisis jusqu\'à 2 muscles à développer EN PRIORITÉ — Milo leur donne plus de fréquence/volume/variantes (comme un vrai coach)'},
  {id:'adn-sportif', screen:'setup', anchor:'menu-row-profil', desc:'Nouveau : « Mon ADN sportif » dans ton Profil — dis à Milo ce qui te caractérise durablement (motivation, mode de vie, préférences, expérience) pour des conseils vraiment personnels'},
  {id:'work-actif',  screen:'setup', anchor:'menu-row-profil', desc:'Nouveau : niveau de travail « Actif » (serveuse, infirmier, vendeur : debout + en déplacement) dans ton Profil — tes calories et macros sont plus justes'},
  {id:'app-guide',   screen:'setup', anchor:'menu-row-appguide', desc:'Nouveau : Menu → « Guide de l\'application » — un diaporama qui explique comment marche l\'app (séance, programmes, Milo, photos…)'},
  {id:'milo-knows',  screen:'setup', anchor:'menu-row-miloknows', desc:'Nouveau : Milo apprend à te connaître — il te pose de petites questions sur l\'Accueil, et tu retrouves tout ce qu\'il a retenu dans Menu → « Ce que Milo sait de toi »'},
  {id:'checkin-tuiles', screen:'home', desc:'Ton check-in se lit d\'un coup d\'œil : trois tuiles sommeil / énergie / moral'},
  {id:'recup-moniteur', screen:'setup', desc:'Nouveau : deux styles pour ta carte récup — Menu → Apparence'},
  {id:'premium-menu', screen:'setup', desc:'Nouveau : le Premium a sa page — Menu → ⭐ Premium : ce qu\'il t\'apporte (Milo en illimité), le prix, et l\'activation d\'un code'},
  {id:'blood-for-all', screen:'setup', desc:'Nouveau : l\'import de ta prise de sang est ouvert à tous (Profil → Santé) — tu masques ton identité au doigt avant l\'envoi ; l\'analyse IA des marqueurs est réservée Premium, et Milo en tient compte'},
  {id:'calendrier-chaleur', screen:'home', desc:'Nouveau : ton calendrier montre le volume de chaque jour, le groupe travaillé, et le détail d\'un jour au tap'},
  {id:'recup-ring', screen:'home', desc:'Nouveau : ton score de récup s\'affiche dans un anneau — appuie dessus pour revoir le chiffre grimper de 0 à ton score'},
  {id:'whatsnew-history', screen:'setup', anchor:'menu-row-whatsnew', desc:'Nouveau : Menu → « Nouveautés » — toutes les nouveautés de l\'app restent consultables quand tu veux, même si tu passes la pop-up de lancement'},
  {id:'milo-knows-alive', screen:'setup', anchor:'menu-row-miloknows', desc:'Nouveau : ta page « Ce que Milo sait de toi » devient vivante — une phrase en haut te dit à quel point Milo peut te conseiller (elle monte, ne redescend jamais), et « 🧠 Milo a appris récemment » liste les dernières choses qu\'il a retenues sur toi'},
  {id:'coach-history', screen:'coach', desc:'Nouveau : Milo se souvient de vos échanges (même en gratuit) + le bouton « + » range tes discussions dans « Mes discussions » (icône horloge) au lieu de les effacer'},
  // Nutrition — spot = onglet où poser le point rouge « ici »
  {id:'food-journal', screen:'nutrition', spot:'ntab-journal', desc:'Nouveau : Journal alimentaire — note tes repas et suis tes calories/macros du jour vs ton objectif'},
  {id:'food-barcode', screen:'nutrition', spot:'ntab-journal', desc:'Nouveau : scan d\'un code-barres dans le journal — le produit est reconnu automatiquement (base mondiale)'},
  {id:'food-score',   screen:'nutrition', spot:'ntab-journal', desc:'Nouveau : le score santé des produits (Nutri-Score + niveau de transformation) au code-barres — gratuit pour tout le monde'},
  {id:'food-bc-photo', screen:'nutrition', spot:'ntab-journal', desc:'Nouveau : photographie le code-barres, l\'IA lit les chiffres pour toi (plus besoin de les taper)'},
  // Ouverts à tous depuis ft-v623 (étaient réservés testeurs) :
  {id:'goal-recomp', screen:'setup', anchor:'menu-row-profil', desc:'Nouveau : objectif « Perte de gras + muscle » (recomposition) dans Profil → Objectif — pour perdre du gras ET prendre du muscle en même temps (léger déficit + protéines hautes)'},
  {id:'manual-kcal', screen:'nutrition', desc:'Nouveau : tu peux régler tes calories et macros À LA MAIN dans Nutrition (bouton sous l\'anneau) — pratique si tu suis un plan précis ; retour à l\'automatique quand tu veux'},
  {id:'reps-maxi',   screen:'log',     desc:'Nouveau : mets « maxi » comme nombre de reps dans l\'éditeur de programme — pour une série « au maximum » (AMRAP)'},
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
// ➕ Pour annoncer une nouveauté : ajoute une entrée en HAUT avec un `v` supérieur à tous les
//    autres. Ne jamais réutiliser un ancien numéro. ⚠️ Il n'y a PLUS rien à incrémenter à côté :
//    `WHATS_NEW_MAX` se calcule tout seul depuis cette liste (voir sa définition, plus bas).
// ✅ v46/47/48 = les 3 features ex-testeurs (« maxi » · calories manuelles · objectif recomposition)
//    OUVERTES À TOUT LE MONDE (ft-v623, décision Michel) + red dots reps-maxi/manual-kcal/goal-recomp réactivés.
const WHATS_NEW=[
  /* 📉 ELLE SE MÉRITE, ET C'EST LE CAS LE PLUS NET DE « UN REPÈRE A BOUGÉ » (règle d'or #11).
     ⛔⛔ « X kcal restantes » N'EST PLUS À SA PLACE dans la carte du jour. C'est le chiffre que
     la personne lisait en premier depuis des mois. **La lecture la plus naturelle serait « ils
     ont supprimé mon compteur »** — c'est exactement ce que la pop-up doit empêcher.
     ⭐ Et la pop-up doit dire OÙ il est parti : il n'a pas disparu, il est traduit en aliments
     réels juste dessous. *Annoncer un retrait sans dire ce qui le remplace fabrique l'inquiétude
     qu'on voulait éviter.*
     ⛔ BORNÉE À L'ESSENTIEL (R25) : ce qui bouge, et ce qui apparaît. Le détail — les 4 états,
     la fenêtre de 14 jours, pourquoi la force se compare à répétitions égales, pourquoi Milo
     n'apparaît que dans un seul cas — vit dans l'aide `?`, l'aide détaillée et le Guide.
     ⛔ ANTI-TCA (P21) : la pop-up ne dit nulle part « remplis ton journal ». Elle dit ce que
     l'app fait quand il est vide : *elle se tait*. */
  {v:67, ic:'📉', t:'Nutrition : ta journée d’abord, ton évolution ensuite', d:'① <b>« X kcal restantes » n’est plus le gros chiffre de la carte</b> — il n’a pas disparu, il est traduit juste dessous en <b>aliments réels</b> (« ≈ 2 × blanc de poulet »). Un nombre de calories ne se mange pas. ② <b>Une carte « Ton évolution »</b> apparaît sous le bouton « noter » : elle croise <b>ton poids, tes charges et tes repas notés sur 14 jours</b>, sur ton téléphone et sans réseau. ⛔ Quand elle n’a pas assez de données, <b>elle le dit et s’arrête là</b> — aucune conclusion inventée.'},
  /* 🔥 ELLE SE MÉRITE, ET C'EST « UN REPÈRE A BOUGÉ » DEUX FOIS (règle d'or #11).
     ① Le chrono d'échauffement affichait **45 s** depuis toujours ; il peut maintenant afficher
        90 ou 120 s sur les derniers paliers. *Un chrono qu'on connaît par cœur et qui triple sans
        un mot se lit comme un bug.*
     ② Et sur les charges légères, la montée COMPTE MOINS DE SÉRIES qu'avant (5 → 3 sur un squat
        à 60 kg). **C'est la lecture la plus dangereuse des deux** : « il a supprimé mes séries ».
     ⛔ BORNÉE À L'ESSENTIEL (R25) : ce qui change et pourquoi. Le détail — les zones, le fait
     que ça ne dépasse jamais son propre repos de travail, le plafond qui suit la charge — vit
     dans l'aide `?`, l'aide détaillée et le Guide.
     ⭐ ET ELLE RAPPELLE LE MAXIMUM (ft-v1030) : sans ça, quelqu'un pourrait croire qu'on lui
     impose 2 minutes de repos. */
  {v:66, ic:'🔥', t:'Ton échauffement se dose à ta charge', d:'① <b>Le repos entre tes paliers suit la charge.</b> Il restait à 45 s quel que soit le poids : les derniers prennent maintenant <b>90 s, puis 2 min</b>. ⏳ Ça reste un <b>maximum</b> — tu peux repartir avant. ② <b>Moins de paliers sur les charges légères</b> : l\'app en ajoutait jusqu\'à 5 même pour un squat à 60 kg. ⛔ Elle n\'enlève <b>jamais</b> un palier que Milo t\'a écrit — elle arrête seulement d\'en rajouter.'},
  /* 🚶 ELLE SE MÉRITE : ce n'est pas un bouton qui apparaît, c'est un CHIFFRE SUR LEQUEL LA
     PERSONNE AGIT — ses calories du jour — qui peut désormais bouger. *Un nombre qu'on suit et
     qui change sans explication se lit comme un bug, ou pire, comme une erreur de l'app.*
     ⛔ BORNÉE À L'ESSENTIEL (R25) : ce qui change, et le fait que ce soit le SURPLUS. Le reste —
     les 7 jours de base, la borne, le jour creux qui ne retire rien — vit dans l'aide. */
  {v:65, si:'montrePas', ic:'🚶', t:'Tes grosses journées de marche comptent', d:'Si ta montre envoie tes pas \u00e0 Sant\u00e9, une randonn\u00e9e ou une longue journ\u00e9e debout <b>s\'ajoute enfin</b> \u00e0 ta d\u00e9pense du jour. \u26d4 <b>Seulement ce qui d\u00e9passe ton habitude</b>, jamais le total : ton niveau d\'activit\u00e9 contient d\u00e9j\u00e0 la marche d\'une journ\u00e9e normale, et te la compter deux fois fausserait tes macros tous les jours. Tu fais 6 000 pas d\'habitude et 15 000 aujourd\'hui \u2192 <b>+290 kcal</b>, expliqu\u00e9es sous ton TDEE.'},
  /* 😴 ELLE SE MÉRITE, ET C'EST LE CAS « UN REPÈRE A BOUGÉ » (règle d'or #11).
     Le nombre d'heures affiché sur l'Accueil peut maintenant être DIFFÉRENT de celui qu'on a
     tapé soi-même, et le score de récup peut bouger avec. *Un chiffre qu'on a donné et qui
     change tout seul, sans un mot, se lit comme une perte de données.*
     ⛔ BORNÉE À L'ESSENTIEL (R25) : ce qui change, pourquoi, et le fait que la saisie reste.
     Le détail — la qualité toujours donnée par la personne, ce que Milo en fait, ce qui se
     passe sans montre — vit dans l'aide `?` et l'aide détaillée, pas ici. */
  {v:64, si:'montreSommeil', ic:'😴', t:'Ton sommeil vient de ta montre', d:'Si ta montre envoie ton sommeil \u00e0 Sant\u00e9, l\'app utilise d\u00e9sormais <b>la dur\u00e9e mesur\u00e9e</b> au lieu de celle que tu notes \u2014 et elle l\'affiche clairement. <b>Pourquoi</b> : la saisie \u00e0 la main lisse les mauvaises semaines, donc ton score de r\u00e9cup\u00e9ration \u00e9tait trop optimiste pile quand tu \u00e9tais fatigu\u00e9. <b>Ta saisie reste</b>, affich\u00e9e \u00e0 c\u00f4t\u00e9 \u2014 et c\'est toujours toi qui dis si la nuit \u00e9tait bonne.'},
  /* ⚡ ELLE SE MÉRITE, ET C'EST LES DEUX CAS À LA FOIS (règle d'or #11).
     ① UN REPÈRE A BOUGÉ : le bouton rouge que tout le monde connaît porte maintenant une
        QUESTION au-dessus. Il est au même endroit et coûte le même tap — mais sans un mot,
        la lecture naturelle serait « on me demande quelque chose en plus ».
     ② ET IL Y A UNE ACTION NOUVELLE : le « Non, retravaille », que personne ne découvrirait
        tout seul puisqu'il n'a jamais existé.
     ⛔ BORNÉE À L'ESSENTIEL (R25) : la pop-up ANNONCE, l'aide EXPLIQUE. Le détail — les raisons
     en un tap, la construction au moment du tap, ce qui se passe si Milo écrit de travers —
     vit dans l'aide `?` et dans l'aide détaillée, pas ici. */
  {v:63, ic:'⚡', t:'« Cette séance te convient ? »', d:'Quand Milo te propose une séance, il te demande maintenant si elle te va. <b>« Oui, on démarre »</b> est le même bouton rouge qu\'avant, au même endroit — <b>rien de plus à faire</b>. Ce qui est nouveau, c\'est le <b>« Non, retravaille »</b> : un tap sur la raison (trop lourd, trop long, pas les bons exercices) et Milo te la refait.'},
  /* 💪 ELLE SE MÉRITE, ET C'EST LE CAS « LA PERSONNE PEUT FAIRE QUELQUE CHOSE DE NOUVEAU » :
     après chaque série de travail, une question apparaît dans la barre de repos. C'est un geste
     inédit, facultatif, et personne ne le découvrirait tout seul.
     ⛔ Sans elle, la ligne de boutons ressemblerait à un réglage de plus dans une barre déjà
     chargée. La pop-up ANNONCE (ce que c'est, à quoi ça sert), l'aide EXPLIQUE (R25). */
  {v:62, ic:'💪', t:'Note ce qu\'il te restait', d:'Après une série de travail, la barre de repos demande <b>« il t\'en restait combien ? »</b> — un tap : <b>échec · 1 · 2 · 3 · 4+</b>. ⚠️ Facultatif, et retirable. 👉 Tu le <b>revois la fois d\'après</b> dans « précédent » (<i>8×80·2r</i>) : c\'est ce qui te dit s\'il faut monter.'},
  /* ⏳ ELLE SE MÉRITE, ET C'EST LE CAS « UN REPÈRE A BOUGÉ » : jusqu'ici la barre de repos
     DISPARAISSAIT à zéro. Elle reste maintenant, et le chrono repart en « +0:12 ».
     ⛔ Sans cette pop-up, la lecture la plus naturelle est « le chrono est cassé » — c'est
     exactement ce qu'elle doit empêcher. Et il n'y a RIEN à faire : on annonce, on n'exige pas.
     La pop-up ANNONCE, l'aide EXPLIQUE (R25). */
  {v:61, ic:'\u23f3', t:'Ton repos est un MAXIMUM', d:'Le chrono de repos ne s\'arr\u00eate plus \u00e0 z\u00e9ro : il continue en <b>+0:12</b>, <b>+0:45</b>\u2026 avec la mention \u00ab au-del\u00e0 de ton repos max \u00bb. \u26a0\uFE0F <b>Ce n\'est pas un reproche</b> \u2014 un repos plus long est parfois exactement ce qu\'il faut. C\'est une information : les coachs \u00e9crivent un repos <b>maximum</b>, pas un temps \u00e0 attendre. <b>Tu peux repartir avant, c\'est permis</b>, et tu vois d\u00e9sormais quand tu vas au-del\u00e0. \u23f3'},
  // \u26a0\uFE0F ELLE SE M\u00c9RITE, ET C'EST LE CAS \u00ab UN REP\u00c8RE A BOUG\u00c9 \u00bb DANS SA FORME LA PLUS NETTE :
  // l'onglet Macros a chang\u00e9 d'ORDRE. Quelqu'un qui y r\u00e8gle son r\u00e9gime ou qui lit son TDEE ne les
  // trouvera plus o\u00f9 il les cherchait \u2014 et ne saura pas qu'ils sont dans un accord\u00e9on repli\u00e9 en bas.
  // \u26d4 Sans cette pop-up, la lecture la plus naturelle est \u00ab ils ont supprim\u00e9 des choses \u00bb ; c'est
  //    exactement ce qu'elle doit emp\u00eacher. La pop-up ANNONCE (o\u00f9 c'est parti), l'aide EXPLIQUE (R25).
  {v:60, ic:'\u{1F37D}\uFE0F', t:'L\'onglet Macros a \u00e9t\u00e9 rang\u00e9', d:'En arrivant sur <b>Nutrition</b>, tu vois maintenant <b>ta journ\u00e9e d\'abord</b> : ce que tu as mang\u00e9, trois anneaux pour tes macros, et ce qu\'il te reste \u00e0 manger. Avant, il fallait faire d\u00e9filer trois \u00e9crans. \u26a0\uFE0F <b>Rien n\'a \u00e9t\u00e9 supprim\u00e9</b> : ton BMR, ton TDEE, la r\u00e9partition et charge/d\u00e9charge sont regroup\u00e9s dans \u00ab <b>Comment c\'est calcul\u00e9</b> \u00bb, et ton mode alimentaire et ton r\u00e9gime dans \u00ab <b>Mes r\u00e9glages alimentaires</b> \u00bb \u2014 tout en bas de l\'onglet, un appui pour les ouvrir. \u{1F37D}\uFE0F'},
  // ⚠️ CETTE POP-UP SE MÉRITE (règle d'or #11) : elle est là parce que la personne doit FAIRE
  // quelque chose — sans code, sa sauvegarde en ligne reste en pause. On dit ce qui change pour
  // elle, pas comment c'est fait ; la pop-up ANNONCE, l'aide EXPLIQUE (R25).
  // ⚠️ CETTE POP-UP SE MÉRITE, ELLE AUSSI — et pour la même raison : la personne doit FAIRE
  // quelque chose de différent. Elle notait « 56 kg » à son rowing haltère (28 × 2) ; à partir
  // de maintenant l'app attend 28. Sans l'avoir lu, ses charges seraient doublées et son
  // tonnage quadruplé, sans que rien ne l'avertisse. C'est un repère qui BOUGE, le seul cas
  // qui justifie d'interrompre. La pop-up ANNONCE, la pastille 🔀 EXPLIQUE (R25).
  // ⚠️ ELLE SE MÉRITE : ses CALORIES changent du jour au lendemain, sans qu'elle ait rien
  // touché. Un repère qui bouge tout seul sans explication, c'est précisément ce qui fait
  // douter du reste de l'app — même quand le nouveau chiffre est meilleur que l'ancien.
  // ⚠️ ELLE SE MÉRITE : il y a quelque chose à FAIRE — aller vérifier sa discipline, que beaucoup
  // n'ont jamais touchée parce qu'elle ne changeait rien. Et un repère bouge : la FORME des séances
  // que Milo propose change, pas seulement un chiffre.
  {v:59, ic:'🎽', t:'Ta discipline change enfin quelque chose', d:'Jusqu\'ici, choisir « Powerlifting » ou « Musculation » ne servait presque à rien : Milo recevait le mot, jamais ce qu\'il implique — deux personnes de disciplines différentes recevaient la même séance. 👉 Chaque discipline porte maintenant un cadre : répétitions, repos, volume, les mouvements qui comptent, et ce qui n\'y a pas sa place. Powerlifting : 1-5 reps, 3 à 5 min de repos, les 3 mouvements avant tout. Musculation : 8-12 reps, 90 à 150 s. Va voir la tienne dans Profil → Discipline : l\'écran te montre exactement ce que Milo applique pour toi. 🎽'},
  // ⚠️ ELLE SE MÉRITE, ELLE AUSSI, et pour la même raison que la v57 : le chiffre de calories
  // BOUGE TOUT SEUL d'une séance à l'autre, sans que la personne ait rien touché — et il monte souvent
  // beaucoup. Et il y a quelque chose à FAIRE : vérifier la durée, la corriger si elle est fausse.
  {v:58, ic:'⏱️', t:'Tes calories comptent enfin le TEMPS de ta séance', d:'Jusqu\'ici l\'app ne mesurait pas combien de temps tu t\'étais entraîné : elle le déduisait de ton nombre de séries. Une séance d\'1 h 50 pouvait être comptée 28 minutes. 👉 Elle prend maintenant l\'heure de tes séries, ou ton chrono — tes prochaines séances afficheront souvent PLUS de calories, et c\'est voulu. ⚠️ Une durée qui n\'a pas de sens (chrono laissé en marche, séance ressaisie le lendemain) est écartée du calcul et marquée d\'un ⚠️ dans ton historique : tape dessus pour la corriger. ⏱️'},
  {v:57, ic:'🔥', t:'Tes calories tiennent compte de ton muscle', d:'Jusqu\'ici ton métabolisme de base était calculé sur ton poids, ta taille et ton âge — une formule qui traite 84 kg de muscle exactement comme 84 kg de gras. 👉 Si tu as renseigné un bilan corporel ou ton % de masse grasse, l\'app calcule maintenant sur ta MASSE MAIGRE (formule de Katch-McArdle). Chez quelqu\'un de musclé, ça monte souvent de 100 à 200 kcal par jour. Ton chiffre a donc pu changer, et c\'est voulu. Dans Nutrition, sous le BMR, une ligne dit quelle formule est utilisée — tape-la, le calcul est posé avec tes chiffres. Pas de bilan corporel ? Rien ne change pour toi. 🔥'},
  {v:56, ic:'🔀', t:'Les exercices « un côté à la fois »', d:'48 exercices sont maintenant reconnus comme unilatéraux — rowing haltère, curl haltères, fentes, squat bulgare, élévations à un bras… Une pastille 🔀 « par bras » ou « par jambe » apparaît à côté de leur nom en séance. 👉 CE QUI CHANGE POUR TOI : tu notes LE POIDS QUI BOUGE. Un seul haltère monte ? Note son poids à lui (28), plus le double. Les deux bougent (squat bulgare) ? Note le total. Tu saisis toujours 3 séries, pas 6 : l\'app sait qu\'elles se refont de l\'autre côté et double ton tonnage toute seule. Tes anciennes séances ne bougent pas. 💪'},
  {v:55, ic:'🔒', t:'Protège ton compte — 2 minutes', d:'Tes données en ligne ne sont plus accessibles avec ta seule adresse e-mail : il faut désormais un code perso, que toi seul connais. 👉 Tant que tu ne l\'as pas posé, ton appli marche normalement et tes séances sont enregistrées sur ton téléphone — mais ta sauvegarde en ligne reste en pause. Pour l\'activer : Profil → « Protéger mon compte avec un code ». Tu reçois un code par mail, tu choisis le tien, c\'est fini. 🔐'},
  {v:54, ic:'🏷️', t:'Des exercices ont changé de nom', d:'Après relecture du catalogue, quelques doublons ont fusionné et « Dips Parallèles » est devenu « Dips Triceps (Buste Droit) » (rangé dans les Triceps). 🛡️ Tes records ont suivi tout seuls, et la recherche comprend encore les anciens noms — tape l\'ancien, tu le trouveras. 👊'},
  {v:53, ic:'🧍', t:'Ta figurine passe à 41 muscles', d:'Le pectoral est maintenant dessiné en 3 faisceaux, la cuisse en 3, le trapèze en 3 étages — et les adducteurs, le soléaire et le trapèze inférieur existent enfin. Tape un muscle : il te dit son nom précis. Ton ventre a changé d\'aspect, c\'est normal : l\'ancien découpage était mal nommé. 💪'},
  {v:52, ic:'💚', t:'Deux styles pour ta récup', d:'Menu → Apparence → Carte récup : garde l\'anneau, ou passe au style Moniteur — ton score en gros à gauche, une jauge ouverte à droite et un vrai tracé de cœur qui défile. Tu peux le figer si tu préfères le calme. 🩺'},
  {v:51, ic:'📅', t:'Ton calendrier se lit d\'un coup d\'œil', d:'Plus une case est foncée, plus tu as soulevé lourd ce jour-là. Le trait sous le chiffre dit ce que tu as travaillé, et le n° de semaine affiche ton tonnage. Tape un jour : son détail s\'ouvre dessous. 📊'},
  {v:50, ic:'🎯', t:'Ta récup passe en anneau', d:'Sur l\'Accueil, ton score de récup s\'affiche maintenant dans un anneau coloré. Appuie dessus : le chiffre se rejoue de 0 à ton score. ✨'},
  {v:49, ic:'✨', t:'Les nouveautés restent consultables', d:'Menu → « Nouveautés » : tu peux relire toutes les nouveautés quand tu veux. Du coup, la pop-up de lancement se passe d\'un tap si tu es pressé — tu ne rates rien. ✨'},
  {v:48, ic:'🎯', t:'Nouvel objectif : « Perte de gras + muscle »', d:'Un nouvel objectif dans Profil : perdre du gras ET prendre du muscle en même temps. Tes calories et tes macros sont calculées pour ça, et Milo adapte ses conseils. 🎯'},
  {v:47, ic:'✏️', t:'Règle tes calories et macros à la main', d:'Dans Nutrition, un bouton sous l\'anneau te laisse fixer toi-même tes calories et tes macros, au lieu du calcul automatique. Utile si tu suis un plan précis. Retour à l\'auto quand tu veux. ✏️'},
  {v:46, ic:'💯', t:'« maxi » dans tes répétitions', d:'Dans l\'éditeur de programme, mets « maxi » au lieu d\'un chiffre : la série se fait au maximum de répétitions. Parfait pour tester ou finir un exercice. 💯'},
  {v:45, ic:'🏋️', t:'Milo repère ton style d\'entraînement', d:'Si tes séances ressemblent à du travail de force alors que ton objectif dit « prise de muscle » (ou l\'inverse), Milo te le fait remarquer sur l\'Accueil et te propose de mettre l\'objectif à jour. Il ne change jamais rien tout seul. 🏋️'},
  {v:44, ic:'🧠', t:'Ta page « Ce que Milo sait de toi » devient vivante', d:'Menu → « Ce que Milo sait de toi » : une phrase te dit à quel point il peut te conseiller, et la liste des dernières choses qu\'il a retenues sur toi. Plus tu utilises l\'app, plus il te connaît — et ça se voit. 🧠'},
  {v:43, ic:'🌿', t:'Milo garde ton profil à jour', d:'De temps en temps, Milo te fait une petite vérification sur l\'Accueil : « Tu t\'entraînes toujours en salle basique ? », « Une séance dure toujours ~45 min ? »… Si rien n\'a changé, tu tapes « Oui, toujours » (ça ne modifie rien — Milo note juste que c\'est à jour) ; si ça a changé, « Non, ça a changé » et tu choisis la nouvelle réponse en 1 tap. Comme ça, ton coach ne te connaît pas seulement au jour de l\'inscription : il reste à jour avec toi, sans jamais te harceler (au plus une petite question par semaine, et « Plus tard » est toujours possible). 🌿'},
  {v:42, ic:'🚴', t:'Milo tient compte de tes autres sports', d:'Tu fais du vélo, de la course, du foot, de la natation… à côté de la muscu ? Milo te pose la question de temps en temps sur l\'Accueil (1 tap) — parce qu\'un autre sport change ta récupération ET ta dépense d\'énergie (donc tes calories). Il en tiendra compte dans ses conseils. Optionnel, et « Aucun » est une réponse tout à fait valable. 🚴'},
  {v:41, ic:'🔎', t:'Milo s\'adapte à ce que tu fais vraiment', d:'Milo ne se contente plus de ce que tu as déclaré : il REGARDE tes vraies séances. S\'il voit un vrai changement durable — par exemple tu avais dit 3 séances/semaine mais tu en fais plutôt 5 depuis plusieurs semaines — il te fait une petite vérification sur l\'Accueil : « Ça a changé ? ». Tu réponds « Oui, mets à jour » ou « Non, garde comme ça ». Il ne modifie JAMAIS rien tout seul, et il ne se base que sur une vraie tendance (pas une semaine exceptionnelle). C\'est le début d\'un coach qui se cale sur ta réalité, pas sur une fiche figée. 🔎'},
  {v:40, ic:'🌱', t:'Milo complète ton profil tout seul', d:'S\'il manque une info de base sur ton entraînement (où tu t\'entraînes, combien de séances par semaine, la durée d\'une séance), Milo te propose maintenant de la remplir en 1 tap sur l\'Accueil — de vrais boutons, rien à écrire. Ta réponse va DIRECT dans ton profil, et ses conseils (et tes calories/macros) deviennent plus justes. Pas envie sur le moment ? « Plus tard », et il te le redemandera une autre fois — jamais deux jours de suite, jamais de rafale. Surtout utile si tu as sauté ces questions à l\'inscription. 🌱'},
  {v:39, ic:'💬', t:'Milo va droit au but', d:'Milo, ton Coach IA, t\'AIDE maintenant au lieu de te questionner : dès ton premier message, il te propose un vrai point de départ concret (une structure, des exercices), adapté à ce qu\'il sait déjà de toi ET à tes zones fragiles (il te montre comment il les protège) — puis, au plus, UNE question pour affiner. Quand une question a quelques réponses simples, il t\'affiche aussi des BOUTONS de réponse rapide à taper (tu peux toujours écrire à la place, ou ne pas répondre). Et répondre à une question de Milo ne coûte JAMAIS de question gratuite. 💬'},
  {v:38, ic:'🧠', t:'Milo retient ce que tu lui confies', d:'Quand tu confies à Milo un truc DURABLE sur toi en discutant (« je m\'entraîne le matin », « j\'ai que des haltères chez moi », « une vieille tendinite à l\'épaule »…), il te propose maintenant de le RETENIR pour de bon : une ligne « 🧠 Je retiens : … ? [Oui, retiens] [Non] » apparaît sous sa réponse. Tu valides → il s\'en souvient dans TOUTES vos prochaines discussions, et ses conseils deviennent plus personnels. Rien n\'est gardé sans ton accord, et tu peux tout revoir ou effacer dans Menu → « Ce que Milo sait de toi ». (Différent de la page d\'Accueil où c\'est LUI qui te pose des questions : ici, c\'est ce que TOI tu lui dis.) 🧠'},
  {v:37, ic:'⚡', t:'Milo démarre ta séance', d:'Nouveau dans le Coach 💬 : dis à Milo ta séance du jour (« Développé Couché 4×8, Rowing 4×10, Curl 3×12… ») OU demande-lui une séance à faire maintenant — un bouton « ⚡ Commencer cette séance » apparaît sous sa réponse. Tape-le et ta séance s\'ouvre DIRECT dans l\'onglet Séance, prête à logger : les bons exercices, les séries, et tes poids déjà pré-remplis avec ta dernière fois. De la discussion à la barre, en un clic. ⚡'},
  {v:36, ic:'💪', t:'Dis à Milo tes muscles prioritaires', d:'Nouveau dans Profil → Objectif : tu peux indiquer les muscles que tu veux développer EN PRIORITÉ (jusqu\'à 2, ex. pectoraux + épaules). Comme un vrai coach qui programme autour des priorités de l\'athlète, Milo donnera alors PLUS de fréquence, de volume et de variantes à ces muscles — dans ses conseils et les programmes qu\'il te génère — tout en maintenant le reste. Ton objectif reste le pilote et ta nutrition n\'est pas touchée : c\'est juste pour cibler OÙ tu veux progresser. 💪'},
  {v:35, ic:'🎯', t:'Choisis DEUX objectifs', d:'Dans ton Profil → Objectif, tu peux maintenant ajouter une « priorité complémentaire » à ton objectif principal. Exemple : principal « Force maximale » + complémentaire « Prise de muscle ». Ton objectif PRINCIPAL pilote toujours ta nutrition (calories, macros, repas) ; la priorité complémentaire, elle, affine les conseils de Milo et ton entraînement. (Pour « perdre du gras ET prendre du muscle » en même temps, l\'objectif « Perte de gras + muscle » est fait pour ça.) 🎯'},
  {v:34, ic:'🩹', t:'Tes douleurs, en tapant sur le corps', d:'Fini la liste de boutons : dans « Ton check-in du jour » (Accueil), pour signaler une gêne tu tapes maintenant directement le MUSCLE sur une vraie figurine anatomique (vue de face + de dos) — il devient rouge. Les articulations (nuque, coude, poignet, genou, cheville) restent en boutons juste en dessous, et tu précises toujours le côté (gauche/droite/les deux). Plus visuel, plus clair — et Milo protège la zone en priorité. 🩹'},
  {v:33, ic:'💡', t:'« Pourquoi ce score ? » — ta récup expliquée', d:'Ton score de récupération (sur l\'Accueil) t\'a toujours un peu intrigué ? Tape « Pourquoi ce score ? » juste en dessous : une fiche claire t\'explique en français simple ce que le chiffre veut dire (à quel point ton corps est prêt à s\'entraîner aujourd\'hui) et D\'OÙ il vient — sommeil, séance récente, âge, jours enchaînés… chaque facteur avec sa raison. Fini le chiffre mystère. Et rappel : ce n\'est qu\'un repère, ton ressenti prime toujours. 💡'},
  {v:32, ic:'🔎', t:'Ton historique plus pratique', d:'Trois améliorations sur l\'onglet Progrès : ① tes cartes d\'historique sont plus claires — le MUSCLE travaillé (ou le nom de la séance) ressort en gros titre, les calories passent en petit ; ② tu peux maintenant FILTRER ton historique par groupe musculaire : tape « Pectoraux », « Quadriceps »… sous « Historique séances » pour retrouver une séance en un clin d\'œil ; ③ dans la recherche d\'exercices (en séance), tes FAVORIS — ceux que tu utilises le plus — remontent tout seuls en tête, avec une ★. 🔎'},
  {v:31, ic:'🎯', t:'Fixe-toi un objectif de force', d:'Nouveau dans Progrès (onglet Exercices) : pour chaque exercice, tu peux fixer un OBJECTIF de 1RM (le max que tu vises). L\'app affiche alors une barre de progression (« 87 % du chemin · encore 17 kg ») et une ligne verte repère sur ton graphe, à côté de ta vraie courbe. Un cap clair et motivant, mouvement par mouvement — que TOI tu choisis. 🎯'},
  {v:30, ic:'📅', t:'Ton calendrier se souvient de tes journées', d:'À partir de maintenant, ton check-in du jour (énergie, humeur, douleur) n\'est plus effacé chaque nuit : il est GARDÉ. Tape une semaine dans le calendrier de l\'Accueil → sous chaque jour tu revois ta séance ET comment tu te sentais (😴 sommeil · humeur · une éventuelle gêne). Dans quelques semaines, tu retrouveras d\'un coup d\'œil dans quel état tu étais le jour d\'un record. C\'est la 1re pierre de « Ton histoire sportive ». 📅'},
  {v:29, ic:'📈', t:'Ton graphe de progression, interactif', d:'Sur l\'onglet Progrès, le graphe d\'un exercice devient interactif : ① choisis la PÉRIODE (3 mois / 6 mois / 1 an / Tout) pour zoomer sur ta progression ; ② tape n\'importe quel point de la courbe → tu vois la date et la charge de ce jour-là, et un bouton « Voir cette séance » t\'ouvre direct le détail complet (tes séries, tes notes). Le graphe et ton historique sont enfin reliés. 📈'},
  {v:28, ic:'🌡️', t:'Ton « check-in du jour » regroupé', d:'Pour désencombrer ton Accueil, ton sommeil et ta carte « Comment tu te sens » sont maintenant réunis en UNE carte repliable : « Ton check-in du jour ». Repliée, tu vois un résumé en une ligne (😴 7h · 🙂 énergie · 😄 moral) ; tape dessus pour la déplier et renseigner ton sommeil, ton énergie, ton moral et une éventuelle douleur. Rien n\'a disparu — c\'est juste plus propre et ça respire. 🌡️'},
  {v:27, ic:'🤝', t:'Milo t\'accompagne dans les moments difficiles', d:'Nouveau sur ton Accueil : à côté de ton énergie, tu peux maintenant indiquer ton MORAL du jour (😔 → 😄), en un tap. Pourquoi ? Parce que le plus dur, ce n\'est pas de savoir quoi faire — c\'est de tenir dans les coups de fatigue ou de mou. Quand ton moral est bas, Milo se fait plus DOUX : il dédramatise un écart (sans jamais te culpabiliser), valorise tes progrès, et t\'aide à repartir calmement. ⚠️ Milo reste ton coach sportif, jamais un psy — il ne pose aucun diagnostic. Tout est optionnel. 🤝'},
  {v:26, ic:'🏁', t:'Ton écran de fin de séance', d:'Dès que tu termines une séance, tu arrives sur un vrai écran de bilan : tes exercices (avec leurs images), tes chiffres (volume, records battus 🏆, durée, calories)… et juste en dessous, MILO DÉBRIEFE TA SÉANCE tout seul — pas un « Bravo » générique, mais une vraie analyse (progression, points d\'attention, et un objectif concret pour la prochaine fois). Puis il te demande comment tu t\'es senti. L\'impression qu\'un vrai coach vient de regarder ta séance. 🏁'},
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
  {v:8, ic:'🎨', t:'Ton app à ta couleur', d:'Nouveau : un halo d\'ambiance en mode nuit ✨. Dans Menu → Apparence, choisis TA couleur (8 teintes), le sens du halo (haut/bas), ou un fond uni tout noir.'},
  {v:7, ic:'🏋️', t:'Séances : cardio & corrections', d:'Tu peux maintenant enregistrer une séance de cardio seul (sans muscu). Et sur une séance passée, tu peux ajouter un exercice oublié, des séries, ou le cardio.'},
  {v:6, ic:'🏃', t:'Niveau de travail « Actif »', d:'Nouveau réglage dans ton Profil pour les métiers debout ET en déplacement toute la journée (serveuse, infirmier, vendeur) — entre « Debout » et « Physique ». Tes calories et macros de la Nutrition sont plus justes.'},
  {v:5, ic:'💬', t:'Milo (Coach IA) plus naturel', d:'Le Coach sait maintenant l\'heure qu\'il est (jour / nuit) et depuis combien de temps vous vous êtes parlé (hier, il y a quelques jours…) — il t\'accueille comme il faut au lieu de reprendre comme si tu venais de partir.'},
  {v:4, ic:'📓', t:'Journal alimentaire', d:'Onglet « Journal » dans Nutrition : note ce que tu manges et suis tes calories + macros du jour face à ton objectif.'},
  {v:3, ic:'📷', t:'Scan de code-barres', d:'Scanne un produit dans le journal : il est reconnu automatiquement et ses valeurs se remplissent — tu ajustes juste la quantité.'},
  {v:2, ic:'🤖', t:'Estimation par l\'IA', d:'Décris ton repas (« 200g poulet, riz, brocolis ») et l\'IA remplit les calories. 25 gratuites, illimité en Premium. La saisie à la main reste gratuite.'},
  {v:1, ic:'📥', t:'Importer un plan diététicien', d:'Une photo ou un PDF de ta diététicienne → l\'IA range tous les repas, jour par jour.'},
];
// ⚠️ CALCULÉ, PLUS JAMAIS ÉCRIT À LA MAIN (05/08/2026). C'était `52` en dur alors que les
// entrées 53 et 54 existaient — ajoutées la veille en oubliant d'incrémenter ce nombre.
// CONSÉQUENCE, et elle était vicieuse : à la fermeture, l'app note « vu jusqu'à 52 » ; les
// nouveautés 53 et 54 restent donc **éternellement non vues** et la pop-up revient À CHAQUE
// OUVERTURE, pour tout le monde. Michel : « à chaque mise à jour j'ai la pop-up, c'est relou ».
// Aucune erreur, aucun test rouge : juste une pop-up qui harcèle — et une nouveauté qui crie
// tout le temps ne dit plus rien (ft-v760).
// 👉 Le nombre se DÉDUIT de la liste : deux endroits qui portent la même information finissent
//    toujours par diverger (**R2**). Il ne peut plus être faux, et le commentaire au-dessus de
//    la liste (« puis incrémente WHATS_NEW_MAX ») n'a plus lieu d'être.
const WHATS_NEW_MAX = WHATS_NEW.reduce((m,f)=>Math.max(m, (f&&f.v)||0), 0);
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
// michdu75 ajouté le 31/07/2026 : Michel voulait tester la boîte à idées avec SON compte
// (diagnostic du mail de Christophe jamais reçu). Effet de bord assumé : il voit aussi la
// carte « Testeur Fondateur » et les pop-ups testeurs (une fois chacune).
const TESTER_EMAILS=['christophe@famillelanglois.fr','elineazs32@gmail.com','emma.david16@gmail.com','tanna.valery.studio@gmail.com','michdu75@gmail.com'];
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
const PREMIUM_CLIENT_EMAILS=['michdu75@gmail.com','elineazs32@gmail.com','christophe@famillelanglois.fr','emma.david16@gmail.com','tanna.valery.studio@gmail.com'];
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

// ═══════════════════════════════════════════════════════════════════════════════════
// IDENTITÉ DES EXERCICES — la clé STABLE (02/08/2026, décision Michel)
// ═══════════════════════════════════════════════════════════════════════════════════
// LE PROBLÈME QU'ELLE RÉSOUT. Jusqu'ici, le NOM d'un exercice était sa clé primaire :
// l'historique, les records, les programmes et les temps de repos étaient tous rangés
// par nom. Trois conséquences, toutes vécues le 02/08 :
//   · renommer un exercice cassait le lien avec le passé (il a fallu 3 tables de migration) ;
//   · deux exercices ne pouvaient pas porter le même nom ;
//   · ajouter un mot dans un nom changeait ses calculs, en silence.
//
// LE SENS DE LA TABLE COMPTE. Elle va de l'IDENTIFIANT vers les NOMS, jamais l'inverse :
// une table rangée par nom casserait au premier renommage, exactement comme avant.
// Ici l'identifiant est la clé ; le nom n'est qu'une valeur, qu'on a le droit de changer.
//
// LE FORMAT : ['nom actuel', ...anciens noms]. Le premier élément est ce qui s'affiche ;
// les suivants sont l'HISTOIRE des noms — c'est ce qui fait qu'une séance enregistrée il y
// a un an sous « Rowing Barre » retrouve sa fiche « Rowing Barre (Tirage Horizontal) ».
// Cette table REMPLACE la table de migration de state.js (R2 : une information, un seul
// propriétaire).
//
// ⚠️ RÈGLES ABSOLUES
//   1. Un identifiant, une fois écrit, ne change JAMAIS — même si le nom devient faux.
//      Il est opaque : sa ressemblance avec le nom d'origine est un confort de lecture,
//      pas une information.
//   2. Renommer = modifier le PREMIER élément et pousser l'ancien nom derrière lui.
//      Ne jamais supprimer un ancien nom : c'est le lien avec l'historique des gens.
//   3. Fusionner deux exercices = ajouter les noms du disparu à la liste de celui qui reste.
//   4. Ne jamais régénérer cette table depuis les noms : elle se maintient à la main,
//      une ligne à la fois. Un test vérifie qu'aucun identifiant existant n'a bougé.
const EX_IDS={
 'abducteurs-machine-debout':["Abducteurs Machine Debout"],
 'abduction-cuisses-leg-abduction':["Abduction Cuisses (Leg Abduction)"],
 'adduction-cuisses-leg-adduction':["Adduction Cuisses (Leg Adduction)"],
 'arrache-debout-muscle-snatch':["Arraché Debout (Muscle Snatch)"],
 'arrache-haltere-dumbbell-snatch':["Arraché Haltère (Dumbbell Snatch)"],
 'assault-air-bike':["Assault Air Bike"],
 'barre-au-front':["Barre au Front"],
 'battle-rope':["Battle Rope"],
 'belt-squat':["Belt Squat"],
 'bench-dips':["Bench Dips"],
 'bird-dog':["Bird Dog"],
 'box-jump':["Box Jump"],
 'burpees':["Burpees"],
 'chaise-romaine':["Chaise Romaine"],
 'chaise-wall-sit':["Chaise (Wall Sit)"],
 'chariot-de-puissance-curl-biceps':["Chariot de Puissance — Curl Biceps"],
 'chariot-de-puissance-extension-triceps':["Chariot de Puissance — Extension Triceps"],
 'chariot-de-puissance-fentes-arriere':["Chariot de Puissance — Fentes Arrière"],
 'chariot-de-puissance-poussee':["Chariot de Puissance — Poussée"],
 'chariot-de-puissance-tirage-de-cote':["Chariot de Puissance — Tirage de Côté"],
 'chariot-de-puissance-tirage-dos':["Chariot de Puissance — Tirage Dos"],
 'chariot-de-puissance-tirage-en-avancant':["Chariot de Puissance — Tirage en Avançant"],
 'chariot-de-puissance-tirage-epaules':["Chariot de Puissance — Tirage Épaules"],
 'chariot-de-puissance-tirage-inverse-jambes':["Chariot de Puissance — Tirage Inversé Jambes"],
 'chest-press-machine-declinee':["Chest Press Machine Déclinée"],
 'chest-press-machine-horizontale':["Chest Press Machine Horizontale"],
 'chest-press-machine-inclinee':["Chest Press Machine Inclinée"],
 'chest-press-poulie-assis':["Chest Press Poulie Assis"],
 'chest-press-trx-sangles':["Chest Press TRX (Sangles)"],
 'clean-jerk':["Clean & Jerk"],
 'cossack-squat':["Cossack Squat"],
 'croise-poulie-cable-crossover':["Croisé Poulie (Cable Crossover)"],
 'croix-de-fer-halteres':["Croix de Fer Haltères"],
 'crunch':["Crunch"],
 'crunch-machine':["Crunch Machine"],
 'crunch-oblique':["Crunch Oblique"],
 'crunch-poulie':["Crunch Poulie","Câble Crunch"],
 'curl-araignee-spider-curl':["Curl Araignée (Spider Curl)"],
 'curl-barre':["Curl Barre"],
 'curl-barre-ez-prise-large':["Curl Barre EZ Prise Large"],
 'curl-cable-en-croix-bayesian-curl':["Curl Câble en Croix (Bayesian Curl)"],
 'curl-concentre':["Curl Concentré"],
 'curl-ez':["Curl EZ"],
 'curl-halteres':["Curl Haltères"],
 'curl-incline':["Curl Incliné"],
 'curl-poignet-barre':["Curl Poignet Barre"],
 'curl-poulie':["Curl Poulie"],
 'curl-pupitre-barre-ez-larry-scott':["Curl Pupitre Barre EZ (Larry Scott)"],
 'curl-pupitre-machine':["Curl Pupitre Machine","Curl Machine"],   // fusion 09/08 : « Curl Machine » était la même machine (décision Michel)
 'curl-zottman':["Curl Zottman"],
 'developpe-arnold-arnold-press':["Développé Arnold (Arnold Press)"],
 'developpe-couche':["Développé Couché"],
 'developpe-couche-au-sol-floor-press':["Développé Couché au Sol (Floor Press)"],
 'developpe-couche-avec-chaines':["Développé Couché avec Chaînes"],
 'developpe-couche-elastique':["Développé Couché Élastique"],
 'developpe-couche-halteres':["Développé Couché Haltères"],
 'developpe-couche-larsen-larsen-press':["Développé Couché Larsen (Larsen Press)"],
 'developpe-couche-unilateral-kettlebell':["Développé Couché Unilatéral Kettlebell"],
 'developpe-decline':["Développé Décliné"],
 'developpe-decline-elastique':["Développé Décliné Élastique"],
 'developpe-decline-halteres':["Développé Décliné Haltères"],
 'developpe-epaules-assis-elastique':["Développé Épaules Assis Élastique"],
 'developpe-epaules-assis-machine-shoulder-pre':["Développé Épaules Assis Machine (Shoulder Press)"],
 'developpe-epaules-elastique':["Développé Épaules Élastique"],
 'developpe-epaules-kettlebell':["Développé Épaules Kettlebell"],
 'developpe-epaules-machine':["Développé Épaules Machine"],
 'developpe-epaules-unilateral-elastique':["Développé Épaules Unilatéral Élastique"],
 'developpe-halteres-assis':["Développé Haltères Assis"],
 'developpe-incline':["Développé Incliné"],
 'developpe-incline-halteres':["Développé Incliné Haltères"],
 'developpe-incline-poulie':["Développé Incliné Poulie"],
 'developpe-landmine-epaules':["Développé Landmine (Épaules)"],
 'developpe-militaire':["Développé Militaire"],
 'developpe-militaire-halteres':["Développé Militaire Haltères"],
 'developpe-nuque':["Développé Nuque"],
 'dips':["Dips"],
 'dips-assis-machine-seated-dip':["Dips Assis Machine (Seated Dip)"],
 'dips-aux-anneaux':["Dips aux Anneaux"],
 'dips-entre-deux-bancs':["Dips entre Deux Bancs"],
 'dips-lestes':["Dips Lestés"],
 'dips-machine-assistee':["Dips Machine Assistée"],
 'dips-paralleles':["Dips Triceps (Buste Droit)","Dips Parallèles"],
 'drapeau-dragon-flag':["Drapeau (Dragon Flag)"],
 'ecarte-arriere-elastique':["Écarté Arrière Élastique"],
 'ecarte-decline-halteres':["Écarté Décliné Haltères"],
 'ecarte-elastique':["Écarté Élastique"],
 'ecarte-halteres':["Écarté Haltères"],
 'ecarte-hyght-hyght-fly':["Écarté Hyght (Hyght Fly)"],
 'ecarte-incline-halteres':["Écarté Incliné Haltères"],
 'ecarte-poulie':["Écarté Poulie"],
 'ecarte-poulie-haute-a-genoux':["Écarté Poulie Haute à Genoux"],
 'ecarte-trx-sangles':["Écarté TRX (Sangles)"],
 'elevation-frontale-allongee-barre':["Élévation Frontale Allongée Barre"],
 'elevation-frontale-banc-incline':["Élévation Frontale Banc Incliné"],
 'elevation-laterale-inclinee-haltere':["Élévation Latérale Inclinée Haltère"],
 'elevation-laterale-landmine':["Élévation Latérale Landmine"],
 'elevation-laterale-poulie-inclinee':["Élévation Latérale Poulie Inclinée"],
 'elevations-frontales':["Élévations Frontales"],
 'elevations-frontales-cable':["Élévations Frontales Câble"],
 'elevations-frontales-machine':["Élévations Frontales Machine"],
 'elevations-laterales-cable':["Élévations Latérales Câble"],
 'elevations-laterales-kettlebell':["Élévations Latérales Kettlebell"],
 'elevations-laterales-lateral-raise':["Élévations Latérales (Lateral Raise)","Élévations Latérales"],
 'elevations-laterales-machine':["Élévations Latérales Machine"],
 'elevations-laterales-unilaterale-poulie':["Élévations Latérales Unilatérale Poulie"],
 'elevations-mollets-assis':["Élévations Mollets Assis"],
 'elevations-mollets-debout':["Élévations Mollets Debout"],
 'elevations-mollets-penche-donkey-calf-raise':["Élévations Mollets Penché (Donkey Calf Raise)"],
 'elevations-mollets-unilateral':["Élévations Mollets Unilatéral"],
 'ergometre-de-ski-ski-erg':["Ergomètre de Ski (Ski Erg)"],
 'extension-fessiers-arriere-kickback':["Extension Fessiers Arrière (Kickback)","Kickback Cable"],
 'extension-lombaire-sur-ballon':["Extension Lombaire sur Ballon"],
 'extension-nuque-haltere':["Extension Nuque Haltère","Triceps Haltère"],
 'extension-nuque-poulie-haute':["Extension Nuque Poulie Haute"],
 'extension-poignet-barre':["Extension Poignet Barre"],
 'extension-quadriceps-elastique':["Extension Quadriceps Élastique"],
 'extension-quadriceps-leg-extension':["Extension Quadriceps (Leg Extension)"],
 'extension-quadriceps-unilaterale':["Extension Quadriceps Unilatérale"],
 'extension-quadriceps-unilaterale-machine-a-d':["Extension Quadriceps Unilatérale Machine à Dips"],
 'extension-triceps':["Extension Triceps"],
 'extension-triceps-allongee-trx-sangles':["Extension Triceps Allongée TRX (Sangles)"],
 'extension-triceps-arriere-kickback':["Extension Triceps Arrière (Kickback)"],
 'extension-triceps-banc-incline-halteres':["Extension Triceps Banc Incliné Haltères"],
 'extension-triceps-concentree-poulie':["Extension Triceps Concentrée Poulie"],
 'extension-triceps-couche-halteres':["Extension Triceps Couché Haltères"],
 'extension-triceps-decline-halteres':["Extension Triceps Décliné Haltères"],
 'extension-triceps-nuque-elastique':["Extension Triceps Nuque Élastique"],
 'extension-triceps-trx-sangles':["Extension Triceps TRX (Sangles)"],
 'extension-triceps-verticale-elastique':["Extension Triceps Verticale Élastique"],
 'face-pull-couche-poulie':["Face Pull Couché Poulie"],
 'farmer-s-walk':["Farmer's Walk","Farmer's Walk (Grip)"],
 'fentes':["Fentes"],
 'fentes-arriere':["Fentes Arrière"],
 'fentes-croisees-curtsy-lunge':["Fentes Croisées (Curtsy Lunge)"],
 'fentes-kettlebell':["Fentes Kettlebell"],
 'fentes-laterales':["Fentes Latérales"],
 'fentes-marchees':["Fentes Marchées"],
 'gainage':["Gainage"],
 'glute-ham-raise-ghd':["Glute Ham Raise (GHD)"],
 'grimpeur-mountain-climber':["Grimpeur (Mountain Climber)"],
 'hack-squat-assis':["Hack Squat Assis"],
 'hack-squat-inverse':["Hack Squat Inversé"],
 'handstand-push-up-atr':["Handstand Push-up (ATR)"],
 'handstand-push-up-suspendu-sangles':["Handstand Push-up Suspendu (Sangles)"],
 'haussements-d-epaules-barre':["Haussements d'Épaules Barre","Haussements d'Épaules (Shrugs)"],
 'haussements-d-epaules-cable':["Haussements d'Épaules Câble"],
 'haussements-d-epaules-halteres':["Haussements d'Épaules Haltères"],
 'haussements-d-epaules-overhead':["Haussements d'Épaules Overhead"],
 'hex-press-smith-machine':["Hex Press Smith Machine"],
 'hip-thrust-barre-poussee-de-hanche':["Hip Thrust Barre (Poussée de Hanche)","Poussée de Hanche (Hip Thrust)"],
 'hip-thrust-haltere-poussee-de-hanche':["Hip Thrust Haltère (Poussée de Hanche)","Poussée de Hanche Haltère"],
 'hip-thrust-machine-poussee-de-hanche':["Hip Thrust Machine (Poussée de Hanche)","Poussée de Hanche Machine"],
 'hip-thrust-unilateral-poussee-de-hanche':["Hip Thrust Unilatéral (Poussée de Hanche)"],
 'hollow-body':["Hollow Body"],
 'hyperextension-back-extension':["Hyperextension (Back Extension)"],
 'hyperextension-inverse-reverse-hyper':["Hyperextension Inverse (Reverse Hyper)"],
 'hyperextension-lestee':["Hyperextension Lestée"],
 'hyperextension-machine':["Hyperextension Machine"],
 'inclinaison-lombaire-good-morning':["Inclinaison Lombaire (Good Morning)"],
 'jefferson-curl':["Jefferson Curl"],
 'jefferson-squat':["Jefferson Squat"],
 'jumping-jack':["Jumping Jack"],
 'kettlebell-swing':["Kettlebell Swing"],
 'kickback-machine':["Kickback Machine"],
 'l-sit':["L-Sit"],
 'leg-curl-assis-machine':["Leg Curl Assis Machine"],
 'leg-curl-couche-machine':["Leg Curl Couché Machine","Curl Ischio-jambiers (Leg Curl)"],
 'leg-curl-elastique':["Leg Curl Élastique"],
 'leg-curl-haltere':["Leg Curl Haltère"],
 'leg-curl-inverse':["Leg Curl Inversé"],
 'leg-curl-unilateral-debout':["Leg Curl Unilatéral Debout"],
 'machine-oiseau':["Machine Oiseau","Pec deck inverse","Pec Deck Inversé","Pec Deck Inverse","Reverse Pec Deck"],
 'marche-de-l-ours-bear-crawl':["Marche de l'Ours (Bear Crawl)"],
 'marteau':["Marteau"],
 'meadows-row':["Meadows Row"],
 'mollets-machine-assise':["Mollets Machine Assise"],
 'mollets-machine-debout':["Mollets Machine Debout"],
 'montee-sur-box-halteres':["Montée sur Box Haltères"],
 'montee-sur-box-step-up':["Montée sur Box (Step-up)"],
 'muscle-up':["Muscle-up"],
 'oiseau':["Oiseau"],
 'oiseau-elastique':["Oiseau Élastique"],
 'oiseau-inverse-trx-sangles':["Oiseau Inversé TRX (Sangles)"],
 'oiseau-poulie-45':["Oiseau Poulie 45°"],
 'overhead-squat':["Overhead Squat"],
 'overhead-squat-elastique':["Overhead Squat Élastique"],
 'overhead-squat-halteres':["Overhead Squat Haltères"],
 'passage-d-epaule-elastique':["Passage d'Épaule Élastique"],
 'glissement-au-mur-wall-slide':["Glissement au Mur (Wall Slide)"],
 'pec-deck':["Pec Deck","Butterfly","Butterfly Machine","Pec Deck (Butterfly)"],
 'pendulum-squat':["Pendulum Squat"],
 'pin-squat':["Pin Squat"],
 'planche-de-prehension':["Planche de Préhension"],
 'planche-inversee':["Planche Inversée"],
 'planche-laterale-side-plank':["Planche Latérale (Side Plank)"],
 'pompes-deficit-deficit-push-up':["Pompes Déficit (Deficit Push-up)"],
 'pompes-diamant':["Pompes Diamant"],
 'pompes-inclinees-trx-sangles':["Pompes Inclinées TRX (Sangles)"],
 'pompes-lestees':["Pompes Lestées"],
 'pompes-push-up':["Pompes (Push-up)","Pompes"],
 'pont-fessier-glute-bridge':["Pont Fessier (Glute Bridge)"],
 'press-jambes-45':["Press Jambes 45°"],
 'press-jambes-horizontale':["Press Jambes Horizontale"],
 'press-jambes-inclinee':["Press Jambes Inclinée"],
 'press-jambes-levier':["Press Jambes Levier"],
 'press-jambes-verticale':["Press Jambes Verticale"],
 'presse-a-cuisses-iso-laterale':["Presse à Cuisses Iso-Latérale"],
 'presse-a-cuisses-sur-le-cote':["Presse à Cuisses sur le Côté"],
 'presse-mollets-leg-press':["Presse Mollets (Leg Press)"],
 'pronation-supination-haltere':["Pronation Supination Haltère"],
 'pull-over':["Pull-over"],
 'pull-over-barre':["Pull-over Barre"],
 'pull-over-haltere':["Pull-over Haltère"],
 'pull-over-poulie':["Pull-over Poulie"],
 'pullover-machine':["Pullover Machine"],
 'reeves-deadlift':["Reeves Deadlift"],
 'releve-de-buste-sit-up':["Relevé de Buste (Sit-up)"],
 'releve-de-jambes':["Relevé de Jambes"],
 'renegade-row':["Renegade Row"],
 'rocky-pull-up':["Rocky Pull-up"],
 'rotation-externe-epaule-abduction':["Rotation Externe Épaule Abduction"],
 'rotation-externe-epaule-elastique':["Rotation Externe Épaule Élastique"],
 'rotation-externe-epaule-haltere':["Rotation Externe Épaule Haltère"],
 'rotation-externe-epaule-poulie':["Rotation Externe Épaule Poulie"],
 'rotation-interne-90-poulie':["Rotation Interne 90° Poulie"],
 'rotation-interne-epaule-elastique':["Rotation Interne Épaule Élastique"],
 'rotation-machine-obliques':["Rotation Machine Obliques"],
 'rotation-russe-russian-twist':["Rotation Russe (Russian Twist)"],
 'roue-abdominale-ab-wheel':["Roue Abdominale (Ab Wheel)"],
 'rowing-barre-tirage-horizontal':["Rowing Barre (Tirage Horizontal)","Rowing Barre"],
 'rowing-buste-penche-elastique':["Rowing Buste Penché Élastique"],
 'rowing-cable-tirage-horizontal':["Rowing Câble (Tirage Horizontal)","Rowing Cable"],
 'rowing-haltere-tirage-horizontal':["Rowing Haltère (Tirage Horizontal)","Rowing Haltère"],
 'rowing-halteres-buste-penche':["Rowing Haltères Buste Penché"],
 'rowing-hammer-strength':["Rowing Hammer Strength"],
 'rowing-horizontal-elastique':["Rowing Horizontal Élastique"],
 'rowing-inverse-sous-une-table':["Rowing Inversé sous une Table"],
 'rowing-landmine-t-bar':["Rowing Landmine (T-Bar)"],
 'rowing-machine-tirage-horizontal':["Rowing Machine (Tirage Horizontal)","Rowing Machine"],
 'rowing-poitrine-appuyee-chest-supported':["Rowing Poitrine Appuyée (Chest Supported)"],
 'rowing-smith-machine':["Rowing Smith Machine"],
 'rowing-t-bar-machine':["Rowing T-Bar Machine"],
 'rowing-trx-sangles':["Rowing TRX (Sangles)"],
 'rowing-unilateral-elastique':["Rowing Unilatéral Élastique"],
 'rowing-yates-supination':["Rowing Yates (Supination)"],
 'russian-twist-developpe-epaules':["Russian Twist Développé Épaules"],
 'safety-bar-squat':["Safety Bar Squat"],
 'sauts-a-la-corde':["Sauts à la Corde"],
 'seal-row':["Seal Row"],
 'sissy-squat':["Sissy Squat"],
 'sissy-squat-machine':["Sissy Squat Machine"],
 'skull-crusher-barre-ez':["Skull Crusher Barre EZ"],
 'sled-pull':["Sled Pull"],
 'sled-push':["Sled Push"],
 'smith-machine-developpe-couche':["Smith Machine Développé Couché"],
 'smith-machine-developpe-incline':["Smith Machine Développé Incliné"],
 'smith-machine-developpe-militaire':["Smith Machine Développé Militaire"],
 'smith-machine-fentes':["Smith Machine Fentes"],
 'smith-machine-squat':["Smith Machine Squat"],
 'souleve-de-terre':["Soulevé de Terre"],
 'souleve-de-terre-avec-deficit':["Soulevé de Terre avec Déficit"],
 'souleve-de-terre-jambes-tendues':["Soulevé de Terre Jambes Tendues"],
 'souleve-de-terre-machine':["Soulevé de Terre Machine"],
 'souleve-de-terre-roumain-barre':["Soulevé de Terre Roumain Barre"],
 'souleve-de-terre-roumain-halteres':["Soulevé de Terre Roumain Haltères"],
 'souleve-de-terre-roumain-kettlebell':["Soulevé de Terre Roumain Kettlebell"],
 'souleve-de-terre-roumain-landmine':["Soulevé de Terre Roumain Landmine"],
 'souleve-de-terre-roumain-unilateral':["Soulevé de Terre Roumain Unilatéral"],
 'souleve-de-terre-sumo':["Soulevé de Terre Sumo"],
 'souleve-de-terre-sumo-halteres':["Soulevé de Terre Sumo Haltères"],
 'souleve-de-terre-sumo-kettlebell':["Soulevé de Terre Sumo Kettlebell"],
 'souleve-de-terre-sumo-landmine':["Soulevé de Terre Sumo Landmine"],
 'souleve-de-terre-trap-bar':["Soulevé de Terre Trap Bar"],
 'souleve-de-terre-valise-suitcase':["Soulevé de Terre Valise (Suitcase)"],
 'split-squat-elastique-fente-statique':["Split Squat Élastique (Fente Statique)"],
 'split-squat-trx-sangles':["Split Squat TRX (Sangles)"],
 'squat-a-la-barre':["Squat à la Barre"],
 'squat-avant':["Squat Avant"],
 'squat-avec-rotation-du-tronc':["Squat avec Rotation du Tronc"],
 'squat-bande-elastique':["Squat Bande Élastique"],
 'squat-barre-avec-bandes-elastiques':["Squat Barre avec Bandes Élastiques"],
 'squat-bulgare':["Squat Bulgare"],
 'squat-bulgare-elastique':["Squat Bulgare Élastique"],
 'squat-gobelet-goblet-squat':["Squat Gobelet (Goblet Squat)"],
 'squat-hack-hack-squat':["Squat Hack (Hack Squat)"],
 'squat-kettlebell':["Squat Kettlebell"],
 'squat-pistol':["Squat Pistol"],
 'squat-pistol-trx-sangles':["Squat Pistol TRX (Sangles)"],
 'squat-poids-du-corps-air-squat':["Squat Poids du Corps (Air Squat)"],
 'squat-saute-jump-squat':["Squat Sauté (Jump Squat)"],
 'squat-sumo':["Squat Sumo"],
 'squat-trx-sangles':["Squat TRX (Sangles)"],
 'superman':["Superman"],
 'suspension-passive-dead-hang':["Suspension Passive (Dead Hang)"],
 'svend-press-serrage-de-plaque':["Svend Press (Serrage de Plaque)"],
 'tate-press':["Tate Press"],
 'thruster':["Thruster"],
 'thruster-kettlebell':["Thruster Kettlebell"],
 'thrusters-halteres':["Thrusters Haltères"],
 'tirage-cable-fessiers-cable-pull-through':["Tirage Cable Fessiers (Cable Pull Through)"],
 'tirage-en-rack-rack-pull':["Tirage en Rack (Rack Pull)"],
 'tirage-incline-poulie-haute':["Tirage Incliné Poulie Haute"],
 'tirage-iso-lateral-hammer-strength':["Tirage Iso-Latéral Hammer Strength"],
 'tirage-menton':["Tirage Menton"],
 'tirage-menton-elastique':["Tirage Menton Élastique"],
 'tirage-menton-kettlebell':["Tirage Menton Kettlebell","Tirage Vertical (Upright Row)"],
 'tirage-nuque':["Tirage Nuque"],
 'tirage-poulie-basse-prise-large':["Tirage Poulie Basse Prise Large"],
 'tirage-poulie-basse-prise-serree':["Tirage Poulie Basse Prise Serrée"],
 'tirage-poulie-haute-lat-pulldown':["Tirage Poulie Haute (Lat Pulldown)","Tirage Poulie Haute"],
 'tirage-poulie-haute-prise-inversee':["Tirage Poulie Haute Prise Inversée"],
 'tirage-poulie-haute-prise-serree':["Tirage Poulie Haute Prise Serrée"],
 'tirage-vertical-alterne-elastique':["Tirage Vertical Alterné Élastique"],
 'tirage-visage-face-pull':["Tirage Visage (Face Pull)"],
 'traction-assistee':["Traction Assistée"],
 'traction-assistee-avec-banc':["Traction Assistée avec Banc"],
 'traction-australienne-poids-du-corps':["Traction Australienne (Poids du Corps)"],
 'traction-australienne-trx-sangles':["Traction Australienne TRX (Sangles)"],
 'traction-derriere-la-nuque':["Traction Derrière la Nuque"],
 'traction-lestee':["Traction Lestée"],
 'traction-prise-neutre':["Traction Prise Neutre"],
 'traction-supination-chin-up':["Traction Supination (Chin-up)"],
 'tractions-aux-anneaux':["Tractions aux Anneaux"],
 'tractions-pull-up':["Tractions (Pull-up)"],
 'triceps-corde-poulie':["Triceps Corde Poulie"],
 'triceps-machine':["Triceps Machine"],
 'triceps-poulie':["Triceps Poulie"],
 'triceps-poulie-basse':["Triceps Poulie Basse"],
 'turkish-get-up':["Turkish Get-Up"],
 'waiter-curl':["Waiter Curl"],
 'wall-ball':["Wall Ball"],
 'windshield-wiper':["Windshield Wiper"],
 'y-raise-w-raise':["Y Raise / W Raise"],
 'zercher-deadlift':["Zercher Deadlift"],
};

// Index inverse construit UNE FOIS au chargement : tous les noms (actuels et anciens) -> identifiant.
const _EX_NOM2ID=(function(){
  const m={};
  try{ Object.keys(EX_IDS).forEach(function(id){
    (EX_IDS[id]||[]).forEach(function(n){ if(n&&m[n]===undefined) m[n]=id; });
  }); }catch(e){}
  return m;
})();

/** Identifiant stable d'un exercice, à partir de n'importe lequel de ses noms (actuel ou ancien).
 *  Rend `null` pour un exercice inconnu (exercice perso, nom saisi à la main) — et ce `null` ne
 *  doit JAMAIS être remplacé par une valeur par défaut : on préfère « je ne sais pas » (R29). */
function exId(nom){ return (nom&&_EX_NOM2ID[nom])||null; }

/** Nom ACTUEL d'un exercice à partir de son identifiant. `null` si l'identifiant est inconnu. */
function exNom(id){ const l=id&&EX_IDS[id]; return (l&&l[0])||null; }

/** Nom actuel correspondant à un nom éventuellement ancien — remplace la table de migration.
 *  Rend le nom inchangé si l'exercice est inconnu (exercice perso : on n'y touche pas). */
function exNomActuel(nom){ const id=exId(nom); return id?exNom(id):nom; }

/* ─── NOM ABRÉGÉ → NOM DU CATALOGUE (24/08/2026) ──────────────────────────────────────
 *
 * ⚠️ POURQUOI. 77 exercices du catalogue portent une parenthèse EXPLICATIVE (« Hip Thrust
 * Barre (Poussée de Hanche) », « Abduction Cuisses (Leg Abduction) »). Elle nomme la
 * famille, elle ne distingue pas l'exercice — et quand Milo prescrit une séance, il abrège :
 * il écrit « Hip Thrust Barre ». Ce nom court est alors STOCKÉ tel quel dans la séance.
 *
 * ⛔⛔ LE DÉFAUT EST SILENCIEUX, ET C'EST CE QUI LE REND COÛTEUX. Le calcul des muscles s'en
 * sortait (il retombe sur les règles `_MEX`, qui devinent), donc rien ne plantait, rien ne
 * rougissait. Mais tous les lookups qui exigent le nom EXACT — l'animation de l'exercice,
 * le tutoriel, la silhouette du groupe — échouaient en silence. Mesuré sur la séance réelle
 * de Michel (24/08) : « Hip Thrust Barre » et « Abduction Cuisses » affichaient « Muscle
 * principal deviné » + « Ajouter la photo de ta machine », alors que `hip-thrust-barre.webp`
 * et `leg-abduction-machine-v2.webp` étaient DÉJÀ dans le dépôt. *L'app proposait d'ajouter
 * une photo qu'elle avait sous la main.*
 *
 * ⭐⭐ LE MÉCANISME EXISTAIT DÉJÀ, POSÉ D'UN SEUL CÔTÉ (R8/R13) — c'est le motif de ft-v973
 * et ft-v975, une 3ᵉ fois. `_matchExercise` porte depuis le 09/08 une étape « exact sans la
 * parenthèse », écrite pour exactement ce cas (Michel, sur un vrai programme de Milo). Elle
 * ne servait qu'à l'IMPORT ; l'affichage, lui, ne l'a jamais eue.
 *
 * ⛔ DÉTERMINISTE SEULEMENT — aucun rapprochement flou ici (R29 : le coût de l'erreur décide).
 * Montrer l'animation d'un AUTRE exercice est pire que de n'en montrer aucune : la personne
 * apprend un mouvement qu'elle n'a pas prescrit. On ne résout donc que ce qui est certain.
 *
 * ⛔⛔ ET LE ZÉRO-COLLISION EST MESURÉ, PAS SUPPOSÉ — il est même la CONDITION de la table.
 * Vérifié le 24/08 sur les 324 exercices : 77 parenthèses → 77 bases distinctes, aucune
 * collision, et aucune base qui soit déjà le nom complet d'un autre exercice. Toute base
 * ambiguë est RETIRÉE de la table plutôt qu'arbitrée : si le catalogue grandit et crée une
 * collision, l'abréviation cesse d'être résolue (on retombe sur l'ancien comportement) —
 * jamais elle ne pointe vers le mauvais exercice. *Le mode d'échec choisi est « je ne sais
 * pas », jamais « voilà, tiens » (R29).*
 */
const _EX_BASE2NOM=(function(){
  const naz=s=>(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()
    .replace(/[^a-z0-9]/g,' ').replace(/\s+/g,' ').trim();
  const m={},ambigu={};
  try{
    const noms=(typeof EXLIB!=='undefined'?EXLIB:[]).map(e=>e&&e.n).filter(Boolean);
    const pleins={};noms.forEach(n=>{pleins[naz(n)]=true;});
    noms.forEach(function(n){
      const b=String(n).replace(/\s*\([^)]*\)\s*$/,'').trim();
      if(!b||b===n)return;
      const k=naz(b);
      if(!k||pleins[k]){ambigu[k]=true;return;}           // la base EST déjà un autre exercice
      if(m[k]!==undefined&&m[k]!==n){ambigu[k]=true;return;} // deux exercices, même base
      m[k]=n;
    });
    Object.keys(ambigu).forEach(function(k){delete m[k];});
  }catch(e){}
  return m;
})();

/** Nom du CATALOGUE pour un nom éventuellement ANCIEN ou ABRÉGÉ (« Hip Thrust Barre » →
 *  « Hip Thrust Barre (Poussée de Hanche) »). Rend le nom inchangé s'il est déjà celui du
 *  catalogue, ou si l'exercice est inconnu (perso, saisi à la main) — on n'invente jamais. */
function exNomCatalogue(nom){
  if(!nom)return nom;
  const actuel=exNomActuel(nom);
  if(exId(actuel))return actuel;                 // déjà un nom du catalogue → on n'y touche pas
  const naz=s=>(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()
    .replace(/[^a-z0-9]/g,' ').replace(/\s+/g,' ').trim();
  return _EX_BASE2NOM[naz(actuel)]||actuel;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// LES EXERCICES UNILATÉRAUX — 48 exercices tranchés UN PAR UN par Michel (10/08/2026)
// ═══════════════════════════════════════════════════════════════════════════════════
// ⭐ LE CRITÈRE, ET C'EST MICHEL QUI L'A DONNÉ. Sur le Soulevé de Terre Valise (la charge
// est d'un seul côté, mais les DEUX jambes poussent) : « bah c'est entre les 2 lol… met
// uni vu que ça doit être fait de l'autre côté aussi ». Ce qui compte n'est donc PAS
// combien de membres travaillent — c'est SI LA SÉRIE SE REFAIT DE L'AUTRE CÔTÉ. C'est
// exactement ce qui double le volume réellement produit.
//
// ⚠️ CE MARQUEUR NE TOUCHE PAS À LA CHARGE, et c'est ce qui rend la chose simple.
// La règle de saisie est UNE SEULE PHRASE, valable pour les 355 exercices :
//        « on note le poids qui BOUGE pendant la répétition »
// (incliné haltères = 60, les 2 montent · rowing haltère = 28, 1 seul monte · squat
// bulgare = 40, les 2 haltères descendent avec le corps). Deux règles qui se ressemblent
// finissent toujours par diverger ; une seule, non (R2). Le marqueur ne sert donc qu'à
// ① DOUBLER LE VOLUME et ② AFFICHER « par bras / par jambe ».
//
// ⚠️ ON SAISIT 3 SÉRIES, PAS 6 — décision de Michel : « pas possible de faire 50 séries.
// Il faut intégrer comme avant 3 séries × X kilos, mais dans la logique on sait qu'il
// faut faire une série à gauche et une à droite ». L'information est dans le TYPE de
// l'exercice, pas dans la saisie (règle d'or #4 : noter en salle doit rester instantané).
// Conséquence assumée : un côté plus faible (28 à droite, 26 à gauche) ne peut pas
// s'exprimer. À rouvrir seulement si un testeur le demande (R22).
//
// ⚠️ LES 9 FAUX AMIS sont volontairement ABSENTS de cette liste (Curl Zottman, Marteau,
// Extension Triceps Arrière, Leg Curl Haltère, Seal Row, Rowing Landmine, Élévations
// Mollets Penché, et les deux machines « ISO-LATÉRALES » — iso-latéral = bras de levier
// indépendants, PAS un côté à la fois). Les ranger ici aurait doublé leur volume à tort.
// 4 des 9 venaient de MES paris, corrigés par Michel ou par le dessin animé de la
// figurine : une liste faite de tête se serait trompée sur presque la moitié (R28).
//
// La clé est l'IDENTIFIANT, jamais le nom : un exercice renommé garde son id, donc son
// marqueur (R2 — une information a un seul propriétaire).
const EX_UNI={
 'arrache-haltere-dumbbell-snatch':'bras','chariot-de-puissance-fentes-arriere':'jambe',
 'cossack-squat':'jambe','curl-araignee-spider-curl':'bras','curl-concentre':'bras',
 'curl-halteres':'bras','developpe-couche-unilateral-kettlebell':'bras',
 'developpe-epaules-unilateral-elastique':'bras','elevation-laterale-inclinee-haltere':'bras',
 'elevation-laterale-landmine':'bras','elevations-laterales-unilaterale-poulie':'bras',
 'elevations-mollets-unilateral':'jambe','extension-fessiers-arriere-kickback':'jambe',
 'extension-quadriceps-unilaterale':'jambe','extension-quadriceps-unilaterale-machine-a-d':'jambe',
 'extension-triceps-concentree-poulie':'bras','fentes':'jambe','fentes-arriere':'jambe',
 'fentes-croisees-curtsy-lunge':'jambe','fentes-kettlebell':'jambe','fentes-laterales':'jambe',
 'fentes-marchees':'jambe','hip-thrust-unilateral-poussee-de-hanche':'jambe',
 'kickback-machine':'jambe','leg-curl-unilateral-debout':'jambe','meadows-row':'bras',
 'montee-sur-box-halteres':'jambe','montee-sur-box-step-up':'jambe',
 'presse-a-cuisses-sur-le-cote':'jambe','renegade-row':'bras',
 'rotation-externe-epaule-abduction':'bras','rotation-externe-epaule-elastique':'bras',
 'rotation-externe-epaule-haltere':'bras','rotation-externe-epaule-poulie':'bras',
 'rotation-interne-90-poulie':'bras','rotation-interne-epaule-elastique':'bras',
 'rowing-haltere-tirage-horizontal':'bras','rowing-unilateral-elastique':'bras',
 'smith-machine-fentes':'jambe','souleve-de-terre-roumain-unilateral':'jambe',
 // ⚠️ « côté » et pas « jambe » : les DEUX jambes poussent, seule la charge est d'un côté.
 // C'est le cas qui a fait naître le critère — dire « par jambe » serait faux.
 'souleve-de-terre-valise-suitcase':'cote',
 'split-squat-elastique-fente-statique':'jambe','split-squat-trx-sangles':'jambe',
 'squat-bulgare':'jambe','squat-bulgare-elastique':'jambe','squat-pistol':'jambe',
 'squat-pistol-trx-sangles':'jambe','tirage-vertical-alterne-elastique':'bras'
};

/** Cet exercice se refait-il de l'autre côté ? `false` pour tout exercice inconnu
 *  (exercice perso, nom inventé) — on ne double JAMAIS un volume au hasard : se tromper
 *  ici fausse une courbe que la personne regarde (R29, le coût de l'erreur décide).
 *  ⚠️ LE NOM EST RÉSOLU D'ABORD (24/08/2026, ft-v997) : c'est la JUMELLE du défaut des
 *  muscles, trouvée en la cherchant (R8 — « un oubli de ce type est rarement isolé »).
 *  Mesuré : **10 exercices** perdaient leur statut unilatéral une fois abrégés — « Hip
 *  Thrust Unilatéral », « Montée sur Box », « Arraché Haltère »… Leur volume n'était donc
 *  PAS doublé, et l'étiquette « par bras / par jambe » ne s'affichait pas.
 *  ⛔ Résoudre une abréviation n'est PAS « doubler au hasard » : la table est déterministe
 *  et vérifiée sans collision — un exercice perso, lui, rend toujours `false`. */
function estUnilateral(nom){ const id=exId(exNomCatalogue(nom)); return !!(id&&EX_UNI[id]); }

/** « par bras » · « par jambe » · « par côté » — ou '' si l'exercice n'est pas unilatéral. */
function uniLabel(nom){
  const id=exId(exNomCatalogue(nom)), c=id&&EX_UNI[id];
  return c==='bras'?'par bras':c==='jambe'?'par jambe':c==='cote'?'par côté':'';
}

// ═══════════════════════════════════════════════════════════════════════════════════
// LES MUSCLES ÉCRITS — la donnée, pas la devinette (02/08/2026, décision Michel)
// ═══════════════════════════════════════════════════════════════════════════════════
// POURQUOI. Jusqu'ici les muscles étaient DÉDUITS du nom par 69 règles parcourues dans
// l'ordre. Ça a permis au catalogue de grandir vite (71 exercices en 5 jours, classés
// gratuitement) — mais ça a produit la famille de bugs la plus fréquente du projet
// (« premier match gagnant », au moins 14 fois), et 60 exercices dont la justesse ne
// tient qu'à la POSITION d'une règle dans une liste, dont le DÉVELOPPÉ COUCHÉ.
//
// Michel, après une journée passée à construire de quoi SURVEILLER cette devinette :
// « des fois on veut faire compliqué et plus simple est mieux ». Il a raison — et ce qui
// disparaît en écrivant les muscles n'est pas corrigé, il devient IMPOSSIBLE : il n'y a
// plus d'ordre où se tromper, plus de règle à masquer, plus de fragilité.
//
// ⚠️ LE DANGER, repéré par Michel lui-même : figer ce que les règles produisent
// aujourd'hui reviendrait à graver les erreurs actuelles dans le marbre — on aurait
// échangé une devinette instable contre une erreur stable. Chaque ligne ci-dessous a donc
// été RELUE une par une, et les corrections trouvées sont notées en commentaire.
//
// LES RÈGLES NE DISPARAISSENT PAS : elles restent pour ce qu'on ne connaît pas — les
// exercices créés par les utilisateurs, et les noms qui arrivent par l'import. Elles
// passent de « la vérité pour ce qu'on connaît » à « une approximation pour ce qu'on
// ignore ». Une règle doit deviner ce qu'on ignore, pas ce qu'on sait.
//
// FORMAT : identifiant -> {p:[principaux], s:[secondaires], vu:'AAAA-MM-JJ'}
// `vu` = date de RELECTURE humaine. Une entrée sans `vu` est refusée par les tests : c'est
// l'interdiction qui empêche de figer une erreur sans l'avoir regardée.
const EX_MUSCLES={
 // ─── PECTORAUX (41) — relus un par un le 02/08/2026 ──────────────────────────────
 // Développés couchés à plat : pectoraux moteurs, deltoïde antérieur et triceps en soutien.
 'developpe-couche':                      {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 'developpe-couche-halteres':             {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 'developpe-couche-larsen-larsen-press':  {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 'developpe-couche-avec-chaines':         {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 'developpe-couche-elastique':            {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 'smith-machine-developpe-couche':        {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 // ✏️ CORRECTION : au sol, l'amplitude est écourtée et le TRICEPS travaille davantage
 //    (le coude s'arrête au sol) — il passe donc au même rang que le pectoral.
 'developpe-couche-au-sol-floor-press':   {p:['pec','triceps'], s:['front-delt'], vu:'2026-08-02'},
 // ✏️ CORRECTION : à une main, c'est un exercice ANTI-ROTATION — le tronc empêche le corps
 //    de basculer. Les obliques et les abdos manquaient complètement.
 'developpe-couche-unilateral-kettlebell':{p:['pec'], s:['front-delt','triceps','obliques','abs'], vu:'2026-08-02'},
 // Inclinés : haut des pectoraux, deltoïde antérieur nettement plus sollicité qu'à plat.
 'developpe-incline':                     {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 'developpe-incline-halteres':            {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 'developpe-incline-poulie':              {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 'smith-machine-developpe-incline':       {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 // Déclinés : bas des pectoraux, deltoïde antérieur MOINS sollicité qu'à plat (ordre inversé).
 'developpe-decline':                     {p:['pec'], s:['triceps','front-delt'], vu:'2026-08-02'},
 'developpe-decline-halteres':            {p:['pec'], s:['triceps','front-delt'], vu:'2026-08-02'},
 'developpe-decline-elastique':           {p:['pec'], s:['triceps','front-delt'], vu:'2026-08-02'},
 // Machines de poussée : même chose, trajectoire guidée.
 'chest-press-machine-horizontale':       {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 'chest-press-machine-inclinee':          {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 'chest-press-machine-declinee':          {p:['pec'], s:['triceps','front-delt'], vu:'2026-08-02'},
 'chest-press-poulie-assis':              {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 'hex-press-smith-machine':               {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 'svend-press-serrage-de-plaque':         {p:['pec'], s:['front-delt','triceps'], vu:'2026-08-02'},
 // Aux sangles, le corps est en planche : la demande de gainage fait partie de l'exercice.
 'chest-press-trx-sangles':               {p:['pec'], s:['front-delt','triceps','abs'], vu:'2026-08-02'},
 // ─── ÉCARTÉS : le coude reste FIXE, donc AUCUN triceps. C'est ce qui les distingue d'un
 //     développé, et c'est vrai pour tous — machine comprise.
 'ecarte-halteres':                       {p:['pec'], s:['front-delt'], vu:'2026-08-02'},
 'ecarte-incline-halteres':               {p:['pec'], s:['front-delt'], vu:'2026-08-02'},
 'ecarte-decline-halteres':               {p:['pec'], s:['front-delt'], vu:'2026-08-02'},
 'ecarte-poulie':                         {p:['pec'], s:['front-delt'], vu:'2026-08-02'},
 'ecarte-elastique':                      {p:['pec'], s:['front-delt'], vu:'2026-08-02'},
 'ecarte-hyght-hyght-fly':                {p:['pec'], s:['front-delt'], vu:'2026-08-02'},
 'croise-poulie-cable-crossover':         {p:['pec'], s:['front-delt'], vu:'2026-08-02'},
 // ⚠️ PAS d'abdos ici, volontairement : à genoux, le tronc n'est pas plus sollicité que
 //    debout. L'ajouter faisait passer l'exercice de 4 à 5,5 en calories (l'app compte
 //    3 muscles = polyarticulaire) — un simple stabilisateur ne doit pas changer la dépense.
 'ecarte-poulie-haute-a-genoux':          {p:['pec'], s:['front-delt'], vu:'2026-08-02'},
 // Aux sangles en revanche le corps est en planche : le gainage est réel, et les calories
 //    montent avec — c'est justifié.
 'ecarte-trx-sangles':                    {p:['pec'], s:['front-delt','abs'], vu:'2026-08-02'},
 // ✏️ CORRECTION LA PLUS NETTE : le PEC DECK avait « triceps » en secondaire alors que les
 //    9 autres écartés n'en ont pas. C'est pourtant le même geste, coude fixe : le triceps
 //    n'y travaille pas. Incohérence interne, trouvée en relisant les 41 d'affilée.
 //    Effet : il redevient une isolation (calories 5,5 → 4), ce qu'il a toujours été.
 'pec-deck':                              {p:['pec'], s:['front-delt'], vu:'2026-08-02'},
 // ─── DIPS ET POMPES : pectoraux ET triceps moteurs tous les deux.
 // ✏️ CORRECTION (03/08, sur sources apportées par Michel) : suspendu aux barres, on doit
 //    TENIR le corps — la sangle abdominale empêche les jambes de partir devant. Le gainage
 //    manquait sur les dips LIBRES ; il était déjà là aux anneaux, où rien n'est fixe.
 //    ⚠️ Pas sur les versions ASSISTÉE et ASSISE : là on est calé, le tronc ne retient rien.
 'dips':                                  {p:['pec','triceps'], s:['front-delt','abs'], vu:'2026-08-03'},
 // ✏️ CORRECTION (03/08) : « Dips » et « Dips Parallèles » disaient EXACTEMENT la même chose,
 //    alors que leurs animations et leurs termes anglais trahissaient deux variantes voulues
 //    différentes (`dips-pectoraux` / *chest dips* · `dips-triceps-paralleles` / *parallel bar
 //    dip*). Penché en AVANT, le pectoral mène ; buste DROIT, on ne peut pas se pencher et c'est
 //    le triceps qui fait le travail — exactement le raisonnement tenu sur les dips sur banc.
 //    Renommé « Dips Triceps (Buste Droit) » : « parallèles » ne distinguait rien, tous les dips
 //    se font sur des barres parallèles.
 'dips-paralleles':                       {p:['triceps'], s:['front-delt','pec','abs'], vu:'2026-08-03'},
 'dips-machine-assistee':                 {p:['pec','triceps'], s:['front-delt'], vu:'2026-08-02'},
  // ✏️ 20/08/2026 — en appui mains au sol, le dentelé tient l'omoplate contre la cage. C'est ce
 //    qui distingue une pompe d'un développé couché, où le banc fait ce travail à sa place.
 'pompes-push-up':                        {p:['pec','triceps'], s:['front-delt','abs','serratus'], vu:'2026-08-20'},
  'pompes-lestees':                        {p:['pec','triceps'], s:['front-delt','abs','serratus'], vu:'2026-08-20'},
  'pompes-deficit-deficit-push-up':        {p:['pec','triceps'], s:['front-delt','abs','serratus'], vu:'2026-08-20'},
  'pompes-inclinees-trx-sangles':          {p:['pec','triceps'], s:['front-delt','abs','serratus'], vu:'2026-08-20'},
 // ✏️ CORRECTION : mains serrées = le TRICEPS devient le moteur, le pectoral suit.
  'pompes-diamant':                        {p:['triceps','pec'], s:['front-delt','abs','serratus'], vu:'2026-08-20'},
 // ✏️ CORRECTION — mais PAS celle que j'avais faite d'abord, et l'histoire vaut d'être écrite.
 //    ① Constat de départ, juste : la fiche disait `p:['pec']` seul, le triceps relégué en
 //       secondaire. Or sur une machine à dips, le triceps est bien un MOTEUR.
 //    ② Ma première correction, FAUSSE : j'avais mis `p:['triceps']` seul, en me fiant à
 //       l'animation du catalogue (dips-assis-machine-avec-poids.webp) où seuls les triceps
 //       et le dos sont colorés. Michel a vérifié : la recherche « Dips Assis Machine muscle »
 //       montre la MÊME machine avec les PECTORAUX en rouge chez Fitwill comme chez Strength
 //       Level. Notre animation est l'exception, pas la règle.
 //    ③ Le bon classement est celui des autres dips : pectoraux ET triceps moteurs.
 //    ⚠️ LA LEÇON : je me suis fié à UNE source (une image) contre le consensus. C'est le
 //       travers listé dans BUGS.md — et il a suffi d'une vérification de Michel pour le voir.
 //    ⏭️ Reste un doute SUR L'ANIMATION elle-même : elle montre peut-être une autre machine.
 'dips-assis-machine-seated-dip':         {p:['pec','triceps'], s:['front-delt'], vu:'2026-08-02'},

 // ─── ÉPAULES (47) — relues une par une le 02/08/2026 ─────────────────────────────
 // ⭐ LA CORRECTION QUI TOUCHE LE PLUS DE MONDE : les 13 DÉVELOPPÉS avaient le deltoïde
 //    LATÉRAL en muscle MOTEUR, à égalité avec l'antérieur. C'est faux : en poussée
 //    verticale le deltoïde ANTÉRIEUR est le moteur, le latéral n'est qu'un assistant
 //    (ExRx, Strength Level, mesures EMG concordent). Conséquence concrète, et elle
 //    explique un vrai problème de salle : quelqu'un qui ne fait que des développés
 //    voyait ses deltoïdes latéraux affichés comme bien travaillés — alors que ce sont
 //    précisément eux qui restent en retard sans élévations latérales.
 'developpe-militaire':                   {p:['front-delt'], s:['side-delt','triceps','traps'], vu:'2026-08-02'},
 'developpe-militaire-halteres':          {p:['front-delt'], s:['side-delt','triceps','traps'], vu:'2026-08-02'},
 'developpe-halteres-assis':              {p:['front-delt'], s:['side-delt','triceps','traps'], vu:'2026-08-02'},
 'developpe-epaules-machine':             {p:['front-delt'], s:['side-delt','triceps','traps'], vu:'2026-08-02'},
 'smith-machine-developpe-militaire':     {p:['front-delt'], s:['side-delt','triceps','traps'], vu:'2026-08-02'},
 'developpe-epaules-assis-machine-shoulder-pre':{p:['front-delt'], s:['side-delt','triceps','traps'], vu:'2026-08-02'},
 'developpe-epaules-elastique':           {p:['front-delt'], s:['side-delt','triceps','traps'], vu:'2026-08-02'},
 'developpe-epaules-assis-elastique':     {p:['front-delt'], s:['side-delt','triceps','traps'], vu:'2026-08-02'},
 'developpe-epaules-kettlebell':          {p:['front-delt'], s:['side-delt','triceps','traps'], vu:'2026-08-02'},
 // La rotation de l'Arnold recrute davantage le latéral qu'un développé classique, mais
 // l'antérieur reste le moteur : il monte d'un cran dans l'ordre, pas de rang.
 'developpe-arnold-arnold-press':         {p:['front-delt'], s:['side-delt','triceps','traps'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le DÉVELOPPÉ NUQUE est le seul du lot où le latéral est vraiment moteur —
 //    les bras y travaillent dans le plan frontal, pas devant le corps. C'est justement ce
 //    qui en fait un exercice exigeant pour l'épaule. Il ne doit donc PAS être rangé comme
 //    les 12 autres, ce qu'il était.
 'developpe-nuque':                       {p:['front-delt','side-delt'], s:['triceps','traps'], vu:'2026-08-02'},
 // ✏️ CORRECTION : à un bras, la charge tire le buste de côté — le tronc retient. Même
 //    raisonnement que le développé couché unilatéral (pectoraux), pour la même raison.
 'developpe-epaules-unilateral-elastique':{p:['front-delt'], s:['side-delt','triceps','traps','obliques','abs'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le développé LANDMINE se pousse en diagonale, pas à la verticale — le
 //    HAUT DU PECTORAL y travaille réellement, il manquait. Et il se fait debout à un bras :
 //    le gainage fait partie de l'exercice.
 'developpe-landmine-epaules':            {p:['front-delt'], s:['pec','triceps','traps','abs'], vu:'2026-08-02'},
 // ✏️ CORRECTION : en équilibre sur les mains, le TRONC tient tout le corps aligné — le
 //    gainage manquait complètement, et c'est pourtant ce qui limite la plupart des gens.
 'handstand-push-up-atr':                 {p:['front-delt'], s:['side-delt','triceps','traps','abs'], vu:'2026-08-02'},
 'handstand-push-up-suspendu-sangles':    {p:['front-delt'], s:['side-delt','triceps','traps','abs'], vu:'2026-08-02'},
 // ─── ÉLÉVATIONS LATÉRALES : isolation du deltoïde latéral, trapèzes en soutien.
 //     Rien à corriger — les 9 étaient justes et cohérentes entre elles.
 'elevations-laterales-lateral-raise':    {p:['side-delt'], s:['traps'], vu:'2026-08-02'},
 'elevations-laterales-cable':            {p:['side-delt'], s:['traps'], vu:'2026-08-02'},
 'elevations-laterales-machine':          {p:['side-delt'], s:['traps'], vu:'2026-08-02'},
 'elevations-laterales-unilaterale-poulie':{p:['side-delt'], s:['traps'], vu:'2026-08-02'},
 'elevations-laterales-kettlebell':       {p:['side-delt'], s:['traps'], vu:'2026-08-02'},
 'elevation-laterale-poulie-inclinee':    {p:['side-delt'], s:['traps'], vu:'2026-08-02'},
 'elevation-laterale-landmine':           {p:['side-delt'], s:['traps'], vu:'2026-08-02'},
 'elevation-laterale-inclinee-haltere':   {p:['side-delt'], s:['traps'], vu:'2026-08-02'},
 'croix-de-fer-halteres':                 {p:['side-delt'], s:['traps'], vu:'2026-08-02'},
 // ─── ÉLÉVATIONS FRONTALES : isolation du deltoïde antérieur. Justes également.
 //     ⚠️ Le haut du pectoral participe, mais on ne l'ajoute PAS : ce serait un 3ᵉ muscle,
 //     et l'app compterait alors l'exercice comme polyarticulaire (4 → 5,5 en calories).
 //     Même arbitrage que pour l'écarté à la poulie haute (pectoraux).
 'elevations-frontales':                  {p:['front-delt'], s:['side-delt'], vu:'2026-08-02'},
 'elevations-frontales-cable':            {p:['front-delt'], s:['side-delt'], vu:'2026-08-02'},
 'elevations-frontales-machine':          {p:['front-delt'], s:['side-delt'], vu:'2026-08-02'},
 'elevation-frontale-allongee-barre':     {p:['front-delt'], s:['side-delt'], vu:'2026-08-02'},
 'elevation-frontale-banc-incline':       {p:['front-delt'], s:['side-delt'], vu:'2026-08-02'},
 // ─── OISEAUX : deltoïde postérieur moteur, latéral et trapèzes en soutien. Justes.
 //     ⚠️ LIMITE CONNUE, écrite ici plutôt que maquillée : ces 3 muscles font compter
 //     l'oiseau comme polyarticulaire (5,5 en calories, autant qu'un développé couché)
 //     alors que c'est une isolation à coude fixe. Retirer le deltoïde latéral rendrait
 //     le chiffre plus joli mais la donnée FAUSSE — on ne triche pas avec l'anatomie pour
 //     arranger un calcul. Le défaut est dans le modèle de calories (« 3 muscles =
 //     polyarticulaire »), pas dans ces fiches. À traiter à part.
 'oiseau':                                {p:['rear-delt'], s:['side-delt','traps'], vu:'2026-08-02'},
 'oiseau-elastique':                      {p:['rear-delt'], s:['side-delt','traps'], vu:'2026-08-02'},
 'oiseau-poulie-45':                      {p:['rear-delt'], s:['side-delt','traps'], vu:'2026-08-02'},
 'machine-oiseau':                        {p:['rear-delt'], s:['side-delt','traps'], vu:'2026-08-02'},
 'ecarte-arriere-elastique':              {p:['rear-delt'], s:['side-delt','traps'], vu:'2026-08-02'},
 // Aux sangles le corps est en appui incliné : le gainage est réel (même règle que les
 // pectoraux au TRX).
 'oiseau-inverse-trx-sangles':            {p:['rear-delt'], s:['side-delt','traps','abs'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le FACE PULL plie le coude, contrairement à l'oiseau — le biceps y
 //    travaille, il manquait. C'est ce qui distingue les deux mouvements.
 'tirage-visage-face-pull':               {p:['rear-delt'], s:['side-delt','traps','biceps'], vu:'2026-08-02'},
 'face-pull-couche-poulie':               {p:['rear-delt'], s:['side-delt','traps','biceps'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le Y RAISE est L'exercice du trapèze INFÉRIEUR — c'est même sa seule
 //    raison d'être. Les trapèzes n'y sont pas un soutien, ils sont moteurs.
 'y-raise-w-raise':                       {p:['traps','rear-delt'], s:[], vu:'2026-08-02'},
 // ✏️ CORRECTION : le tirage menton monte les coudes DEVANT le corps — le deltoïde
 //    antérieur y participe, il manquait.
 'tirage-menton-kettlebell':              {p:['side-delt','traps'], s:['biceps','front-delt'], vu:'2026-08-02'},
 // ─── COIFFE DES ROTATEURS — ⚠️ LE POINT LE PLUS HONNÊTE DE CE GROUPE.
 //     Les vrais muscles de la coiffe (sus-épineux, sous-épineux, petit rond, SOUS-SCAPULAIRE)
 //     n'existent PAS dans la figurine : elle ne connaît que 17 muscles. On approche donc,
 //     et on l'écrit — plutôt que de laisser croire à une précision qu'on n'a pas.
 //     ROTATION EXTERNE : le deltoïde POSTÉRIEUR est bien un rotateur externe → l'approximation
 //     tient.
 'rotation-externe-epaule-poulie':        {p:['rear-delt'], s:['traps'], vu:'2026-08-02'},
 'rotation-externe-epaule-elastique':     {p:['rear-delt'], s:['traps'], vu:'2026-08-02'},
 'rotation-externe-epaule-haltere':       {p:['rear-delt'], s:['traps'], vu:'2026-08-02'},
 'rotation-externe-epaule-abduction':     {p:['rear-delt'], s:['traps'], vu:'2026-08-02'},
 // ✏️✏️ LA CORRECTION LA PLUS NETTE DU GROUPE : les deux ROTATIONS **INTERNES** étaient
 //     classées EXACTEMENT comme les externes — deltoïde postérieur. Or ce sont des
 //     mouvements OPPOSÉS : le deltoïde postérieur est l'ANTAGONISTE d'une rotation
 //     interne, il freine le mouvement, il ne le produit pas. L'app comptait donc du
 //     volume sur le muscle que l'exercice n'entraîne pas. Les vrais moteurs (sous-
 //     scapulaire, grand pectoral, grand dorsal, deltoïde antérieur) → on garde les deux
 //     qui existent dans la figurine.
 //     ⭐ Personne ne pouvait le voir : la règle lisait le mot « rotation … épaule » et
 //     ne distinguait pas « externe » de « interne ». Deux exercices contraires, une seule
 //     réponse — c'est exactement ce que la relecture une par une sert à trouver.
 'rotation-interne-epaule-elastique':     {p:['front-delt'], s:['pec'], vu:'2026-08-02'},
 'rotation-interne-90-poulie':            {p:['front-delt'], s:['pec'], vu:'2026-08-02'},
 // Mobilité (passage de bâton/élastique au-dessus de la tête) : amplitude, pas de charge.
 'passage-d-epaule-elastique':            {p:['rear-delt'], s:['traps'], vu:'2026-08-02'},
 // ✨ AJOUTÉ le 03/08 (demande de Michel) : le GLISSEMENT AU MUR — dos et bras plaqués contre
 //    le mur, les bras montent et descendent en gardant le contact. C'est la mobilité d'épaule
 //    de référence, et l'exercice du TRAPÈZE INFÉRIEUR (sonnette externe de l'omoplate). On
 //    n'avait presque rien dans ce registre — juste le passage d'épaule. Aligné sur le Y Raise,
 //    qui est le même geste en chargé. ⚠️ Pas de 3ᵉ muscle : un exercice de MOBILITÉ ne doit
 //    pas coûter autant qu'un développé couché (l'app compte « 3 muscles = polyarticulaire »).
 'glissement-au-mur-wall-slide':          {p:['traps','rear-delt'], s:[], vu:'2026-08-03'},
 // ✏️ CORRECTION : le BICEPS n'a rien à faire ici — il venait du mot « tirage » dans le nom.
 //    On tire le chariot bras tendus devant soi : c'est une élévation frontale lestée, et
 //    le corps entier résiste à la traction (gainage).
 'chariot-de-puissance-tirage-epaules':   {p:['front-delt'], s:['side-delt','traps','abs'], vu:'2026-08-02'},

 // ─── DOS (52) — relus un par un le 02/08/2026 ────────────────────────────────────
 // ⭐ LES DEUX CORRECTIONS QUI TOUCHENT LE PLUS DE MONDE, et elles sont symétriques :
 //    ① sur les 18 ROWINGS, le deltoïde POSTÉRIEUR était moteur à égalité avec le grand
 //       dorsal. C'est un assistant (ExRx : « synergist »), pas un moteur.
 //    ② sur les 12 TIRAGES VERTICAUX et TRACTIONS, le BICEPS était moteur à égalité avec
 //       le grand dorsal. Même erreur, autre muscle : quelqu'un qui enchaîne tractions et
 //       tirages voyait ses biceps comptés comme un gros volume de travail direct.
 //    ⭐ Les deux ont leur EXCEPTION RÉELLE, et c'est ce qui rend la distinction utile :
 //       en prise SUPINÉE (chin-up, prise inversée) le biceps est bel et bien co-moteur.
 //
 // ⭐ LA DISTINCTION QUI N'EXISTAIT PAS : rowing ≠ tirage vertical côté TRAPÈZES. Un rowing
 //    RÉTRACTE les omoplates (trapèzes moyens et rhomboïdes = moteurs) ; un tirage vertical
 //    les ABAISSE (le grand dorsal domine, les trapèzes assistent). Les 52 fiches disaient
 //    la même chose pour les deux gestes.
 //
 // ─── SOULEVÉS DE TERRE
 'souleve-de-terre':                      {p:['glutes','hamstrings','lower-back'], s:['quads','traps','forearms','lats'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le SUMO n'est pas un soulevé conventionnel avec les pieds écartés. La
 //    position ouverte fait travailler davantage les QUADRICEPS et moins les ischios et le
 //    bas du dos — c'est même la raison pour laquelle beaucoup s'y mettent. Les deux fiches
 //    étaient identiques. (Les adducteurs, très sollicités, n'existent pas dans la figurine.)
 'souleve-de-terre-sumo':                 {p:['glutes','quads','lower-back'], s:['adductors','hamstrings','traps','forearms','lats'], vu:'2026-08-20'},
 // ✏️ CORRECTION : au rack pull la barre est lourde et l'amplitude courte — les FESSIERS sont
 //    moteurs et la PRISE (avant-bras) est ce qui lâche en premier. Les deux manquaient.
 'tirage-en-rack-rack-pull':              {p:['lower-back','glutes','traps'], s:['hamstrings','lats','forearms'], vu:'2026-08-02'},
 // ─── ROWINGS BUSTE PENCHÉ (non soutenu) : le bas du dos tient la position, il compte.
 'rowing-barre-tirage-horizontal':        {p:['lats','traps'], s:['rear-delt','biceps','forearms','lower-back'], vu:'2026-08-02'},
 'rowing-haltere-tirage-horizontal':      {p:['lats','traps'], s:['rear-delt','biceps','forearms','lower-back'], vu:'2026-08-02'},
 'rowing-cable-tirage-horizontal':        {p:['lats','traps'], s:['rear-delt','biceps','forearms','lower-back'], vu:'2026-08-02'},
 'rowing-yates-supination':               {p:['lats','traps'], s:['rear-delt','biceps','forearms','lower-back'], vu:'2026-08-02'},
 'rowing-smith-machine':                  {p:['lats','traps'], s:['rear-delt','biceps','forearms','lower-back'], vu:'2026-08-02'},
 'rowing-landmine-t-bar':                 {p:['lats','traps'], s:['rear-delt','biceps','forearms','lower-back'], vu:'2026-08-02'},
 'rowing-halteres-buste-penche':          {p:['lats','traps'], s:['rear-delt','biceps','forearms','lower-back'], vu:'2026-08-02'},
 'meadows-row':                           {p:['lats','traps'], s:['rear-delt','biceps','forearms','lower-back'], vu:'2026-08-02'},
 'rowing-buste-penche-elastique':         {p:['lats','traps'], s:['rear-delt','biceps','forearms','lower-back'], vu:'2026-08-02'},
 'rowing-unilateral-elastique':           {p:['lats','traps'], s:['rear-delt','biceps','forearms','lower-back'], vu:'2026-08-02'},
 'rowing-horizontal-elastique':           {p:['lats','traps'], s:['rear-delt','biceps','forearms','lower-back'], vu:'2026-08-02'},
 'tirage-poulie-basse-prise-large':       {p:['lats','traps'], s:['rear-delt','biceps','forearms','lower-back'], vu:'2026-08-02'},
 'tirage-poulie-basse-prise-serree':      {p:['lats','traps'], s:['rear-delt','biceps','forearms','lower-back'], vu:'2026-08-02'},
 // ✏️✏️ CORRECTION QUI SE VOIT À L'ŒIL UNE FOIS DITE : les rowings à POITRINE APPUYÉE
 //    comptaient le BAS DU DOS… alors que c'est précisément ce qu'ils servent à supprimer.
 //    On s'allonge sur un banc pour que les lombaires ne travaillent PAS — l'app créditait
 //    l'exercice du travail qu'il est conçu pour éviter. Six fiches concernées.
 'rowing-poitrine-appuyee-chest-supported':{p:['lats','traps'], s:['rear-delt','biceps','forearms'], vu:'2026-08-02'},
 'seal-row':                              {p:['lats','traps'], s:['rear-delt','biceps','forearms'], vu:'2026-08-02'},
 'rowing-machine-tirage-horizontal':      {p:['lats','traps'], s:['rear-delt','biceps','forearms'], vu:'2026-08-02'},
 'rowing-hammer-strength':                {p:['lats','traps'], s:['rear-delt','biceps','forearms'], vu:'2026-08-02'},
 'rowing-t-bar-machine':                  {p:['lats','traps'], s:['rear-delt','biceps','forearms'], vu:'2026-08-02'},
 'tirage-iso-lateral-hammer-strength':    {p:['lats','traps'], s:['rear-delt','biceps','forearms'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le RENEGADE ROW se fait en position de planche, sur deux haltères — c'est
 //    d'abord un ANTI-ROTATION. Il n'avait aucun gainage, et il comptait du bas du dos.
 'renegade-row':                          {p:['lats','traps'], s:['rear-delt','biceps','forearms','abs','obliques'], vu:'2026-08-02'},
 // ✏️ CORRECTION : les tirages HORIZONTAUX au poids du corps (table, TRX, australienne) se
 //    font corps gainé en planche inversée — le gainage manquait, et le bas du dos n'y est
 //    pas moteur.
 'rowing-inverse-sous-une-table':         {p:['lats','traps'], s:['rear-delt','biceps','forearms','abs'], vu:'2026-08-02'},
 'rowing-trx-sangles':                    {p:['lats','traps'], s:['rear-delt','biceps','forearms','abs'], vu:'2026-08-02'},
 'traction-australienne-poids-du-corps':  {p:['lats','traps'], s:['rear-delt','biceps','forearms','abs'], vu:'2026-08-02'},
 'traction-australienne-trx-sangles':     {p:['lats','traps'], s:['rear-delt','biceps','forearms','abs'], vu:'2026-08-02'},
 // ─── TIRAGES VERTICAUX ET TRACTIONS (prise pronation ou neutre) : le grand dorsal domine,
 //     les trapèzes et le biceps assistent.
 'tirage-poulie-haute-lat-pulldown':      {p:['lats'], s:['biceps','traps','rear-delt','forearms'], vu:'2026-08-02'},
 'tirage-poulie-haute-prise-serree':      {p:['lats'], s:['biceps','traps','rear-delt','forearms'], vu:'2026-08-02'},
 'tirage-nuque':                          {p:['lats'], s:['biceps','traps','rear-delt','forearms'], vu:'2026-08-02'},
 'tirage-incline-poulie-haute':           {p:['lats'], s:['biceps','traps','rear-delt','forearms'], vu:'2026-08-02'},
 'tirage-vertical-alterne-elastique':     {p:['lats'], s:['biceps','traps','rear-delt','forearms'], vu:'2026-08-02'},
 'tractions-pull-up':                     {p:['lats'], s:['biceps','traps','rear-delt','forearms'], vu:'2026-08-02'},
 'traction-lestee':                       {p:['lats'], s:['biceps','traps','rear-delt','forearms'], vu:'2026-08-02'},
 'traction-assistee':                     {p:['lats'], s:['biceps','traps','rear-delt','forearms'], vu:'2026-08-02'},
 'traction-assistee-avec-banc':           {p:['lats'], s:['biceps','traps','rear-delt','forearms'], vu:'2026-08-02'},
 'traction-prise-neutre':                 {p:['lats'], s:['biceps','traps','rear-delt','forearms'], vu:'2026-08-02'},
 'traction-derriere-la-nuque':            {p:['lats'], s:['biceps','traps','rear-delt','forearms'], vu:'2026-08-02'},
 'tractions-aux-anneaux':                 {p:['lats'], s:['biceps','traps','rear-delt','forearms'], vu:'2026-08-02'},
 'rocky-pull-up':                         {p:['lats'], s:['biceps','traps','rear-delt','forearms'], vu:'2026-08-02'},
 // ⭐ L'EXCEPTION RÉELLE : en prise SUPINÉE, le coude part fléchi et le biceps est vraiment
 //    co-moteur. C'est même la seule raison de choisir cette prise. Deux fiches, et elles
 //    étaient rangées comme les onze autres.
 'traction-supination-chin-up':           {p:['lats','biceps'], s:['traps','rear-delt','forearms'], vu:'2026-08-02'},
 'tirage-poulie-haute-prise-inversee':    {p:['lats','biceps'], s:['traps','rear-delt','forearms'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le MUSCLE-UP est une traction PUIS un dips — la transition demande un
 //    gainage considérable, qui manquait.
 'muscle-up':                             {p:['lats','biceps'], s:['front-delt','pec','triceps','abs'], vu:'2026-08-02'},
 // ✏️ CORRECTION : en SUSPENSION PASSIVE on ne tire pas, on TIENT. C'est un exercice de
 //    PRISE : le grand dorsal s'étire, il n'est pas moteur. Il était à égalité avec l'avant-bras.
 'suspension-passive-dead-hang':          {p:['forearms'], s:['lats','traps'], vu:'2026-08-02'},
 // ─── PULL-OVERS : grand dorsal moteur, pectoral et longue portion du triceps en soutien
 //     (le triceps y travaille comme extenseur d'ÉPAULE, pas du coude). Justes.
  // ✏️ 20/08/2026 — le DENTELÉ ANTÉRIEUR entre ici : il plaque l'omoplate pendant que le bras
 //    passe au-dessus de la tête. En secondaire : il stabilise, il n'est pas moteur.
 'pull-over':                             {p:['lats'], s:['pec','triceps','serratus'], vu:'2026-08-20'},
  'pull-over-barre':                       {p:['lats'], s:['pec','triceps','serratus'], vu:'2026-08-20'},
  'pull-over-haltere':                     {p:['lats'], s:['pec','triceps','serratus'], vu:'2026-08-20'},
  'pull-over-poulie':                      {p:['lats'], s:['pec','triceps','serratus'], vu:'2026-08-20'},
  'pullover-machine':                      {p:['lats'], s:['pec','triceps','serratus'], vu:'2026-08-20'},
 // ─── CHARIOT DE PUISSANCE : on tire une charge en reculant ou de côté.
 'sled-pull':                             {p:['lats','traps'], s:['rear-delt','biceps','forearms'], vu:'2026-08-02'},
 'chariot-de-puissance-tirage-dos':       {p:['lats','traps'], s:['rear-delt','biceps','forearms'], vu:'2026-08-02'},
 // ✏️ CORRECTION : tirer de CÔTÉ met les obliques en jeu — c'est ce qui le distingue du
 //    tirage dos, et les deux fiches étaient identiques.
 'chariot-de-puissance-tirage-de-cote':   {p:['lats','traps'], s:['rear-delt','biceps','forearms','obliques'], vu:'2026-08-02'},

 // ─── JAMBES (58) — relues une par une le 02/08/2026 ──────────────────────────────
 // ⭐ LE FIL DU GROUPE : les 40 squats disaient tous la même chose. Or ce qui distingue un
 //    squat d'un autre, c'est presque toujours ce qui tient le TRONC — barre sur le dos,
 //    charge devant, dos appuyé sur un chariot, ou rien du tout. Cette information n'était
 //    nulle part.
 //
 // ✅ LIMITE LEVÉE LE 20/08/2026 — elle est gardée ici parce qu'elle explique les fiches.
 //    Elle disait : « les ADDUCTEURS n'existent pas dans la figurine (17 muscles). Ils sont
 //    pourtant moteurs au squat sumo, au cossack, aux fentes latérales et à l'adduction de
 //    cuisses. On ne les invente pas ailleurs : la fiche reste honnête et le manque est nommé.
 //    ⏭️ Ajouter un muscle change ce que voit l'utilisateur, donc c'est l'arbitrage de Michel. »
 //    ⭐ La bonne décision : on n'a PAS bricolé, on a nommé le manque et on a attendu. Michel a
 //    tranché le 20/08 (« Abducteur/Adducteur ce n'est pas pareil hein »), le groupe `adductors`
 //    existe, et les quatre fiches nommées ci-dessus ont été reprises — elles portent `2026-08-20`.
 //    ⚠️ Les adducteurs sont en SECONDAIRE sur les squats et les fentes, pas en moteur : les
 //    moteurs restent quadriceps et fessiers. Seule l'adduction de cuisses, qui est une
 //    ISOLATION, les porte en moteur.
 //
 // ─── SQUATS À LA BARRE, colonne chargée : les érecteurs travaillent, c'est normal.
 'squat-a-la-barre':                      {p:['quads','glutes'], s:['hamstrings','calves','lower-back'], vu:'2026-08-02'},
 'smith-machine-squat':                   {p:['quads','glutes'], s:['hamstrings','calves','lower-back'], vu:'2026-08-02'},
 'safety-bar-squat':                      {p:['quads','glutes'], s:['hamstrings','calves','lower-back'], vu:'2026-08-02'},
 'pin-squat':                             {p:['quads','glutes'], s:['hamstrings','calves','lower-back'], vu:'2026-08-02'},
 'squat-bande-elastique':                 {p:['quads','glutes'], s:['hamstrings','calves','lower-back'], vu:'2026-08-02'},
 'squat-barre-avec-bandes-elastiques':    {p:['quads','glutes'], s:['hamstrings','calves','lower-back'], vu:'2026-08-02'},
 // Le SUMO ouvre les hanches : les fessiers passent devant. (Adducteurs : voir la limite ci-dessus.)
 'squat-sumo':                            {p:['glutes','quads'], s:['adductors','hamstrings','calves','lower-back'], vu:'2026-08-20'},
 // ✏️ CORRECTION : le SQUAT AVANT n'est pas un squat arrière avec la barre devant. La barre
 //    posée sur les épaules doit être RETENUE — le haut du dos et les abdos empêchent le buste
 //    de plonger, et c'est ce qui limite la charge. Aucun des deux n'était compté.
 'squat-avant':                           {p:['quads','glutes'], s:['hamstrings','calves','lower-back','abs','traps'], vu:'2026-08-02'},
 // Charge tenue DEVANT le corps : même demande de gainage, en plus léger.
 'squat-gobelet-goblet-squat':            {p:['quads','glutes'], s:['hamstrings','calves','lower-back','abs'], vu:'2026-08-02'},
 'squat-kettlebell':                      {p:['quads','glutes'], s:['hamstrings','calves','lower-back','abs'], vu:'2026-08-02'},
 // ✏️ CORRECTION : l'OVERHEAD SQUAT se fait barre TENDUE AU-DESSUS DE LA TÊTE — ce sont les
 //    ÉPAULES et le gainage qui lâchent en premier, jamais les cuisses. Ils manquaient tous
 //    les trois : c'est pourtant tout ce qui distingue cet exercice d'un squat ordinaire.
 'overhead-squat':                        {p:['quads','glutes'], s:['hamstrings','calves','lower-back','abs','front-delt','traps'], vu:'2026-08-02'},
 'overhead-squat-halteres':               {p:['quads','glutes'], s:['hamstrings','calves','lower-back','abs','front-delt','traps'], vu:'2026-08-02'},
 'overhead-squat-elastique':              {p:['quads','glutes'], s:['hamstrings','calves','lower-back','abs','front-delt','traps'], vu:'2026-08-02'},
 // ✏️✏️ CORRECTION SYMÉTRIQUE DE CELLE DES ROWINGS À POITRINE APPUYÉE : sur un HACK SQUAT, un
 //    PENDULUM ou un BELT SQUAT, le dos est appuyé sur un chariot (ou la charge pend à la
 //    ceinture) — la colonne n'est PAS chargée, c'est même la raison d'être de ces machines.
 //    Elles comptaient pourtant le bas du dos. Les presses à jambes, elles, étaient déjà justes :
 //    deux traitements différents pour la même situation, dans le même groupe.
 'squat-hack-hack-squat':                 {p:['quads','glutes'], s:['hamstrings','calves'], vu:'2026-08-02'},
 'hack-squat-inverse':                    {p:['quads','glutes'], s:['hamstrings','calves'], vu:'2026-08-02'},
 'hack-squat-assis':                      {p:['quads','glutes'], s:['hamstrings','calves'], vu:'2026-08-02'},
 'pendulum-squat':                        {p:['quads','glutes'], s:['hamstrings','calves'], vu:'2026-08-02'},
 'belt-squat':                            {p:['quads','glutes'], s:['hamstrings','calves'], vu:'2026-08-02'},
 // ─── PRESSES À JAMBES : dos calé, aucun travail des érecteurs. C'était déjà juste.
 'press-jambes-45':                       {p:['quads','glutes'], s:['hamstrings','calves'], vu:'2026-08-02'},
 'press-jambes-horizontale':              {p:['quads','glutes'], s:['hamstrings','calves'], vu:'2026-08-02'},
 'press-jambes-verticale':                {p:['quads','glutes'], s:['hamstrings','calves'], vu:'2026-08-02'},
 'press-jambes-inclinee':                 {p:['quads','glutes'], s:['hamstrings','calves'], vu:'2026-08-02'},
 'press-jambes-levier':                   {p:['quads','glutes'], s:['hamstrings','calves'], vu:'2026-08-02'},
 'presse-a-cuisses-sur-le-cote':          {p:['quads','glutes'], s:['hamstrings','calves'], vu:'2026-08-02'},
 // Presse à une jambe : le bassin doit rester droit, le tronc retient.
 'presse-a-cuisses-iso-laterale':         {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 // ─── SQUAT AU POIDS DU CORPS : rien sur la colonne.
 'squat-poids-du-corps-air-squat':        {p:['quads','glutes'], s:['hamstrings','calves'], vu:'2026-08-02'},
 'squat-trx-sangles':                     {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 // ✏️ CORRECTION : à UNE JAMBE (pistol), c'est l'équilibre qui limite — le gainage manquait.
 'squat-pistol':                          {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 'squat-pistol-trx-sangles':              {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le SQUAT SAUTÉ retombe et repart — les mollets propulsent, le tronc encaisse.
 'squat-saute-jump-squat':                {p:['quads','glutes'], s:['calves','hamstrings','abs'], vu:'2026-08-02'},
 // ✏️✏️ LA CORRECTION LA PLUS NETTE DU GROUPE : le SISSY SQUAT comptait les FESSIERS et les
 //    ISCHIOS en muscles de travail. C'est le contraire de ce que fait l'exercice : la hanche
 //    reste ÉTENDUE du début à la fin (on ne s'assoit pas, on bascule en arrière sur les
 //    genoux). Les fessiers y sont verrouillés, pas moteurs — c'est une isolation du
 //    quadriceps, et c'est même le seul exercice au poids du corps qui le fasse.
 'sissy-squat':                           {p:['quads'], s:['abs','calves'], vu:'2026-08-02'},
 'sissy-squat-machine':                   {p:['quads'], s:['abs','calves'], vu:'2026-08-02'},
 // La CHAISE est un maintien : quadriceps en isométrie, fessiers et gainage en soutien. Juste.
 'chaise-wall-sit':                       {p:['quads'], s:['glutes','abs'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le JEFFERSON SQUAT se fait à cheval sur la barre, tenue à bout de bras —
 //    la PRISE et l'ANTI-ROTATION (position asymétrique) manquaient tous les deux.
 'jefferson-squat':                       {p:['quads','glutes'], s:['hamstrings','lower-back','obliques','forearms'], vu:'2026-08-02'},
 // ✏️ CORRECTION : la ROTATION DU TRONC est dans le nom, les obliques n'étaient pas dans la fiche.
 'squat-avec-rotation-du-tronc':          {p:['quads','glutes'], s:['hamstrings','calves','obliques','abs'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le SOULEVÉ VALISE se porte d'UN SEUL CÔTÉ — tout l'exercice consiste à ne
 //    pas pencher. Les obliques manquaient, et la prise aussi comptait moins qu'elle ne devrait.
 //    (Le grand dorsal est retiré : les bras pendent le long du corps, il n'y a rien à retenir.)
 'souleve-de-terre-valise-suitcase':      {p:['glutes','hamstrings','lower-back'], s:['quads','forearms','traps','obliques'], vu:'2026-08-02'},
 // ─── FENTES ET MOUVEMENTS À UNE JAMBE : le gainage et les mollets tiennent l'équilibre —
 //     ils manquaient tous les deux, alors que les montées sur box, elles, avaient les mollets.
 'fentes':                                {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 'fentes-marchees':                       {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 'fentes-arriere':                        {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 'fentes-kettlebell':                     {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 'smith-machine-fentes':                  {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 'chariot-de-puissance-fentes-arriere':   {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 // Fentes LATÉRALES et CROISÉES : le déplacement se fait sur le côté (adducteurs — voir limite).
 'fentes-laterales':                      {p:['quads','glutes'], s:['adductors','hamstrings','calves','abs'], vu:'2026-08-20'},
 'fentes-croisees-curtsy-lunge':          {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 'cossack-squat':                         {p:['quads','glutes'], s:['adductors','hamstrings','calves','abs'], vu:'2026-08-20'},
 'squat-bulgare':                         {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 'squat-bulgare-elastique':               {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 'split-squat-elastique-fente-statique':  {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 'split-squat-trx-sangles':               {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 'montee-sur-box-step-up':                {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 'montee-sur-box-halteres':               {p:['quads','glutes'], s:['hamstrings','calves','abs'], vu:'2026-08-02'},
 // ─── EXTENSIONS DE QUADRICEPS : isolation pure, un seul muscle. C'était déjà juste, et il
 //     ne faut RIEN y ajouter — un 3ᵉ muscle ferait passer l'exercice pour polyarticulaire
 //     et doublerait presque sa dépense (4 → 5,5).
 'extension-quadriceps-leg-extension':    {p:['quads'], s:[], vu:'2026-08-02'},
 'extension-quadriceps-unilaterale':      {p:['quads'], s:[], vu:'2026-08-02'},
 'extension-quadriceps-elastique':        {p:['quads'], s:[], vu:'2026-08-02'},
 'extension-quadriceps-unilaterale-machine-a-d':{p:['quads'], s:[], vu:'2026-08-02'},
 // ⚠️⚠️ ADDUCTION DE CUISSES — LAISSÉ TEL QUEL, EXPRÈS, ET C'EST LE POINT LE PLUS HONNÊTE
 //    DU GROUPE. Le muscle qui travaille est l'ADDUCTEUR, qui n'existe pas dans la figurine.
 //    Le fessier moyen est même son ANTAGONISTE (il ABduit) — c'est exactement le défaut
 //    corrigé sur les rotations internes d'épaule. Mais ici il n'y a AUCUN code disponible
 //    qui soit moins faux : le remplacer par « ischios » ou « quadriceps » serait échanger
 //    une erreur contre une autre, sans rien gagner.
 //    ⏭️ ARBITRAGE MICHEL : ajouter les adducteurs à la figurine. Signalé le 02/08, toujours
 //    ouvert. Tant que ce n'est pas tranché, la fiche est fausse ET on le sait — c'est
 //    préférable à une fiche fausse dont personne ne se souvient.
  // ✏️ CORRECTION 20/08/2026 — elle disait `p:['glutes'], s:['quads']`, c'est-à-dire les
 //    FESSIERS. C'est faux : la machine d'adduction ramène la cuisse vers l'intérieur, ce
 //    sont les adducteurs (long, court, grand, gracile, pectiné). La fiche était juste au
 //    02/08 *faute de vocabulaire* — le groupe `adductors` n'existait pas encore.
 'adduction-cuisses-leg-adduction':       {p:['adductors'], s:[], vu:'2026-08-20'},
 // ─── CHARIOT DE PUISSANCE : la poussée et le tirage inversé sont deux exercices différents,
 //     et ils étaient déjà distingués correctement (le tirage inversé est quadriceps-dominant).
 'sled-push':                             {p:['quads','glutes'], s:['calves','abs'], vu:'2026-08-02'},
 'chariot-de-puissance-tirage-inverse-jambes':{p:['quads'], s:['glutes','calves'], vu:'2026-08-02'},

 // ─── FESSIERS (34) — relus un par un le 02/08/2026 ───────────────────────────────
 // ⭐ LE FIL DU GROUPE : trois exercices identiques rangés de trois façons différentes, et
 //    des muscles crédités qui ne travaillent pas. C'est le groupe où les incohérences
 //    INTERNES sautent le plus aux yeux quand on lit les 34 d'affilée.
 //
 // ─── LEG CURLS : flexion du GENOU, et rien d'autre.
 // ✏️✏️ CORRECTION LA PLUS NETTE : les 7 leg curls comptaient les FESSIERS. Or au leg curl la
 //    HANCHE NE BOUGE PAS — le fessier est un extenseur de hanche, il n'a strictement rien à
 //    y faire. (Le mollet, lui, fléchit bien le genou : il reste.)
 // ⭐ CONSÉQUENCE, et c'est une INCOHÉRENCE INTERNE qu'on ne voit qu'en comparant : avec ce
 //    3ᵉ muscle fantôme, l'app comptait le leg curl comme POLYARTICULAIRE (6,5 en calories)
 //    alors que l'extension de quadriceps — son miroir exact, même machine, même articulation
 //    — était bien comptée comme une isolation (4). Deux mouvements symétriques, deux coûts
 //    différents. Le leg curl redevient une isolation, comme il l'a toujours été.
 'leg-curl-couche-machine':               {p:['hamstrings'], s:['calves'], vu:'2026-08-02'},
 'leg-curl-assis-machine':                {p:['hamstrings'], s:['calves'], vu:'2026-08-02'},
 'leg-curl-unilateral-debout':            {p:['hamstrings'], s:['calves'], vu:'2026-08-02'},
 'leg-curl-haltere':                      {p:['hamstrings'], s:['calves'], vu:'2026-08-02'},
 'leg-curl-elastique':                    {p:['hamstrings'], s:['calves'], vu:'2026-08-02'},
 'leg-curl-inverse':                      {p:['hamstrings'], s:['calves'], vu:'2026-08-02'},
 // ─── ABDUCTION : là, c'est JUSTE — le moyen fessier est bien LE muscle abducteur.
 //     ⚠️ À comparer avec l'ADDUCTION (groupe Jambes), où le même fessier est crédité alors
 //     qu'il est l'ANTAGONISTE. Les deux machines se font face dans toutes les salles, et
 //     l'app en classait une bien et l'autre à l'envers.
 'abduction-cuisses-leg-abduction':       {p:['glutes'], s:[], vu:'2026-08-02'},
 'abducteurs-machine-debout':             {p:['glutes'], s:[], vu:'2026-08-02'},
 // ─── HIP THRUSTS ET PONT FESSIER : extension de hanche, genou fléchi.
 // ✏️ CORRECTION : le QUADRICEPS manquait — genou plié à 90°, c'est lui qui tient le tibia
 //    vertical pendant toute la série.
 'hip-thrust-barre-poussee-de-hanche':    {p:['glutes'], s:['hamstrings','quads','lower-back'], vu:'2026-08-02'},
 'hip-thrust-haltere-poussee-de-hanche':  {p:['glutes'], s:['hamstrings','quads','lower-back'], vu:'2026-08-02'},
 'hip-thrust-machine-poussee-de-hanche':  {p:['glutes'], s:['hamstrings','quads','lower-back'], vu:'2026-08-02'},
 'pont-fessier-glute-bridge':             {p:['glutes'], s:['hamstrings','quads','lower-back'], vu:'2026-08-02'},
 // ✏️ CORRECTION : à UNE JAMBE, le bassin veut tourner — tout l'exercice consiste à l'en
 //    empêcher. Les obliques et le gainage manquaient.
 'hip-thrust-unilateral-poussee-de-hanche':{p:['glutes'], s:['hamstrings','quads','lower-back','obliques','abs'], vu:'2026-08-02'},
 // ─── KICKBACKS : isolation du fessier, hanche seule.
 // ✏️✏️ INCOHÉRENCE INTERNE FLAGRANTE : « Extension Fessiers Arrière (Kickback) » comptait le
 //    BAS DU DOS et coûtait 6,5 en calories, tandis que « Kickback Machine » et « Kickback
 //    Cable » — LE MÊME MOUVEMENT — n'avaient que fessiers + ischios et coûtaient 4. Trois
 //    fiches du même geste, deux traitements. Les trois s'alignent sur le bon : c'est une
 //    isolation, et on est calé sur un banc ou une machine, les lombaires ne travaillent pas.
 'extension-fessiers-arriere-kickback':   {p:['glutes'], s:['hamstrings'], vu:'2026-08-02'},
 'kickback-machine':                      {p:['glutes'], s:['hamstrings'], vu:'2026-08-02'},
 // Le pull-through est un hip hinge à la poulie : charnière complète, pas une isolation.
 'tirage-cable-fessiers-cable-pull-through':{p:['glutes'], s:['hamstrings','lower-back'], vu:'2026-08-02'},
 // ─── SOULEVÉS ROUMAINS ET JAMBES TENDUES
 // ✏️ CORRECTION : ils étaient la copie conforme du soulevé conventionnel, QUADRICEPS COMPRIS.
 //    Or l'absence de poussée des jambes est la DÉFINITION du roumain : les genoux restent
 //    quasi tendus, on descend en poussant les hanches en arrière. C'est même à ça qu'on
 //    reconnaît qu'il est bien exécuté. Le quadriceps n'y a pas sa place.
 'souleve-de-terre-roumain-barre':        {p:['hamstrings','glutes','lower-back'], s:['forearms','traps','lats'], vu:'2026-08-02'},
 'souleve-de-terre-roumain-halteres':     {p:['hamstrings','glutes','lower-back'], s:['forearms','traps','lats'], vu:'2026-08-02'},
 'souleve-de-terre-roumain-kettlebell':   {p:['hamstrings','glutes','lower-back'], s:['forearms','traps','lats'], vu:'2026-08-02'},
 'souleve-de-terre-roumain-landmine':     {p:['hamstrings','glutes','lower-back'], s:['forearms','traps','lats'], vu:'2026-08-02'},
 'souleve-de-terre-jambes-tendues':       {p:['hamstrings','glutes','lower-back'], s:['forearms','traps','lats'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le roumain à UNE JAMBE est d'abord un exercice d'ÉQUILIBRE — le bassin
 //    veut s'ouvrir, les obliques le retiennent. Rien de tout ça n'était compté.
 'souleve-de-terre-roumain-unilateral':   {p:['hamstrings','glutes','lower-back'], s:['forearms','traps','obliques','abs'], vu:'2026-08-02'},
 // ─── SUMO : ⭐ les 3 variantes étaient restées la copie du conventionnel, alors que le sumo
 //     À LA BARRE a été corrigé hier (position ouverte = plus de quadriceps, moins d'ischios
 //     et de bas du dos). Une correction faite à moitié laisse deux vérités dans le catalogue —
 //     exactement ce que l'interdiction « pas de groupe à moitié » sert à empêcher.
 'souleve-de-terre-sumo-halteres':        {p:['glutes','quads','lower-back'], s:['hamstrings','traps','forearms','lats'], vu:'2026-08-02'},
 'souleve-de-terre-sumo-kettlebell':      {p:['glutes','quads','lower-back'], s:['hamstrings','traps','forearms','lats'], vu:'2026-08-02'},
 'souleve-de-terre-sumo-landmine':        {p:['glutes','quads','lower-back'], s:['hamstrings','traps','forearms','lats'], vu:'2026-08-02'},
 // ─── AUTRES SOULEVÉS
 // ✏️ CORRECTION : au TRAP BAR le buste est plus droit et les genoux plus fléchis — c'est le
 //    plus quadriceps-dominant des soulevés, et c'est pour ça qu'on le conseille aux débutants.
 //    Il était rangé comme un conventionnel. (Poignées sur les côtés : rien à retenir avec le
 //    grand dorsal.)
 'souleve-de-terre-trap-bar':             {p:['glutes','quads','lower-back'], s:['hamstrings','traps','forearms'], vu:'2026-08-02'},
 'souleve-de-terre-avec-deficit':         {p:['glutes','hamstrings','lower-back'], s:['quads','forearms','traps','lats'], vu:'2026-08-02'},
 'souleve-de-terre-machine':              {p:['glutes','hamstrings','lower-back'], s:['quads','forearms','traps'], vu:'2026-08-02'},
 // ✏️ CORRECTION : au ZERCHER la barre est tenue dans le PLI DES COUDES — il n'y a rien dans
 //    les mains, donc rien pour les avant-bras. Ce sont les BICEPS et le GAINAGE qui la
 //    retiennent, et le buste très droit rend le mouvement quadriceps-dominant.
 'zercher-deadlift':                      {p:['glutes','quads','lower-back'], s:['hamstrings','traps','abs','biceps'], vu:'2026-08-02'},
 // ✏️ CORRECTION : au REEVES on attrape les DISQUES, bras très écartés — la prise et le haut
 //    du dos sont ce qui lâche, c'est toute la raison d'être de cette variante.
 'reeves-deadlift':                       {p:['glutes','hamstrings','lower-back'], s:['forearms','traps','rear-delt','quads'], vu:'2026-08-02'},
 // ─── LE RESTE
 // Le GLUTE HAM RAISE combine flexion du genou ET extension de hanche : c'est L'exercice
 // d'ischios, ils passent devant (le mollet fléchit le genou avec eux).
 'glute-ham-raise-ghd':                   {p:['hamstrings','glutes'], s:['calves','lower-back'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le GOOD MORNING met la barre sur le dos avec un très long bras de levier —
 //    les érecteurs y sont MOTEURS, pas de simples stabilisateurs. Et le mollet n'y fait rien.
 'inclinaison-lombaire-good-morning':     {p:['hamstrings','glutes','lower-back'], s:['abs'], vu:'2026-08-02'},
 // ✏️ CORRECTION : au SWING la kettlebell tire vers l'avant à chaque répétition — la PRISE et
 //    le GAINAGE (la « planche debout » en haut du mouvement) manquaient tous les deux.
 'kettlebell-swing':                      {p:['glutes','hamstrings'], s:['lower-back','quads','abs','forearms'], vu:'2026-08-02'},

 // ─── TRICEPS (25) — relus un par un le 02/08/2026 ────────────────────────────────
 // ⭐ LE FIL DU GROUPE : les 25 fiches disaient TOUTES « triceps + deltoïde antérieur ».
 //    Or ce qui distingue une extension de triceps d'une autre, c'est OÙ EST LE BRAS —
 //    au-dessus de la tête, le long du corps, ou derrière. Et selon le cas, ce n'est pas
 //    le même deltoïde qui tient la position… voire aucun.
 //
 // ─── BRAS AU-DESSUS DE LA TÊTE ou À LA VERTICALE : l'épaule est maintenue fléchie, le
 //     deltoïde ANTÉRIEUR tient la position pendant toute la série. Il a sa place ici.
 'extension-nuque-haltere':               {p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 'extension-nuque-poulie-haute':          {p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 'extension-triceps-nuque-elastique':     {p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 'extension-triceps-verticale-elastique': {p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 'triceps-poulie-basse':                  {p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 'extension-triceps':                     {p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 'chariot-de-puissance-extension-triceps':{p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 // ─── ALLONGÉ, BRAS À LA VERTICALE : même chose, l'épaule est tenue fléchie à 90°.
 'barre-au-front':                        {p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 'skull-crusher-barre-ez':                {p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 'extension-triceps-couche-halteres':     {p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 'extension-triceps-banc-incline-halteres':{p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 'extension-triceps-decline-halteres':    {p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 'tate-press':                            {p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 // Aux sangles, le corps est en planche — mais on n'ajoute PAS les abdos : ce 3ᵉ muscle
 // ferait passer l'exercice de 4 à 5,5 en calories (l'app compte « 3 muscles =
 // polyarticulaire »), et un simple stabilisateur ne doit pas changer la dépense. Même
 // arbitrage qu'à l'écarté à la poulie haute à genoux (ft-v737).
 'extension-triceps-trx-sangles':         {p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 'extension-triceps-allongee-trx-sangles':{p:['triceps'], s:['front-delt'], vu:'2026-08-02'},
 // ─── BRAS LE LONG DU CORPS (poussées à la poulie) : ⭐ CORRECTION — l'épaule ne bouge pas
 //     et n'est pas maintenue en l'air, le coude est collé au buste. Le deltoïde ANTÉRIEUR
 //     n'y travaille pas du tout : c'est une extension du coude, point. Les références
 //     (ExRx) ne listent d'ailleurs AUCUN muscle synergiste sur un pushdown.
 'triceps-poulie':                        {p:['triceps'], s:[], vu:'2026-08-02'},
 'triceps-corde-poulie':                  {p:['triceps'], s:[], vu:'2026-08-02'},
 'triceps-machine':                       {p:['triceps'], s:[], vu:'2026-08-02'},
 'extension-triceps-concentree-poulie':   {p:['triceps'], s:[], vu:'2026-08-02'},
 // ─── BRAS DERRIÈRE LE CORPS : ⭐⭐ LA CORRECTION LA PLUS NETTE DU GROUPE. Au KICKBACK, le
 //     bras est tenu EN ARRIÈRE, épaule en EXTENSION — c'est le deltoïde POSTÉRIEUR qui
 //     maintient cette position, pas l'antérieur. L'antérieur en est même l'ANTAGONISTE :
 //     il ramènerait le bras vers l'avant. C'est exactement le défaut corrigé sur les
 //     rotations internes d'épaule (ft-v739) — un muscle crédité pour un travail qu'il ne
 //     fournit pas, et que personne ne pouvait voir puisque les 25 fiches étaient identiques.
 'extension-triceps-arriere-kickback':    {p:['triceps'], s:['rear-delt'], vu:'2026-08-02'},
 // ─── DIPS : aux barres parallèles, on peut se pencher en avant → pectoraux ET triceps.
 'dips-lestes':                           {p:['pec','triceps'], s:['front-delt','abs'], vu:'2026-08-03'},
 // ✏️ CORRECTION : aux ANNEAUX, rien n'est fixe — tenir les anneaux immobiles est la moitié
 //    du travail. Le gainage manquait. (Ici il ne change pas les calories : l'exercice a
 //    déjà 3 muscles, il est donc déjà compté comme polyarticulaire.)
 'dips-aux-anneaux':                      {p:['pec','triceps'], s:['front-delt','abs'], vu:'2026-08-02'},
 // ✏️✏️ CORRECTION : les DIPS SUR BANC (mains derrière soi, pieds devant) étaient rangés
 //    comme des dips aux barres — pectoraux moteurs à égalité. C'est faux : dans cette
 //    position le buste reste VERTICAL et on ne peut pas se pencher en avant, donc le
 //    pectoral ne peut pas prendre le relais. C'est le triceps qui fait tout le travail —
 //    et c'est aussi pour ça que cet exercice tire autant sur l'épaule.
 'bench-dips':                            {p:['triceps'], s:['front-delt','pec'], vu:'2026-08-02'},
 'dips-entre-deux-bancs':                 {p:['triceps'], s:['front-delt','pec'], vu:'2026-08-02'},

 // ─── ABDOMINAUX (20) — relus un par un le 02/08/2026 ─────────────────────────────
 // ⭐ LE FIL DU GROUPE : les 20 fiches confondaient FLÉCHIR LE TRONC et FLÉCHIR LA HANCHE.
 //    Les deux se ressemblent de l'extérieur, mais ce ne sont pas les mêmes muscles — et
 //    c'est précisément ce qui distingue un CRUNCH d'un RELEVÉ DE BUSTE.
 //
 // ─── CRUNCHS : on décolle les OMOPLATES, le bassin ne bouge pas.
 // ✏️✏️ CORRECTION : ils comptaient tous les FLÉCHISSEURS DE HANCHE. Or dans un crunch la
 //    hanche ne bouge PAS — c'est exactement ce qui le distingue du relevé de buste, où l'on
 //    remonte tout le buste et où les fléchisseurs travaillent vraiment.
 //    ⭐ Conséquence : ce 3ᵉ muscle fantôme faisait compter un crunch comme POLYARTICULAIRE
 //    (5,5 en calories — autant qu'un développé couché). Il redevient l'isolation qu'il est.
 'crunch':                                {p:['abs'], s:['obliques'], vu:'2026-08-02'},
 'crunch-poulie':                         {p:['abs'], s:['obliques'], vu:'2026-08-02'},
 'crunch-machine':                        {p:['abs'], s:['obliques'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le crunch OBLIQUE avait les obliques en simple soutien — le mot est
 //    pourtant dans son nom, et la rotation EST le mouvement.
 'crunch-oblique':                        {p:['obliques','abs'], s:[], vu:'2026-08-02'},
 // Le RELEVÉ DE BUSTE, lui, remonte le tronc en entier : les fléchisseurs de hanche y sont
 // bien moteurs. C'est la seule fiche du lot qui devait les garder.
 'releve-de-buste-sit-up':                {p:['abs'], s:['hip-flexors','obliques'], vu:'2026-08-02'},
 // ─── RELEVÉS DE JAMBES : ⭐ l'inverse — c'est la HANCHE qui bouge, pas le tronc. Les
 //     fléchisseurs de hanche sont les moteurs, les abdos empêchent le bas du dos de creuser.
 // ✏️ CORRECTION : « Relevé de Jambes » et « Chaise Romaine » sont LE MÊME mouvement, et ils
 //    étaient rangés différemment (l'un avec les fléchisseurs en soutien, l'autre en moteur).
 'releve-de-jambes':                      {p:['abs','hip-flexors'], s:['obliques'], vu:'2026-08-02'},
 'chaise-romaine':                        {p:['abs','hip-flexors'], s:['obliques'], vu:'2026-08-02'},
 // ─── ROTATIONS : les OBLIQUES sont moteurs, pas de simples assistants.
 // ✏️ CORRECTION : sur la machine à rotation, les jambes sont bloquées et les bras ne font
 //    que tenir les coussins — ni fléchisseurs de hanche, ni épaules. C'est une isolation
 //    des obliques (elle coûtait 5,5, autant qu'un développé couché).
 'rotation-machine-obliques':             {p:['obliques'], s:['abs'], vu:'2026-08-02'},
 'rotation-russe-russian-twist':          {p:['obliques','abs'], s:['hip-flexors','front-delt'], vu:'2026-08-02'},
 'russian-twist-developpe-epaules':       {p:['obliques','abs'], s:['front-delt','hip-flexors'], vu:'2026-08-02'},
 'windshield-wiper':                      {p:['obliques','abs'], s:['hip-flexors','front-delt'], vu:'2026-08-02'},
 // ─── GAINAGES : rien ne bouge, on RÉSISTE.
 // ✏️ CORRECTION : au gainage ventral les érecteurs ne sont pas moteurs — ils co-contractent
 //    pour tenir la colonne neutre pendant que les abdos empêchent le bassin de basculer.
 //    C'est l'abdomen qui définit l'exercice.
 'gainage':                               {p:['abs'], s:['obliques','front-delt','glutes','lower-back'], vu:'2026-08-02'},
 // La planche LATÉRALE était juste : obliques moteurs, et le moyen fessier tient la hanche en l'air.
 'planche-laterale-side-plank':           {p:['obliques'], s:['abs','front-delt','glutes','lower-back'], vu:'2026-08-02'},
 // ⚠️ La planche INVERSÉE est rangée dans Abdominaux parce qu'on l'y cherche, mais ses muscles
 //    moteurs sont bien les fessiers et les érecteurs (on est face au ciel). Exception assumée,
 //    déjà écrite dans les croisements.
 'planche-inversee':                      {p:['glutes','lower-back'], s:['abs','hamstrings','rear-delt'], vu:'2026-08-02'},
 'hollow-body':                           {p:['abs'], s:['obliques','hip-flexors','front-delt'], vu:'2026-08-02'},
 // ✏️ CORRECTION : au L-SIT, on est en appui SUR LES MAINS, coudes verrouillés — ce sont les
 //    triceps et les épaules qui lâchent en premier, et les fléchisseurs de hanche qui tiennent
 //    les jambes à l'horizontale. Rien de tout ça n'était compté.
 'l-sit':                                 {p:['abs','hip-flexors'], s:['triceps','front-delt','obliques'], vu:'2026-08-02'},
 // ✏️ CORRECTION : à la ROUE ABDOMINALE et au DRAPEAU, ce sont les BRAS TENDUS et le GRAND
 //    DORSAL qui ramènent le corps — sans eux on ne remonte pas. Ils manquaient tous les deux.
 'roue-abdominale-ab-wheel':              {p:['abs'], s:['obliques','lats','front-delt'], vu:'2026-08-02'},
 'drapeau-dragon-flag':                   {p:['abs'], s:['obliques','hip-flexors','lats','front-delt'], vu:'2026-08-02'},
 // Le GRIMPEUR est du cardio : ses calories viennent de sa nature, pas de ses muscles.
 'grimpeur-mountain-climber':             {p:['abs','obliques'], s:['hip-flexors','front-delt','quads'], vu:'2026-08-02'},

 // ─── FULL BODY (17) — relus un par un le 02/08/2026 ──────────────────────────────
 // ⭐⭐ LE PLUS GROS BLOC IDENTIQUE DE TOUT LE CATALOGUE : **13 fiches sur 17** disaient
 //    EXACTEMENT la même chose — « deltoïde antérieur + quadriceps » moteurs, « abdos +
 //    fessiers + trapèzes + triceps » en soutien. La même réponse pour un Turkish Get-Up,
 //    une corde ondulatoire, un ergomètre de ski, un jumping jack et un épaulé-jeté.
 //    C'était la règle de rattrapage générique, appliquée à un groupe qui n'a par définition
 //    aucun mouvement en commun. *Quand 13 fiches sont identiques, ce n'est pas un
 //    classement — c'est l'absence de classement.*
 //
 // ─── SQUAT + POUSSÉE AU-DESSUS DE LA TÊTE (thrusters, wall ball)
 // ✏️ CORRECTION : les FESSIERS passent moteurs — c'est un squat COMPLET, pas une flexion
 //    de genoux. Ils étaient en simple soutien.
 'thruster':                              {p:['quads','glutes','front-delt'], s:['triceps','abs','traps'], vu:'2026-08-02'},
 'thruster-kettlebell':                   {p:['quads','glutes','front-delt'], s:['triceps','abs','traps'], vu:'2026-08-02'},
 'thrusters-halteres':                    {p:['quads','glutes','front-delt'], s:['triceps','abs','traps'], vu:'2026-08-02'},
 'wall-ball':                             {p:['quads','glutes','front-delt'], s:['triceps','abs','calves'], vu:'2026-08-02'},
 // ─── HALTÉROPHILIE : ⭐ un ARRACHÉ et un ÉPAULÉ partent d'une CHARNIÈRE DE HANCHE, pas
 //     d'un squat. Les ISCHIOS et les TRAPÈZES (le tirage, le haussement) sont les moteurs —
 //     les ischios ne figuraient nulle part, et les trapèzes étaient en simple soutien.
 'arrache-haltere-dumbbell-snatch':       {p:['glutes','hamstrings','traps'], s:['quads','front-delt','side-delt','abs','forearms'], vu:'2026-08-02'},
 'arrache-debout-muscle-snatch':          {p:['glutes','hamstrings','traps'], s:['quads','front-delt','side-delt','abs','forearms'], vu:'2026-08-02'},
 'clean-jerk':                            {p:['glutes','quads','traps'], s:['hamstrings','front-delt','triceps','abs','forearms'], vu:'2026-08-02'},
 // ✏️✏️ CORRECTION LA PLUS NETTE : le TURKISH GET-UP se fait avec une charge tenue À BOUT DE
 //    BRAS AU-DESSUS DE LA TÊTE pendant tout le mouvement, en passant par des positions de
 //    côté. C'est un exercice d'ÉPAULE et d'OBLIQUES — et les obliques n'y étaient PAS.
 //    Se lever du sol n'est que la moitié visible du geste.
 'turkish-get-up':                        {p:['front-delt','abs','obliques'], s:['glutes','quads','triceps','traps'], vu:'2026-08-02'},
 // ✏️ CORRECTION : dans les BURPEES il y a une POMPE — les pectoraux n'étaient nulle part,
 //    alors qu'ils sont ce qui fait échouer la série.
 'burpees':                               {p:['quads','glutes'], s:['pec','triceps','front-delt','abs','calves'], vu:'2026-08-02'},
 // ✏️✏️ CORRECTION : la CORDE ONDULATOIRE avait les QUADRICEPS en muscle moteur. On y est en
 //    demi-flexion, jambes immobiles : elles tiennent la position, elles ne produisent rien.
 //    Ce sont les ÉPAULES, les BRAS et le GAINAGE qui travaillent — et le grand dorsal, qui
 //    ramène la corde vers le bas, n'était même pas compté.
 'battle-rope':                           {p:['front-delt','abs'], s:['lats','biceps','triceps','forearms','quads'], vu:'2026-08-02'},
 // ✏️✏️ CORRECTION : l'ERGOMÈTRE DE SKI est un mouvement de TIRAGE vers le bas — grand dorsal,
 //    triceps et gainage. Il était classé « deltoïde antérieur + quadriceps », c'est-à-dire
 //    l'inverse de ce qu'on y fait.
 'ergometre-de-ski-ski-erg':              {p:['lats','abs','triceps'], s:['glutes','hamstrings','quads','forearms'], vu:'2026-08-02'},
 // ✏️ CORRECTION : au JUMPING JACK les bras montent SUR LES CÔTÉS (deltoïde MOYEN, pas
 //    antérieur) et ce sont les MOLLETS qui font les sauts. Les quadriceps n'y sont pas moteurs.
 'jumping-jack':                          {p:['calves','side-delt'], s:['quads','glutes','abs','front-delt'], vu:'2026-08-02'},
 // ✏️ CORRECTION : la MARCHE DE L'OURS se fait genoux décollés du sol — tout le travail
 //    consiste à empêcher le bassin de tourner. Le gainage passe moteur, les obliques
 //    apparaissent.
 'marche-de-l-ours-bear-crawl':           {p:['abs','front-delt','quads'], s:['obliques','triceps','glutes','calves'], vu:'2026-08-02'},
 // Le VÉLO À BRAS pédale ET tire/pousse les bras : quadriceps et épaules ensemble, c'est
 // bien ce qui le caractérise. La fiche était déjà proche.
 'assault-air-bike':                      {p:['quads','front-delt'], s:['hamstrings','glutes','lats','abs'], vu:'2026-08-02'},
 // Le BOX JUMP était juste : fessiers et quadriceps moteurs, mollets et ischios en soutien.
 'box-jump':                              {p:['glutes','quads'], s:['calves','hamstrings','abs'], vu:'2026-08-02'},
 // ─── CHARIOT DE PUISSANCE : alignés sur les autres chariots (déjà écrits).
 // ✏️ CORRECTION : le tirage EN AVANÇANT n'avait que le grand dorsal en moteur, alors que
 //    les trois autres tirages de chariot ont dorsal + trapèzes. Même geste, deux réponses.
 'chariot-de-puissance-poussee':          {p:['quads','glutes'], s:['calves','abs'], vu:'2026-08-02'},
 'chariot-de-puissance-tirage-en-avancant':{p:['lats','traps'], s:['rear-delt','biceps','forearms'], vu:'2026-08-02'},

 // ─── BICEPS (16) — relus un par un le 02/08/2026 ─────────────────────────────────
 // ⚠️ LIMITE DU GROUPE : le BRACHIAL et le LONG SUPINATEUR (brachio-radial) n'existent pas
 //    dans la figurine — or ce sont eux qui distinguent réellement un curl marteau d'un curl
 //    classique. On les approche par « avant-bras », le code le plus proche, et on l'écrit.
 // Les 14 curls en prise supinée : biceps moteur, avant-bras en soutien. C'était juste.
 'curl-barre':                            {p:['biceps'], s:['forearms'], vu:'2026-08-02'},
 'curl-halteres':                         {p:['biceps'], s:['forearms'], vu:'2026-08-02'},
 'curl-ez':                               {p:['biceps'], s:['forearms'], vu:'2026-08-02'},
 'curl-barre-ez-prise-large':             {p:['biceps'], s:['forearms'], vu:'2026-08-02'},
 'curl-poulie':                           {p:['biceps'], s:['forearms'], vu:'2026-08-02'},
 'curl-incline':                          {p:['biceps'], s:['forearms'], vu:'2026-08-02'},
 'curl-concentre':                        {p:['biceps'], s:['forearms'], vu:'2026-08-02'},
 'curl-cable-en-croix-bayesian-curl':     {p:['biceps'], s:['forearms'], vu:'2026-08-02'},
 'curl-araignee-spider-curl':             {p:['biceps'], s:['forearms'], vu:'2026-08-02'},
 'curl-pupitre-machine':                  {p:['biceps'], s:['forearms'], vu:'2026-08-02'},
 'curl-pupitre-barre-ez-larry-scott':     {p:['biceps'], s:['forearms'], vu:'2026-08-02'},
 'waiter-curl':                           {p:['biceps'], s:['forearms'], vu:'2026-08-02'},
 'chariot-de-puissance-curl-biceps':      {p:['biceps'], s:['forearms'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le MARTEAU se fait en prise NEUTRE et le ZOTTMAN redescend en prise
 //    PRONATÉE — dans les deux cas l'avant-bras n'est pas un assistant, c'est un MOTEUR.
 //    C'est même la seule raison de les choisir plutôt qu'un curl ordinaire. Les 16 fiches
 //    étaient identiques, donc ces deux-là ne se distinguaient de rien.
 'marteau':                               {p:['biceps','forearms'], s:[], vu:'2026-08-02'},
 'curl-zottman':                          {p:['biceps','forearms'], s:[], vu:'2026-08-02'},
 // ─── LOMBAIRES (8) — relus un par un le 02/08/2026 ───────────────────────────────
 // Les hyperextensions : érecteurs et fessiers moteurs, ischios en soutien. C'était juste.
 'hyperextension-back-extension':         {p:['lower-back','glutes'], s:['hamstrings'], vu:'2026-08-02'},
 'hyperextension-lestee':                 {p:['lower-back','glutes'], s:['hamstrings'], vu:'2026-08-02'},
 'hyperextension-machine':                {p:['lower-back','glutes'], s:['hamstrings'], vu:'2026-08-02'},
 'extension-lombaire-sur-ballon':         {p:['lower-back','glutes'], s:['hamstrings'], vu:'2026-08-02'},
 // À l'INVERSE (reverse hyper), ce sont les JAMBES qui montent, buste fixe : les fessiers
 // et les ischios font le mouvement, les érecteurs tiennent.
 'hyperextension-inverse-reverse-hyper':  {p:['glutes','hamstrings'], s:['lower-back'], vu:'2026-08-02'},
 // ✏️ CORRECTION : le JEFFERSON CURL est un mouvement de MOBILITÉ — on déroule la colonne
 //    vertèbre par vertèbre avec une charge tenue à bout de bras. Les érecteurs travaillent
 //    en freinant, les ischios sont étirés à fond, et la PRISE manquait complètement.
 'jefferson-curl':                        {p:['lower-back','hamstrings'], s:['glutes','forearms'], vu:'2026-08-02'},
 // Le SUPERMAN et le BIRD DOG sont des MAINTIENS, pas des charnières de hanche (leur schéma
 // a été corrigé le 02/08 : on est allongé, la hanche ne se plie pas).
 'superman':                              {p:['lower-back','glutes'], s:['hamstrings','rear-delt'], vu:'2026-08-02'},
 'bird-dog':                              {p:['abs','lower-back'], s:['glutes','obliques'], vu:'2026-08-02'},
 // ─── MOLLETS (8) — relus un par un le 02/08/2026 ─────────────────────────────────
 // ⚠️ LIMITE DU GROUPE : la figurine ne connaît qu'un seul code « mollets ». Or debout
 //    (genou tendu) c'est le JUMEAU qui travaille, assis (genou plié) c'est le SOLÉAIRE —
 //    c'est toute la raison d'avoir les deux machines. On ne peut pas le distinguer ici.
  'elevations-mollets-debout':             {p:['calves'], s:['soleus'], vu:'2026-08-20'},
  // ✏️ 20/08/2026 — ASSIS = genou fléchi : les jumeaux sont relâchés, c'est le SOLÉAIRE qui
 //    porte. Debout et assis rendaient exactement la même chose ; personne ne les confond en salle.
 'elevations-mollets-assis':              {p:['soleus'], s:['calves'], vu:'2026-08-20'},
  'elevations-mollets-unilateral':         {p:['calves'], s:['soleus'], vu:'2026-08-20'},
  'elevations-mollets-penche-donkey-calf-raise':{p:['calves'], s:['soleus'], vu:'2026-08-20'},
  'mollets-machine-debout':                {p:['calves'], s:['soleus'], vu:'2026-08-20'},
  'mollets-machine-assise':                {p:['soleus'], s:['calves'], vu:'2026-08-20'},
  'presse-mollets-leg-press':              {p:['calves'], s:['soleus'], vu:'2026-08-20'},
 'sauts-a-la-corde':                      {p:['calves'], s:['quads'], vu:'2026-08-02'},
 // ─── TRAPÈZES (6) — relus un par un le 02/08/2026 ────────────────────────────────
 // Les haussements d'épaules : trapèzes moteurs, la PRISE en soutien (c'est elle qui lâche
 // en premier sur les charges lourdes). C'était juste.
 'haussements-d-epaules-barre':           {p:['traps'], s:['forearms'], vu:'2026-08-02'},
 'haussements-d-epaules-halteres':        {p:['traps'], s:['forearms'], vu:'2026-08-02'},
 'haussements-d-epaules-cable':           {p:['traps'], s:['forearms'], vu:'2026-08-02'},
 // ⚠️ L'OVERHEAD SHRUG sollicite surtout le trapèze INFÉRIEUR (bras au-dessus de la tête),
 //    mais la figurine n'a qu'un seul code « trapèzes ». Et on n'ajoute PAS les épaules :
 //    elles ne font que TENIR la barre en l'air — un stabilisateur ne doit pas doubler la
 //    dépense (4 → 5,5). Même arbitrage qu'à l'extension triceps TRX (ft-v743).
 'haussements-d-epaules-overhead':        {p:['traps'], s:['forearms'], vu:'2026-08-02'},
 // ✏️ CORRECTION : les deux TIRAGES MENTON n'avaient pas le deltoïde ANTÉRIEUR, alors que le
 //    « Tirage Menton Kettlebell » — le même mouvement — l'a reçu il y a six versions.
 //    Trois fiches du même geste, deux réponses.
 'tirage-menton':                         {p:['side-delt','traps'], s:['biceps','front-delt'], vu:'2026-08-02'},
 'tirage-menton-elastique':               {p:['side-delt','traps'], s:['biceps','front-delt'], vu:'2026-08-02'},
 // ─── AVANT-BRAS (5) — relus un par un le 02/08/2026 ──────────────────────────────
 // Le FARMER'S WALK : c'est la PRISE qui lâche, pas les jambes (corrigé en ft-v730).
 'farmer-s-walk':                         {p:['forearms','traps'], s:['abs','glutes','quads'], vu:'2026-08-02'},
 'curl-poignet-barre':                    {p:['forearms'], s:[], vu:'2026-08-02'},
  // ✏️ 20/08/2026 — l'EXTENSION de poignet est le mouvement OPPOSÉ du curl : elle travaille les
 //    extenseurs (face dorsale). Les deux fiches étaient identiques.
 'extension-poignet-barre':               {p:['forearm-ext'], s:[], vu:'2026-08-20'},
 'pronation-supination-haltere':          {p:['forearms'], s:[], vu:'2026-08-02'},
 // ✏️ CORRECTION : la PLANCHE DE PRÉHENSION comptait les QUADRICEPS. On est debout, immobile,
 //    à serrer deux disques : les jambes ne font rien du tout. C'est un maintien de prise —
 //    et il coûtait 5,5 en calories, autant qu'un développé couché.
 'planche-de-prehension':                 {p:['forearms'], s:['traps'], vu:'2026-08-02'},
};

/** Muscles ÉCRITS d'un exercice, ou null s'il n'en a pas encore (bascule en cours, ou
 *  exercice créé par l'utilisateur). Le null n'est jamais remplacé par une valeur par
 *  défaut : on retombe alors sur les règles, qui devinent (R29). */
function exMuscles(nom){
  const id=(typeof exId==='function')?exId(nom):null;
  return (id&&EX_MUSCLES[id])||null;
}

/* ─── LIRE UNE DURÉE DE REPOS, QUELLE QUE SOIT SA FORME (05/08/2026) ──────────────────
 *
 * ⚠️ POURQUOI. L'app lisait le repos avec `parseInt(s.rest)`. Or Milo produit ce champ
 * dans un bloc JSON, et le prompt lui explique en toutes lettres la conversion à faire :
 * « 3 min » → `"rest":180`. Un modèle léger peut très bien écrire `"rest":"3 min"` —
 * et alors `parseInt("3 min")` vaut **3**. Le chronomètre de repos passait donc à
 * 3 SECONDES au lieu de 3 minutes, sans erreur, sans message : juste un chrono absurde
 * que personne n'aurait su expliquer.
 *
 * 👉 LE BON GESTE N'EST PAS DE DURCIR LA CONSIGNE, C'EST DE RENDRE L'APP TOLÉRANTE.
 *    C'est le patron de ft-v761 (lire la séance dans le texte quand le bloc caché manque) :
 *    ça marche sur TOUS les modèles, et ça ne coûte pas un caractère de prompt.
 *    Chaque calcul qu'on demande au modèle est un calcul qu'il peut rater ; celui-ci,
 *    le code le fait sans jamais se tromper.
 *
 * Rend des SECONDES, ou 0 si c'est illisible (l'app garde alors son réglage habituel).
 */
function _secRepos(v){
  if(v==null)return 0;
  if(typeof v==='number')return v>0&&isFinite(v)?Math.round(v):0;
  const s=String(v).trim().toLowerCase().replace(',','.');
  if(!s)return 0;
  let m;
  // « 1:30 » ou « 1'30 » → minutes:secondes
  if((m=s.match(/^(\d+)\s*[:'’]\s*(\d{1,2})$/)))return (+m[1])*60+(+m[2]);
  // « 1 min 30 », « 1 minute 30 s »
  if((m=s.match(/^(\d+(?:\.\d+)?)\s*(?:min|minutes?|mn|m)\b\s*(\d{1,2})\s*(?:s|sec|secondes?)?$/)))
    return Math.round((+m[1])*60)+(+m[2]);
  // « 3 min », « 2.5 minutes », « 3mn »
  if((m=s.match(/^(\d+(?:\.\d+)?)\s*(?:min|minutes?|mn|m)\b$/)))return Math.round((+m[1])*60);
  // « 90 s », « 90 sec », « 90 secondes »
  if((m=s.match(/^(\d+(?:\.\d+)?)\s*(?:s|sec|secs?|secondes?)\b$/)))return Math.round(+m[1]);
  // « 180 » tout court → déjà des secondes
  if((m=s.match(/^(\d+(?:\.\d+)?)$/)))return Math.round(+m[1]);
  return 0;
}

/* ─── LIRE UNE DATE ANNONCÉE, EN CHIFFRES OU EN TOUTES LETTRES (05/08/2026) ────────────
 *
 * ⚠️ POURQUOI. L'app n'acceptait que `YYYY-MM-DD` : Milo devait donc CALCULER lui-même
 * que « mercredi » vaut 2026-08-12. C'est précisément la famille de bugs ft-v658/660
 * (« demain mercredi » un mercredi, une séance datée « lundi » alors qu'elle était mardi).
 * Et le pire n'est pas qu'il échoue : c'est qu'il peut produire une date VALIDE mais
 * FAUSSE — l'app l'enregistre alors sans pouvoir s'en apercevoir.
 *
 * 👉 On ne demande plus le calcul, on le FAIT. `_dateAnnoncee()` comprend une date ISO,
 *    « demain », « après-demain », « ce soir », un jour de la semaine (le PROCHAIN à
 *    venir), « dans 3 jours ». Elle rend une date ISO, ou '' si c'est illisible — et dans
 *    ce cas l'appelant ignore l'annonce plutôt que d'inventer (jamais de date devinée).
 *
 * ⚠️ La date « d'aujourd'hui » vient de `today()` — celle du TÉLÉPHONE, jamais celle de
 *    Greenwich : règle née du bug ft-v655, protégée par un test permanent.
 */
const _JOURS_SEM = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
function _dateAnnoncee(v){
  try{
    const s=String(v==null?'':v).trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g,'');
    if(!s)return '';
    if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;                      // déjà une date ISO
    const base=(typeof today==='function')?today():new Date().toISOString().slice(0,10);
    const d0=new Date(base+'T12:00:00'); if(isNaN(d0))return '';
    const iso=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*6e4);return z.toISOString().slice(0,10);};
    const plus=n=>{const d=new Date(d0); d.setDate(d.getDate()+n); return iso(d);};
    if(/\b(aujourd'?hui|ce soir|ce matin|cet apres-midi|maintenant)\b/.test(s))return plus(0);
    if(/\bapres-?demain\b/.test(s))return plus(2);
    if(/\bdemain\b/.test(s))return plus(1);
    let m=s.match(/\bdans\s+(\d{1,2})\s*jours?\b/);
    if(m)return plus(Math.min(30,+m[1]));
    // Un jour de la semaine → la PROCHAINE occurrence (aujourd'hui compte si on dit « ce X »)
    for(let i=0;i<7;i++){
      const j=_JOURS_SEM[i].normalize('NFD').replace(/[̀-ͯ]/g,'');
      if(new RegExp('\\b'+j+'\\b').test(s)){
        let ecart=(i-d0.getDay()+7)%7;
        if(ecart===0 && !/\bce\b|\baujourd'?hui\b/.test(s))ecart=7;   // « mercredi » un mercredi = le prochain
        if(/\bprochain\b/.test(s) && ecart<7)ecart+=0;                // « mercredi prochain » = le prochain aussi
        return plus(ecart);
      }
    }
    return '';                                                       // illisible → on n'invente pas
  }catch(e){ return ''; }
}
