// Tests permanents de l'ANNEAU DE RÉCUP de l'Accueil (ft-v636 → ft-v642).
// Chaque test fige un retour réel de Michel ou un piège rencontré à l'écran.
// Lancer : node tests/anneau/runner.js   (sortie 1 si un test casse)
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
(async()=>{
await new Promise(r=>srv.listen(0,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const iso=d=>d.toISOString().slice(0,10), now=new Date(), ss=[];
for(let i=2;i<16;i+=2){const d=new Date(now);d.setDate(d.getDate()-i);
  ss.push({date:iso(d),exs:[{name:'Développé Couché',sets:[{kg:80,reps:8,done:true,type:'N'}]}]});}
const base={ft4_name:'Michel',ft4_bw:'87',ft4_age:'45',ft4_height:'178',ft4_gender:'h',ft4_ok:'1',
            ft4_sessions:JSON.stringify(ss)};
async function page(extra,motion,score){
  const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},
    deviceScaleFactor:2,reducedMotion:motion||'no-preference'});
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(s=>{for(const k in s)localStorage.setItem(k,s[k]);},Object.assign({},base,extra||{}));
  await p.goto('http://localhost:'+srv.address().port+'/index.html'); await p.waitForTimeout(2300);
  await p.evaluate(sc=>{
    const o=document.getElementById('onboarding');if(o)o.style.display='none';
    document.querySelectorAll('.overlay').forEach(x=>{x.classList.remove('open');x.style.display='none';});
    document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
    const h=document.getElementById('s-home');if(h)h.classList.add('active');
    if(sc!=null){window.calcRecoveryDetail=()=>({score:sc,factors:[],tips:[],dayPains:[]});
                 window.calcRecoveryScore=()=>sc;}
    try{renderHome();}catch(e){}
  },score==null?null:score);
  return {p,c,errs};
}
console.log('\n─── ANNEAU DE RÉCUP ──────────────────────────────────────');

// ── 1. Le rendu et la structure imposée par la technique ────────────────────
{
  const q=await page(null,null,57);
  const r=await q.p.evaluate(()=>{
    const w=document.getElementById('recup-ring');
    if(!w)return {no:1};
    const cs=n=>getComputedStyle(document.getElementById(n));
    const mask=n=>(cs(n).webkitMaskImage||cs(n).maskImage||'');
    return {
      p:w.style.getPropertyValue('--p').trim(),
      num:(document.getElementById('rr-num')||{}).textContent,
      // la PART est découpée par un masque CONIQUE sur le parent…
      wrapConique:/conic-gradient/.test(mask('rr-arcwrap')),
      // …et le TROU par un masque RADIAL sur les enfants (imbrication, jamais mask-composite)
      arcRadial:/radial-gradient/.test(mask('rr-arc')),
      arcEnfantDuWrap:document.getElementById('rr-arc').parentElement.id==='rr-arcwrap',
      // le tour gris n'a AUCUNE découpe conique -> il fait 360°
      tourConique:/conic-gradient/.test(mask('rr-track')),
      tourRadial:/radial-gradient/.test(mask('rr-track')),
      couleurSuitLeCercle:/conic-gradient/.test(cs('rr-arc').backgroundImage),
      reflet:cs('rr-shine').animationDuration
    };
  });
  t('anneau présent et rempli au score', r.p==='57'&&r.num==='57', JSON.stringify(r));
  t('le tour gris fait 360° (aucune découpe conique dessus)', r.tourConique===false&&r.tourRadial===true, JSON.stringify(r));
  t('la couleur SUIT le cercle (dégradé conique, pas linéaire)', r.couleurSuitLeCercle===true);
  t('masques IMBRIQUÉS : part sur le parent, trou sur l\'enfant', r.wrapConique&&r.arcRadial&&r.arcEnfantDuWrap, JSON.stringify(r));
  t('la lueur tourne en boucle (5 s)', r.reflet==='5s', r.reflet);
  t('0 erreur JS', q.errs.length===0, q.errs.join(' | '));
  await q.c.close();
}

// ── 2. Le tour gris doit rester PLUS LARGE que l'arc, sinon la boucle ne se lit pas
// (retour Michel ft-v641 : « ça ne fait pas la boucle en entier »).
{
  const q=await page(null,null,57);
  const l=await q.p.evaluate(()=>{
    const pct=n=>{const m=(getComputedStyle(document.getElementById(n)).webkitMaskImage||'')
      .match(/rgba?\([^)]*\)\s+([\d.]+)%/); return m?parseFloat(m[1]):null;};
    const wrap=getComputedStyle(document.getElementById('rr-arcwrap'));
    return {trou:pct('rr-track'), trouArc:pct('rr-arc'), insetArc:wrap.top};
  });
  t('le tour gris est plus large que l\'arc (visible tout autour)',
    l.trou!==null&&l.trouArc!==null&&l.trou<l.trouArc, JSON.stringify(l));
  // ⚠️ Sur iPhone, un tour gris trop sombre devient INVISIBLE (retour Michel, deux fois).
  // On vérifie qu'il porte un relief avec une crête CLAIRE, pas un aplat foncé.
  const relief=await q.p.evaluate(()=>{
    const st=getComputedStyle(document.getElementById('rr-track'));
    const bg=st.backgroundImage;
    // le relief est en BLANC translucide : sur un iPhone, un gris sombre sur fond
    // sombre ne se voit pas (retour Michel, trois fois). On mesure la crête blanche.
    const w=(bg.match(/rgba\(255, 255, 255, ([\d.]+)\)/g)||[])
      .map(x=>parseFloat(x.match(/[\d.]+(?=\)$)/)[0]));
    return {radial:/radial-gradient/.test(bg), crete:w.length?Math.max.apply(null,w):0};
  });
  t('le tour gris a un relief de tube (dégradé sur son épaisseur)', relief.radial===true);
  t('sa crête est en blanc, assez marquée pour un iPhone (>= .25)', relief.crete>=.25, JSON.stringify(relief));
  // la lueur doit AUSSI passer sur le gris, sinon il reste mort pendant que la couleur vit
  const surGris=await q.p.evaluate(()=>{
    const g=document.getElementById('rr-glint'); if(!g)return null;
    const st=getComputedStyle(g);
    return {conic:/conic-gradient/.test(st.backgroundImage),
            masque:/radial-gradient/.test(st.webkitMaskImage||st.maskImage||''),
            tourne:st.animationDuration};
  });
  t('la lueur passe aussi sur la partie grise',
    surGris&&surGris.conic&&surGris.masque&&surGris.tourne==='5s', JSON.stringify(surGris));
  const lueur=await q.p.evaluate(()=>{
    const bg=getComputedStyle(document.getElementById('rr-shine')).backgroundImage;
    const m=(bg.match(/rgba\(255, 255, 255, ([\d.]+)\)/g)||[]).map(x=>parseFloat(x.match(/[\d.]+(?=\)$)/)[0]));
    return m.length?Math.max.apply(null,m):0;
  });
  t('la lueur est franchement visible (opacité >= .45)', lueur>=.45, 'max='+lueur);
  const galbe=await q.p.evaluate(()=>getComputedStyle(document.getElementById('rr-arc')).backgroundImage);
  t('l\'arc coloré a le même galbe de tube',
    /radial-gradient/.test(galbe)&&/conic-gradient/.test(galbe));
  await q.c.close();
}

// ── 3. Les pièges Safari iOS déjà payés : ils ne doivent JAMAIS revenir ──────
{
  // ⚠️ On retire les COMMENTAIRES avant de chercher : ils citent justement ces pièges
  // pour expliquer pourquoi on ne les utilise pas (piège du piège, trouvé en écrivant ce test).
  const brut=fs.readFileSync(path.join(ROOT,'style.css'),'utf8');
  const css=brut.replace(/\/\*[\s\S]*?\*\//g,'');
  const i=css.indexOf('#recup-ring{');
  const bloc=css.slice(i, i+3000);
  t('pas de mask-composite (mal supporté sur Safari iOS)', !/mask-composite/.test(css));
  t('pas de @property pour animer la part (--p est piloté en JS)', !/@property/.test(css));
  t('pas de drop-shadow coloré sur l\'arc (l\'ombre remplissait le centre)',
    !/#rr-arc\{[^}]*drop-shadow/.test(bloc.replace(/\s+/g,'')));
}

// ── 4. Le tap : le chiffre défile de 0 au score et revient EXACTEMENT dessus ──
{
  const q=await page(null,null,72);
  await q.p.evaluate(()=>{document.getElementById('recup-ring').click();});
  await q.p.waitForTimeout(160);
  const milieu=await q.p.evaluate(()=>({
    n:+document.getElementById('rr-num').textContent,
    p:parseFloat(document.getElementById('recup-ring').style.getPropertyValue('--p'))}));
  await q.p.waitForTimeout(1400);
  const fin=await q.p.evaluate(()=>({
    n:document.getElementById('rr-num').textContent,
    p:document.getElementById('recup-ring').style.getPropertyValue('--p').trim()}));
  t('le tap fait DÉFILER le chiffre', milieu.n<72&&milieu.n>=0, JSON.stringify(milieu));
  t('l\'arc se remplit en même temps que le chiffre', milieu.p<72&&milieu.p>=0, JSON.stringify(milieu));
  t('à la fin, le chiffre ET l\'arc sont pile sur le score', fin.n==='72'&&fin.p==='72', JSON.stringify(fin));
  t('0 erreur JS (tap)', q.errs.length===0, q.errs.join(' | '));
  await q.c.close();
}

// ── 5. L'échelle de couleur ROUGE (0) -> VERT (100) ─────────────────────────
{
  const q=await page(null,null,57);
  const e=await q.p.evaluate(()=>({
    bas:_ringScale(10), milieu:_ringScale(50), haut:_ringScale(95),
    aberrants:[_ringScale(-20),_ringScale(500),_ringScale(null),_ringScale(undefined)]
  }));
  const rgb=x=>x.match(/\d+/g).map(Number);
  const b1=rgb(e.bas), h1=rgb(e.haut);
  t('score bas = rouge dominant', b1[0]>200&&b1[1]<130, e.bas);
  t('score haut = vert dominant', h1[1]>170&&h1[0]<130, e.haut);
  t('la teinte se déplace vraiment entre les deux', e.bas!==e.milieu&&e.milieu!==e.haut,
    e.bas+' / '+e.milieu+' / '+e.haut);
  t('valeurs aberrantes gérées sans planter',
    e.aberrants.every(c=>/^rgb\(\d+,\s?\d+,\s?\d+\)$/.test(c)), JSON.stringify(e.aberrants));
  const stops=await q.p.evaluate(()=>getComputedStyle(document.getElementById('rr-arc')).backgroundImage);
  t('les 4 repères exacts sont bien dans le dégradé',
    ['255, 77, 94','255, 138, 114','234, 179, 8','52, 211, 153'].every(c=>stops.includes(c)), stops.slice(0,160));
  await q.c.close();
}

// ── 6. Cas limites : pas de score, et « réduire les animations » ────────────
{
  const q=await page({ft4_sessions:'[]',ft4_age:'',ft4_bw:''});
  const r=await q.p.evaluate(()=>({ring:!!document.getElementById('recup-ring'),
                                   hero:(document.getElementById('home-hero').innerText||'').length}));
  t('score indisponible → pas de plantage, la carte s\'affiche quand même', r.hero>0);
  t('0 erreur JS (cas sans données)', q.errs.length===0, q.errs.join(' | '));
  await q.c.close();
}
{
  const q=await page(null,'reduce',57);
  const a=await q.p.evaluate(()=>{const s=getComputedStyle(document.getElementById('rr-shine'));
    return {anim:s.animationName, op:s.opacity};});
  t('« réduire les animations » fige le reflet', a.anim==='none'||a.op==='0', JSON.stringify(a));
  await q.c.close();
}
console.log('──────────────────────────────────────────────────────────');
console.log((ko?'❌ ':'✅ ')+ok+'/'+(ok+ko));
await b.close(); srv.close(); process.exit(ko?1:0);
})();
