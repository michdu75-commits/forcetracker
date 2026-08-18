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
// 2 bis. LE MÉTABOLISME DE BASE SELON LA MASSE MAIGRE (11/08/2026)
// Michel : « on tient compte dans l'appli de la valeur de base du métabolisme de la
// balance ? » — la réponse était NON : la donnée était stockée, affichée, envoyée à Milo,
// et n'entrait dans aucun calcul (R5, la donnée morte).
// ⚠️ CE QUE CES TÉMOINS PROTÈGENT, ce n'est pas Katch-McArdle : c'est le REFUS de l'employer
// quand la mesure n'est plus la sienne d'aujourd'hui. Une composition corporelle de mars
// appliquée en août produirait un chiffre FAUX présenté comme PRÉCIS — pire que l'estimation
// grossière qu'on remplace (R29 : le droit de deviner dépend du coût de l'erreur, et ici la
// personne règle son alimentation dessus).
console.log('\n═══ 2 bis. BMR : Katch-McArdle quand la masse maigre est connue ═══');
{
  const {c,p}=await boot(null,{});
  const r=await p.evaluate(()=>{
   try{
    const out={};
    const jour=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().slice(0,10);};
    S.bw=80;S.height=178;S.age=30;S.gender='H';S.smoker=false;S.bodyScans=[];S.weightLog=[];
    out.mifflin=calcBMR();                                    // 1768, aucune mesure

    // ① bilan RÉCENT avec masse maigre → Katch-McArdle
    S.bodyScans=[{date:jour(10),weight:80,leanMass:65}];
    out.katch=calcBMR();                                      // 370 + 21.6*65 = 1774
    out.katchAttendu=Math.round(370+21.6*65);
    out.methode=bmrDetail().methode;
    out.ecart=bmrDetail().kcal-bmrDetail().mifflin;
    out.tdeeSuit=calcTDEE()===Math.round(out.katch*S.activityLevel); // le TDEE suit vraiment

    // ② une masse maigre PLUS ÉLEVÉE fait monter le chiffre (le muscle consomme)
    S.bodyScans=[{date:jour(10),weight:80,leanMass:70}];
    out.katchPlus=calcBMR();
    out.monteAvecMuscle=out.katchPlus>out.katch;

    // ③ FUMEUR : le +7 % s'applique AUSSI à Katch (c'est un effet du tabac, pas un
    //    correctif de formule — sinon arrêter de fumer ferait « sauter » 100 kcal
    //    juste en changeant de source de mesure)
    S.smoker=true; out.katchFume=calcBMR(); S.smoker=false;
    out.fumeOk=out.katchFume===Math.round(out.katchPlus*1.07);

    // ④ bilan TROP ANCIEN (> 90 j) → retour à Mifflin, avec la raison écrite
    S.bodyScans=[{date:jour(200),weight:80,leanMass:70}];
    out.vieux=calcBMR(); out.vieuxMethode=bmrDetail().methode; out.vieuxRaison=bmrDetail().raison;

    // ⑤ le POIDS A BOUGÉ de plus de 5 % → Mifflin aussi : on ne sait pas si c'est du
    //    muscle ou du gras, et l'inventer fausserait la seule chose qu'on mesurait
    S.bodyScans=[{date:jour(10),weight:70,leanMass:60}];
    out.derive=calcBMR(); out.deriveMethode=bmrDetail().methode; out.deriveRaison=bmrDetail().raison;

    // ⑥ une PESÉE avec % de gras marche aussi, et la source la PLUS RÉCENTE gagne
    S.bodyScans=[{date:jour(60),weight:80,leanMass:60}];
    S.weightLog=[{date:jour(2),bw:80,bf:20}];                 // → masse maigre 64
    out.viaPesee=calcBMR(); out.viaPeseeAttendu=Math.round(370+21.6*64);
    out.sourceLaPlusRecente=bmrDetail().lm&&bmrDetail().lm.src;

    // ⑦ une masse maigre ABSURDE ou absente ne casse rien
    S.bodyScans=[{date:jour(5),weight:80,leanMass:0}]; S.weightLog=[];
    out.zero=calcBMR(); out.zeroMethode=bmrDetail().methode;
    S.bw=0; out.sansProfil=calcBMR(); S.bw=80;
    S.bodyScans=[]; S.weightLog=[];
    return out;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  const tb=(n,c2,x)=>t(n, !r.erreur && c2, r.erreur||x);
  if(r.erreur) t('⛔ le bloc BMR s\'exécute (aucun témoin ci-dessous ne vaut sans ça)', false, r.erreur);
  tb('sans aucune mesure de composition : Mifflin (1768), comme avant', r.mifflin===1768, 'reçu '+r.mifflin);
  tb('⭐⭐ bilan récent → Katch-McArdle : 370 + 21,6 × masse maigre',
    r.katch===r.katchAttendu&&r.methode==='katch', r.katch+' vs '+r.katchAttendu+' ('+r.methode+')');
  tb('⭐ le TDEE suit vraiment le nouveau BMR (sinon le calcul ne sert à rien)', r.tdeeSuit===true);
  tb('plus de masse maigre → plus de métabolisme (le muscle consomme au repos)', r.monteAvecMuscle===true);
  tb('⭐ le +7 % fumeur s\'applique aussi à Katch (c\'est le tabac, pas la formule)', r.fumeOk===true);
  tb('⭐⭐ bilan de plus de 90 jours → REFUSÉ, retour à Mifflin',
    r.vieuxMethode==='mifflin'&&/ancien/.test(r.vieuxRaison||''), r.vieuxMethode+' · '+r.vieuxRaison);
  tb('⭐⭐ poids qui a bougé de plus de 5 % → REFUSÉ aussi (muscle ou gras ? on ne sait pas)',
    r.deriveMethode==='mifflin'&&/poids/.test(r.deriveRaison||''), r.deriveMethode+' · '+r.deriveRaison);
  tb('une pesée avec % de gras suffit — et la mesure la PLUS RÉCENTE gagne',
    r.viaPesee===r.viaPeseeAttendu&&r.sourceLaPlusRecente==='pesée',
    r.viaPesee+' vs '+r.viaPeseeAttendu+' ('+r.sourceLaPlusRecente+')');
  tb('masse maigre à 0 → Mifflin, aucun chiffre absurde', r.zeroMethode==='mifflin'&&r.zero===1768, 'reçu '+r.zero);
  tb('profil incomplet → toujours 0 (on n\'invente pas)', r.sansProfil===0, 'reçu '+r.sansProfil);
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
    /* ⏱️ CE TÉMOIN A CHANGÉ DE VALEUR LE 16/08 (ft-v874), volontairement — pas de bug ici.
       Avant, le total valait exactement la formule FABRIQUÉE (4×30 s + 3×120 s = 8 min).
       Depuis, la partie musculation est MISE À L'ÉCHELLE de la durée retenue par
       `_dureeSeanceMin` — ici l'estimation, 4 × (30 s + repos réglé). Ce que le témoin
       protège n'a pas bougé : le MET n'est pas touché, seule l'échelle de temps l'est.
       ⚠️ L'attendu se CALCULE, il ne se recopie pas — sinon il faudrait le réécrire à chaque
       changement de réglage de repos. */
    out.dFormule = 4*30/60 + 3*120/60;                                   // 8 min : l'ancienne durée
    out.dRetenue = (typeof _dureeSeanceMin==='function')                  // ce que l'app retient
                     ? _dureeSeanceMin(sess, 4, out.dFormule).min : out.dFormule;
    out.metRepos=MET_REST;         // figés par leurs propres témoins, ci-dessous
    out.metTransit=(typeof MET_TRANSITION!=='undefined')?MET_TRANSITION:null;
    /* ⏱️ L'ATTENDU SUIT LES TROIS ÉTATS DU MODÈLE (ft-v876) : la série (temps déduit des reps),
       le repos entre séries, et le RESTE — décharger, ranger, traverser la salle. Il se calcule
       à partir des mêmes constantes que le code : un attendu recopié à la main devient faux au
       premier réglage qui bouge, et c'est arrivé deux fois en deux versions. */
    const _ss = (typeof _secSerie==='function') ? _secSerie : (()=>30);   // absent avant ft-v876
    out.actifSec = sess.exs[0].sets.reduce((a,x)=>a+_ss(x),0);           // 4 × (10 + 8×3) = 136 s
    out.dFormule = (out.actifSec + 3*120)/60;
    out.dRetenue = (typeof _dureeSeanceMin==='function')
                     ? _dureeSeanceMin(sess, 4, out.dFormule).min : out.dFormule;
    out.transitMin = Math.max(0, out.dRetenue - out.dFormule);
    out.attendu=Math.round(6.5*80*(out.actifSec/3600) + MET_REST*80*(3*120/3600)
                           + (out.metTransit||0)*80*(out.transitMin/60) + 3.5*80*(10/60));
    // une série de 3 reps et une de 12 ne durent pas pareil — et ne coûtent donc pas pareil
    const troisReps = {exs:[{name:'Squat à la Barre',sets:[1,2,3,4,5].map(()=>({kg:140,reps:3,done:true,type:'N'}))}],duration:70*60};
    const douzeReps = {exs:[{name:'Squat à la Barre',sets:[1,2,3,4,5].map(()=>({kg:80,reps:12,done:true,type:'N'}))}],duration:70*60};
    out.kcal3  = calcSessionCalories(troisReps).total;
    out.kcal12 = calcSessionCalories(douzeReps).total;
    out.sec3   = _ss({reps:3});
    out.sec12  = _ss({reps:12});
    out.secVide= _ss({});          // aucune rep notée → l'ancien forfait
    out.secFou = _ss({reps:400});  // gainage compté en secondes → plafonné
    /* 🏋️ LA CHARGE RELATIVE (ft-v879) — Michel : « fais le MET qui tient compte du % de la
       charge max ». L'ampleur est bornée par l'écart PUBLIÉ entre effort modéré (3,5) et
       vigoureux (6,0) du Compendium, soit 1,71 ; on reste à 1,53 (0,85 → 1,30). */
    const _fc = (typeof _facteurCharge==='function') ? _facteurCharge : (()=>1);
    out.fc = {p40:+_fc(40,100).toFixed(3), p72:+_fc(72,100).toFixed(3),
              p90:+_fc(90,100).toFixed(3), p100:+_fc(100,100).toFixed(3)};
    out.fcSansMax  = _fc(100,0);      // aucun maximum connu → aucune modulation
    out.fcAberrant = _fc(500,100);    // 500 % du max → donnée fausse, on ne module pas
    const memoPrs=S.prs; S.prs={'Développé Couché':{rm1:100}};
    const mkC=kg=>({date:'2026-08-16',duration:60*60,exs:[{name:'Développé Couché',
      sets:[1,2,3,4].map(()=>({kg,reps:5,done:true,type:'N'}))}]});
    out.kcalLeger=calcSessionCalories(mkC(60)).total;
    out.kcalLourd=calcSessionCalories(mkC(92)).total;
    S.prs={}; out.kcalSansRepere=calcSessionCalories(mkC(92)).total;
    S.prs=memoPrs;
    out.sommeBreakdown=Object.values(cd.breakdown).reduce((a,b)=>a+b,0);
    // une séance VIDE facture quand même l'échauffement
    out.vide=calcSessionCalories({exs:[]}).total;                      // 46.67 → 47
    // le temps de repos réel de l'utilisateur est-il utilisé ? (defRest 120 vs 60)
    S.defRest=60; out.rest60=calcSessionCalories(sess).total; S.defRest=120;

    // ── LE DOUBLE COMPTAGE DE L'ÉCHAUFFEMENT (bug trouvé le 11/08/2026) ────────────
    // Le forfait de 10 min était ajouté SANS CONDITION, puis `finishWorkout` ajoutait
    // par-dessus le cardio réellement noté → les mêmes minutes payées deux fois.
    // Ces témoins figent la règle : une mesure chasse l'estimation du MÊME moment,
    // et une séance SANS cardio noté ne bouge pas d'un kcal.
    const c10={type:'tapis',intensity:'modere',duration:10};
    const s_av={exs:sess.exs,cardioAvant:c10};
    const s_ap={exs:sess.exs,cardio:c10};
    const s_2 ={exs:sess.exs,cardioAvant:c10,cardio:c10};
    out.fSans =calcSessionCalories(sess).warmupMin;   // 10 : rien de mesuré
    out.fAvant=calcSessionCalories(s_av).warmupMin;   //  5 : l'échauffement est mesuré
    out.fApres=calcSessionCalories(s_ap).warmupMin;   //  5 : le retour au calme est mesuré
    out.fDeux =calcSessionCalories(s_2 ).warmupMin;   //  0 : les deux sont mesurés
    out.tSans =calcSessionCalories(sess).total;
    out.tAvant=calcSessionCalories(s_av).total;
    // la séance complète telle que l'app la facture : muscu + cardio réel
    out.reelAvant=out.tAvant+calcCardioKcal(c10);
    // les minutes réelles du cardio entrent dans la durée (sinon noter un cardio RACCOURCIT la séance)
    out.minSans =calcSessionCalories(sess).totalMin;
    out.minAvant=calcSessionCalories(s_av).totalMin;
    // une durée à 0 n'est PAS une mesure → le forfait reste entier
    out.fZero=calcSessionCalories({exs:sess.exs,cardioAvant:{type:'tapis',intensity:'modere',duration:0}}).warmupMin;
    // les valeurs de référence, CALCULÉES ici (jamais recopiées à la main dans les assertions)
    out.kcalCardio10=calcCardioKcal(c10);           // le cardio réel, à la charge de finishWorkout
    out.demiForfait =Math.round(3.5*(S.bw||80)*(5/60)); // ce que le forfait perd quand on mesure
    return out;
  });
  t('vélo modéré 60 min (80 kg) = 544 kcal (MET 6.8)', r.velo60===544, 'reçu '+r.velo60);
  t('corde intense 30 min = 480 kcal (MET 12)', r.corde30i===480, 'reçu '+r.corde30i);
  t('durée 0 → 0 kcal', r.zero===0);
  t('type inconnu → barème « autre » (440)', r.inconnu===440, 'reçu '+r.inconnu);
  t('cardio null → 0 (pas de plantage)', r.null_===0);
  t('séance 4 séries : total = actif + repos + échauffement ('+r.attendu+')', approx(r.cd.total,r.attendu,1), 'reçu '+r.cd.total);
  /* 🫀 CE TÉMOIN A CHANGÉ DE VALEUR LE 16/08 (ft-v886), et il faut lire pourquoi avant d'y
     toucher — il a déjà bougé deux fois (2,0 → 1,5 → 3,0).
     Le 1,5 de ft-v875 était correctement ancré (Compendium 07041, « debout, activité légère »)
     mais il décrivait quelqu'un qui NE FAIT RIEN, pas quelqu'un qui récupère d'un triple à
     130 kg. La démonstration tient en une ligne : le Compendium publie 3,5 pour une SÉANCE de
     musculation modérée, repos compris. Le temps actif ne pesant que ~19 % à ~5,1 MET :
         0,19 × 5,1 + 0,81 × x = 3,5  →  x ≈ 3,1
     La valeur publiée IMPLIQUE donc ~3 MET entre les séries. Une 2ᵉ route indépendante tombe au
     même endroit : la consommation d'oxygène en récupération reste à ~50 % de l'écart à l'effort,
     soit 1,0 + 0,5 × (5,5 − 1,0) = 3,25.
     MESURÉ sur 27 séances chronométrées : MET de séance 2,55 → 3,28 (publié 3,50), séances à
     ±20 % 15/27 → 17/27.
     ⛔ NE PAS REMONTER AU-DELÀ DE 3,0 pour se rapprocher d'une montre : au-dessus, le total
     dépasse la valeur publiée, et on aurait calé la physiologie sur un bracelet (r = 0,10-0,34
     en résistance). Le plafond de ce raisonnement est le Compendium, pas Garmin. */
  t('🫀 le MET entre les séries vaut 3,0 (récupération, pas posture au repos)',
    r.metRepos===3.0, 'reçu '+r.metRepos);
  t('🫀 … et il ne dépasse jamais le MET de SÉANCE publié (3,5), sinon on calerait sur une montre',
    r.metRepos < 3.5, 'reçu '+r.metRepos);
  /* 🔄 LE 3ᵉ ÉTAT (ft-v876). Michel : « quand je fais un soulevé de terre à 140 kg, le temps de
     décharger la barre et d'aller à l'autre exercice ça peut prendre 5 à 7 minutes, et là ce
     n'est PAS du repos ». Le modèle n'avait que deux états (série / debout à 1,5) ; il en a
     trois. ⚠️ 3,0 = marche lente / port de charge légère — au-dessus de debout, très en dessous
     d'une série. NE PAS le monter pour rapprocher le total d'une montre. */
  t('🔄 le temps entre deux exercices vaut 3,0 (marche lente / port de charge)',
    r.metTransit===3.0, 'reçu '+r.metTransit);
  t('🔄 … et il est NOMMÉ dans le résultat, pas dilué dans une mise à l\'échelle',
    r.cd.transitionMin>0 && Math.abs(r.cd.transitionMin-r.transitMin)<=1,
    'transitionMin '+r.cd.transitionMin+' · attendu ~'+(r.transitMin||0).toFixed(1));
  /* ⏱️ LE TEMPS D'UNE SÉRIE SUIT LES RÉPÉTITIONS (ft-v876) — 30 s en dur, c'était la même
     intensité pour du powerlifting (3 reps) et du culturisme (12 reps). Michel l'a vu sur sa
     fille et lui : « on a pratiquement la même séance d'entraînement ». */
  t('⏱️ 3 reps = '+r.sec3+' s, 12 reps = '+r.sec12+' s (10 s d\'installation + 3 s/rep)',
    r.sec3===19 && r.sec12===46, r.sec3+' / '+r.sec12);
  t('⏱️ … donc la même séance en 3 reps et en 12 reps ne coûte plus pareil',
    r.kcal12 > r.kcal3*1.1, r.kcal3+' vs '+r.kcal12+' kcal');
  t('⚠️ aucune répétition notée → on garde le forfait de 30 s, on ne devine pas',
    r.secVide===30, 'reçu '+r.secVide);
  t('⚠️ 400 « reps » (gainage compté en secondes) est plafonné à 3 min',
    r.secFou===180, 'reçu '+r.secFou);
  t('🏋️ la charge relative module de 0,85 (léger) à 1,30 (maximal), neutre à 72 %',
    r.fc.p40===0.85 && r.fc.p72===1 && r.fc.p100===1.3, JSON.stringify(r.fc));
  t('🏋️ … et l\'amplitude (1,53) reste SOUS l\'écart publié modéré↔vigoureux (3,5→6,0 = 1,71)',
    (r.fc.p100/r.fc.p40) < (6.0/3.5), 'amplitude '+(r.fc.p100/r.fc.p40).toFixed(2));
  t('🏋️ une même série coûte plus cher à 92 % du max qu\'à 60 %',
    r.kcalLourd > r.kcalLeger, r.kcalLeger+' vs '+r.kcalLourd+' kcal');
  t('⚠️ AUCUN maximum connu sur l\'exercice → aucune modulation, on ne devine pas (R29)',
    r.fcSansMax===1 && r.kcalSansRepere>0, 'facteur '+r.fcSansMax+' · kcal '+r.kcalSansRepere);
  t('⚠️ une charge aberrante (500 % du max) ne module rien non plus',
    r.fcAberrant===1, 'reçu '+r.fcAberrant);
  t('le détail par exercice colle au total (hors échauffement)', approx(r.cd.total-r.sommeBreakdown,47,2),
    'écart '+(r.cd.total-r.sommeBreakdown));
  t('⚠️ QUIRK : une séance sans aucune série validée facture quand même 47 kcal d\'échauffement', r.vide===47, 'reçu '+r.vide);
  t('le temps de repos du profil (defRest) change bien le calcul', r.rest60<r.cd.total, r.rest60+' vs '+r.cd.total);
  // ── le double comptage de l'échauffement (11/08/2026) ──
  t('⭐ sans cardio noté, le forfait reste ENTIER (10 min) — rien ne change pour personne', r.fSans===10, 'reçu '+r.fSans);
  t('⭐ un échauffement MESURÉ retire sa moitié du forfait (5 min)', r.fAvant===5, 'reçu '+r.fAvant);
  t('⭐ un cardio APRÈS mesuré retire l\'autre moitié (5 min)', r.fApres===5, 'reçu '+r.fApres);
  t('⭐⭐ les deux mesurés → plus aucun forfait (0 min)', r.fDeux===0, 'reçu '+r.fDeux);
  // AVANT le fix, noter 10 min d'échauffement facturait `tSans + kcalCardio10` : le forfait
  // entier ET le cardio réel. APRÈS, la moitié estimée cède la place à la mesure.
  t('⭐⭐ LE BUG : 10 min d\'échauffement ne sont plus payées deux fois ('
    +r.reelAvant+' kcal au lieu de '+(r.tSans+r.kcalCardio10)+')',
    approx(r.tSans-r.tAvant, r.demiForfait, 1) && r.reelAvant===r.tAvant+r.kcalCardio10,
    'muscu '+r.tSans+'→'+r.tAvant+' (attendu −'+r.demiForfait+'), total réel '+r.reelAvant);
  t('⭐ noter un cardio ALLONGE la séance, ne la raccourcit pas', r.minAvant>r.minSans, r.minSans+' → '+r.minAvant+' min');
  t('une durée à 0 n\'est pas une mesure → forfait entier', r.fZero===10, 'reçu '+r.fZero);
  await c.close();
}

// ════════════════════════════════════════════════════════════════════
// L'HORODATAGE DES SÉRIES (12/08/2026) — né de l'objection de Michel : « si la personne
// n'arrête pas sa séance les calories continuent de monter ; ça m'arrive de prendre plus
// de temps de récupération ». Deux moitiés à protéger, et il faut les DEUX :
//   · l'ÉCRITURE (toggleSet pose bien `at`, sur le chrono, pauses exclues) ;
//   · la LECTURE (_dureeEffective plafonne, et sait dire « je ne sais pas »).
// Un lecteur parfait sur une donnée jamais écrite ne mesure rien.
console.log('\n═══ 6bis. Horodatage des séries + temps effectif ═══');
{
  const {c,p}=await boot(null,{});
  const r=await p.evaluate(()=>{
    const out={};
    S.bw=85; S.defRest=130;

    // ── ÉCRITURE ────────────────────────────────────────────────────────────────
    S.wkt={date:today(),exs:[{name:'Squat à la Barre',sets:[
      {kg:100,reps:5,done:false,type:'N'},{kg:100,reps:5,done:false,type:'N'}]}],
      startHour:12, startTs:Date.now()-600000};          // chrono à 10 min
    toggleSet(0,0);
    out.ecrit   = S.wkt.exs[0].sets[0].at;               // ~600
    toggleSet(0,0);
    out.retire  = S.wkt.exs[0].sets[0].at;               // undefined
    toggleSet(0,0);
    S.wkt.pausedTotal=300000;                            // 5 min EN PAUSE
    toggleSet(0,1);
    out.horsPause = S.wkt.exs[0].sets[1].at;             // ~300, pas ~600
    /* ⚠️ CE SCÉNARIO A CHANGÉ DE SENS LE 14/08 (ft-v852), volontairement.
       AVANT : `startWorkout` posait toujours `startTs`, donc une séance en cours SANS chrono
       était un état artificiel, et on vérifiait qu'aucun horodatage n'y était inventé.
       MAINTENANT : le chrono démarre à la 1ʳᵉ SÉRIE VALIDÉE (demande de Michel — il partait à
       l'ouverture de l'écran et tournait pendant l'échauffement, jusqu'à 254 min pour 96
       réelles). Une séance ouverte sans chrono est donc l'état NORMAL, et valider la première
       série DOIT le démarrer. On teste maintenant ça.
       ⚠️ Ce que l'ancien témoin protégeait n'est pas perdu : l'édition d'une séance passée et
       l'import ne passent PAS par `toggleSet` (vérifié : il n'est appelé que depuis l'écran de
       séance), et le témoin « une séance SANS horodatage répond null » couvre la conséquence
       observable, plus bas dans ce même bloc. */
    S.wkt={exs:[{name:'X',sets:[{done:false}]}]};        // séance ouverte, rien validé
    out.avantPremiere = !!S.wkt.startTs;                 // false : le chrono ne tourne pas
    toggleSet(0,0);
    out.apresPremiere = !!S.wkt.startTs;                 // true : la 1ʳᵉ série l'a démarré
    out.sansChrono = S.wkt.exs[0].sets[0].at;            // 0 : elle est l'origine du temps
    S.wkt=null;

    // ── LECTURE ─────────────────────────────────────────────────────────────────
    // ⚠️ GARDE-FOU DE TEST : si la fonction disparaît (refonte, renommage), on veut des
    // témoins ROUGES, pas une exception qui fait sauter tout le bloc avant la 1ʳᵉ assertion.
    // C'est le motif qui avait produit un faux-vert en ft-v832 — un bloc mort ne mesure rien.
    const DE = (typeof _dureeEffective==='function') ? _dureeEffective : ()=>'FONCTION ABSENTE';
    const mk=ats=>({exs:[{name:'Squat à la Barre',sets:ats.map(a=>({kg:100,reps:5,done:true,type:'N',at:a}))}]});
    const suite=(n,pas)=>Array.from({length:n},(_,i)=>i*pas);
    out.normal   = DE(mk(suite(20,180)));   // 20 séries, 3 min → le rythme mesuré de Michel
    // ⭐ LE CAS QUI MOTIVE TOUT : « Terminer » oublié 2 h. Aucune série après la dernière,
    // donc la fenêtre est IDENTIQUE — c'est ce qui rend le bouton sans effet sur la mesure.
    out.oubli    = DE(mk(suite(20,180)));
    // 3 vraies interruptions de 20 min, séparées
    const av=suite(20,180); for(let i=0;i<20;i++){ if(i>=5) av[i]+=1200; if(i>=10) av[i]+=1200; if(i>=15) av[i]+=1200; }
    out.pauses   = DE(mk(av));
    // l'attendu se CALCULE, il ne se recopie pas : 19 écarts en tout, dont 3 plafonnés à 300 s
    /* ⚠️ ATTENDU RECALCULÉ LE 14/08 — le plafond n'est plus fixe (ft-v850).
       Il se cale sur les écarts RÉELS de la séance : ici 16 écarts de 180 s, donc médiane
       180 → plafond 2×180 = 360 s. Les 3 interruptions sont ramenées à 360 s au lieu de 300.
       Ce n'est PAS un relâchement du garde-fou : sur une séance faite à 3 min de repos, 6 min
       est le bon plafond ; l'ancien 300 s était calé sur le cas le plus lourd, donc trop
       serré ici et trop lâche sur des abdos. Ce que le témoin protège reste identique :
       le total se TASSE (66 min pour 117 bruts), il n'explose pas. */
    out.pausesAttendu = (19-3)*180 + 3*360;              // 4 -> 3960 s = 66 min
    out.circuit  = DE(mk(suite(30,50)));    // supersets
    out.reposLong= DE(mk(suite(12,300)));   // 5 min entre séries
    // une séance d'AVANT ft-v835 n'a aucun horodatage → « je ne sais pas », jamais un chiffre
    out.ancienne = DE({exs:[{name:'Squat à la Barre',sets:[{done:true},{done:true},{done:true}]}]});
    out.uneSeule = DE(mk([0]));
    out.plafond  = out.normal ? out.normal : null;
    /* ⏱️⏱️ CE TÉMOIN A ÉTÉ RETOURNÉ LE 16/08 (ft-v874) — et c'est le cœur de la livraison.
       Il figeait un choix VOLONTAIRE de ft-v835 : « les horodatages MESURENT, ils ne calculent
       rien encore » — on affichait la vraie durée à côté du chiffre officiel sans y toucher,
       le temps de vérifier le modèle. La vérification a eu lieu (27 séances chronométrées à
       la montre, biais −38,9 % → −5,1 %), donc le choix change et le témoin avec lui.
       ⚠️ IL NE DISPARAÎT PAS, IL S'INVERSE : on vérifie maintenant que l'horodatage FAIT une
       différence, et que cette différence est EXACTEMENT le rapport des durées — c'est ce qui
       prouve que le MET n'a pas été touché au passage. */
    const sAvec=mk(suite(20,180));
    const sSans={exs:[{name:'Squat à la Barre',sets:suite(20,180).map(()=>({kg:100,reps:5,done:true,type:'N'}))}]};
    out.calAvec  = calcSessionCalories(sAvec).total;
    out.calSans  = calcSessionCalories(sSans).total;
    out.srcAvec  = calcSessionCalories(sAvec).dureeSrc;
    out.dureeAvec= calcSessionCalories(sAvec).dureeMin;
    out.dureeSans= calcSessionCalories(sSans).dureeMin;
    return out;
  });
  const min=s=>Math.round(s/60);
  t('⭐ cocher une série pose son horodatage', typeof r.ecrit==='number', 'reçu '+r.ecrit);
  t('… lu sur le CHRONO de séance (~600 s pour 10 min)', r.ecrit>=595&&r.ecrit<=615, 'reçu '+r.ecrit);
  t('décocher retire l\'horodatage', typeof r.ecrit==='number'&&r.retire===undefined, 'écrit='+r.ecrit+' · reste '+r.retire);
  t('⭐ le temps EN PAUSE est exclu (300 s, pas 600)', r.horsPause>=295&&r.horsPause<=315, 'reçu '+r.horsPause);
  t('⭐⭐ le chrono démarre à la 1ʳᵉ SÉRIE VALIDÉE, pas à l\'ouverture de l\'écran',
    r.avantPremiere===false&&r.apresPremiere===true&&r.sansChrono===0,
    JSON.stringify({avant:r.avantPremiere,apres:r.apresPremiere,at:r.sansChrono}));
  t('20 séries à 3 min → 57 min effectifs, densité 0,35 (« hypertrophie classique »)',
    r.normal&&min(r.normal.actifSec)===57&&r.normal.densite>0.25&&r.normal.densite<0.40,
    JSON.stringify(r.normal));
  t('⭐⭐ « Terminer » oublié 2 h → la mesure NE BOUGE PAS (l\'horloge s\'arrête à la dernière série)',
    r.oubli&&r.normal&&r.oubli.actifSec>0&&r.oubli.actifSec===r.normal.actifSec, JSON.stringify(r.oubli));
  t('⭐⭐ 3 interruptions de 20 min : '+(r.pauses?min(r.pauses.spanSec):'?')+' min bruts → '
    +(r.pauses?min(r.pauses.actifSec):'?')+' min effectifs (le total se TASSE, il n\'explose pas)',
    r.pauses&&r.pauses.actifSec===r.pausesAttendu&&r.pauses.actifSec<r.pauses.spanSec&&r.pauses.densite>0.25,
    'attendu '+r.pausesAttendu+' s · '+JSON.stringify(r.pauses));
  /* ⚠️ CE TÉMOIN A CHANGÉ DE SENS LE 14/08 (ft-v850), volontairement. Il figeait un plafond
     FIXE — or Michel a montré qu'un plafond fixe est faux dans les deux sens : *« et si on
     fait un squat avec 2 minutes de repos ? »*. Le plafond se cale désormais sur les écarts
     réels de la séance. Ce qu'on vérifie ici, c'est qu'il reste BORNÉ des deux côtés :
     jamais plus de 10 min (au-delà ce sont deux séances), jamais moins de 1 min (sinon on
     tronquerait des repos normaux). */
  t('le plafond reste borné : entre 1 et 10 min quoi qu\'il arrive',
    r.plafond&&r.plafond.plafondSec>=60&&r.plafond.plafondSec<=600, 'reçu '+(r.plafond&&r.plafond.plafondSec));
  t('un circuit (50 s entre séries) donne une densité > 0,65', r.circuit&&r.circuit.densite>0.65, JSON.stringify(r.circuit));
  t('des repos longs (5 min) donnent une densité < 0,25', r.reposLong&&r.reposLong.densite<0.25, JSON.stringify(r.reposLong));
  t('⭐ une séance SANS horodatage répond « je ne sais pas » (null), jamais un chiffre inventé', r.ancienne===null, 'reçu '+JSON.stringify(r.ancienne));
  t('une seule série horodatée ne suffit pas à mesurer un temps', r.uneSeule===null, 'reçu '+JSON.stringify(r.uneSeule));
  /* ⏱️⏱️ LE PLAFOND NE SE CALE PLUS SUR LES ÉCHAUFFEMENTS (ft-v885). Michel, sur sa séance du
     16/08 : « c'est quoi encore cette différence de calories ». Mesuré : l'app retenait 56,6 min
     quand sa montre en relevait 63,8, et le plafond de 239 s avait coupé des repos de 284, 316
     et 265 s ENTRE SES SÉRIES DE SOULEVÉ DE TERRE À 130 kg. Cause : la médiane qui fixe le
     plafond mélangeait les paliers d'échauffement (56-83 s) et les vraies séries de travail
     (284-316 s) — les premiers tiraient la médiane vers le bas.
     ⚠️ Le témoin compare DEUX séances rigoureusement identiques sur leurs séries de travail :
     l'une sans échauffement, l'autre avec. Elles doivent rendre le MÊME plafond. */
  const D2=await p.evaluate(()=>{
   try{
    const mk=(sets)=>({date:'2026-08-16',exs:[{name:'Soulevé de Terre',sets}]});
    const travail=[{kg:130,reps:3,done:true,type:'N',at:0},
                   {kg:130,reps:3,done:true,type:'N',at:290},
                   {kg:130,reps:3,done:true,type:'N',at:600},
                   {kg:130,reps:3,done:true,type:'N',at:900}];
    const ech=[{kg:60,reps:5,done:true,type:'É',at:0},{kg:80,reps:3,done:true,type:'É',at:60},
               {kg:90,reps:3,done:true,type:'É',at:140},{kg:110,reps:1,done:true,type:'É',at:230}];
    const sansEch=_dureeEffective(mk(travail));
    const avecEch=_dureeEffective(mk(ech.concat(travail.map(x=>({...x,at:x.at+520})))));
    // et le passage d'un exercice à l'autre reçoit le plafond MAXIMUM, pas celui d'un repos
    /* ⚠️ LE TÉMOIN COMPARE LES MÊMES HORODATAGES, avec et sans frontière d'exercice. Un écart de
       500 s au MÊME exercice est un repos anormal (on le borne) ; le même écart AU CHANGEMENT
       d'exercice, c'est décharger la barre et traverser la salle (on le garde). */
    const A=[{kg:130,reps:3,done:true,type:'N',at:0},{kg:130,reps:3,done:true,type:'N',at:200}];
    const B=[{kg:60,reps:8,done:true,type:'N',at:700},{kg:60,reps:8,done:true,type:'N',at:900}];
    const deuxExos={date:'2026-08-16',exs:[{name:'Soulevé de Terre',sets:A},
                                           {name:'Tirage Poulie Haute (Lat Pulldown)',sets:B}]};
    const unSeul  ={date:'2026-08-16',exs:[{name:'Soulevé de Terre',sets:A.concat(B)}]};
    const _d2=_dureeEffective(deuxExos), _d1=_dureeEffective(unSeul);
    return {plafondSans:sansEch&&sansEch.plafondSec, plafondAvec:avecEch&&avecEch.plafondSec,
            coupeAvec:avecEch&&avecEch.coupeSec,
            transDeux:_d2, transUn:_d1};
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(D2.erreur){ t('⛔ le plafond des écarts se calcule', false, D2.erreur); }
  else{
    t('⏱️⏱️ les paliers d\'ÉCHAUFFEMENT ne rabaissent plus le plafond des vraies séries',
      D2.plafondSans===D2.plafondAvec,
      'sans échauffement '+D2.plafondSans+' s · avec '+D2.plafondAvec+' s');
    t('⏱️ … donc un repos de 5 min à 130 kg n\'est plus rogné',
      D2.coupeAvec===0, 'coupé '+D2.coupeAvec+' s');
    t('🔄 les MÊMES horodatages gardent plus de temps quand c\'est un CHANGEMENT d\'exercice',
      D2.transDeux && D2.transUn && D2.transDeux.actifSec > D2.transUn.actifSec,
      '2 exercices : '+(D2.transDeux&&D2.transDeux.actifSec)+' s · 1 seul : '+(D2.transUn&&D2.transUn.actifSec)+' s');
  }
  t('⭐⭐ l\'horodatage ALIMENTE maintenant les calories (ft-v874) — il ne fait plus que mesurer',
    r.srcAvec==='horodatage' && r.calAvec!==r.calSans, 'source '+r.srcAvec+' · '+r.calAvec+' vs '+r.calSans);
  t('⚠️ … et l\'écart est EXACTEMENT le rapport des durées : le MET n\'est pas touché',
    Math.abs((r.calAvec-47)/(r.calSans-47) - r.dureeAvec/r.dureeSans) < 0.05,
    'kcal '+r.calAvec+'/'+r.calSans+' · durées '+r.dureeAvec+'/'+r.dureeSans);
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
    // ⚠️ DATE CALCULÉE, PLUS JAMAIS ÉCRITE EN DUR (05/08/2026). C'était '2026-07-29' —
    // ce qui voulait dire « aujourd'hui » le jour où le test a été écrit. Une semaine plus
    // tard, le même test disait « aujourd'hui » et vérifiait « il y a 7 jours » : il est passé
    // au ROUGE sans qu'une seule ligne de code ait changé. *Un test qui pourrit avec le
    // calendrier est pire qu'un test absent* — on apprend à ignorer son rouge, exactement
    // comme le voyant de sauvegarde de ft-v770. On utilise `today()` (la date du TÉLÉPHONE,
    // jamais celle de Greenwich — règle née du bug ft-v655).
    S.cycle={startDate:today(),weeks:12}; out.sem1=getCurrentCycleWeek();
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

  // ── Retour de Michel après test réel : « mon régime alimentaire ne sert plus à rien dès qu'on
  // sélectionne le kéto ». Il agit BIEN — mais rien ne le disait, et une substitution laissait
  // une faute visible (« Tofu brouillé brouillés »).
  const cr=await p.evaluate(()=>{
   try{
    const plan=(mode,diet,restr)=>{S.foodMode=mode;S.keto=(mode==='keto');S.diet=diet||'';
      S.dietRestrictions=restr||[];S.dietNotes='';S.fasting='';S.bw=80;S.goal='muscle';
      return getMeals(calcMacros('normal'),'normal').map(m=>m.desc).join(' | ');};
    return {ketoVegan:plan('keto','vegan'), ketoLactose:plan('keto','',['sanslactose']),
            ketoSeul:plan('keto','')};
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  t('⭐ la carte RÉGIME agit toujours quand un mode est actif (kéto + végan → tofu, tempeh)',
    /Tofu/.test(cr.ketoVegan)&&/Tempeh/.test(cr.ketoVegan)&&!/Poulet|Saumon/.test(cr.ketoVegan),
    (cr.ketoVegan||'').slice(0,110));
  t('⭐ plus de « Tofu brouillé brouillés » (le mot d\'origine était remplacé à moitié)',
    !/brouillé brouillé/i.test(cr.ketoVegan||''), (cr.ketoVegan||'').slice(0,60));
  t('kéto + sans lactose : beurre et crème remplacés',
    /huile d'olive \+ avocat/.test(cr.ketoLactose)&&/crème de coco/.test(cr.ketoLactose),
    (cr.ketoLactose||'').slice(0,110));
  // ⚠️ La tolérance «\u00a0 ?(\\d+ g)?\u00a0» a été ajoutée le 18/08 quand le plan a reçu ses PORTIONS
  // (« Œufs brouillés 200 g au beurre »). Elle n'affaiblit PAS le témoin : il exige toujours
  // « Œufs brouillés » ET « au beurre » COLLÉS l'un à l'autre — c'est bien l'absence de
  // substitution qu'on vérifie, pas l'absence de grammes.
// ─── LE PLAN CHANGE TOUS LES JOURS — ET CHAQUE VARIANTE EST SURE (18/08/2026) ──────
// /!\/!\ CE BLOC EST LE GARDE-FOU DE LA BRIQUE. Sans lui, un test de regime ne verifierait
// que la variante du JOUR OU IL TOURNE : une variante dangereuse (viande chez un vegan,
// amandes chez quelqu'un qui a declare « fruits a coque ») ne sortirait que certains jours,
// et personne ne la verrait avant qu'un utilisateur la mange. C'est le bug d'Emma du 02/08,
// avec un calendrier par-dessus. On parcourt donc TOUTES les variantes de TOUS les plans.
{
  const rot=await p.evaluate(()=>{
   try{
    if(typeof getMeals!=='function') return {erreur:'getMeals absente'};
    if(typeof _varianteDuJour!=='function') return {erreur:'_varianteDuJour absente'};
    const VIANDE=/poulet|b(œ|oe)uf|thon|saumon|poisson|dinde|jambon/i;
    const ANIMAL=/(œ|oe)uf|yaourt(?! de soja)|fromage(?! blanc sans)|whey|lait(?! de soja| sans lactose)|poulet|b(œ|oe)uf|thon|saumon|poisson|dinde|miel/i;
    const o={variantes:0, jours:0};
    const fautes={vegan:[], vegetarien:[], allergie:[]};
    const vus=new Set();
    // 40 jours d'affilee : assez pour epuiser toutes les rotations (2 a 3 variantes)
    for(let j=0;j<40;j++){
      for(const g of ['muscle','perte','force','equilibre','endurance','recomp']){
        // vegan
        S.keto=false;S.foodMode='';S.fasting='';S.dietNotes='';S.dietRestrictions=[];
        S.goal=g;S.diet='vegan';S.bw=75;S.age=35;S.height=178;S.activityLevel=1.55;
        getMeals(calcMacros('normal'),'normal',j).forEach(m=>{
          vus.add(m.desc);
          if(ANIMAL.test(m.desc)) fautes.vegan.push(g+' j'+j+' : '+m.desc);
        });
        // vegetarien
        S.diet='vegetarien';
        getMeals(calcMacros('normal'),'normal',j).forEach(m=>{
          if(VIANDE.test(m.desc)) fautes.vegetarien.push(g+' j'+j+' : '+m.desc);
        });
        // allergie declaree aux fruits a coque
        S.diet='';S.dietNotes='fruits à coque';
        getMeals(calcMacros('normal'),'normal',j).forEach(m=>{
          if(/amande|noix|noisette|macadamia|cajou|pistache/i.test(m.desc)
             && (typeof mealAlertes!=='function' || !mealAlertes(m.desc).length))
            fautes.allergie.push(g+' j'+j+' : '+m.desc);
        });
      }
      o.jours=j+1;
    }
    o.variantes=vus.size;
    o.fautes=fautes;
    // la variante doit CHANGER d'un jour a l'autre, et etre STABLE dans la journee
    S.diet='';S.dietNotes='';S.goal='muscle';
    const m0=calcMacros('normal');
    const a=getMeals(m0,'normal',10).map(m=>m.desc).join('|');
    const b=getMeals(m0,'normal',10).map(m=>m.desc).join('|');
    const c=getMeals(m0,'normal',11).map(m=>m.desc).join('|');
    o.stableDansLaJournee=(a===b);
    o.changeLeLendemain=(a!==c);
    // un plan qui n'a QU'UNE description continue de marcher (les deux formes cohabitent)
    o.chaineSimple=_varianteDuJour('Repas unique',7)==='Repas unique';
    o.tableau=_varianteDuJour(['A','B','C'],7)==='B';
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(rot.erreur){ t('X la rotation', false, rot.erreur); }
  else{
    t('⭐⭐ LE PLAN CHANGE D\'UN JOUR A L\'AUTRE',
      rot.changeLeLendemain===true);
    t('/!\\ ... et reste STABLE dans la journee (sinon il changerait a chaque affichage)',
      rot.stableDansLaJournee===true);
    t('⭐⭐ AUCUNE variante ne sert de produit animal a un VEGAN — sur '+rot.jours+' jours x 6 objectifs',
      (rot.fautes.vegan||[]).length===0, (rot.fautes.vegan||[]).slice(0,3).join(' | '));
    t('⭐⭐ ... ni de viande a un VEGETARIEN',
      (rot.fautes.vegetarien||[]).length===0, (rot.fautes.vegetarien||[]).slice(0,3).join(' | '));
    t('⭐⭐ ... ni de fruits a coque a qui en a declare l\'allergie (sans alerte)',
      (rot.fautes.allergie||[]).length===0, (rot.fautes.allergie||[]).slice(0,3).join(' | '));
    t('/!\\ le parcours a bien vu PLUSIEURS variantes distinctes (sinon il ne verifie rien)',
      rot.variantes>=40, rot.variantes+' descriptions distinctes');
    t('/!\\ les deux formes cohabitent : une description simple marche toujours',
      rot.chaineSimple===true && rot.tableau===true);
  }
}

// ─── LES PORTIONS DU PLAN DE REPAS (18/08/2026) ───────────────────────────────────
// Michel : « dans nutrition le plan alimentaire du jour il n'y a pas les proportions ».
// /!\ Ce bloc verifie surtout ce qui peut RENDRE FAUX : une quantite collee au mauvais
// aliment, une unite prise dans le texte au lieu de la table, une quantite inventee sur
// un aliment inconnu, ou une quantite ajoutee par-dessus une quantite deja ecrite.
{
  const po=await p.evaluate(()=>{
   try{
    if(typeof _portionner!=='function') return {erreur:'_portionner absente'};
    const o={};
    o.simple   =_portionner('Avoine + œufs + fruit — Glucides complexes',560);
    o.prepa    =_portionner("Œufs brouillés à l'huile d'olive + avocat — Sans glucides",560);
    o.deja     =_portionner('Amandes (20g) + whey shake — Anti-fringales',200);
    o.inconnu  =_portionner('Protéine + céréale complète + légumes variés — Coloré',600);
    o.liquide  =_portionner('Avoine + lait entier — Base',400);
    o.substitue=_portionner('Avoine + Tofu + fruit — Glucides complexes',560);
    o.rien     =_portionner('Repas libre du dimanche',600);
    o.choix    =_portionner('Saumon/bœuf + légumes + patate douce',320);
    o.boeuf    =_portionner('Bœuf + riz blanc + banane — Charge',600);
    // cohérence : la somme des portions doit rester proche des calories annoncees
    S.keto=false;S.diet='';S.dietRestrictions=[];S.dietNotes='';S.fasting='';S.foodMode='';
    S.bw=80;S.age=35;S.height=178;S.activityLevel=1.55;
    const ecarts={};
    for(const g of ['muscle','perte','force','equilibre','endurance']){
      S.goal=g; const mm=calcMacros('normal'); const meals=getMeals(mm,'normal');
      // chaque repas doit porter au moins une quantite
      ecarts[g]=meals.filter(m=>!/\d+ (g|ml)\b/.test(m.desc)).map(m=>m.desc);
    }
    o.sansQuantite=ecarts;
    S.goal='muscle';
    return o;
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(po.erreur){ t('X les portions', false, po.erreur); }
  else{
    t('⭐⭐ chaque aliment connu recoit une portion EN GRAMMES',
      /Avoine \d+ g \+ œufs \d+ g \+ fruit \d+ g/.test(po.simple), po.simple);
    t('/!\\/!\\ la quantite se pose APRES l\'aliment, pas a la fin du morceau'
      +' (« a l\'huile d\'olive 200 g » = 200 g d\'HUILE)',
      /Œufs brouillés \d+ g à l'huile d'olive/.test(po.prepa), po.prepa);
    t('/!\\ ... et l\'unite vient de la TABLE, pas d\'une relecture du texte (« huile » y apparait)',
      !/Œufs brouillés \d+ ml/.test(po.prepa), po.prepa);
    t('/!\\ une quantite DEJA ECRITE dans le plan n\'est pas doublee (R30)',
      /Amandes \(20g\) \+/.test(po.deja) && !/Amandes \(20g\) \d/.test(po.deja), po.deja);
    t('/!\\/!\\ un aliment INCONNU ne recoit AUCUNE quantite inventee (R29)',
      /^Protéine \+/.test(po.inconnu), po.inconnu);
    t('/!\\ un liquide se lit en ml',
      /lait entier \d+ ml/.test(po.liquide), po.liquide);
    t('⭐ la portion suit l\'aliment REELLEMENT affiche apres substitution (Tofu, pas œufs)',
      /Tofu \d+ g/.test(po.substitue), po.substitue);
    t('/!\\ une description qui n\'est pas une liste d\'aliments est laissee intacte',
      po.rien==='Repas libre du dimanche', po.rien);
    t('/!\\ « Saumon/bœuf » propose un CHOIX : la quantite va AU BOUT, pas au milieu',
      /Saumon\/bœuf \d+ g/.test(po.choix), po.choix);
    t('/!\\/!\\ le motif du BŒUF matche vraiment (« b[œo]euf » ne matchait JAMAIS « bœuf »)',
      /^Bœuf \d+ g/.test(po.boeuf), po.boeuf);
    const vides=Object.entries(po.sansQuantite||{}).filter(([,v])=>v.length);
    t('⭐ TOUS les objectifs produisent des repas chiffres',
      vides.length===0, vides.map(([g,v])=>g+' : '+v.join(' / ')).join(' | '));
  }
}

  t('TÉMOIN : kéto seul garde bien œufs, beurre et fromage',
    /Œufs brouillés( \d+ (g|ml))? au beurre/.test(cr.ketoSeul)&&/fromage à pâte dure/.test(cr.ketoSeul),
    (cr.ketoSeul||'').slice(0,80));
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

/* ══ LE PLAFOND DE REPOS S'ADAPTE À LA SÉANCE (14/08/2026) ═════════════════════════════
   Objection de Michel : *« et si on fait un squat avec 2 minutes de repos ? »* — un plafond
   fixe de 5 min est alors son PIRE jour, pas son jour normal, et laisserait passer 5 min de
   téléphone. Le plafond se cale donc sur ses écarts RÉELS (médiane × 2), par classe de série
   déduite des REPS (3×3/5×3/5×5 = lourd · 4×8/3×10 = normal · 15+ = court).            */
{
  console.log('\n── Le plafond de repos s\'adapte ──');
  const {c:_cR,p:_pR}=await boot('2026-08-14T09:00:00+02:00');
  const R = await _pR.evaluate(()=>{
   try{
    if(typeof _dureeEffective!=='function')return {erreur:'_dureeEffective absente'};
    const mk=(reps,ecarts)=>{let t=0;const sets=[{kg:100,reps,done:true,at:0,type:'N'}];
      ecarts.forEach(e=>{t+=e;sets.push({kg:100,reps,done:true,at:t,type:'N'});});
      return {exs:[{name:'Squat à la Barre',sets}]};};
    return {
      appel   : _dureeEffective(mk(3,[120,120,120,360])),   // 2 min de repos + appel de 6
      lourd   : _dureeEffective(mk(3,[240,240,250,235])),   // vrai jour lourd à 4 min
      hyper   : _dureeEffective(mk(10,[90,95,88,92])),      // 3×10 à 1 min 30
      abdos   : _dureeEffective(mk(20,[45,50,42,48,480])),  // abdos + pause de 8 min
      peu     : _dureeEffective(mk(3,[120,600])),           // 2 écarts → repères métier
      enorme  : _dureeEffective(mk(8,[100,105,98,1500])),   // interruption de 25 min
      classes : [_classeRepos(3).k,_classeRepos(5).k,_classeRepos(10).k,_classeRepos(20).k]
    };
   }catch(e){ return {erreur:String(e&&e.message||e)}; }
  });
  if(R.erreur){ t('⛔ le plafond adaptatif s\'exécute', false, R.erreur); }
  else{
    t('⭐⭐ squat à 2 min + appel de 6 : le plafond DESCEND à 4 min (pas 5)',
      R.appel && R.appel.plafondSec===240 && R.appel.coupeSec===120,
      JSON.stringify(R.appel));
    t('⭐⭐ vrai jour lourd à 4 min de repos : RIEN n\'est tronqué',
      R.lourd && R.lourd.coupeSec===0, JSON.stringify(R.lourd));
    t('3×10 à 1 min 30 : rien coupé non plus', R.hyper && R.hyper.coupeSec===0, JSON.stringify(R.hyper));
    t('⭐ abdos à 45 s : le plafond tombe à 2 min, la pause de 8 min est coupée',
      R.abdos && R.abdos.plafondSec<=120 && R.abdos.coupeSec>=300, JSON.stringify(R.abdos));
    t('⚠️ trop peu d\'écarts → on retombe sur les repères métier (lourd = 5 min)',
      R.peu && R.peu.plafondSec===300, JSON.stringify(R.peu));
    t('⚠️ une interruption de 25 min ne compte jamais en entier',
      R.enorme && R.enorme.coupeSec>=1200, JSON.stringify(R.enorme));
    t('les classes viennent des REPS, pas du nom de l\'exercice',
      JSON.stringify(R.classes)===JSON.stringify(['lourd','lourd','normal','court']),
      JSON.stringify(R.classes));
  }
  await _cR.close();
}

// ════════════════════════════════════════════════════════════════════
// LE CARDIO D'AVANT COMPTE DANS LA DURÉE TOTALE (18/08/2026) — Michel, en pleine séance :
// « je fais du cardio avant, il faut que ce soit pris en compte dans la durée totale ».
// ⚠️ CE QUE CE BLOC PROTÈGE VRAIMENT, ce n'est pas une addition — c'est la question « qu'est-ce
// qui est DÉJÀ dans la mesure ? », qui dépend entièrement d'une décision prise ailleurs (le
// chrono démarre à la 1ʳᵉ série validée, log.js, 14/08). Le jour où cette décision changera,
// c'est ici que ça doit rougir — sinon on comptera le même cardio deux fois, sans erreur ni
// symptôme visible. C'est exactement ce qui était arrivé à `_rythmeSeance` (coach.js), écrite
// deux jours APRÈS le changement de chrono et qui soustrayait encore un cardio absent.
console.log('\n═══ 10. Durée totale : la muscu mesurée + le cardio qui n\'y était pas ═══');
{
  const {c:_cD,p:_pD}=await boot(null,{});
  /* ⚠️⚠️ CE BLOC DOIT S'EXÉCUTER DES DEUX CÔTÉS, c'est la seule façon qu'il ait de prouver
     quelque chose. Premier jet : il appelait `_dureeTotaleMin` directement → sur l'ancien code
     il levait `ReferenceError` et le contrôle négatif s'ARRÊTAIT au lieu de rougir. Un témoin
     qui plante ne mesure rien (même erreur qu'en ft-v887/890/892). Il passe donc par ce que
     l'écran AFFICHE — `_renderSeStats`, qui existe des deux côtés — et n'appelle la fonction
     neuve que derrière un garde qui rend `null`, donc qui FAIT ÉCHOUER le témoin au lieu de
     le sauter. */
  const D=await _pD.evaluate(()=>{
    const out={}; S.bw=80; S.defRest=120;
    const _dt=(s,n)=>(typeof _dureeTotaleMin==='function')?_dureeTotaleMin(s,n,0):null;
    const sets=n=>[...Array(n)].map((_,i)=>({kg:100,reps:5,done:true,type:'N',at:i*180}));
    const base=()=>({date:today(),exs:[{name:'Squat à la Barre',sets:sets(8)}]});
    const nS=8;
    // ① horodatage (le cas normal) : ni l'avant ni l'après n'ont jamais été dans la mesure
    const s1=base(); s1.cardioAvant={type:'velo',intensity:'modere',duration:20};
    out.horo=_dt(s1,nS);
    /* ⭐ LE TÉMOIN DE COMPORTEMENT — ce que la personne LIT sur son écran de fin de séance.
       `_renderSeStats` existe des deux côtés : sur l'ancien code la tuile annonce la durée du
       chrono seul, sur le nouveau elle annonce le total et nomme le cardio. */
    try{
      const el=document.getElementById('se-stats');
      if(el){ _renderSeStats(s1,0); out.tuileHoro=el.textContent.replace(/\s+/g,' ').trim(); }
    }catch(e){ out.tuileHoro='ERREUR: '+e.message; }
    // ② chrono : il court de la 1ʳᵉ série à « Terminer » → l'APRÈS est dedans, l'AVANT non
    const s2={date:today(),duration:60*60,exs:[{name:'Squat à la Barre',
      sets:[...Array(8)].map(()=>({kg:100,reps:5,done:true,type:'N'}))}]};   // aucun `at`
    s2.cardioAvant={type:'velo',intensity:'modere',duration:20};
    s2.cardio={type:'tapis',intensity:'modere',duration:15};
    out.chrono=_dt(s2,nS);
    // ③ durée SAISIE à la main : c'est SON chiffre, on n'y touche pas
    const s3={...s2, durationDite:true};
    out.saisie=_dt(s3,nS);
    // ④ séance de CARDIO SEUL (valide depuis le 02/08) : le chrono n'a jamais démarré
    const s4={date:today(),exs:[],duration:0,cardioAvant:{type:'velo',intensity:'modere',duration:30}};
    out.cardioSeul=_dt(s4,0);
    try{
      const el=document.getElementById('se-stats');
      if(el){ _renderSeStats(s4,0); out.tuileCardioSeul=el.textContent.replace(/\s+/g,' ').trim(); }
    }catch(e){ out.tuileCardioSeul='ERREUR: '+e.message; }
    // ⑤ aucune séance de cardio : le total ne bouge pas d'une minute
    out.sansCardio=_dt(base(),nS);
    // ⑥ ce que voit l'écran de séance AVANT la 1ʳᵉ série (le « 0:00 » qui inquiétait Michel)
    S.wkt={date:today(),exs:[],cardioAvant:{type:'velo',intensity:'modere',duration:20}};
    out.avantChrono=_fmtElapsed();
    S.wkt.startTs=Date.now()-300000;
    out.apresChrono=_fmtElapsed();
    S.wkt=null;
    return out;
  });
  t('⭐⭐ horodatage : les 20 min de cardio d\'AVANT s\'ajoutent à la muscu mesurée',
    !!D.horo && D.horo.cardioMin===20 && Math.round(D.horo.min)===Math.round(D.horo.muscuMin)+20,
    JSON.stringify(D.horo));
  t('⭐⭐ CE QUE L\'ÉCRAN AFFICHE : la tuile Durée nomme les minutes de cardio',
    /cardio/i.test(D.tuileHoro||''), D.tuileHoro);
  t('⭐⭐ chrono : on n\'ajoute QUE l\'avant — l\'après y est déjà (sinon compté 2 fois)',
    !!D.chrono && D.chrono.src==='chrono' && D.chrono.cardioMin===20, JSON.stringify(D.chrono));
  t('⚠️ durée SAISIE à la main : on n\'ajoute RIEN, c\'est son chiffre',
    !!D.saisie && D.saisie.src==='saisie' && D.saisie.cardioMin===0, JSON.stringify(D.saisie));
  t('⭐ cardio SEUL : la séance dure ses 30 min, alors que le chrono n\'a jamais tourné',
    !!D.cardioSeul && Math.round(D.cardioSeul.min)===30, JSON.stringify(D.cardioSeul));
  t('⭐⭐ ... et la tuile Durée EXISTE sur une séance de cardio seul (elle manquait)',
    /30 min/.test(D.tuileCardioSeul||''), D.tuileCardioSeul);
  t('⚠️ sans cardio noté, la durée totale = la durée de muscu, à la minute près',
    !!D.sansCardio && D.sansCardio.cardioMin===0 && D.sansCardio.min===D.sansCardio.muscuMin,
    JSON.stringify(D.sansCardio));
  t('⭐ avant la 1ʳᵉ série, l\'écran annonce le cardio noté au lieu d\'un « 0:00 » muet',
    /20 min/.test(D.avantChrono), D.avantChrono);
  t('⚠️ et dès que le chrono tourne, c\'est LUI qui s\'affiche (pas le cardio)',
    /^\d+:\d\d$/.test(D.apresChrono), D.apresChrono);
  await _cD.close();
}

// ════════════════════════════════════════════════════════════════════
// LE PLANCHER CALORIQUE (18/08/2026) — trouvé par un contre-audit exterieur, VERIFIE ici dans
// le code : `autoKcal` etait une addition sans plancher, alors que le Gardien de Milo alerte
// sous 1500 kcal (H) / 1200 (F). L'app prescrivait une cible qu'elle aurait signalee si la
// personne l'avait mangee — et le Gardien ne s'allume que si elle tient son journal, donc il
// protegeait exactement la population qui en avait le moins besoin.
console.log('\n═══ 11. Plancher calorique + plancher proteines keto ═══');
{
  const {c:_cP,p:_pP}=await boot(null,{});
  const P=await _pP.evaluate(()=>{
    const out={};
    /* /!\ `nutritionPhase` ne vaut QUE 'charge' ou 'decharge' — c'est un interrupteur a deux
       positions, sans etat neutre (state.js, defaut 'charge'). Mon 1er jet passait '' : une
       valeur qui n'existe pas, et qui tombait donc dans la branche 'decharge' (-100 kcal).
       Un temoin qui emploie une entree impossible mesure autre chose que ce qu'il annonce. */
    const pose=(g,bw,ht,age,act,goal,phase)=>{
      const ph=phase||'charge';
      S.gender=g;S.bw=bw;S.height=ht;S.age=age;S.activityLevel=act;S.goal=goal;
      S.foodMode='';S.keto=false;S.manualKcal=0;S.nutritionPhase=ph;
      return calcMacros(ph);
    };
    // ⭐ les 3 profils du contre-audit, refaits avec nos propres regles
    out.femmeSed   = pose('F',55,160,45,1.2,'perte').calories;
    out.femmeDech  = pose('F',55,160,45,1.2,'perte','decharge').calories;
    out.femmeActive= pose('F',55,160,45,1.375,'perte').calories;
    out.homme      = pose('H',70,175,40,1.2,'perte').calories;
    // le plancher DIT qu'il a mordu
    /* /!\ CE BLOC DOIT TOURNER DES DEUX COTES : appeler directement la fonction neuve faisait
       PLANTER le controle negatif au lieu de le faire rougir (5e fois — ft-v887, 890, 892, 901,
       905). Le garde rend `null`, ce qui FAIT ECHOUER le temoin ; les autres mesures passent
       par `calcMacros`, presente des deux cotes. */
    const _plF=(typeof plancherKcalActif==='function')?plancherKcalActif:(()=>null);
    pose('F',55,160,45,1.2,'perte');
    const pl=_plF('charge');
    out.expliqueBrut=pl?pl.brut:null; out.expliquePlancher=pl?pl.plancher:null;
    // /!\ un profil normal n'est PAS touche
    out.hommeMuscle=pose('H',85,180,48,1.55,'muscle').calories;
    pose('H',85,180,48,1.55,'muscle'); out.pasDePlancher=_plF('charge')===null;
    // /!\ une cible SAISIE A LA MAIN reste celle de la personne
    S.gender='F';S.bw=55;S.height=160;S.age=45;S.activityLevel=1.2;S.goal='perte';S.manualKcal=900;S.nutritionPhase='charge';
    out.manuel=calcMacros('charge').calories;
    S.manualKcal=0;
    // ⭐ keto : 15 % de proteines passe sous 0,8 g/kg chez quelqu'un de lourd
    S.gender='H';S.bw=100;S.height=180;S.age=40;S.activityLevel=1.2;S.goal='perte';S.foodMode='keto';
    const k=macrosForKcal(1950);
    out.ketoProt=k.prot_g; out.ketoRatio=+(k.prot_g/100).toFixed(2);
    out.ketoKcal=k.prot_g*4+k.carbs_g*4+k.fat_g*9;
    S.foodMode='';
    return out;
  });
  t('⭐⭐ FEMME SEDENTAIRE EN PERTE : plus jamais 947 kcal (plancher 1200)',
    P.femmeSed>=1200, P.femmeSed+' kcal');
  t('⭐⭐ ... meme en phase de decharge (c\'etait 847 kcal)',
    P.femmeDech>=1200, P.femmeDech+' kcal');
  t('femme legerement active en perte : au moins 1200', P.femmeActive>=1200, P.femmeActive+' kcal');
  t('homme sedentaire en perte : au moins 1500', P.homme>=1500, P.homme+' kcal');
  t('⭐ le plancher DIT de combien il a releve la cible (jamais en silence)',
    P.expliqueBrut>0 && P.expliqueBrut<P.expliquePlancher, JSON.stringify([P.expliqueBrut,P.expliquePlancher]));
  t('/!\\ un profil ordinaire n\'est PAS touche par le plancher',
    P.hommeMuscle>2000 && P.pasDePlancher===true, P.hommeMuscle+' kcal');
  t('/!\\ une cible SAISIE A LA MAIN reste celle de la personne (on ne decide pas a sa place)',
    P.manuel===900, P.manuel+' kcal');
  t('⭐⭐ KETO : les proteines ne descendent plus sous 0,8 g/kg',
    P.ketoRatio>=0.8, P.ketoProt+' g = '+P.ketoRatio+' g/kg');
  t('/!\\ ... et le total calorique du keto reste juste (les lipides absorbent)',
    Math.abs(P.ketoKcal-1950)<=20, P.ketoKcal+' kcal');
  await _cP.close();
}

// ════════════════════════════════════════════════════════════════════
// BRIQUE 0 — LA PROVENANCE DE CHAQUE LIGNE DU JOURNAL (18/08/2026)
// Une entree du journal s'ecrivait { date, meal, name, kcal, prot, carbs, fat, ts } : un RESULTAT
// sans trace de son origine. C'est la seule brique nutrition qu'on ne peut pas rattraper apres
// coup — chaque jour qui passe fabrique des entrees definitivement muettes.
// /!\ CE BLOC PROTEGE SURTOUT DEUX CHOSES QU'ON NE VOIT PAS A L'ECRAN :
//   · la provenance NE SURVIT PAS d'une saisie a l'autre (sinon le journal affirme une source
//     qui n'a rien a voir — une provenance fausse est pire que pas de provenance) ;
//   · ce qu'on ne sait pas reste `null` : aucun etat cru/cuit devine, aucune quantite inventee.
console.log('\n═══ 12. Journal alimentaire : la provenance de chaque ligne ═══');
{
  const {c:_cJ,p:_pJ}=await boot(null,{});
  const J=await _pJ.evaluate(async()=>{
    /* /!\ CE BLOC S'EXECUTE DES DEUX COTES : il passe par `openAddFood` + `addFoodEntry`, qui
       existent depuis toujours, et il INSPECTE L'ENTREE ECRITE. Un 1er jet sortait sur
       `_provFood absente` : il rendait UN rouge au lieu de mesurer les huit comportements, et
       ne prouvait donc pas que le temoin attrape la regression (meme defaut qu'en ft-v887/890/
       892/901/905/906). Seuls les appels a `_afSetSrc` sont gardes — sur l'ancien code le
       scenario du scan retombe sur une saisie manuelle, et les assertions rougissent. */
    const o={};
    const src=(x)=>{ if(typeof _afSetSrc==='function') _afSetSrc(x); };
    S.foodLog=[]; persist();
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v;};
    const bcRow=()=>document.getElementById('af-bc-row');
    // ── ① saisie 100 % MANUELLE ────────────────────────────────────────────────
    openAddFood();
    set('af-desc','Poulet maison'); set('af-kcal',300); set('af-prot',40); set('af-carbs',0); set('af-fat',12);
    addFoodEntry();
    o.manuel=S.foodLog[S.foodLog.length-1];
    // ── ② SCAN Open Food Facts, quantite connue, valeurs non retouchees ────────
    openAddFood();
    src({saisie:'scan',origine:'off',sourceId:'3017620422003',
      per100:{kcal:539,prot:6.3,carbs:57.5,fat:30.9},attendu:{kcal:135,prot:2,carbs:14,fat:8}});
    if(bcRow())bcRow().style.display='block';
    set('af-bc-grams',25);
    set('af-desc','Pate a tartiner'); set('af-kcal',135); set('af-prot',2); set('af-carbs',14); set('af-fat',8);
    addFoodEntry();
    o.scan=S.foodLog[S.foodLog.length-1];
    // ── ③ SCAN puis la personne RETOUCHE les macros a la main ──────────────────
    openAddFood();
    src({saisie:'scan',origine:'off',sourceId:'3017620422003',
      per100:{kcal:539},attendu:{kcal:135,prot:2,carbs:14,fat:8}});
    if(bcRow())bcRow().style.display='block';
    set('af-bc-grams',25);
    set('af-desc','Pate a tartiner'); set('af-kcal',200); set('af-prot',2); set('af-carbs',14); set('af-fat',8);
    addFoodEntry();
    o.retouche=S.foodLog[S.foodLog.length-1];
    // ── ④ la saisie SUIVANTE ne doit PAS heriter de la provenance precedente ───
    openAddFood();
    set('af-desc','Pomme'); set('af-kcal',80); set('af-prot',0); set('af-carbs',20); set('af-fat',0);
    addFoodEntry();
    o.apresScan=S.foodLog[S.foodLog.length-1];
    o.n=S.foodLog.length;
    S.foodLog=[]; persist();
    return o;
  });
  await _cJ.close();

  if(J.err){ t('X le bloc tourne', false, J.err); }
  else{
    const E=x=>x||{};
    t('⭐⭐ SAISIE MANUELLE : origine « utilisateur », et AUCUNE quantite inventee',
      E(J.manuel).v===1 && E(J.manuel).saisie==='manuel' && E(J.manuel).origine==='utilisateur'
      && E(J.manuel).q===null && E(J.manuel).etat===null, JSON.stringify(J.manuel));
    t('⭐⭐ SCAN : la QUANTITE est enfin enregistree (25 g), avec la source et son identifiant',
      E(J.scan).q===25 && E(J.scan).u==='g' && E(J.scan).origine==='off' && E(J.scan).sourceId==='3017620422003',
      JSON.stringify(J.scan));
    t('⭐ ... et les valeurs au 100 g sont gardees (c\'est ce qui permettra de recalculer)',
      !!(E(J.scan).per100 && E(J.scan).per100.kcal===539), JSON.stringify(E(J.scan).per100));
    t('/!\\ valeurs NON retouchees → modifie = false', E(J.scan).modifie===false, 'modifie='+E(J.scan).modifie);
    t('⭐⭐ VALEURS RETOUCHEES A LA MAIN : `modifie` le dit (la source n\'explique plus le chiffre)',
      E(J.retouche).modifie===true, 'modifie='+E(J.retouche).modifie);
    t('⭐⭐ LA PROVENANCE NE SURVIT PAS A LA SAISIE SUIVANTE (sinon le journal ment)',
      E(J.apresScan).origine==='utilisateur' && E(J.apresScan).q===null && !E(J.apresScan).sourceId,
      JSON.stringify(J.apresScan));
    t('/!\\ l\'etat cru/cuit reste `null` partout : il viendra de la base, il ne se devine pas',
      [J.manuel,J.scan,J.retouche,J.apresScan].every(e=>e.etat===null));
    t('les 4 entrees sont bien enregistrees', J.n===4, 'n='+J.n);
  }
}

// ════════════════════════════════════════════════════════════════════
// SUPPLÉMENTS — contre-audit v1.2 (18/08/2026). Trois constats VÉRIFIÉS dans le code avant
// correction : une phrase FAUSSE affichée aux utilisateurs, des contre-indications ANSES
// absentes, et une barre de protéines qu'aucune donnée n'alimentait.
console.log('\n═══ 13. Supplements : ce qui est affiche est-il vrai ? ═══');
{
  const {c:_cS,p:_pS}=await boot(null,{});
  const S13=await _pS.evaluate(()=>{
    const o={}; S.bw=85; S.gender='H'; S.foodLog=[];
    // ── la fiche creatine, en entretien ──────────────────────────────────────
    if(typeof creatPhase!=='undefined') creatPhase='maintenance';
    const el=document.getElementById('creat-content');
    if(!el) return {err:'creat-content absent'};
    renderCreatine();
    o.txt=el.textContent||'';
    o.dose=(o.txt.match(/(\d+)g \/ jour/)||[])[1];
    // ── la barre de proteines lit-elle le journal ? ──────────────────────────
    const inp=document.getElementById('prot-eaten');
    if(inp) inp.value='';
    S.foodLog=[{date:today(),meal:'dejeuner',name:'Steak',kcal:400,prot:60,carbs:0,fat:18,ts:Date.now()}];
    persist(); updateProteinBar();
    o.barre=(document.getElementById('prot-remaining')||{}).textContent;
    o.cible=(document.getElementById('prot-target-disp')||{}).textContent;
    // ... et une saisie MANUELLE reste prioritaire
    if(inp){ inp.value='150'; updateProteinBar(); }
    o.barreManuelle=(document.getElementById('prot-remaining')||{}).textContent;
    if(inp) inp.value='';
    S.foodLog=[]; persist();
    // ── ⭐ la dose est LIBRE, et l'avertissement suit le chiffre (decision Michel 18/08) ──
    if(typeof setCreatDose==='function'){
      setCreatDose(0);   S.bw=85; renderCreatine();
      o.auto=(el.textContent.match(/(\d+)g \/ jour/)||[])[1];
      setCreatDose(8);   renderCreatine();
      o.libre8=(el.textContent.match(/([\d.]+)g \/ jour/)||[])[1];
      o.avert8=el.textContent;
      setCreatDose(4);   renderCreatine();
      o.avert4=el.textContent;
      setCreatDose(3);   renderCreatine();
      o.avert3=el.textContent;
      setCreatDose(0);   renderCreatine();
      o.retour=(el.textContent.match(/(\d+)g \/ jour/)||[])[1];
    }
    // ── la phrase caféine, dans les combos premium ───────────────────────────
    S.premium=true; renderSupplCombos();
    const cb=document.getElementById('suppl-combos');
    o.combos=cb?(cb.textContent||''):'';
    return o;
  });
  await _cS.close();

  if(S13.err){ t('X le bloc tourne', false, S13.err); }
  else{
    t('⭐⭐ CONTRE-INDICATIONS ANSES affichees sur la fiche creatine (elles ne l\'etaient nulle part)',
      /ANSES/.test(S13.txt) && /rénale/.test(S13.txt) && /médecin/.test(S13.txt),
      S13.txt.slice(0,120));
    t('⭐ le repere REGLEMENTAIRE (3 g, arrete 2016) est affiche des que la dose le depasse',
      +S13.dose<=3 || /3 g/.test(S13.txt), 'dose='+S13.dose);
    /* ⚠️ TEMOIN AJUSTE LE 18/08 AU SOIR, et la raison compte : la formule « pas un risque
       demontre » a DEMENAGE. Elle accompagne desormais l'avertissement au-dela de 5 g ; entre
       3 et 5 g, le texte dit autre chose et de mieux fonde — que c'est une regle de
       COMMERCIALISATION, pas une limite pour la personne (decision Michel). Ce qu'on protege
       n'a pas change : ce repere ne doit pas etre dramatise. */
    t('/!\\ ... et le repere n\'est jamais dramatise (aucun « danger », aucun « attention »)',
      +S13.dose<=3 || (!/danger/i.test(S13.txt) && !/⚠️ Attention/i.test(S13.txt)));
    t('⭐⭐ LA PHRASE FAUSSE A DISPARU : la cafeine ne « reduit pas l\'absorption »',
      !/réduire l'absorption/.test(S13.combos) && !/Espace-les de 2h/.test(S13.combos));
    t('⭐ ... remplacee par ce qui est MESURE, et par ce qui n\'a pas ete teste',
      /absorption n'est pas en cause/.test(S13.combos) && /jamais été testé/.test(S13.combos));
    t('⭐⭐ LA BARRE PROTEINES LIT LE JOURNAL (60 g manges → il en reste cible-60)',
      S13.barre===String(Math.max(0,parseInt(S13.cible)-60))+'g',
      'reste='+S13.barre+' cible='+S13.cible);
    t('/!\\ une saisie MANUELLE reste prioritaire sur le journal (on ne l\'ecrase pas)',
      S13.barreManuelle===String(Math.max(0,parseInt(S13.cible)-150))+'g',
      'reste='+S13.barreManuelle);
    t('⭐⭐ LA DOSE EST LIBRE : 8 g reglés a la main sont bien affiches (aucun plafond)',
      S13.libre8==='8', 'affiche='+S13.libre8);
    t('⭐⭐ ... et au-dela de 5 g l\'AVERTISSEMENT apparait (zone peu etudiee, pas un danger)',
      /Au-delà de/.test(S13.avert8||'') && /pas un risque démontré/.test(S13.avert8||''));
    t('/!\\ entre 3 et 5 g : un simple REPERE, et il dit que c\'est une regle de COMMERCIALISATION',
      /commercialisation/.test(S13.avert4||'') && !/Au-delà de/.test(S13.avert4||''));
    t('/!\\ a 3 g ou moins : ni repere ni avertissement (on n\'encombre pas pour rien)',
      !/commercialisation/.test(S13.avert3||'') && !/Au-delà de/.test(S13.avert3||''));
    t('/!\\ on peut revenir a la suggestion de l\'app en un geste',
      S13.retour===S13.auto, 'auto='+S13.auto+' retour='+S13.retour);
  }
}

await b.close(); srv.close();

console.log('\n════ TOTAL LINÉAIRE : '+ok+' ✅ · '+ko+' ❌ ════');
process.exit(ko?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
