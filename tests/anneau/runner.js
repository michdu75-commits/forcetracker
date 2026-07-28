// Tests permanents de l'ANNEAU DE RÉCUP de l'Accueil (ft-v636 → ft-v640).
// Chaque test fige un retour réel de Michel ou un piège rencontré.
// Lancer : node tests/anneau/runner.js   (sortie 1 si un test casse)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'../..');
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.gif':'image/gif','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(ROOT,p);
if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
let ok=0,ko=0; const t=(n,c,x)=>{c?(ok++,console.log('  ✅ '+n)):(ko++,console.log('  ❌ '+n+(x?' — '+x:'')));};
(async()=>{await new Promise(r=>srv.listen(0,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const iso=d=>d.toISOString().slice(0,10), now=new Date(), ss=[];
for(let w=3;w>=0;w--)for(let k=0;k<4;k++){const d=new Date(now);d.setDate(d.getDate()-(w*7+k+1));
 ss.push({date:iso(d),vol:4200,exs:[{name:'Développé Couché',sets:[{kg:80,reps:8,done:true,type:'N'}]}]});}
const base={ft4_name:'Michel',ft4_bw:'87',ft4_age:'45',ft4_height:'178',ft4_gender:'h',ft4_goal:'muscle',ft4_ok:'1',
 ft4_sessions:JSON.stringify(ss),ft4_prs:JSON.stringify({'Développé Couché':{kg:105,reps:2,rm1:111,date:iso(now)}}),
 ft4_coachquiz:JSON.stringify({answers:{place:'salle',time:'60',freq:'4',othersport:'aucun'},done:true,confirmedAt:{place:iso(now),time:iso(now),othersport:iso(now)}})};
async function page(extra,motion){
 const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},deviceScaleFactor:2,reducedMotion:motion||'no-preference'});
 const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(s=>{for(const k in s)localStorage.setItem(k,s[k]);},Object.assign({},base,extra||{}));
 await p.goto('http://localhost:'+srv.address().port+'/index.html'); await p.waitForTimeout(2300);
 await p.evaluate(()=>{const o=document.getElementById('onboarding');if(o)o.style.display='none';
   document.querySelectorAll('.overlay').forEach(x=>{x.classList.remove('open');x.style.display='none';});});
 return {p,c,errs};
}
// 1) rendu normal
let {p,c,errs}=await page();
const r=await p.evaluate(()=>{const w=document.getElementById('recup-ring');
 if(!w)return{no:1};
 const arc=document.getElementById('rr-arc'), num=document.getElementById('rr-num'), tr=document.getElementById('rr-trav');
 const cs=getComputedStyle(tr);
 return {ring:!!w, arc:!!arc, num:num?num.textContent:null,
  dash:arc?arc.getAttribute('stroke-dasharray'):null, off:arc?arc.getAttribute('stroke-dashoffset'):null,
  circVar:w.style.getPropertyValue('--rr-circ'), runVar:w.style.getPropertyValue('--rr-run'),
  anim:cs.animationName, dur:cs.animationDuration,
  barres:[...document.querySelectorAll('#home-hero div')].filter(d=>d.style.height==='7px').length};});
t('anneau présent dans le vrai code', r.ring===true, JSON.stringify(r).slice(0,90));
t('arc dessiné avec dasharray/offset', !!r.dash && !!r.off, r.dash+' / '+r.off);
t('score affiché au centre', /^\d+$/.test(r.num||''), r.num);
t('variables CSS posées', !!r.circVar && !!r.runVar, r.circVar+' | '+r.runVar);
t('reflet animé (6.5s)', r.anim==='rr-travel' && r.dur==='6.5s', r.anim+' '+r.dur);
t('ancienne barre plate retirée', r.barres===0, 'restantes: '+r.barres);
// 2) le tap fait défiler le chiffre
const suite=await p.evaluate(async()=>{const n=document.getElementById('rr-num');const fin=n.textContent;
 ringReplay(); await new Promise(r=>setTimeout(r,180)); const pendant=n.textContent;
 await new Promise(r=>setTimeout(r,1300)); return {pendant,apres:n.textContent,fin};});
t('le tap fait DÉFILER le chiffre', suite.pendant!==suite.fin, suite.pendant+' → '+suite.apres);
t('le chiffre revient au bon score', suite.apres===suite.fin, suite.apres+' vs '+suite.fin);
t('0 erreur JS', errs.length===0, errs.join('|'));
await c.close();
// 3) score nul (pas de données) → pas d'anneau, pas de plantage
let r2=await page({ft4_sessions:'[]'}); 
const noScore=await r2.p.evaluate(()=>({hero:!!document.getElementById('home-hero').innerHTML.length,err:0}));
t('score indisponible → pas de plantage', noScore.hero===true);
t('0 erreur JS (cas sans données)', r2.errs.length===0, r2.errs.join('|'));
await r2.c.close();
// 4) réduire les animations
let r3=await page({},'reduce');
const red=await r3.p.evaluate(()=>{const tr=document.getElementById('rr-trav'); if(!tr)return{n:1};
 const cs=getComputedStyle(tr); return {anim:cs.animationName,op:cs.opacity};});
t('« réduire les animations » fige le reflet', red.anim==='none'||red.op==='0', JSON.stringify(red));
await r3.c.close();
// 5) mode jour
let r4=await page({ft4_theme:'light'});
const lm=await r4.p.evaluate(()=>{const a=document.getElementById('rr-arc'); return {arc:!!a, stroke:a?a.getAttribute('stroke'):null};});
t('mode jour : anneau rendu', lm.arc===true, JSON.stringify(lm));
await r4.c.close();
// ── ft-v640 : le tour GRIS doit faire 360° et se voir SUR LE TÉLÉPHONE ──────
// Retour Michel : « j'aimerais que le cercle fasse 100 % du cercle — ma récup est à 57 %
// en couleur et le reste continue en gris ». Il ne le voyait pas sur son iPhone : la
// rainure portait un filtre SVG (ombre interne) que Safari iOS rend mal sur un TRACÉ.
{
  const q=await page();
  const piste=await q.p.evaluate(()=>{
    const w=document.getElementById('recup-ring');
    if(!w)return {no:1};
    const cs=[...w.querySelectorAll('circle')];
    const sansDash=cs.filter(c=>!c.getAttribute('stroke-dasharray'));
    return {
      total:cs.length,
      tour360:sansDash.length,
      filtreSurLeTour:sansDash.some(c=>c.getAttribute('filter')),
      run:getComputedStyle(w).getPropertyValue('--rr-run').trim(),
      arcCoupe:!!document.getElementById('rr-arc').getAttribute('stroke-dasharray')
    };
  });
  t('le tour gris fait 360° (aucune coupure)', piste.tour360>=1, JSON.stringify(piste));
  t('aucun filtre SVG sur le tour gris (piège Safari iOS)', piste.filtreSurLeTour===false, JSON.stringify(piste));
  t('l\'arc coloré, lui, reste proportionnel au score', piste.arcCoupe===true);
  // ft-v637 avait calculé travRun sans jamais le brancher : le reflet s'arrêtait net.
  t('le reflet sort bien de l\'arc (variable branchée)',
    parseFloat(piste.run)<0 && Math.abs(parseFloat(piste.run))>60, 'run='+piste.run);
  t('0 erreur JS (tour gris)', q.errs.length===0, q.errs.join(' | '));
  await q.c.close();
}
// ── ft-v641 : la TEINTE suit le score sur l'échelle rouge (0) -> vert (100) ──
// Retour Michel : « il n'y a pas de dégradé de couleur du rouge 0 à vert pour 100 ».
{
  const q=await page();
  const ech=await q.p.evaluate(()=>({
    bas:_ringScale(10), milieu:_ringScale(50), haut:_ringScale(95),
    zero:_ringScale(0), cent:_ringScale(100),
    horsBornes:[_ringScale(-20),_ringScale(500),_ringScale(null),_ringScale(undefined)]
  }));
  const rgb=x=>x.match(/\d+/g).map(Number);
  const b=rgb(ech.bas), h=rgb(ech.haut);
  t('score bas = rouge dominant', b[0]>200 && b[1]<130, ech.bas);
  t('score haut = vert dominant', h[1]>170 && h[0]<130, ech.haut);
  t('la teinte se déplace bien entre les deux', ech.bas!==ech.milieu && ech.milieu!==ech.haut,
    ech.bas+' / '+ech.milieu+' / '+ech.haut);
  t('bornes et valeurs aberrantes gérées sans planter',
    ech.horsBornes.every(c=>/^rgb\(\d+,\d+,\d+\)$/.test(c)), JSON.stringify(ech.horsBornes));
  // le tour gris doit rester plus large que l'arc, sinon la boucle ne se lit pas en entier
  const larg=await q.p.evaluate(()=>{
    const w=document.getElementById('recup-ring');
    const cs=[...w.querySelectorAll('circle')];
    const tour=cs.filter(c=>!c.getAttribute('stroke-dasharray'))
                 .map(c=>parseFloat(c.getAttribute('stroke-width')));
    return {tour:Math.max.apply(null,tour.filter(x=>x<13)),
            arc:parseFloat(document.getElementById('rr-arc').getAttribute('stroke-width'))};
  });
  t('le tour gris est plus large que l\'arc (la boucle se voit partout)',
    larg.tour>larg.arc, JSON.stringify(larg));
  t('0 erreur JS (échelle de couleur)', q.errs.length===0, q.errs.join(' | '));
  await q.c.close();
}
console.log((ko?'❌':'✅')+' '+ok+'/'+(ok+ko));
await b.close();srv.close();process.exit(ko?1:0);})();
