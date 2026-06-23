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
  {n:'Dips',g:'Pectoraux'},{n:'Dips Parallèles',g:'Pectoraux'},{n:'Dips Machine Assistée',g:'Pectoraux'},
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
  // ── Trapèzes ───────────────────────────────────────────────
  {n:'Haussements d\'Épaules (Shrugs)',g:'Trapèzes'},{n:'Haussements d\'Épaules Barre',g:'Trapèzes'},
  {n:'Haussements d\'Épaules Haltères',g:'Trapèzes'},{n:'Haussements d\'Épaules Câble',g:'Trapèzes'},
  {n:'Tirage Menton',g:'Trapèzes'},{n:'Farmer\'s Walk',g:'Trapèzes'},
  // ── Épaules ────────────────────────────────────────────────
  {n:'Développé Militaire',g:'Épaules'},{n:'Développé Militaire Haltères',g:'Épaules'},
  {n:'Développé Haltères Assis',g:'Épaules'},{n:'Développé Arnold (Arnold Press)',g:'Épaules'},
  {n:'Développé Épaules Machine',g:'Épaules'},{n:'Smith Machine Développé Militaire',g:'Épaules'},
  {n:'Élévations Latérales',g:'Épaules'},{n:'Élévations Latérales Câble',g:'Épaules'},{n:'Élévations Latérales Machine',g:'Épaules'},
  {n:'Élévations Frontales',g:'Épaules'},{n:'Élévations Frontales Câble',g:'Épaules'},{n:'Élévations Frontales Machine',g:'Épaules'},
  {n:'Oiseau',g:'Épaules'},{n:'Machine Oiseau',g:'Épaules'},
  {n:'Tirage Visage (Face Pull)',g:'Épaules'},{n:'Tirage Vertical (Upright Row)',g:'Épaules'},
  {n:'Y Raise / W Raise',g:'Épaules'},
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
  {n:'Leg Curl Couché Machine',g:'Jambes'},{n:'Leg Curl Assis Machine',g:'Jambes'},
  {n:'Fentes',g:'Jambes'},{n:'Fentes Marchées',g:'Jambes'},{n:'Fentes Arrière',g:'Jambes'},{n:'Fentes Latérales',g:'Jambes'},
  {n:'Smith Machine Fentes',g:'Jambes'},
  {n:'Montée sur Box (Step-up)',g:'Jambes'},{n:'Montée sur Box Haltères',g:'Jambes'},
  {n:'Abduction Cuisses (Leg Abduction)',g:'Jambes'},{n:'Adduction Cuisses (Leg Adduction)',g:'Jambes'},
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
  // ── Lombaires ──────────────────────────────────────────────
  {n:'Hyperextension (Back Extension)',g:'Lombaires'},{n:'Hyperextension Inverse (Reverse Hyper)',g:'Lombaires'},
  {n:'Hyperextension Lestée',g:'Lombaires'},{n:'Hyperextension Machine',g:'Lombaires'},
  {n:'Inclinaison Lombaire (Good Morning)',g:'Lombaires'},{n:'Good Morning Haltères',g:'Lombaires'},
  {n:'Soulevé de Terre',g:'Lombaires'},{n:'Soulevé de Terre Roumain Barre',g:'Lombaires'},
  {n:'Jefferson Curl',g:'Lombaires'},{n:'Tirage en Rack (Rack Pull)',g:'Lombaires'},
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
const SET_TYPES=['N','W','E','D','M'];
const SET_TYPE_LABELS={N:'Normal',W:'Warm-up',E:'Échec',D:'Drop set',M:'Méthode'};

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

