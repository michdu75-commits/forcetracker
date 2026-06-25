// ─── STATE ───────────────────────────────────────────────────
let _chartPts=[];
let S={
  bw:80,barW:20,defRest:130,
  gender:'H',age:30,height:175,activityLevel:1.55,
  workType:'bureau',smoker:false,
  mensCycleStart:'',mensCycleDur:28,contraception:'',morpho:'',morphotype:'',
  sessions:[],prs:{},wkt:null,programmes:[],progExos:null,seenFeatures:[],reportedCustomEx:[],
  url:DEFAULT_URL,email:'',connected:false,
  nutritionPhase:'charge',
  customExercises:[],
  neck:0,waist:0,hip:0,
  goal:'muscle',
  sleepLog:[],
  weightLog:[],
  name:'',
  coachFree:0,
  premium:false,
  premiumExpiry:'',
  exRestPref:{}
};

function load(){
  try{
    S.bw=parseFloat(localStorage.getItem('ft4_bw')||'0')||0;
    S.barW=parseFloat(localStorage.getItem('ft4_bar')||'20')||20;
    S.defRest=parseInt(localStorage.getItem('ft4_rest')||'130')||130;
    S.gender=localStorage.getItem('ft4_gender')||'H';
    S.age=parseInt(localStorage.getItem('ft4_age')||'0')||0;
    S.height=parseFloat(localStorage.getItem('ft4_ht')||'0')||0;
    S.activityLevel=parseFloat(localStorage.getItem('ft4_act')||'1.55')||1.55;
    S.workType=localStorage.getItem('ft4_work')||'bureau';
    S.smoker=localStorage.getItem('ft4_smoker')==='1';
    S.mensCycleStart=localStorage.getItem('ft4_mcstart')||'';
    S.mensCycleDur=parseInt(localStorage.getItem('ft4_mcdur')||'28')||28;
    S.contraception=localStorage.getItem('ft4_contra')||'';
    S.morpho=localStorage.getItem('ft4_morpho')||'';
    S.morphotype=localStorage.getItem('ft4_morphot')||'';
    S.sessions=JSON.parse(localStorage.getItem('ft4_sessions')||'[]');
    S.prs=JSON.parse(localStorage.getItem('ft4_prs')||'{}');
    S.wkt=JSON.parse(localStorage.getItem('ft4_wkt')||'null');
    S.url=DEFAULT_URL;
    S.email=localStorage.getItem('ft4_email')||'';
    S.connected=localStorage.getItem('ft4_ok')==='1';
    S.cycle=JSON.parse(localStorage.getItem('ft4_cycle')||'null');
    S.nutritionPhase=localStorage.getItem('ft4_nphase')||'charge';
    S.customExercises=JSON.parse(localStorage.getItem('ft4_cuex')||'[]');
    S.neck=parseFloat(localStorage.getItem('ft4_neck')||'0')||0;
    S.waist=parseFloat(localStorage.getItem('ft4_waist')||'0')||0;
    S.hip=parseFloat(localStorage.getItem('ft4_hip')||'0')||0;
    S.goal=localStorage.getItem('ft4_goal')||'muscle';
    S.sleepLog=JSON.parse(localStorage.getItem('ft4_sleep')||'[]');
    S.weightLog=JSON.parse(localStorage.getItem('ft4_wlog')||'[]');
    S.name=localStorage.getItem('ft4_name')||'';
    S.programmes=JSON.parse(localStorage.getItem('ft4_progs')||'[]');
    S.progExos=JSON.parse(localStorage.getItem('ft4_progexos')||'null')||[...BIG4];
    S.seenFeatures=JSON.parse(localStorage.getItem('ft4_seen_ft')||'[]');
    S.reportedCustomEx=JSON.parse(localStorage.getItem('ft4_rep_cex')||'[]');
    // ID anonyme persistant — jamais lié à l'email
    S.anonId=localStorage.getItem('ft4_auid')||(()=>{const id='u_'+Math.random().toString(36).slice(2,11);localStorage.setItem('ft4_auid',id);return id;})();
    S.coachFree=parseInt(localStorage.getItem('ft4_coachFree')||'0')||0;
    S.coachMemory=localStorage.getItem('ft4_coach_mem')||'';
    S.premium=localStorage.getItem('ft4_premium')==='1';
    S.premiumExpiry=localStorage.getItem('ft4_premiumExp')||'';
    S.exRestPref=JSON.parse(localStorage.getItem('ft4_exRp')||'{}');
    S.badges=JSON.parse(localStorage.getItem('ft4_badges')||'{}');
    S.bday=localStorage.getItem('ft4_bday')||'';
    S.lastWeekSummary=localStorage.getItem('ft4_lws')||'';
    // Migration one-time : exercices EN → FR
    if(!localStorage.getItem('ft4_exmig2')){
      const _REN={'Rack Pull':'Tirage en Rack (Rack Pull)','Good Morning':'Inclinaison Lombaire (Good Morning)',
        'Rowing Chest Supported':'Rowing Poitrine Appuyée (Chest Supported)','Shrugs':'Haussements d\'Épaules (Shrugs)',
        'Arnold Press':'Développé Arnold (Arnold Press)','Face Pull':'Tirage Visage (Face Pull)',
        'Upright Row':'Tirage Vertical (Upright Row)','Kickback Triceps':'Extension Triceps Arrière (Kickback)',
        'Hack Squat':'Squat Hack (Hack Squat)','Step-up':'Montée sur Box (Step-up)',
        'Leg Extension':'Extension Quadriceps (Leg Extension)','Leg Abduction':'Abduction Cuisses (Leg Abduction)',
        'Leg Adduction':'Adduction Cuisses (Leg Adduction)','Hip Thrust':'Poussée de Hanche (Hip Thrust)',
        'Glute Bridge':'Pont Fessier (Glute Bridge)','Kickback Fessiers':'Extension Fessiers Arrière (Kickback)',
        'Leg Curl':'Curl Ischio-jambiers (Leg Curl)','Side Plank':'Planche Latérale (Side Plank)',
        'Ab Wheel':'Roue Abdominale (Ab Wheel)','Russian Twist':'Rotation Russe (Russian Twist)',
        'Dragon Flag':'Drapeau (Dragon Flag)','Mountain Climber':'Grimpeur (Mountain Climber)',
        'Leg Press Mollets':'Presse Mollets (Leg Press)','Donkey Calf Raise':'Élévations Mollets Penché (Donkey Calf Raise)'
      };
      Object.keys(_REN).forEach(old=>{if(S.prs[old]){S.prs[_REN[old]]=S.prs[old];delete S.prs[old];}});
      (S.sessions||[]).forEach(sess=>{(sess.exs||sess.exercises||[]).forEach(ex=>{if(_REN[ex.name])ex.name=_REN[ex.name];});});
      localStorage.setItem('ft4_exmig2','1');
      localStorage.setItem('ft4_prs',JSON.stringify(S.prs));
      localStorage.setItem('ft4_sessions',JSON.stringify(S.sessions));
    }
  }catch(e){}
}
function persist(){
  try{
    localStorage.setItem('ft4_bw',S.bw);localStorage.setItem('ft4_bar',S.barW);
    localStorage.setItem('ft4_rest',S.defRest);localStorage.setItem('ft4_gender',S.gender);
    localStorage.setItem('ft4_age',S.age);localStorage.setItem('ft4_ht',S.height);
    localStorage.setItem('ft4_act',S.activityLevel);
    localStorage.setItem('ft4_sessions',JSON.stringify(S.sessions));
    localStorage.setItem('ft4_prs',JSON.stringify(S.prs));
    localStorage.setItem('ft4_wkt',JSON.stringify(S.wkt));
    localStorage.setItem('ft4_email',S.email);localStorage.setItem('ft4_ok',S.connected?'1':'0');
    localStorage.setItem('ft4_nphase',S.nutritionPhase);
    localStorage.setItem('ft4_work',S.workType);
    localStorage.setItem('ft4_smoker',S.smoker?'1':'0');
    localStorage.setItem('ft4_mcstart',S.mensCycleStart);
    localStorage.setItem('ft4_mcdur',S.mensCycleDur);
    localStorage.setItem('ft4_contra',S.contraception||'');
    localStorage.setItem('ft4_morpho',S.morpho||'');
    localStorage.setItem('ft4_morphot',S.morphotype||'');
    localStorage.setItem('ft4_cuex',JSON.stringify(S.customExercises||[]));
    localStorage.setItem('ft4_neck',S.neck||0);
    localStorage.setItem('ft4_waist',S.waist||0);
    localStorage.setItem('ft4_hip',S.hip||0);
    localStorage.setItem('ft4_goal',S.goal||'muscle');
    localStorage.setItem('ft4_sleep',JSON.stringify(S.sleepLog||[]));
    localStorage.setItem('ft4_wlog',JSON.stringify(S.weightLog||[]));
    localStorage.setItem('ft4_name',S.name||'');
    localStorage.setItem('ft4_progs',JSON.stringify(S.programmes||[]));
    localStorage.setItem('ft4_progexos',JSON.stringify(S.progExos||BIG4));
    localStorage.setItem('ft4_coachFree',S.coachFree||0);
    localStorage.setItem('ft4_coach_mem',S.coachMemory||'');
    localStorage.setItem('ft4_exRp',JSON.stringify(S.exRestPref||{}));
    localStorage.setItem('ft4_premium',S.premium?'1':'0');
    localStorage.setItem('ft4_premiumExp',S.premiumExpiry||'');
    localStorage.setItem('ft4_badges',JSON.stringify(S.badges||{}));
    localStorage.setItem('ft4_bday',S.bday||'');
    localStorage.setItem('ft4_lws',S.lastWeekSummary||'');
  }catch(e){}
  _cloudSyncDebounced();
}

// ─── UTILS ───────────────────────────────────────────────────
const fmt=n=>Math.round(n*10)/10;
const bz=(kg,r)=>(!kg||!r||r<1)?0:(r===1?kg:fmt(kg/(1.0278-0.0278*Math.min(r,20))));
const today=()=>new Date().toISOString().split('T')[0];
const fmtD=d=>d?new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'}):'';

// ─── NUTRITION CALCULATIONS ──────────────────────────────────
function calcBMR(){
  if(!S.bw||!S.height||!S.age) return 0;
  const base=10*S.bw+6.25*S.height-5*S.age;
  const bmr=Math.round(S.gender==='H'?base+5:base-161);
  return S.smoker?Math.round(bmr*1.07):bmr;
}
function calcWorkExtra(){return{bureau:0,debout:200,physique:450}[S.workType]||0;}
function calcTDEE(){return Math.round(calcBMR()*S.activityLevel+calcWorkExtra());}

function getMensCyclePhase(){
  if(S.gender!=='F')return null;
  const hormonalContra=['pill-combo','pill-prog','implant','iud-hormonal'];
  if(hormonalContra.includes(S.contraception||'')){
    return{hormonal:true,phase:'Contraception hormonale',day:null,dur:null,icon:'💊',color:'var(--t2)',perf:null,
      nutrition:'Avec une contraception hormonale, les phases naturelles du cycle sont modifiées. Maintiens une alimentation équilibrée et écoute ton corps au quotidien.',
      training:'Les fluctuations hormonales liées au cycle naturel sont atténuées. Entraîne-toi selon ta forme du jour.'};
  }
  if(!S.mensCycleStart)return null;
  const elapsed=Math.floor((new Date()-new Date(S.mensCycleStart+'T12:00:00'))/864e5);
  if(elapsed<0)return null;
  const dur=S.mensCycleDur||28;
  const day=(elapsed%dur)+1;
  const ovDay=Math.max(10,dur-14);
  const copper=S.contraception==='iud-copper';
  const copperNote=copper?' (Règles potentiellement plus abondantes avec DIU cuivre)':'';
  if(day<=5) return{phase:'Menstruation',day,dur,ovDay,icon:'🔴',color:'var(--red)',perf:'low',
    nutrition:'Privilégie le fer (viande rouge, légumineuses), magnésium et oméga-3 anti-inflammatoires. Réduis légèrement les glucides.'+copperNote,
    training:'Repos actif ou séances légères. Yoga, marche, mobilité. Évite les charges maximales et le surentraînement.'};
  if(day<ovDay) return{phase:'Folliculaire',day,dur,ovDay,icon:'🌱',color:'var(--green)',perf:'rising',
    nutrition:'Phase anabolique optimale. Augmente glucides complexes et protéines pour soutenir la progression musculaire.',
    training:'Période idéale pour les records et la progression. Corps en phase anabolique, récupération accélérée — pousse les charges.'};
  if(day<=ovDay+2) return{phase:'Ovulation',day,dur,ovDay,icon:'⚡',color:'var(--gold)',perf:'peak',
    nutrition:'Pic de performance. Maintiens les macros habituelles. Hydratation renforcée (+0.5L/j).',
    training:'Énergie et force au maximum. Séances intensives recommandées — c\'est le meilleur moment pour tenter des PRs.'};
  return{phase:'Lutéale',day,dur,ovDay,icon:'🌙',color:'var(--purp)',perf:'declining',
    nutrition:'+150 kcal/j appliqués automatiquement. Augmente protéines et magnésium pour réduire les symptômes prémenstruels.',
    training:'Fatigue accrue est normale. Privilégie volume modéré, exercices familiers et bonne récupération entre les séances.'};
}

function calcMacros(phase){
  const tdee=calcTDEE();
  const goal=S.goal||'muscle';
  const isCharge=phase==='charge';
  const cp=getMensCyclePhase();
  const lutealBonus=cp&&cp.phase==='Lutéale'?150:0;
  const goalDelta={muscle:350,perte:-450,force:200,equilibre:0,endurance:100}[goal]||350;
  const phaseAdj=isCharge?100:-100;
  const calories=tdee+goalDelta+phaseAdj+lutealBonus;
  const lutealProt=cp&&cp.phase==='Lutéale'?0.2:0;
  const protRatio=({muscle:2.2,perte:2.5,force:2.0,equilibre:2.0,endurance:1.7}[goal]||2.2)+lutealProt;
  const fatRatio={muscle:0.9,perte:0.8,force:1.0,equilibre:0.85,endurance:0.75}[goal]||0.9;
  const prot_g=Math.round(S.bw*protRatio);
  const fat_g=Math.round(S.bw*fatRatio);
  const prot_k=prot_g*4,fat_k=fat_g*9;
  const carbs_g=Math.max(0,Math.round((calories-prot_k-fat_k)/4));
  return{calories,prot_g,fat_g,carbs_g};
}

function getMeals(macros,phase){
  const goal=S.goal||'muscle';
  const plans={
    muscle:[
      [0.20,'🌅 Petit-déjeuner','Avoine + œufs + fruit — Glucides complexes'],
      [0.10,'🍎 Collation matin','Yaourt grec + noix — Protéines rapides'],
      [0.25,'🍽️ Déjeuner','Riz + poulet + légumes — Repas complet'],
      [0.15,'⚡ Pré-entraînement',"Banane + flocons d'avoine — Énergie maximale"],
      [0.20,'💪 Post-entraînement','Whey + riz + banane — Récupération anabolique'],
      [0.10,'🌙 Dîner','Saumon/bœuf + légumes + patate douce'],
    ],
    perte:[
      [0.25,'🌅 Petit-déjeuner','Œufs entiers + épinards + pain complet — Rassasiant, riche en protéines'],
      [0.10,'🍎 Collation','Fromage blanc 0% + concombre — Volume sans calories'],
      [0.30,'🍽️ Déjeuner','Poulet/thon + légumes vapeur + légumineuses — Satiété maximale'],
      [0.10,'🍎 Collation 2','Amandes (20g) + whey shake — Anti-fringales'],
      [0.25,'🌙 Dîner','Poisson maigre + légumes rôtis + quinoa — Faible IG'],
    ],
    force:[
      [0.20,'🌅 Petit-déjeuner','Avoine + œufs + lait entier — Base énergétique dense'],
      [0.15,'⚡ Pré-entraînement','Riz blanc + bœuf + banane — Charge glycogène maximale'],
      [0.25,'🍽️ Déjeuner','Pâtes + poulet + huile olive — Carburant pour les charges lourdes'],
      [0.25,'💪 Post-entraînement','Whey + riz blanc + dattes — Récupération rapide'],
      [0.15,'🌙 Dîner','Œufs + patate douce + légumes — Récupération nocturne'],
    ],
    equilibre:[
      [0.25,'🌅 Petit-déjeuner','Œufs + avoine + fruits — Équilibre parfait macro/micro'],
      [0.30,'🍽️ Déjeuner','Protéine + céréale complète + légumes variés — Coloré et complet'],
      [0.15,'🍎 Collation','Yaourt grec + noix ou fruit de saison'],
      [0.30,'🌙 Dîner','Poisson + légumes + riz complet ou lentilles'],
    ],
    endurance:[
      [0.25,'🌅 Petit-déjeuner','Porridge + miel + banane + fruit sec — Réserve glycogène'],
      [0.15,'⚡ Pré-entraînement','Barre céréale maison + jus de fruit — Énergie rapide'],
      [0.25,'🍽️ Déjeuner','Pâtes complètes + thon + légumes — Glucides dominants'],
      [0.20,'💪 Post-entraînement','Boisson récup + banane + pain complet — Réhydratation'],
      [0.15,'🌙 Dîner','Riz + poulet + légumes — Reconstruction musculaire nocturne'],
    ],
  };
  const plan=plans[goal]||plans.muscle;
  return plan.map(([pct,name,desc])=>{
    const kcal=Math.round(macros.calories*pct);
    const prot=Math.round(macros.prot_g*pct);
    const carbs=Math.round(macros.carbs_g*pct);
    const fat=Math.round(macros.fat_g*pct);
    return{name,desc,kcal,prot,carbs,fat};
  });
}

