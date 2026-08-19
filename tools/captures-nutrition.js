#!/usr/bin/env node
/**
 * 📸 LES ÉTATS DE LA SECTION NUTRITION — pour une revue UX à plusieurs (18/08/2026)
 *
 * Michel : *« fais-moi un UX complet de la section nutrition avec des screens pour que je voie
 * avec GPT si tout est cohérent, ainsi que l'autre Claude »*.
 *
 * ⚠️ POURQUOI UN SCRIPT ET PAS DES CAPTURES À LA MAIN : ce qu'on veut faire relire, ce ne sont
 * pas trois jolis écrans, ce sont **les états** — vide, à moitié rempli, plein, en régime, en
 * dépassement. Ce sont eux qui portent les décisions de conception, et ce sont eux qu'on ne
 * pense jamais à photographier depuis son téléphone. Un script les produit tous, à l'identique,
 * autant de fois qu'on veut.
 *
 * ⚠️ DONNÉES FICTIVES (« Alex »), comme tools/captures.js. Ces images partent chez GPT et chez
 * une autre instance : aucun poids, aucune masse grasse, aucun e-mail réel n'y figure.
 *
 * ⚠️ PIÈGES HÉRITÉS de tools/captures.js, déjà payés :
 *   · goScreen() prend 'nutrition', pas 's-nutrition' ;
 *   · poser ft4_ob2 / ft4_guide_shown / ft4_wn_seen, sinon on capture l'écran d'installation ;
 *   · une modale ouverte par .open reste invisible si un display:none en ligne traîne.
 *
 * Lancer :  node tools/captures-nutrition.js      Sortie : ./captures-nutrition/
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const OUT=path.resolve(process.env.FT_SHOTS_OUT||path.join(ROOT,'captures-nutrition'));
fs.mkdirSync(OUT,{recursive:true});
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
  '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});

(async()=>{
await new Promise(r=>srv.listen(0,r)); const PORT=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:1000},
  deviceScaleFactor:2,timezoneId:'Europe/Paris'});
const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));

const seed={ft4_name:'Alex',ft4_bw:'79',ft4_age:'34',ft4_ht:'178',ft4_gender:'H',ft4_act:'1.55',
  ft4_work:'debout',ft4_goal:'recomp',ft4_rest:'120',ft4_ob2:'1',ft4_guide_shown:'1',ft4_wn_seen:'99'};
await p.addInitScript(`(()=>{try{${Object.entries(seed).map(([k,v])=>
  `localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)});`).join('')}
  window._demoMode=true;}catch(e){}})();`);
await p.goto('http://localhost:'+PORT+'/index.html'); await p.waitForTimeout(2600);
await p.evaluate(()=>document.querySelectorAll('.overlay').forEach(o=>{o.classList.remove('open');o.style.display='none';}));

const jours=n=>{const d=new Date(Date.now()-n*864e5);
  return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().split('T')[0];};

const shots=[];
async function shot(nom,titre,fn){
  if(fn) await p.evaluate(fn,{j:[jours(0),jours(1),jours(2),jours(3),jours(4)]});
  await p.waitForTimeout(700);
  const f=path.join(OUT,nom+'.png');
  await p.screenshot({path:f,fullPage:true});
  shots.push({nom,titre,fichier:f});
  console.log('  ✅ '+nom+'  —  '+titre);
}

console.log('\n📸 SECTION NUTRITION — les états\n');

// ── ONGLET MACROS ────────────────────────────────────────────────────────────
await shot('01-macros-vide','Macros — personne n\'a rien noté',()=>{
  S.foodLog=[]; persist(); goScreen('nutrition',null);
  switchNuTab('macros',document.getElementById('ntab-macros'));
});
await shot('02-macros-1jour','Macros — un seul jour noté (la moyenne ne ment pas)',({j})=>{
  S.foodLog=[{date:j[0],meal:'petitdej',name:'Shaker protéine',kcal:180,prot:35,carbs:6,fat:2,ts:Date.now()}];
  persist(); renderNutrition();
});
await shot('03-macros-semaine','Macros — 3 jours notés sur 7',({j})=>{
  const e=(d,m,n,k,pr,c,f)=>({date:d,meal:m,name:n,kcal:k,prot:pr,carbs:c,fat:f,ts:Date.now()+Math.random()*1e3});
  S.foodLog=[
    e(j[0],'petitdej','Shaker protéine',180,35,6,2), e(j[0],'petitdej','Banane',90,1,23,0),
    e(j[0],'dejeuner','Steak haché 5% 300g',420,75,0,12), e(j[0],'dejeuner','Riz 200g',260,5,57,1),
    e(j[1],'petitdej','Shaker protéine',180,35,6,2), e(j[1],'petitdej','Banane',90,1,23,0),
    e(j[1],'dejeuner','Steak haché 5% 300g',420,75,0,12), e(j[1],'dejeuner','Riz 200g',260,5,57,1),
    e(j[1],'diner','Saumon + patate douce',620,45,48,28),
    e(j[3],'dejeuner','Poulet curry + riz',780,62,85,20)];
  persist(); renderNutrition();
});

// ── ONGLET JOURNAL ───────────────────────────────────────────────────────────
await shot('04-journal-vide','Journal — rien de noté aujourd\'hui, mais des habitudes reconnues',()=>{
  switchNuTab('journal',document.getElementById('ntab-journal'));
});
await shot('05-journal-rempli','Journal — la journée en cours',({j})=>{
  const e=(m,n,k,pr,c,f)=>({date:j[0],meal:m,name:n,kcal:k,prot:pr,carbs:c,fat:f,ts:Date.now()+Math.random()*1e3});
  S.foodLog=S.foodLog.concat([e('petitdej','Shaker protéine',180,35,6,2),e('petitdej','Banane',90,1,23,0),
    e('dejeuner','Steak haché 5% 300g',420,75,0,12),e('dejeuner','Riz 200g',260,5,57,1),
    e('collation','Amandes 30g',180,6,6,16)]);
  persist(); renderFoodJournal();
});

// ── LA SAISIE ────────────────────────────────────────────────────────────────
await shot('06-ajout-aliment','La saisie — les 4 façons d\'ajouter',()=>{
  openAddFood();
  const ov=document.getElementById('ov-add-food'); if(ov){ov.style.display='';ov.classList.add('open');}
});
await shot('07-ajout-ferme','',()=>{ closeAddFood(); });
shots.pop();   // celle-là ne sert qu'à refermer

// ── ONGLET SUPPLÉMENTS ───────────────────────────────────────────────────────
await shot('08-suppl-creatine','Suppléments — créatine en entretien (dose libre + repères)',()=>{
  switchNuTab('suppl',document.getElementById('ntab-suppl'));
  if(typeof setCreatDose==='function')setCreatDose(0);
});
await shot('09-suppl-dose-haute','Suppléments — dose réglée à 8 g : l\'avertissement apparaît',()=>{
  if(typeof setCreatDose==='function')setCreatDose(8);
});
await shot('10-suppl-charge','Suppléments — phase de charge',()=>{
  if(typeof setCreatDose==='function')setCreatDose(0);
  const btn=document.querySelector('.phase-toggle-small .ptbtn');
  if(typeof setCreatPhase==='function')setCreatPhase('charge',btn);
});
await shot('11-suppl-premium','Suppléments — combinaisons (premium)',()=>{
  if(typeof setCreatPhase==='function')setCreatPhase('maintenance',null);
  S.premium=true; renderSupplements();
});

// ── RÉGIMES ──────────────────────────────────────────────────────────────────
await shot('12-macros-keto','Macros — mode cétogène (répartition propre + plancher protéines)',()=>{
  switchNuTab('macros',document.getElementById('ntab-macros'));
  S.foodMode='keto'; persist(); renderNutrition();
});
await shot('13-macros-plancher','Macros — le plancher calorique explique pourquoi la cible a monté',()=>{
  S.foodMode=''; S.gender='F'; S.bw=55; S.height=160; S.age=45; S.activityLevel=1.2;
  S.goal='perte'; S.nutritionPhase='decharge'; persist(); renderNutrition();
});

console.log('\n'+shots.length+' captures dans '+OUT);
if(errs.length){ console.log('\n⚠️ erreurs JS pendant les captures :'); errs.slice(0,5).forEach(e=>console.log('   '+e)); }
fs.writeFileSync(path.join(OUT,'index.json'),JSON.stringify(shots,null,1));
await b.close(); srv.close();
})();
