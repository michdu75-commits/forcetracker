/* DIFFÉRENTIEL LARGE — NUT-LIPIDES-25-01 (02/10/2026, session-B) : master ↔ branche, même grille, deux arbres
   servis côte à côte. Usage :
     git worktree add --detach /tmp/ft_master 5b0387d4
     ROOT_A=/tmp/ft_master ROOT_B=$PWD node tools/diff_nutri_lipides25.js
     git worktree remove --force /tmp/ft_master
   Compte ce qui DOIT rester identique (BMR, TDEE, cible, protéines, kéto, low carb) et ce qui PEUT changer
   (lipides et glucides des modes standards, cycle séance/repos par son plancher de lipides, D-034).
   Profils de TEST, aucun appel réseau (Apps Script, Worker, Anthropic bloqués). */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'),fs=require('fs'),path=require('path');
const serve=root=>http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(root,p);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':p.endsWith('.js')?'text/javascript':p.endsWith('.html')?'text/html':p.endsWith('.json')?'application/json':'text/css'});fs.createReadStream(f).pipe(r);});
const grille=()=>{const o=[];const sem=j=>{const T=new Date('2026-09-20T12:00:00'),s=[];for(let d=0;d<28;d++){const x=new Date(T-d*864e5);if(j.includes(x.getDay()))s.push({date:x.toISOString().slice(0,10),exs:[{name:'Squat',sets:[{kg:100,reps:5,done:true}]}]});}return s;};
 const res=[];
 ['H','F'].forEach(sx=>[20,45,70,100,130,170,220,300].forEach(bw=>[101,160,190,229].forEach(h=>[14,40,75,99].forEach(a=>[1.2,1.55,1.9].forEach(ac=>
  ['muscle','force','perte','recomp','equilibre','endurance'].forEach(goal=>['charge','decharge'].forEach(ph=>['', 'keto','lowcarb'].forEach(md=>[null,[0,2,4],[1,3,5]].forEach(ses=>[0,1000].forEach(man=>{
   if(md&&ses)return; if(man&&(ses||ph==='decharge'))return;
   S.gender=sx;S.bw=bw;S.height=h;S.age=a;S.activityLevel=ac;S.activitySrc='choisi';S.goal=goal;S.nutritionPhase=ph;S.workType='bureau';S.smoker=false;
   S.manualKcal=man;S.weightLog=[];S.bodyScans=[];S.foodMode=md;S.keto=md==='keto';S.sessions=ses?sem(ses):[];S.mensCycleStart=sx==='F'&&a===40?'2026-09-01':'';S.wkt=null;
   const m=calcMacros(ph),bd=bmrDetail();
   res.push([sx,bw,h,a,ac,goal,ph,md,ses?ses.join(''):'',man, bd.kcal, calcTDEE(), m.calories, m.prot_g, m.fat_g, m.carbs_g, m.cycle?m.cycle.jour:null, m.cycle&&m.cycle.autre?m.cycle.autre.fat_g+'/'+m.cycle.autre.carbs_g:null, m.incompatible?(m.incompatible.ecart+'|'+(m.incompatible.autre?m.incompatible.autre.ecart:'')):null]);
 }))))))))));
 return res;};
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
 const run=async root=>{const s=serve(root);await new Promise(r=>s.listen(0,r));const cx=await b.newContext({serviceWorkers:'block',timezoneId:'Europe/Paris'});
  await cx.route(/script\.google\.com|workers\.dev|anthropic/,rt=>rt.abort());
  await cx.addInitScript(`(()=>{const F=new Date('2026-09-20T12:00:00');const V=Date;window.Date=class extends V{constructor(...a){if(a.length)super(...a);else super(F.getTime());}static now(){return F.getTime();}};})();`);
  const pg=await cx.newPage();await pg.goto('http://localhost:'+s.address().port+'/index.html');await pg.waitForTimeout(2000);
  const r=await pg.evaluate('('+grille.toString()+')()');await cx.close();s.close();return r;};
 const A=await run(process.env.ROOT_A), B=await run(process.env.ROOT_B);
 const st={lipAvMin:1e9,lipAvMax:0,dLmin:1e9,dLmax:-1e9,cycPerduBw:{},cycPerduGoal:{},g0Nouveau:0,incNouveau:0,n:A.length,bmr:0,tdee:0,cible:0,prot:0,ketolc:0,lipStd:0,cycleAv:0,cycleAp:0,cyclePerdu:0,cycleGagne:0,g0Av:0,g0Ap:0,incAv:0,incAp:0,incCycleAv:0,incCycleAp:0,pctMin:1e9,pctMax:0,diffAutre:0};
 for(let i=0;i<A.length;i++){const a=A[i],b2=B[i];if(a.slice(0,10).join()!==b2.slice(0,10).join())throw 'grilles désalignées';
  if(a[10]!==b2[10])st.bmr++;if(a[11]!==b2[11])st.tdee++;if(a[12]!==b2[12])st.cible++;if(a[13]!==b2[13])st.prot++;
  if(a[7]){if(a.slice(13).join()!==b2.slice(13).join())st.ketolc++;continue;}
  if(a[14]!==b2[14])st.lipStd++;
  if(a[12]&&a[14]!=null&&!a[16]){const p=a[14]*9/a[12]*100;st.lipAvMin=Math.min(st.lipAvMin,p);st.lipAvMax=Math.max(st.lipAvMax,p);}
  if(a[14]!=null&&b2[14]!=null&&!a[16]&&!b2[16]){const d=b2[14]-a[14];st.dLmin=Math.min(st.dLmin,d);st.dLmax=Math.max(st.dLmax,d);}
  if(a[16]&&!b2[16]){st.cycPerduBw[a[1]]=(st.cycPerduBw[a[1]]||0)+1;st.cycPerduGoal[a[5]]=(st.cycPerduGoal[a[5]]||0)+1;}
  if(a[15]!==0&&b2[15]===0)st.g0Nouveau++;if(!a[18]&&b2[18])st.incNouveau++;
  if(a[16])st.cycleAv++;if(b2[16])st.cycleAp++;if(a[16]&&!b2[16])st.cyclePerdu++;if(!a[16]&&b2[16])st.cycleGagne++;
  if(a[15]===0)st.g0Av++;if(b2[15]===0)st.g0Ap++;if(a[18])st.incAv++;if(b2[18])st.incAp++;
  if(a[18]&&a[16])st.incCycleAv++;if(b2[18]&&b2[16])st.incCycleAp++;
  if(b2[12]&&b2[14]!=null&&!b2[16]){const p=b2[14]*9/b2[12]*100;st.pctMin=Math.min(st.pctMin,p);st.pctMax=Math.max(st.pctMax,p);}
 }
 st.lipAvMin=Math.round(st.lipAvMin*10)/10;st.lipAvMax=Math.round(st.lipAvMax*10)/10;st.pctMin=Math.round(st.pctMin*10)/10;st.pctMax=Math.round(st.pctMax*10)/10;
 console.log(JSON.stringify(st));await b.close();})().catch(e=>{console.error('PLANTAGE',e);process.exit(2);});
