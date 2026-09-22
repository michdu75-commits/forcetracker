#!/usr/bin/env node
/* 🧪 BANC V9 — ⛔ LECTURE SEULE. Aucun fichier servi modifié, aucune publication, aucun bump.
   ① le miroir de V0 est revalidé contre l'app SERVIE ;
   ② TROIS corpus : A adversarial · B plausible · C dérivé de distributions publiées ;
   ③ l'autopsie du cas ~659 g, de V0 à V9 ;
   ④ l'attribution de CAUSE des prescriptions > 600 g ;
   ⑤ la simulation temporelle : le même utilisateur à S0, S4, S8, S12, S16.
*/
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const M8 = require('./moteur_v8.js'), M9 = require('./moteur_v9.js');
const ROOT = path.dirname(__dirname);
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
  '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2',
  '.webp':'image/webp','.ico':'image/x-icon','.wasm':'application/wasm'};
const VAR = Object.assign({}, M8.VARIANTES, { V9: M9.mV9, V9dur: M9.mV9dur, V9mk: M9.mV9mk });
delete VAR.V8nc;
const NOMS = Object.keys(VAR);

/* ═════════ MÉTRIQUES — identiques pour toutes les variantes (§24) ═════════ */
function met(p, r) {
  if (!r) return null;
  const { ffm } = M8.ffmDe(p), tdee = M8.mTDEE(p);
  return { kcal:r.kcal, kcal_kg:r.kcal/p.bw, prot_gkg:r.prot_g/p.bw, prot_gkg_ffm:r.prot_g/ffm,
    prot_pct:r.prot_g*4/r.kcal, lip_gkg:r.fat_g/p.bw, lip_pct:r.fat_g*9/r.kcal,
    gluc_gkg:r.carbs_g/p.bw, gluc_abs:r.carbs_g, gluc_pct:r.carbs_g*4/r.kcal,
    ecart_kcal:r.kcal-tdee, ecart_pct:(r.kcal-tdee)/tdee,
    vitesse:(r.kcal-tdee)*7/7700/p.bw*100, ea:(r.kcal-(p.seancesSem||0)*7*p.bw/7)/ffm,
    fermeture:r.prot_g*4+r.fat_g*9+r.carbs_g*4-r.kcal };
}
function viol(p, r, m) {
  const o = []; if (!r || !m) { o.push('P00_pas_de_sortie'); return o; }
  const reg = !!p.foodMode, tag = s => reg ? s+'@regime' : s;
  if (!isFinite(r.prot_g)||!isFinite(r.fat_g)||!isFinite(r.carbs_g)||!isFinite(r.kcal)) o.push('P03_nan');
  if (r.prot_g<0||r.fat_g<0||r.carbs_g<0) o.push('P02_macro_negative');
  if (Math.abs(m.fermeture)>5) o.push('P01_fermeture_sup_5');
  if (m.prot_gkg<0.8) o.push('P11_prot_sous_0_8_gkg');
  if (m.prot_gkg>2.2) o.push(tag('R11_prot_sur_2_2_gkg_repere_ANSES'));
  if (m.prot_gkg_ffm>3.1) o.push(tag('P11_prot_sur_3_1_gkg_ffm_Helms'));
  if (m.prot_pct>0.40) o.push(tag('P11_prot_sur_40pct'));
  if (m.lip_gkg<0.5) o.push(tag('P12_lip_sous_0_5_gkg'));
  if (m.lip_gkg>1.5) o.push(tag('P12_lip_sur_1_5_gkg'));
  if (m.lip_pct<0.15) o.push(tag('P12_lip_sous_15pct'));
  if (m.lip_pct>0.35) o.push(tag('P12_lip_sur_35pct'));
  if (r.carbs_g===0 && !reg) o.push('P13_gluc_zero');
  if (m.gluc_gkg>7 && !reg) o.push('O_gluc_sur_7_gkg');
  if (m.gluc_gkg>10 && !reg) o.push('O_gluc_sur_10_gkg');
  if (m.gluc_gkg>12 && !reg) o.push('P13_gluc_sur_12_gkg');
  /* ⛔⛔ RÉTIQUETÉ : « S_ » = SIGNAL de praticabilité, pas un invariant. 600 g n'a AUCUNE
     justification physiologique — vérifié, il vient de moi. Il reste mesuré, il ne juge plus. */
  if (m.gluc_abs>600 && !reg) o.push('S_gluc_sur_600g_SIGNAL_praticabilite');
  /* Le plafond de déficit devient CONTEXTUEL : Alpert, puis Murphy & Koehler si IMC < 30. */
  const { ffm } = M8.ffmDe(p), fm = p.bw - ffm, imc = p.bw/((p.height/100)**2);
  const pAl = M9.CONST.ALPERT_KCAL_PAR_KG_GRAS*fm;
  if (m.ecart_kcal < -pAl-5) o.push('P09_deficit_au_dela_dAlpert');
  if (imc < 30 && m.ecart_kcal < -M9.CONST.MK_PLAFOND-5) o.push('P09_deficit_sur_500_hors_obesite');
  if (m.ecart_pct>0.20) o.push('P10_surplus_sur_20pct');
  if (m.ea<30) o.push('P19_EA_sous_30');
  if (m.kcal_kg>55) o.push('S_kcal_kg_sur_55_SIGNAL');
  return o;
}

/* ═════════ CORPUS ═════════ */
function* corpusA() {
  for (const gender of ['H','F']) for (const age of [18,30,45,60,80])
  for (const height of [148,160,172,185,200]) for (const bw of [45,60,75,90,110,130,150])
  for (const bfC of [null,8,15,25,35,45]) for (const activityLevel of [1.375,1.55,1.725,1.9])
  for (const workType of ['bureau','actif','physique'])
  for (const goal of ['perte','recomp','equilibre','force','muscle'])
  for (const seancesSem of [0,3,6]) for (const level of ['','confirme'])
    yield { gender,age,height,bw,activityLevel,workType,goal,level,seancesSem,
      seriesParGroupe:seancesSem*3, phase:'charge', smoker:false, othersport:'aucun',
      foodMode:'', manualKcal:null, historique:null,
      lm: bfC==null?null:Math.round(bw*(1-bfC/100)*10)/10 };
}
let _s=20260924;
const rnd=()=>{_s=(_s*1103515245+12345)&0x7fffffff;return _s/0x7fffffff;};
const gauss=(mu,sd)=>mu+sd*Math.sqrt(-2*Math.log(Math.max(1e-9,rnd())))*Math.cos(2*Math.PI*rnd());
const tire=t=>{let r=rnd()*t.reduce((a,x)=>a+x[1],0);for(const[v,p]of t){r-=p;if(r<=0)return v;}return t[t.length-1][0];};
function base(gender,height,bw,age,bf,aBilan){
  const seancesSem=+tire([[0,8],[1,6],[2,14],[3,26],[4,24],[5,13],[6,7],[7,2]]);
  return { gender,height,bw,age,seancesSem, seriesParGroupe:Math.round(seancesSem*(2+rnd()*4)),
    activityLevel:+tire([[1.375,25],[1.55,45],[1.725,25],[1.9,5]]),
    workType:tire([['bureau',55],['debout',20],['actif',17],['physique',8]]),
    goal:tire([['muscle',38],['perte',30],['recomp',14],['force',8],['equilibre',8],['endurance',2]]),
    level:tire([['',55],['debutant',15],['intermediaire',18],['confirme',12]]),
    phase:tire([['charge',75],['decharge',25]]), smoker:rnd()<0.18,
    othersport:rnd()<0.35?'velo':'aucun', foodMode:tire([['',92],['keto',4],['lowcarb',4]]),
    manualKcal:null, historique:null,
    lm:aBilan?Math.round(bw*(1-bf/100)*10)/10:null };
}
/* CORPUS B — population plausible d'app de musculation. ⚠️ MODÈLE, pas recensement. */
function profilB(){
  const gender=rnd()<0.72?'H':'F';
  const height=Math.round(Math.min(205,Math.max(145,gauss(gender==='H'?176:164,7))));
  const imc=Math.min(45,Math.max(16,gauss(25.5,4.2)));
  const bw=Math.round(imc*(height/100)**2*10)/10;
  const age=Math.round(Math.min(80,Math.max(16,gauss(34,12))));
  const bf=Math.min(55,Math.max(4,gauss(gender==='H'?20:28,7)));
  return base(gender,height,bw,age,bf,rnd()<0.20);
}
/* ⭐⭐ CORPUS C — profils dérivés de DISTRIBUTIONS PUBLIÉES (adultes américains, NHANES).
   ⛔⛔ ET LA LIMITE EST ÉCRITE AVANT LES CHIFFRES : **je n'ai PAS téléchargé NHANES.**
   `wwwn.cdc.gov` et `www.cdc.gov` rendent HTTP 000 (`connect_rejected`, politique du proxy) —
   vérifié le 24/09. Les moyennes et écarts-types ci-dessous sont des **statistiques résumées
   publiées**, pas des lignes de données. 👉 *Un corpus bâti sur des moyennes publiées teste le
   RÉALISME DES ENTRÉES ; il ne remplace jamais des données individuelles longitudinales.*
   ⚠️ Et il ne décrit PAS les utilisateurs de Force Tracker : c'est la population générale
   américaine, plus lourde et moins active. Il sert exactement à ça — voir ce que le moteur fait
   sur des corps réels plutôt que sur une gaussienne que j'ai choisie. */
function profilC(){
  const gender=rnd()<0.49?'H':'F';
  const height=Math.round(Math.min(205,Math.max(140,gauss(gender==='H'?175.3:161.3,gender==='H'?7.4:7.1))));
  const bw=Math.round(Math.min(200,Math.max(40,gauss(gender==='H'?90.6:77.5,gender==='H'?21:22)))*10)/10;
  const age=Math.round(Math.min(80,Math.max(20,gauss(47,17))));
  const bf=Math.min(60,Math.max(5,gauss(gender==='H'?28:40,7)));
  return base(gender,height,bw,age,bf,rnd()<0.20);
}
const pctl=(a,q)=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(q*s.length))];};
const dist=a=>a.length?{p50:+pctl(a,.5).toFixed(2),p90:+pctl(a,.9).toFixed(2),p95:+pctl(a,.95).toFixed(2),
  p99:+pctl(a,.99).toFixed(2),max:+Math.max(...a).toFixed(2)}:null;

/* ═════════ LE CAS ~659 g (§20) ═════════
   ⭐ Profil de Michel tel que l'audit du 22/09 l'a reconstruit : 85,8 kg, prise de muscle.
   Le chiffre publié à l'époque était **7,61 g/kg** à 85,8 kg, soit ≈ 653 g. */
/* ⛔⛔ LE PROFIL EXACT, REPRIS DE L'AUDIT DU 22/09 — et ma première version était FAUSSE.
   J'avais mis 178 cm, 52 ans, activité 1,725 et métier « bureau », ce qui rendait **490 g** au
   lieu de 659. Le vrai profil du cahier est : **85,8 kg · 179 cm · 41 ans · « Actif (5-6 j) »
   (1,725) · métier PHYSIQUE · phase CHARGE · jour de séance**, TDEE mesuré **3 515 kcal**.
   👉 *Un « cas de référence » reconstruit de mémoire au lieu d'être relu est un faux témoin* —
   et il aurait fait dire à ce dossier que V0 ne produit pas 659 g, ce qui est faux. */
const CAS659 = { gender:'H', age:41, height:179, bw:85.8, activityLevel:1.725, workType:'physique',
  goal:'muscle', phase:'charge', smoker:false, othersport:'aucun', foodMode:'', manualKcal:null,
  lm:null, level:'', seancesSem:5, seriesParGroupe:15, historique:null };

/* ═════════ SIMULATION TEMPORELLE (§21) ═════════ */
function histo(jours, joursNutri, apportMoyen, poids0, penteKgSem, nPesees, opts){
  opts=opts||{};
  const pesees=[];
  for(let i=0;i<nPesees;i++){
    const j=Math.round(i*(jours-1)/Math.max(1,nPesees-1));
    const d=new Date(Date.UTC(2026,0,1)+j*864e5).toISOString().slice(0,10);
    pesees.push({date:d,kg:Math.round((poids0+penteKgSem*j/7)*10)/10});
  }
  return { jours, joursNutriRenseignes:joursNutri, apportMoyen, pesees,
    activiteStable:opts.activiteStable!==false, changementObjectif:!!opts.changementObjectif,
    interruption:!!opts.interruption };
}

(async () => {
  const T={}, t0=Date.now(), OUT={horodatage:new Date().toISOString()};

  /* ── ① revalidation du miroir V0 ── */
  const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';
    const f=path.join(ROOT,u);
    if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
    r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});
    fs.createReadStream(f).pipe(r);});
  await new Promise(r=>srv.listen(0,r));
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const cx=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
  const pg=await cx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(`try{localStorage.clear();}catch(e){}`);
  await pg.goto('http://localhost:'+srv.address().port+'/index.html');
  await pg.waitForTimeout(2200);
  const ech=[]; let i=0; for(const p of corpusA()){ if(i++%307===0) ech.push(p); } ech.push(CAS659);
  const APP=await pg.evaluate(profils=>{
    const j=n=>{const d=new Date(Date.now()-n*864e5);
      return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);};
    return profils.map(p=>{
      S.gender=p.gender;S.bw=p.bw;S.height=p.height;S.age=p.age;S.activityLevel=p.activityLevel;
      S.workType=p.workType;S.goal=p.goal;S.smoker=!!p.smoker;S.nutritionPhase=p.phase;
      S.manualKcal=p.manualKcal;S.foodMode=p.foodMode||'';S.keto=false;S.level=p.level||'';
      S.discipline='muscu';S.sessions=[];S.weightLog=[];S.mensLog=[];S.stepsLog=[];
      S.coachQuiz={answers:{othersport:p.othersport}};
      S.bodyScans=p.lm!=null?[{date:j(3),leanMass:p.lm,weight:p.bw}]:[];
      S.mensCycleStart=null;S.contraception='';
      const m=calcMacros(p.phase);
      return {kcal:m.calories,prot_g:m.prot_g,fat_g:m.fat_g,carbs_g:m.carbs_g};});
  }, ech);
  await b.close(); srv.close();
  const ec=[]; ech.forEach((p,k)=>{const a=APP[k],v=M8.mV0(p);
    if(a.kcal!==v.kcal||a.prot_g!==v.prot_g||a.fat_g!==v.fat_g||a.carbs_g!==v.carbs_g)
      ec.push({p,a,v});});
  OUT.validation_v0={taille:ech.length,ecarts:ec.length,erreurs_page:errs};
  if(ec.length){console.log('⛔ ARRÊT : miroir V0 divergent ('+ec.length+')');process.exit(1);}
  console.log('① MIROIR V0 vs APP SERVIE : '+ech.length+' profils, 0 écart, '+errs.length+' erreur(s) de page');

  /* ── ② les trois corpus ── */
  function passe(gen,n,nom){
    const R={}; NOMS.forEach(k=>R[k]={n:0,viol:{},met:{}});
    const CH=['kcal','kcal_kg','prot_gkg','prot_gkg_ffm','lip_gkg','lip_pct','gluc_gkg','gluc_abs',
              'gluc_pct','ecart_kcal','vitesse','ea','fermeture'];
    NOMS.forEach(k=>CH.forEach(c=>R[k].met[c]=[]));
    const causes={}, plaus={}, gros=[];
    let z=0;
    for(const p of gen){
      if(n&&z>=n)break; const garde=(z%101===0); z++;
      for(const k of NOMS){
        const r=VAR[k](p), m=met(p,r), X=R[k]; X.n++;
        for(const v of viol(p,r,m)) X.viol[v]=(X.viol[v]||0)+1;
        if(garde&&m) CH.forEach(c=>{ if(isFinite(m[c])) X.met[c].push(m[c]); });
        /* §5 : attribution de cause, sur V9 uniquement */
        if(k==='V9'&&r&&!p.foodMode){
          const pl=r.plausibilite; plaus[pl.niveau]=(plaus[pl.niveau]||0)+1;
          if(r.carbs_g>600){
            (pl.causes.length?pl.causes:['aucune_cause_identifiee']).forEach(c=>causes[c]=(causes[c]||0)+1);
            if(gros.length<4000) gros.push({g:r.carbs_g,gkg:+(r.carbs_g/p.bw).toFixed(2),
              kcal:r.kcal, kcalkg:+(r.kcal/p.bw).toFixed(1), bw:p.bw, sem:p.seancesSem,
              act:p.activityLevel, wt:p.workType, goal:p.goal, niv:pl.niveau, c:pl.causes.join('+'),
              lib:`${p.gender} ${p.age}a ${p.height}cm ${p.bw}kg act${p.activityLevel} ${p.workType} ${p.goal} ${p.seancesSem}s/sem`});
          }
        }
      }
    }
    const O={nom,n:z,variantes:{},causes_sup600:causes,plausibilite_v9:plaus};
    NOMS.forEach(k=>{O.variantes[k]={violations:R[k].viol,distributions:{}};
      CH.forEach(c=>O.variantes[k].distributions[c]=dist(R[k].met[c]));});
    gros.sort((a,b)=>b.gkg-a.gkg);
    O.top50_sup600=gros.slice(0,50);
    O.sup600_dist={ abs:dist(gros.map(x=>x.g)), gkg:dist(gros.map(x=>x.gkg)) };
    return O;
  }
  let t=Date.now(); OUT.corpusA=passe(corpusA(),0,'A — adversarial'); T.A=Date.now()-t;
  t=Date.now(); OUT.corpusB=passe((function*(){for(let z=0;z<1000000;z++)yield profilB();})(),1000000,'B — plausible'); T.B=Date.now()-t;
  t=Date.now(); OUT.corpusC=passe((function*(){for(let z=0;z<500000;z++)yield profilC();})(),500000,'C — distributions publiées'); T.C=Date.now()-t;
  console.log('② CORPUS A '+OUT.corpusA.n.toLocaleString('fr-FR')+' · B '+OUT.corpusB.n.toLocaleString('fr-FR')+' · C '+OUT.corpusC.n.toLocaleString('fr-FR')+' profils × '+NOMS.length+' variantes');

  /* ── ③ autopsie du cas ~659 g ── */
  OUT.autopsie659={profil:CAS659,versions:{}};
  NOMS.forEach(k=>{ const r=VAR[k](CAS659); if(!r) return;
    const m=met(CAS659,r), {ffm,bf}=M8.ffmDe(CAS659);
    OUT.autopsie659.versions[k]={bmr:M8.mBMR(CAS659),tdee:M8.mTDEE(CAS659),kcal:r.kcal,
      P:r.prot_g,L:r.fat_g,G:r.carbs_g,gluc_gkg:+m.gluc_gkg.toFixed(2),
      gluc_pct:+(m.gluc_pct*100).toFixed(1),ffm:Math.round(ffm*10)/10,bf:Math.round(bf*10)/10,
      plausibilite:r.plausibilite?r.plausibilite.niveau:null,
      bande:r.plausibilite?r.plausibilite.bande_lib:null,
      explication:r.explication||null}; });

  /* ── ④ simulation temporelle ── */
  const etapes=[
    ['S0  — nouvel utilisateur, aucun historique', null],
    ['S4  — 28 j, journal à 18 %, 3 pesées', histo(28,5,2900,86,-0.05,3)],
    ['S8  — 56 j, journal à 64 %, 9 pesées', histo(56,36,3050,86,-0.02,9)],
    ['S12 — 84 j, journal à 86 %, 14 pesées, poids stable', histo(84,72,3050,86,0,14)],
    ['S16 — activité augmente (6 séances), journal tenu', histo(84,72,3320,86,0.03,14)]
  ];
  OUT.temporel=etapes.map(([lib,h],idx)=>{
    const p=Object.assign({},CAS659,{historique:h});
    if(idx===4){p.seancesSem=6;p.seriesParGroupe=22;}
    const r=M9.mV9(p);
    return {etape:lib, tdee_estime:r.tdee.estime, tdee_observe:r.tdee.observe,
      tdee_retenu:r.tdee.tdee, confiance:r.tdee.confiance.niveau, poids_obs:r.tdee.poids,
      raisons:r.tdee.confiance.raisons, kcal:r.kcal, P:r.prot_g, L:r.fat_g, G:r.carbs_g,
      gluc_gkg:+(r.carbs_g/p.bw).toFixed(2), plausibilite:r.plausibilite.niveau,
      bande:r.plausibilite.bande_lib};
  });

  T.total=Date.now()-t0; OUT.temps_ms=T;
  fs.writeFileSync('/tmp/banc_v9.json',JSON.stringify(OUT,null,1));

  /* ── SORTIE ── */
  const L=console.log;
  for(const C of [OUT.corpusA,OUT.corpusB,OUT.corpusC]){
    L('\n=== CORPUS '+C.nom+' ('+C.n.toLocaleString('fr-FR')+' profils, taux pour 100 000) ===');
    const cl=new Set(); NOMS.forEach(k=>Object.keys(C.variantes[k].violations).forEach(v=>cl.add(v)));
    L('PROPRIÉTÉ'.padEnd(40)+NOMS.map(x=>x.padStart(8)).join(''));
    [...cl].sort().forEach(v=>L(v.padEnd(40)+NOMS.map(k=>
      String(Math.round((C.variantes[k].violations[v]||0)/C.n*1e5)).padStart(8)).join('')));
  }
  L('\n=== PLAUSIBILITÉ GLUCIDIQUE V9 (corpus B) ===');
  Object.entries(OUT.corpusB.plausibilite_v9).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>
    L('  '+k.padEnd(32)+String(Math.round(v/OUT.corpusB.n*1000)/10).padStart(6)+' %'));
  L('\n=== CAUSES DES PRESCRIPTIONS > 600 g (corpus B, V9) ===');
  Object.entries(OUT.corpusB.causes_sup600).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>
    L('  '+k.padEnd(36)+String(v).padStart(7)));
  L('  distribution : absolus '+JSON.stringify(OUT.corpusB.sup600_dist.abs)+
    '  g/kg '+JSON.stringify(OUT.corpusB.sup600_dist.gkg));
  L('\n=== AUTOPSIE DU CAS ~659 g ===');
  Object.entries(OUT.autopsie659.versions).forEach(([k,v])=>
    L('  '+k.padEnd(6)+' BMR '+v.bmr+' TDEE '+v.tdee+' → '+String(v.kcal).padStart(5)+' kcal · P'+
      String(v.P).padStart(3)+' L'+String(v.L).padStart(3)+' G'+String(v.G).padStart(3)+
      ' ('+v.gluc_gkg+' g/kg, '+v.gluc_pct+' %)'+(v.plausibilite?' · '+v.plausibilite:'')));
  L('\n=== LE MÊME UTILISATEUR DANS LE TEMPS ===');
  OUT.temporel.forEach(e=>L('  '+e.etape.padEnd(50)+' TDEE '+
    (e.tdee_observe!=null?e.tdee_estime+'→'+e.tdee_retenu+' (obs '+e.tdee_observe+', w='+e.poids_obs+')':e.tdee_retenu+' (formule)')+
    ' · conf '+e.confiance.padEnd(8)+' · '+String(e.kcal).padStart(5)+' kcal P'+e.P+' L'+e.L+' G'+e.G+
    ' ('+e.gluc_gkg+' g/kg) · '+e.plausibilite));
  L('\ntemps : '+JSON.stringify(T)+'\n→ /tmp/banc_v9.json');
})();
