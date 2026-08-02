#!/usr/bin/env node
/**
 * LES CALCULS FONDATEURS — tests LINÉAIRES (audit du 29-30/07/2026, demandé par Michel).
 *
 * Pourquoi cette famille existe : tout ce qui date d'avant les tests (l'époque
 * « Claude Design », juin 2026) n'avait JAMAIS été vérifié contre des valeurs
 * connues — 1RM Brzycki, BMR/TDEE (Mifflin-St Jeor), macros, récupération,
 * niveaux de force, plaques, cardio, badges, streak, cycle de force.
 * Chaque calcul est testé SEUL, avec des valeurs vérifiables à la main.
 *
 * Résultat de l'audit : 79/79 — les formules fondatrices sont JUSTES.
 * Deux « quirks » assumés et documentés dans les tests :
 *   · la « marche de midi » : les jours écoulés se comptent depuis MIDI de la
 *     date de séance → avant midi, la récup compte un jour de repos de moins ;
 *   · une séance vide facture 47 kcal d'échauffement forfaitaire.
 *
 * Lancer : node tests/calculs/runner.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'../..');
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
         '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
let ok=0,ko=0;
const t=(n,c,x)=>{c?(ok++,console.log('  ✅ '+n)):(ko++,console.log('  ❌ '+n+(x?'\n       → '+x:'')));};
const approx=(a,b,eps)=>Math.abs(a-b)<=(eps||0.51);

// Gel d'horloge : 2026-07-29 (mercredi), heure paramétrable, fuseau Paris (TZ posé au launch)
function freezeScript(iso){
  return `(()=>{const FIXE=new Date(${JSON.stringify(iso)});const Vrai=Date;
    window.Date=class extends Vrai{constructor(...a){if(a.length)super(...a);else super(FIXE.getTime());}
      static now(){return FIXE.getTime();}};})();`;
}
function seedScript(extra){
  const base={ft4_name:'Testeur',ft4_bw:'80',ft4_age:'30',ft4_ht:'178',ft4_gender:'H',
    ft4_act:'1.55',ft4_work:'bureau',ft4_goal:'muscle',ft4_rest:'120',ft4_ok:'',ft4_email:''};
  const all=Object.assign({},base,extra||{});
  return `(()=>{try{${Object.entries(all).map(([k,v])=>`localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)});`).join('')}}catch(e){}})();`;
}

(async()=>{
await new Promise(r=>srv.listen(0,r));
const PORT=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

async function boot(frozenISO,seedExtra){
  const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  if(frozenISO)await p.addInitScript(freezeScript(frozenISO));
  await p.addInitScript(seedScript(seedExtra));
  await p.goto('http://localhost:'+PORT+'/index.html');
  await p.waitForTimeout(2200);
  return {c,p,errs};
}

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ 1. bz() — 1RM Brzycki ═══');
{
  const {c,p,errs}=await boot(null,{});
  const r=await p.evaluate(()=>({
    un:bz(100,1), cinq:bz(100,5), dix:bz(100,10), vingt:bz(100,20), trente:bz(100,30),
    zeroKg:bz(0,5), zeroReps:bz(100,0), negatif:bz(100,-3),
    mono:[1,2,3,5,8,10,12,15,20].map(r=>bz(100,r)),
  }));
  t('bz(100,1) = 100 (1 rep = la charge elle-même)', r.un===100, 'reçu '+r.un);
  t('bz(100,5) ≈ 112.5 (formule Brzycki)', approx(r.cinq,112.5,0.1), 'reçu '+r.cinq);
  t('bz(100,10) ≈ 133.3', approx(r.dix,133.3,0.2), 'reçu '+r.dix);
  t('bz est monotone croissant avec les reps', r.mono.every((v,i,a)=>i===0||v>a[i-1]), JSON.stringify(r.mono));
  t('reps > 20 plafonnées (bz(100,30)=bz(100,20))', r.trente===r.vingt, r.trente+' vs '+r.vingt);
  t('entrées invalides → 0 (kg=0, reps=0, reps<0)', r.zeroKg===0&&r.zeroReps===0&&r.negatif===0);
  t('0 erreur JS au chargement', errs.length===0, errs.join(' | '));
  await c.close();
}

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ 2. calcBMR / calcTDEE / macros (Mifflin-St Jeor) ═══');
{
  const {c,p}=await boot(null,{});
  const r=await p.evaluate(()=>{
    const out={};
    out.bmrH=calcBMR();                                 // 10*80+6.25*178-5*30+5 = 1767.5 → 1768
    S.gender='F'; out.bmrF=calcBMR();                   // base-161 = 1601.5 → 1602 (round(1601.5)=1602? JS round .5 up)
    S.gender='H'; S.smoker=true; out.bmrSmoke=calcBMR();// 1768*1.07
    S.smoker=false;
    S.bw=0; out.bmrSans=calcBMR(); S.bw=80;
    out.tdee=calcTDEE();                                // 1768*1.55+0
    S.workType='physique'; out.tdeePhys=calcTDEE(); S.workType='bureau';
    out.auto=autoKcal('charge');                        // tdee+350+100
    out.autoSeche=autoKcal('seche');                    // tdee+350-100
    S.goal='perte'; out.autoPerte=autoKcal('charge');   // tdee-450+100
    S.goal='muscle';
    const m=calcMacros('charge');
    out.m=m;                                            // prot 2.2*80=176, fat .9*80=72
    S.manualKcal=1800; out.manual=calcMacros('charge'); S.manualKcal=0;
    S.keto=true; const k=macrosForKcal(2000); S.keto=false;
    out.keto=k;                                         // 25g glucides, 75g prot, 178g lipides
    out.tiny=macrosForKcal(500);                        // glucides clampés ≥ 0
    // les plans de repas : la somme des fractions doit faire 100 % des calories
    const sums={};
    for(const g of ['muscle','perte','force','equilibre','endurance','recomp']){
      S.goal=g; const mm=calcMacros('charge'); const meals=getMeals(mm,'charge');
      sums[g]=meals.reduce((a,x)=>a+x.kcal,0)/mm.calories;
    }
    S.goal='muscle';
    // autre sport déclaré → +150 kcal/j, SAUF si le niveau d'activité le couvre déjà (≥ Actif)
    S.coachQuiz={answers:{othersport:'velo'},done:false};
    out.sportPlus=calcTDEE();
    S.activityLevel=1.9; out.sportActif=Math.round(calcBMR()*1.9)-calcTDEE(); S.activityLevel=1.55;
    S.coachQuiz.answers.othersport='aucun'; out.sportAucun=calcTDEE();
    delete S.coachQuiz.answers.othersport;
    return out.sums=sums,out;
  });
  t('BMR homme 80kg/178cm/30ans = 1768 (Mifflin-St Jeor exact)', approx(r.bmrH,1768), 'reçu '+r.bmrH);
  t('BMR femme = homme − 166 (constante −161 vs +5)', approx(r.bmrH-r.bmrF,166), 'reçu '+(r.bmrH-r.bmrF));
  t('fumeur : +7 % de BMR', approx(r.bmrSmoke,Math.round(r.bmrH*1.07)), 'reçu '+r.bmrSmoke);
  t('profil incomplet → BMR 0 (pas de chiffre inventé)', r.bmrSans===0);
  t('TDEE = BMR × 1.55 (activité) + 0 (bureau)', approx(r.tdee,Math.round(1767.5*1.55)), 'reçu '+r.tdee);
  t('travail physique : +450 kcal', r.tdeePhys-r.tdee===450, 'reçu +'+(r.tdeePhys-r.tdee));
  t('autre sport déclaré (vélo) → +150 kcal/j dans le TDEE', r.sportPlus-r.tdee===150, 'reçu +'+(r.sportPlus-r.tdee));
  t('niveau « Très actif » → PAS de double comptage (+0)', r.sportActif===0, 'reçu écart '+r.sportActif);
  t('« aucun autre sport » → +0', r.sportAucun===r.tdee, r.sportAucun+' vs '+r.tdee);
  t('objectif muscle + phase charge : TDEE +350 +100', r.auto-r.tdee===450, 'reçu +'+(r.auto-r.tdee));
  t('phase sèche : −200 vs charge', r.auto-r.autoSeche===200, 'reçu '+(r.auto-r.autoSeche));
  t('objectif perte : TDEE −450 (déficit)', r.autoPerte-r.tdee===-350, 'reçu '+(r.autoPerte-r.tdee));
  t('protéines muscle = 2.2 g/kg (176 g pour 80 kg)', r.m.prot_g===176, 'reçu '+r.m.prot_g);
  t('lipides muscle = 0.9 g/kg (72 g)', r.m.fat_g===72, 'reçu '+r.m.fat_g);
  t('glucides = le reste des calories (cohérence interne ±10 kcal)',
    approx(r.m.prot_g*4+r.m.fat_g*9+r.m.carbs_g*4, r.m.calories, 10),
    (r.m.prot_g*4+r.m.fat_g*9+r.m.carbs_g*4)+' vs '+r.m.calories);
  t('réglage manuel 1800 respecté + marqué isManual', r.manual.calories===1800&&r.manual.isManual===true);
  t('keto : 5/15/80 % (25 g gluc · 75 g prot · 178 g lip pour 2000)',
    r.keto.carbs_g===25&&r.keto.prot_g===75&&r.keto.fat_g===178, JSON.stringify(r.keto));
  t('calories minuscules → glucides clampés à 0 (jamais négatifs)', r.tiny.carbs_g===0, 'reçu '+r.tiny.carbs_g);
  for(const g of Object.keys(r.sums))
    t('plan de repas « '+g+' » distribue 100 % des calories (±2 %)', approx(r.sums[g],1,0.02), 'reçu '+(r.sums[g]*100).toFixed(1)+' %');
  await c.close();
}

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ 3. Récupération — calcRecoveryDetail, horloge gelée ═══');
{
  // Matin 08:00 — aucune donnée
  const {c,p}=await boot('2026-07-29T08:00:00+02:00',{});
  const r=await p.evaluate(()=>{
    const out={};
    out.vide=calcRecoveryDetail();                       // base neutre 70, pas de séance → 70
    // 3 nuits parfaites
    S.sleepLog=[{date:'2026-07-28',hours:8,quality:4},{date:'2026-07-27',hours:8,quality:4},{date:'2026-07-26',hours:8,quality:4}];
    out.parfait=calcRecoveryDetail();                    // 100
    // 3 nuits catastrophe
    S.sleepLog=[{date:'2026-07-28',hours:3,quality:1},{date:'2026-07-27',hours:3,quality:1},{date:'2026-07-26',hours:3,quality:1}];
    out.cata=calcRecoveryDetail();
    // retour au neutre + une grosse séance HIER SOIR 20h (13 exercices ×4 séries)
    S.sleepLog=[];
    const sets=[];for(let i=0;i<4;i++)sets.push({kg:100,reps:8,done:true,type:'N'});
    const exs=[];for(let i=0;i<5;i++)exs.push({name:'Squat à la Barre',sets:JSON.parse(JSON.stringify(sets))});
    S.sessions=[{date:'2026-07-28',ts:new Date('2026-07-28T20:00:00+02:00').getTime(),exs}];
    out.matinApres=calcRecoveryDetail();                 // d = floor((29/07 08:00 - 28/07 12:00)/24h) = 0 → « même jour » !
    // même donnée, 4 jours de repos
    S.sessions=[{date:'2026-07-25',ts:new Date('2026-07-25T20:00:00+02:00').getTime(),exs}];
    out.repos4j=calcRecoveryDetail();                    // +12
    // âge 60
    S.sessions=[];S.age=60; out.age60=calcRecoveryDetail(); S.age=30;
    // fumeur
    S.smoker=true; out.fumeur=calcRecoveryDetail(); S.smoker=false;
    // état du jour : crevé / douleur
    S.dayState={date:'2026-07-29',energy:0,mood:null,pains:[],note:''};
    out.creve=calcRecoveryDetail();
    S.dayState={date:'2026-07-29',energy:null,mood:null,pains:[{zone:'epaule',side:'L'}],note:''};
    out.douleur=calcRecoveryDetail();
    S.dayState=null;
    // bornes : tout au pire
    S.sleepLog=[{date:'2026-07-28',hours:3,quality:1}];S.age=65;S.smoker=true;
    S.sessions=[{date:'2026-07-29',ts:new Date('2026-07-29T07:30:00+02:00').getTime(),exs},
                {date:'2026-07-28',ts:1,exs},{date:'2026-07-27',ts:1,exs}];
    S.dayState={date:'2026-07-29',energy:0,mood:null,pains:[],note:''};
    out.pire=calcRecoveryDetail();
    return out;
  });
  t('aucune donnée → base neutre 70', r.vide.score===70, 'reçu '+r.vide.score);
  // ⚠️ ATTENTE RÉVISÉE le 02/08 (« le prêt à performer est trop optimiste ») : 8 h ne vaut plus
  // la note maximale — il faut 9 h pour ça. 8 h en qualité 4/4 → 94, ce qui reste « Prêt à
  // performer » (seuil 80) : le haut du barème est atteignable, il se mérite juste un peu plus.
  t('3 nuits parfaites (8 h, excellent) → 94 (100 réservé à 9 h)', r.parfait.score===94, 'reçu '+r.parfait.score);
  t('3 nuits catastrophe (3h, mauvais) → score très bas (< 30)', r.cata.score<30, 'reçu '+r.cata.score);
  t('grosse séance la veille au soir → malus le matin', r.matinApres.score<70, 'reçu '+r.matinApres.score);
  // fin de la marche de midi (30/07) : 4 jours CALENDAIRES de repos = +12, crédités dès le matin
  t('4 jours de repos, vu le MATIN → +12 dès le matin (fin de la marche de midi)', r.repos4j.score===82, 'reçu '+r.repos4j.score);
  t('60 ans → −9', r.age60.score===61, 'reçu '+r.age60.score);
  t('fumeur → −4', r.fumeur.score===66, 'reçu '+r.fumeur.score);
  t('check-in « crevé » → −10', r.creve.score===60, 'reçu '+r.creve.score);
  t('une DOULEUR ne touche PAS le score (70) mais est listée', r.douleur.score===70&&r.douleur.dayPains.length===1,
    'score '+r.douleur.score+' douleurs '+JSON.stringify(r.douleur.dayPains));
  t('pire scénario : borné ≥ 0, jamais négatif', r.pire.score>=0, 'reçu '+r.pire.score);
  await c.close();

  // ✅ FIN DE LA MARCHE DE MIDI (30/07, validé Michel) : la fatigue s'efface EN CONTINU sur 36 h.
  // Le score ne doit plus SAUTER — ni à midi, ni à minuit.
  const seed=`(()=>{const sets=[];for(let i=0;i<4;i++)sets.push({kg:100,reps:8,done:true,type:'N'});
    const exs=[];for(let i=0;i<5;i++)exs.push({name:'Squat',sets:JSON.parse(JSON.stringify(sets))});
    S.sessions=[{date:'2026-07-28',ts:new Date('2026-07-28T20:00:00+02:00').getTime(),exs}];
    return calcRecoveryDetail().score;})()`;
  const m1=await boot('2026-07-29T11:59:00+02:00',{});
  const m2=await boot('2026-07-29T12:01:00+02:00',{});
  const s1=await m1.p.evaluate(seed), s2=await m2.p.evaluate(seed);
  console.log('     ℹ️  séance hier 20h → score à 11h59 = '+s1+' · à 12h01 = '+s2+' (écart '+(s2-s1)+')');
  t('⭐ plus AUCUN saut à midi (11h59 et 12h01 : même score)', s1===s2, s1+' vs '+s2);
  await m1.c.close(); await m2.c.close();
  const n1=await boot('2026-07-29T23:59:00+02:00',{});
  const n2=await boot('2026-07-30T00:01:00+02:00',{});
  const sn1=await n1.p.evaluate(seed), sn2=await n2.p.evaluate(seed);
  t('⭐ plus aucun saut à MINUIT non plus (23h59 → 00h01 : écart ≤ 1)', Math.abs(sn2-sn1)<=1, sn1+' vs '+sn2);
  await n1.c.close(); await n2.c.close();
  // continuité globale : la fatigue s'efface progressivement, sans remonter puis redescendre
  const heures=['2026-07-29T02:00:00+02:00','2026-07-29T08:00:00+02:00','2026-07-29T14:00:00+02:00',
                '2026-07-29T20:00:00+02:00','2026-07-30T02:00:00+02:00','2026-07-30T09:00:00+02:00'];
  const serie=[];
  for(const h of heures){const bx=await boot(h,{});serie.push(await bx.p.evaluate(seed));await bx.c.close();}
  console.log('     ℹ️  effacement de la fatigue (6h→37h après séance) : '+serie.join(' → '));
  t('⭐ le score REMONTE de façon monotone après la séance (jamais de rechute)',
    serie.every((v,i,a)=>i===0||v>=a[i-1]), serie.join(' → '));
  // une vieille séance SANS heure (ts absent) garde l'ancien barème : hier = −8
  const v1=await boot('2026-07-29T08:00:00+02:00',{});
  const sv=await v1.p.evaluate(`(()=>{S.sessions=[{date:'2026-07-28',exs:[{name:'Squat',sets:[{kg:100,reps:8,done:true,type:'N'}]}]}];
    return calcRecoveryDetail().score;})()`);
  // ⚠️ ATTENTE RÉVISÉE le 02/08 : la pénalité d'une séance de la veille passe de −8 à −12,
  // pour rester cohérente avec le barème horaire (qui s'efface désormais sur 48 h, pas 36 h).
  t('séance d\'hier SANS heure enregistrée → barème par jour (−12 → 58)', sv===58, 'reçu '+sv);

  // ── LE SCORE ÉTAIT TROP OPTIMISTE (02/08, retour Michel) — 4 défauts mesurés, figés ici ──
  {
    const {c:cc,p:pp}=await boot('2026-07-29T08:00:00+02:00',{});
    const r2=await pp.evaluate(()=>{
      const o={};
      const sc=(h,q)=>{ S.sleepLog=[{date:'2026-07-28',hours:h,quality:q}]; S.sessions=[];
                        S.dayState=null; S.age=30; S.smoker=false; return calcRecoveryDetail().score; };
      // ① LA MARCHE DES 7 H : avant, 6 h 54 → 53 et 7 h 00 → 77. 24 points pour six minutes.
      o.avant7=sc(6.9,2); o.pile7=sc(7,2); o.saut=Math.abs(o.pile7-o.avant7);
      // le balayage complet : plus AUCUN saut brutal sur toute la plage utile
      let pire=0,prev=null;
      for(let h=3;h<=11.01;h+=0.05){ const v=sc(+h.toFixed(2),3);
        if(prev!==null) pire=Math.max(pire,Math.abs(v-prev)); prev=v; }
      o.pireSaut=pire;
      // ② 7 h n'est plus la note maximale · ③ une mauvaise qualité pèse vraiment
      o.h7q2=sc(7,2); o.h8q3=sc(8,3); o.h9q4=sc(9,4); o.h7q1=sc(7,1);
      // ④ une grosse séance de la veille coûte plus que 10 points
      S.sleepLog=[{date:'2026-07-28',hours:8,quality:3}];
      const sets=[];for(let i=0;i<24;i++)sets.push({kg:100,reps:8,done:true,type:'N'});
      S.sessions=[{date:'2026-07-28',ts:new Date('2026-07-28T08:00:00+02:00').getTime(),
                   exs:[{name:'Squat à la Barre',sets}]}];
      o.grosseSeanceHier=calcRecoveryDetail().score;
      S.sessions=[]; o.memeNuitSansSeance=calcRecoveryDetail().score;
      o.coutSeance=o.memeNuitSansSeance-o.grosseSeanceHier;
      return o;
    });
    t('⭐ plus de MARCHE à 7 h : 6 h 54 et 7 h 00 se tiennent (≤ 2 points d\'écart)',
      r2.saut<=2, '6h54='+r2.avant7+' · 7h00='+r2.pile7+' → écart '+r2.saut);
    t('⭐ aucun saut brutal sur toute la courbe de sommeil (3 h → 11 h)',
      r2.pireSaut<=2, 'plus gros saut mesuré : '+r2.pireSaut+' points pour 3 min');
    t('7 h n\'est plus la note maximale — il faut 8-9 h pour le haut du barème',
      r2.h7q2<r2.h8q3 && r2.h8q3<r2.h9q4, [r2.h7q2,r2.h8q3,r2.h9q4].join(' < '));
    t('une nuit de mauvaise QUALITÉ n\'est plus une « bonne récup »',
      r2.h7q1<60, '7 h qualité 1/4 → '+r2.h7q1);
    t('⭐ une grosse séance la veille coûte vraiment (plus de 10 points)',
      r2.coutSeance>15, 'coût mesuré : '+r2.coutSeance+' points ('+r2.memeNuitSansSeance+' → '+r2.grosseSeanceHier+')');
    t('témoin : bien dormir 9 h reste « Prêt à performer »', r2.h9q4>=80, '9 h qualité 4/4 → '+r2.h9q4);
    await cc.close();
  }
  await v1.c.close();
}

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ 3 bis. APRÈS MINUIT — le bouton « Hier » et les replis de date ═══');
{
  // 00 h 30 : la fenêtre où l'heure de Greenwich donnait encore « hier » (bug corrigé le 30/07)
  const {c,p}=await boot('2026-07-30T00:30:00+02:00',{});
  const r=await p.evaluate(()=>{
    const out={};
    out.today=today();                                    // 2026-07-30 (l'heure du téléphone)
    startWorkout();
    setLogYesterday();                                    // « Hier » = le 29, PAS le 28
    out.hier=S.wkt&&S.wkt.date;
    out.dayOfTs=dayOfTs(new Date('2026-07-30T00:15:00+02:00').getTime()); // séance de 00h15 = aujourd'hui
    return out;
  });
  t('à 00 h 30, today() = le bon jour (2026-07-30)', r.today==='2026-07-30', 'reçu '+r.today);
  t('⭐ le bouton « Hier » date la séance du 29 — plus jamais d\'avant-hier', r.hier==='2026-07-29', 'reçu '+r.hier);
  t('dayOfTs : un ts de 00 h 15 donne le jour d\'aujourd\'hui (repli séance sans date)', r.dayOfTs==='2026-07-30', 'reçu '+r.dayOfTs);
  await c.close();
}

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ 3 ter. Masse maigre calculée sur les ANCIENS bilans (migration 30/07) ═══');
{
  // 3 bilans en stock : ① leanMass ratée par le lecteur (cas Eline) ② leanMass DÉJÀ lue
  // (ne doit jamais être écrasée) ③ poids manquant (on ne peut pas calculer → reste vide)
  const scans=JSON.stringify([
    {date:'2026-07-29',weight:51.85,fatMass:14.1,leanMass:null},
    {date:'2026-06-15',weight:52.4,fatMass:14.8,leanMass:37.4},
    {date:'2026-05-01',fatMass:15.2,leanMass:null},
  ]);
  const {c,p}=await boot(null,{ft4_bodyscans:scans});
  const r=await p.evaluate(()=>({s:S.bodyScans.map(x=>x.leanMass)}));
  t('⭐ bilan d\'Eline : masse maigre CALCULÉE (51.85 − 14.1 = 37.8)', r.s[0]===37.8, 'reçu '+r.s[0]);
  t('une masse maigre déjà LUE n\'est jamais écrasée', r.s[1]===37.4, 'reçu '+r.s[1]);
  t('poids manquant → on ne peut pas calculer, on n\'invente rien', r.s[2]==null, 'reçu '+r.s[2]);
  await c.close();
}

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ 3 quater. Masse grasse ↔ % de gras (audit 31/07, même famille qu\'Eline) ═══');
{
  // Beaucoup de balances n'affichent QUE le % de gras, ou QUE les kg. Les deux se déduisent
  // l'un de l'autre quand le poids est lu — et la chaîne doit aboutir jusqu'à la masse maigre.
  const scans=JSON.stringify([
    {date:'2026-07-01',weight:80,bf:25,fatMass:null,leanMass:null},   // % seul → kg PUIS masse maigre
    {date:'2026-06-01',weight:80,bf:null,fatMass:16,leanMass:null},   // kg seul → % déduit
    {date:'2026-05-01',weight:80,bf:24,fatMass:20.5,leanMass:null},   // les DEUX lus → aucun n'est recalculé
  ]);
  const {c,p}=await boot(null,{ft4_bodyscans:scans});
  const r=await p.evaluate(()=>({s:S.bodyScans.map(x=>({bf:x.bf,fm:x.fatMass,lm:x.leanMass}))}));
  t('⭐ % de gras seul → masse grasse CALCULÉE (80 × 25 % = 20 kg)', r.s[0].fm===20, 'reçu '+r.s[0].fm);
  t('⭐ … et la CHAÎNE aboutit : masse maigre = 80 − 20 = 60', r.s[0].lm===60, 'reçu '+r.s[0].lm);
  t('masse grasse seule → % déduit (16/80 = 20 %)', r.s[1].bf===20, 'reçu '+r.s[1].bf);
  t('les deux valeurs LUES ne sont jamais recalculées (24 % et 20.5 kg restent tels quels)',
    r.s[2].bf===24&&r.s[2].fm===20.5, r.s[2].bf+' / '+r.s[2].fm);
  await c.close();
}

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ 4. Niveaux de force — getLevel ═══');
{
  const {c,p}=await boot(null,{});
  const r=await p.evaluate(()=>({
    elite:getLevel('Squat à la Barre',120,80,'H',30),        // ratio 1.5 = seuil Élite
    juste:getLevel('Squat à la Barre',119,80,'H',30),        // 1.4875 → Avancé
    deb:getLevel('Squat à la Barre',40,80,'H',30),           // 0.5 → Débutant
    fInter:getLevel('Squat à la Barre',48,60,'F',30),        // 0.80 → F seuils .5/.7/.9/1.1 → Intermédiaire
    fAv:getLevel('Squat à la Barre',56,60,'F',30),           // 0.933 → Avancé
    age50:getLevel('Squat à la Barre',108.5,80,'H',50),      // corr .90 → seuils ×.9 : 1.356 ≥ 1.35 → Élite
    inconnu:getLevel('Curl Biceps',50,80,'H',30),
    sans:getLevel('Squat à la Barre',0,80,'H',30),
  }));
  t('H 80kg squat 120 = ratio 1.50 → Élite', r.elite.name==='Élite', 'reçu '+r.elite.name);
  t('H squat 119 (1.49) → Avancé', r.juste.name==='Avancé', 'reçu '+r.juste.name);
  t('H squat 40 (0.5) → Débutant', r.deb.name==='Débutant', 'reçu '+r.deb.name);
  t('F 60kg squat 48 (0.80) → Intermédiaire (seuils féminins distincts)', r.fInter.name==='Intermédiaire', 'reçu '+r.fInter.name);
  t('F 60kg squat 56 (0.93) → Avancé', r.fAv.name==='Avancé', 'reçu '+r.fAv.name);
  t('50 ans : seuils réduits de 10 % (même mérite)', r.age50.name==='Élite', 'reçu '+r.age50.name);
  t('exercice hors référentiel → « — » (pas de niveau inventé)', r.inconnu.name==='—', 'reçu '+r.inconnu.name);
  t('1RM absent → « — »', r.sans.name==='—');
  await c.close();
}

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ 5. Calculateur de plaques — calcPlatesArr ═══');
{
  const {c,p}=await boot(null,{});
  const r=await p.evaluate(()=>{
    const cases=[[100,20],[102.5,20],[60,20],[20,20],[15,20],[47.5,20],[247.5,20],[100.7,20]];
    return cases.map(([t,bar])=>{
      const a=calcPlatesArr(t,bar);
      return {t,bar,a,sum:a?bar+2*a.reduce((x,y)=>x+y,0):null};
    });
  });
  for(const x of r){
    if(x.a===null){ t('cible '+x.t+' < barre → null (impossible)', x.t<x.bar, 'a='+JSON.stringify(x.a)); continue; }
    const exact=Math.abs(x.sum-x.t)<0.75; // au pire l'arrondi d'une demi-plaque de 0.5
    t('cible '+x.t+' kg : plaques '+JSON.stringify(x.a)+' → '+x.sum+' kg', exact||x.t===100.7, 'somme '+x.sum);
    if(x.t===100.7)console.log('     ℹ️  charge non atteignable (100.7) → rend '+x.sum+' (le mieux possible)');
  }
  const desc=await p.evaluate(()=>calcPlatesArr(100,20).every((v,i,a)=>i===0||v<=a[i-1]));
  t('plaques rendues de la plus lourde à la plus légère', desc);
  await c.close();
}

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ 6. Cardio + calories de séance ═══');
{
  const {c,p}=await boot(null,{});
  const r=await p.evaluate(()=>{
    const out={};
    out.velo60=calcCardioKcal({type:'velo',intensity:'modere',duration:60});   // 6.8*80 = 544
    out.corde30i=calcCardioKcal({type:'corde',intensity:'intense',duration:30});// 12*80*.5 = 480
    out.zero=calcCardioKcal({type:'velo',intensity:'modere',duration:0});
    out.inconnu=calcCardioKcal({type:'trottinette',intensity:'modere',duration:60}); // → autre 5.5*80=440
    out.null_=calcCardioKcal(null);
    // séance simple : 1 exo, 4 séries → 4×30 s actives + 3×120 s repos + 10 min forfait
    const sess={exs:[{name:'Squat à la Barre',sets:[1,2,3,4].map(()=>({kg:100,reps:8,done:true,type:'N'}))}]};
    const cd=calcSessionCalories(sess);
    out.cd=cd;
    // à la main : actif 6.5*80*(120/3600)=17.33 ; repos 2*80*(360/3600)=16 ; échauffement 3.5*80*(1/6)=46.67 → 80
    out.attendu=Math.round(6.5*80*(4*30/3600)+2*80*(3*120/3600)+3.5*80*(10/60));
    out.sommeBreakdown=Object.values(cd.breakdown).reduce((a,b)=>a+b,0);
    // une séance VIDE facture quand même l'échauffement
    out.vide=calcSessionCalories({exs:[]}).total;                      // 46.67 → 47
    // le temps de repos réel de l'utilisateur est-il utilisé ? (defRest 120 vs 60)
    S.defRest=60; out.rest60=calcSessionCalories(sess).total; S.defRest=120;
    return out;
  });
  t('vélo modéré 60 min (80 kg) = 544 kcal (MET 6.8)', r.velo60===544, 'reçu '+r.velo60);
  t('corde intense 30 min = 480 kcal (MET 12)', r.corde30i===480, 'reçu '+r.corde30i);
  t('durée 0 → 0 kcal', r.zero===0);
  t('type inconnu → barème « autre » (440)', r.inconnu===440, 'reçu '+r.inconnu);
  t('cardio null → 0 (pas de plantage)', r.null_===0);
  t('séance 4 séries : total = actif + repos + échauffement ('+r.attendu+')', approx(r.cd.total,r.attendu,1), 'reçu '+r.cd.total);
  t('le détail par exercice colle au total (hors échauffement)', approx(r.cd.total-r.sommeBreakdown,47,2),
    'écart '+(r.cd.total-r.sommeBreakdown));
  t('⚠️ QUIRK : une séance sans aucune série validée facture quand même 47 kcal d\'échauffement', r.vide===47, 'reçu '+r.vide);
  t('le temps de repos du profil (defRest) change bien le calcul', r.rest60<r.cd.total, r.rest60+' vs '+r.cd.total);
  await c.close();
}

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ 7. Badges + streak ═══');
{
  const {c,p}=await boot(null,{});
  const r=await p.evaluate(()=>{
    const out={};
    const mk=d=>({date:d,exs:[{name:'Squat à la Barre',sets:[{kg:100,reps:5,done:true,type:'N'}]}]});
    S.sessions=[mk('2026-07-20'),mk('2026-07-21'),mk('2026-07-22'),mk('2026-07-24')];
    out.streak=_getMaxStreak();                                        // 3
    S.sessions=[mk('2026-07-20'),mk('2026-07-20'),mk('2026-07-21')];   // doublon même jour
    out.streakDoublon=_getMaxStreak();                                 // 2
    // club_100 : le badge lit le KG soulevé, pas le 1RM estimé
    S.prs={'Squat à la Barre':{kg:95,reps:5,rm1:107,date:'2026-07-28'}};
    out.club100rm=_checkBadgeCond({id:'club_100'});                    // false attendu (95 kg)
    S.prs={'Squat à la Barre':{kg:100,reps:1,rm1:100,date:'2026-07-28'}};
    out.club100kg=_checkBadgeCond({id:'club_100'});                    // true
    // fire : 3 séances même semaine ISO
    S.sessions=[mk('2026-07-27'),mk('2026-07-29'),mk('2026-07-31')];   // lun/mer/ven même semaine
    out.fire=_checkBadgeCond({id:'fire'});
    S.sessions=[mk('2026-07-25'),mk('2026-07-27'),mk('2026-08-03')];   // à cheval sur 3 semaines
    out.fireNo=_checkBadgeCond({id:'fire'});
    return out;
  });
  t('streak : 3 jours consécutifs comptés juste (trou → reset)', r.streak===3, 'reçu '+r.streak);
  t('deux séances le même jour ne gonflent pas le streak', r.streakDoublon===2, 'reçu '+r.streakDoublon);
  // ⚠️ la fonction rend `undefined` (pas `false`) quand le DC n'a pas de PR — comportement juste, type flou
  t('club des 100 : lit la CHARGE réelle (95 kg + 1RM 107 → pas débloqué)', !r.club100rm, 'reçu '+r.club100rm);
  t('club des 100 : 100 kg soulevés → débloqué', r.club100kg===true);
  t('« En feu » : 3 séances la même semaine ISO → oui', r.fire===true);
  t('« En feu » : 3 séances sur 3 semaines → non', r.fireNo===false);
  await c.close();
}

// ════════════════════════════════════════════════════════════════════
console.log('\n═══ 8. Cycle de force ═══');
{
  const {c,p}=await boot(null,{});
  const r=await p.evaluate(()=>{
    const out={sommes:{},pcts:[]};
    for(let w=6;w<=16;w++){const d=phaseDistrib(w);out.sommes[w]=d.acc+d.int+d.peak+d.del;}
    for(let w=1;w<=12;w++){const pl=getWeekPlan(w,12);out.pcts.push(pl.pct);}
    out.phases12=[getWeekPlan(1,12).phase,getWeekPlan(6,12).phase,getWeekPlan(10,12).phase,getWeekPlan(12,12).phase];
    S.prs={};S.age=30;
    out.proj=projectRM(100,12);                    // débutant .009*1.1*12 = +11.9 %
    S.age=55; out.proj55=projectRM(100,12); S.age=30;
    out.round=[round25(101.2),round25(101.3),round25(98.7)];
    S.cycle={startDate:'2026-07-29',weeks:12}; out.sem1=getCurrentCycleWeek();
    S.cycle={startDate:'2026-01-01',weeks:12}; out.semCap=getCurrentCycleWeek();
    S.cycle=null;
    return out;
  });
  t('phaseDistrib : les phases totalisent TOUJOURS le nombre de semaines (6→16)',
    Object.entries(r.sommes).every(([w,s])=>+w===s), JSON.stringify(r.sommes));
  t('progression des % : 70→77 (acc) · 80→87 (int) · 90→97 (peak) · 55 (décharge)',
    r.pcts[0]===70&&r.pcts[r.pcts.length-1]===55&&Math.max(...r.pcts)<=98, JSON.stringify(r.pcts));
  t('les 4 phases sortent dans le bon ordre', JSON.stringify(r.phases12)===JSON.stringify(['Accumulation','Intensification','Peak','Décharge']), JSON.stringify(r.phases12));
  t('projection 12 sem (débutant 30 ans) ≈ +12 % (réaliste, pas de miracle)', r.proj>110&&r.proj<114, 'reçu '+r.proj);
  t('à 55 ans la projection est plus modeste', r.proj55<r.proj, r.proj55+' vs '+r.proj);
  t('arrondi à 2.5 kg près (98.7 → 97.5, le plus proche)', JSON.stringify(r.round)===JSON.stringify([100,102.5,97.5]), JSON.stringify(r.round));
  t('cycle démarré aujourd\'hui → semaine 1', r.sem1===1, 'reçu '+r.sem1);
  t('cycle dépassé → plafonné à la dernière semaine', r.semCap===12, 'reçu '+r.semCap);
  await c.close();
}

console.log('\n═══ 9. Les repas suggérés respectent le RÉGIME (kéto, végé, végan, restrictions) ═══');
// (02/08, demande d'Emma via Michel. Mesuré AVANT : Emma en kéto — 18 g de glucides autorisés —
// se voyait proposer pain complet, légumineuses et quinoa : 5 repas sur 6 contredisaient son
// régime. Un végan : œufs, yaourt, poulet. L'app collectait le régime, calculait juste, le
// disait à Milo… et l'oubliait au moment de suggérer. R4.)
{
  const {c,p}=await boot('2026-08-02T09:00:00+02:00',{});
  const r=await p.evaluate(()=>{
   try{
    const GLUC=/avoine|riz|banane|pâtes|pain(?! sans gluten| aux graines)|patate|quinoa|dattes|légumineuses|lentilles|céréale/i;
    const VIANDE=/poulet|bœuf|thon|saumon|poisson|dinde|jambon/i;
    const ANIMAL=/œuf|yaourt(?! de soja)|fromage(?! blanc sans)|whey|lait(?! de soja| sans lactose)|poulet|bœuf|thon|saumon|poisson|dinde|jambon/i;
    const essai=(setup,filtre)=>{
      S.keto=false;S.diet='';S.dietRestrictions=[];S.goal='muscle';S.bw=60;setup();
      const meals=getMeals(calcMacros('normal'),'normal');
      return {n:meals.length, ko:meals.filter(m=>filtre.test(m.desc)).map(m=>m.desc.split('—')[0].trim()),
              descs:meals.map(m=>m.desc)};
    };
    const o={};
    o.keto=essai(()=>{S.keto=true;},GLUC);
    o.vegetarien=essai(()=>{S.diet='vegetarien';},VIANDE);
    o.vegan=essai(()=>{S.diet='vegan';},ANIMAL);
    o.sansGluten=essai(()=>{S.dietRestrictions=['sansgluten'];},/pain complet|pâtes(?! de riz)|avoine/i);
    o.sansLactose=essai(()=>{S.dietRestrictions=['sanslactose'];},/yaourt grec|fromage blanc 0|whey/i);
    // CAS CROISÉ : kéto ET végan (le plan kéto doit AUSSI passer par les substitutions)
    o.ketoVegan=essai(()=>{S.keto=true;S.diet='vegan';},ANIMAL);
    // TÉMOIN : sans aucun régime, les plans classiques ne doivent PAS être dénaturés
    o.temoin=essai(()=>{},/tofu|tempeh|pois chiches|soja/i);
    // la casse : « poulet » en minuscule doit être remplacé comme « Poulet »
    o.casse=essai(()=>{S.diet='vegetarien';},/poulet/i).ko.length;
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐ KÉTO : aucun repas riche en glucides (avant : 5 sur 6)',
    r.keto&&r.keto.ko.length===0, JSON.stringify(r.keto&&r.keto.ko));
  t('le plan kéto est un plan DÉDIÉ (pas une substitution mot à mot)',
    r.keto&&/avocat/i.test(r.keto.descs.join(' ')), (r.keto&&r.keto.descs[0])||'');
  t('⭐ VÉGAN : plus aucun produit animal (avant : 5 sur 6)',
    r.vegan&&r.vegan.ko.length===0, JSON.stringify(r.vegan&&r.vegan.ko));
  t('VÉGÉTARIEN : plus de viande ni de poisson', r.vegetarien&&r.vegetarien.ko.length===0,
    JSON.stringify(r.vegetarien&&r.vegetarien.ko));
  t('SANS GLUTEN et SANS LACTOSE respectés',
    r.sansGluten&&r.sansGluten.ko.length===0&&r.sansLactose&&r.sansLactose.ko.length===0,
    JSON.stringify([r.sansGluten&&r.sansGluten.ko,r.sansLactose&&r.sansLactose.ko]));
  t('⭐ cas croisé KÉTO + VÉGAN : les deux tiennent en même temps',
    r.ketoVegan&&r.ketoVegan.ko.length===0, JSON.stringify(r.ketoVegan&&r.ketoVegan.ko));
  t('la casse est gérée (« poulet » en minuscule aussi remplacé)', r.casse===0, 'restants : '+r.casse);
  t('TÉMOIN : sans régime déclaré, les plans classiques restent intacts',
    r.temoin&&r.temoin.ko.length===0, JSON.stringify(r.temoin&&r.temoin.ko));

  // ── ALIMENTS À ÉVITER (Michel : « dans le profil aussi on met les aliments qu'on ne mange pas »)
  // Mesuré AVANT : Emma déclarait « fruits à coque » et le plan kéto lui proposait « Amandes »
  // puis « noix de macadamia ». La carte du profil promet pourtant : « jamais un aliment que
  // tu ne manges pas ». Erreur potentiellement GRAVE (allergie) → on remplace quand c'est sûr,
  // et on SIGNALE dans tous les autres cas plutôt que d'inventer (R29).
  const al=await p.evaluate(()=>{
   try{
    if(typeof mealAlertes!=='function')return {erreur:'mealAlertes absente'};
    const o={};
    const pose=(notes,keto)=>{ S.keto=!!keto;S.diet='';S.dietRestrictions=[];S.dietNotes=notes;S.bw=58;S.goal='perte';
      const m=getMeals(calcMacros('normal'),'normal');
      return {descs:m.map(x=>x.desc), alertes:m.map(x=>mealAlertes(x.desc)).filter(a=>a.length)}; };
    // ① une CATÉGORIE déclarée doit attraper ses membres (fruits à coque → amandes, macadamia)
    const a1=pose('fruits à coque',true);
    o.plusDeFruitsACoque=!a1.descs.some(d=>/amande|macadamia|noix de cajou/i.test(d));
    o.aucuneAlerteRestante=a1.alertes.length===0;
    o.casse=a1.descs.some(d=>/^Graines de courge/.test(d));   // majuscule conservée en début de ligne
    // ② un aliment qu'on ne sait PAS remplacer doit être signalé, pas ignoré
    const a2=pose('brocolis',true);
    o.signale=a2.alertes.length>0&&a2.alertes[0].indexOf('brocolis')>=0;
    // ③ TÉMOIN : sans rien déclarer, aucune alerte et le plan n'est pas dénaturé
    const a3=pose('',true);
    o.temoinAucuneAlerte=a3.alertes.length===0;
    o.temoinPlanIntact=a3.descs.some(d=>/Amandes/.test(d));
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐ une CATÉGORIE déclarée attrape ses membres (« fruits à coque » → amandes, macadamia)',
    al.plusDeFruitsACoque&&al.aucuneAlerteRestante, JSON.stringify(al).slice(0,180));
  t('l\'aliment de remplacement garde la casse en début de ligne', al.casse, String(al.casse));
  t('⭐ un aliment qu\'on ne sait PAS remplacer est SIGNALÉ, pas ignoré (R29)',
    al.signale, JSON.stringify(al).slice(0,180));
  t('TÉMOIN : sans aliment à éviter, aucune alerte et le plan reste intact',
    al.temoinAucuneAlerte&&al.temoinPlanIntact, JSON.stringify(al).slice(0,180));

  // ── LES 4 MODES ALIMENTAIRES + LE JEÛNE (Michel, 02/08 : « lance les autres régimes ») ──
  // Modes EXCLUSIFS entre eux (on n'est pas kéto ET low carb) ; le jeûne est INDÉPENDANT :
  // c'est un horaire, pas des macros — les calories du jour ne changent pas.
  const md=await p.evaluate(()=>{
   try{
    if(typeof setFoodMode!=='function')return {erreur:'setFoodMode absente'};
    const pose=(mode,fast)=>{ S.foodMode=mode||'';S.keto=(mode==='keto');S.fasting=fast||'';
      S.diet='';S.dietRestrictions=[];S.dietNotes='';S.bw=75;S.goal='muscle';S.age=35;S.height=178;S.activityLevel=1.55;
      const m=calcMacros('normal'), meals=getMeals(m,'normal');
      return {kcal:m.calories,P:m.prot_g,L:m.fat_g,G:m.carbs_g,n:meals.length,
              noms:meals.map(x=>x.name),descs:meals.map(x=>x.desc).join(' | ')}; };
    const o={};
    o.aucun=pose(''); o.keto=pose('keto'); o.lowcarb=pose('lowcarb');
    o.paleo=pose('paleo'); o.medit=pose('mediterraneen');
    o.jeune=pose('','16-8'); o.jeuneKeto=pose('keto','20-4');
    // exclusivité : activer un mode puis un autre ne laisse QUE le dernier
    S.foodMode=''; setFoodMode('keto'); setFoodMode('lowcarb'); o.exclusif=S.foodMode;
    setFoodMode('lowcarb'); o.retapeDesactive=S.foodMode;  // re-cliquer désactive
    S.foodMode=''; S.keto=false; S.fasting='';
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐ LOW CARB : glucides réduits mais bien plus qu\'en kéto (il reste de quoi s\'entraîner)',
    md.lowcarb&&md.keto&&md.lowcarb.G>md.keto.G*3&&md.lowcarb.G<md.aucun.G,
    'kéto '+(md.keto&&md.keto.G)+' g · low carb '+(md.lowcarb&&md.lowcarb.G)+' g · normal '+(md.aucun&&md.aucun.G)+' g');
  t('PALÉO et MÉDITERRANÉEN ne changent PAS les macros (ce sont des choix d\'aliments)',
    md.paleo&&md.paleo.G===md.aucun.G&&md.medit&&md.medit.G===md.aucun.G,
    'paléo '+(md.paleo&&md.paleo.G)+' · médit '+(md.medit&&md.medit.G)+' · normal '+(md.aucun&&md.aucun.G));
  t('… mais ils changent bien les REPAS suggérés',
    md.paleo&&!/avoine|pain complet/i.test(md.paleo.descs)&&md.medit&&/huile d'olive/i.test(md.medit.descs),
    (md.paleo&&md.paleo.descs.slice(0,60))+' ‖ '+(md.medit&&md.medit.descs.slice(0,60)));
  t('⭐ JEÛNE : plus de petit-déjeuner, mais les CALORIES du jour ne changent pas',
    md.jeune&&md.jeune.kcal===md.aucun.kcal&&md.jeune.n===md.aucun.n-1
    &&!md.jeune.noms.some(n=>/petit-déjeuner/i.test(n))&&md.jeune.noms.some(n=>/jeûne/i.test(n)),
    JSON.stringify(md.jeune&&md.jeune.noms));
  t('jeûne ET mode se combinent (kéto 20/4)',
    md.jeuneKeto&&md.jeuneKeto.G<40&&!md.jeuneKeto.noms.some(n=>/petit-déjeuner/i.test(n)),
    JSON.stringify(md.jeuneKeto&&[md.jeuneKeto.G,md.jeuneKeto.noms[0]]));
  t('les modes sont EXCLUSIFS · re-cliquer sur le mode actif le désactive',
    md.exclusif==='lowcarb'&&md.retapeDesactive==='', md.exclusif+' → '+md.retapeDesactive);
  await c.close();
}

// ── RÉTROCOMPATIBILITÉ : un compte qui avait l'ANCIEN interrupteur kéto (ft4_keto=1) doit se
// retrouver en mode 'keto', sans rien perdre. C'est le seul vrai risque du changement.
{
  const {c,p}=await boot('2026-08-02T09:00:00+02:00',{ft4_keto:'1'});
  const r=await p.evaluate(()=>({mode:S.foodMode,alias:S.keto,
    glucides:(S.bw=75,S.height=178,S.age=35,S.activityLevel=1.55,calcMacros('normal').carbs_g)}));
  t('⭐ RÉTROCOMPAT : un compte déjà en kéto retrouve son régime (ancien interrupteur)',
    r.mode==='keto'&&r.alias===true&&r.glucides<40, JSON.stringify(r));
  await c.close();
}

await b.close(); srv.close();
console.log('\n════ TOTAL LINÉAIRE : '+ok+' ✅ · '+ko+' ❌ ════');
process.exit(ko?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
