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
// ── ft-v648 : on peut FIGER le tracé (Menu → Apparence) ─────────────────────
{
  const q=await page({ft4_ringstyle:'moniteur',ft4_ecgstill:'1'},null,87);
  const r=await q.p.evaluate(()=>{
    const st=getComputedStyle(document.querySelector('#rj-ecg path'));
    return {anim:st.animationName, offset:st.strokeDashoffset,
            visible:getComputedStyle(document.getElementById('rj-ecg')).display!=='none'};
  });
  t('tracé figé : plus d\'animation', r.anim==='none', r.anim);
  t('mais il reste affiché EN ENTIER (pas un cercle vide)',
    r.visible && parseFloat(r.offset)===0, JSON.stringify(r));
  await q.c.close();
}
{
  const q=await page({ft4_ringstyle:'moniteur'},null,87);
  const r=await q.p.evaluate(()=>{ setEcgStill(true);
    const a=getComputedStyle(document.querySelector('#rj-ecg path')).animationName;
    setEcgStill(false);
    const b=getComputedStyle(document.querySelector('#rj-ecg path')).animationName;
    return {fige:a, anime:b, cle:localStorage.getItem('ft4_ecgstill')}; });
  t('le réglage bascule dans les deux sens et se retient',
    r.fige==='none' && r.anime==='rj-ecg' && r.cle==='0', JSON.stringify(r));
  await q.c.close();
}
// ── ft-v647 : le sommet de la jauge s'aligne sur « AUJOURD'HUI » ────────────
// Demande de Michel : « le cercle faut le monter un peu ». Une valeur en dur
// se perd au premier réglage suivant -> on la mesure.
{
  const q=await page({ft4_ringstyle:'moniteur'},null,87);
  const a=await q.p.evaluate(()=>{
    const h=document.querySelector('.rj-haut'), j=document.getElementById('rj');
    if(!h||!j)return null;
    return +(j.getBoundingClientRect().top - h.getBoundingClientRect().top).toFixed(1);
  });
  t('le haut de la jauge est au niveau de « AUJOURD\'HUI »', a!==null&&Math.abs(a)<=2, 'écart '+a+'px');
  await q.c.close();
}
// ── ft-v652 : le PRÉNOM — visible dans le profil ET transmis à Milo ─────────
// Deux bugs signalés par Michel : « Milo ne prenait pas mon prénom et il ne le
// voit pas dans le profil ». Le prompt disait « Salut [son prénom] » alors que
// le prénom n'était JAMAIS transmis (R8 : un prompt ne compense pas une donnée
// absente), et le champ n'existait qu'à l'inscription.
{
  const q=await page({ft4_name:'Michel'},null,64);
  const r=await q.p.evaluate(()=>{
    goScreen('setup',null);
    const inp=document.getElementById('name-inp');
    return {champ:!!inp, prerempli:inp?inp.value:null,
            ctx:(buildCoachContext().match(/- Prénom: [^\n]*/)||[''])[0]};
  });
  t('le prénom a un champ dans le profil', r.champ===true);
  t('il est pré-rempli avec le prénom connu', r.prerempli==='Michel', JSON.stringify(r.prerempli));
  t('Milo reçoit le prénom dans son contexte', /- Prénom: Michel/.test(r.ctx), r.ctx.slice(0,60));
  const r2=await q.p.evaluate(()=>{
    const inp=document.getElementById('name-inp'); inp.value='  Mich  '; saveProfile();
    return {S:S.name, cle:localStorage.getItem('ft4_name'),
            menu:(document.getElementById('menu-name-lbl')||{}).textContent,
            ctx:(buildCoachContext().match(/- Prénom: [^\n]*/)||[''])[0]};
  });
  t('on peut le corriger : enregistré, nettoyé, et Milo suit',
    r2.S==='Mich' && r2.cle==='Mich' && /- Prénom: Mich /.test(r2.ctx), JSON.stringify(r2));
  t('le menu affiche le nouveau prénom', r2.menu==='Mich', JSON.stringify(r2.menu));
  await q.c.close();
  // sans prénom : Milo ne doit pas dire « Salut [prénom] » à vide
  const q2=await page(null,null,64);
  const r3=await q2.p.evaluate(()=>{ S.name='';
    return (buildCoachContext().match(/- Prénom: [^\n]*/)||[''])[0]; });
  t('sans prénom, Milo est prévenu de ne pas faire de formule à vide',
    /inconnu/.test(r3), r3.slice(0,70));
  await q2.c.close();
}
// ── ft-v650 : les 3 tuiles du check-in (sommeil · énergie · moral) ──────────
{
  const iso=new Date().toISOString().slice(0,10);
  // a) rempli
  const q=await page({ft4_sleep:JSON.stringify([{date:iso,hours:6,quality:3}])},null,64);
  const r=await q.p.evaluate(()=>{
    const st=_dayState(); st.energy=1; st.mood=3; _renderDayStateCard();
    const el=document.getElementById('home-daystate');
    const lbl=[...el.querySelectorAll('div')].map(d=>d.textContent.trim())
      .map(x=>x.toUpperCase())
      .filter(x=>x==='SOMMEIL'||x==='ÉNERGIE'||x==='MORAL');
    const jauges=[...el.querySelectorAll('div')].filter(d=>d.children.length===4&&[...d.children].every(c=>c.tagName==='I'));
    return {nbTuiles:lbl.length, libelles:lbl, nbJauges:jauges.length,
            traitsParJauge:jauges.map(j=>j.children.length),
            allumes:jauges.map(j=>[...j.children].filter(c=>c.classList.contains('on')).length),
            texte:(el.innerText||'').replace(/\n/g,' | '), sale:/NaN|undefined/.test(el.innerText||'')};
  });
  t('3 tuiles affichées', r.nbTuiles===3, JSON.stringify(r).slice(0,150));
  t('4 traits par tuile (pas 5 : les échelles ont 4 niveaux)',
    r.traitsParJauge.length===3 && r.traitsParJauge.every(n=>n===4), JSON.stringify(r.traitsParJauge));
  t('les traits allumés suivent le niveau (qualité 3 · énergie 1 · moral 3)',
    JSON.stringify(r.allumes)===JSON.stringify([3,2,4]), JSON.stringify(r.allumes));
  // ft-v651 : le relief doit rester (un aplat de couleur paraît plat à 9x5 px)
  const relief=await q.p.evaluate(()=>{
    const on=document.querySelector('.ck-b.on'), off=document.querySelector('.ck-b:not(.on)');
    const ico=document.querySelector('.ck-ico');
    if(!on||!off||!ico)return null;
    const so=getComputedStyle(on), sf=getComputedStyle(off), si=getComputedStyle(ico);
    return {allumeDegrade:/gradient/.test(so.backgroundImage), allumeOmbre:so.boxShadow!=='none',
            eteintCreuse:/inset/.test(sf.boxShadow), icoOmbre:/drop-shadow/.test(si.filter)};
  });
  t('les traits ont du relief (dégradé + ombres)',
    relief && relief.allumeDegrade && relief.allumeOmbre && relief.eteintCreuse, JSON.stringify(relief));
  t('la figurine a une ombre portée', relief && relief.icoOmbre, JSON.stringify(relief));
  t('pas de NaN dans le check-in', r.sale===false, r.texte.slice(0,80));
  await q.c.close();
  // b) rien noté -> pas de plantage, invitation affichée
  const q2=await page(null,null,64);
  const r2=await q2.p.evaluate(()=>{
    const el=document.getElementById('home-daystate');
    return {txt:el.innerText||'', sale:/NaN|undefined/.test(el.innerText||'')};
  });
  t('aucune donnée -> invitation, pas de plantage',
    !r2.sale && /Note ton énergie/.test(r2.txt), r2.txt.slice(0,70));
  t('0 erreur JS (check-in)', q2.errs.length===0, q2.errs.join(' | '));
  await q2.c.close();
}
// ── ft-v646 : la carte ne doit JAMAIS afficher « NaN » ou « undefined » ─────
// Bug réel arrivé en prod : dans un ternaire, un « + » en tête de ligne devient
// un plus UNAIRE appliqué à une chaîne -> NaN, et le bloc concerné disparaît.
// Michel l'a vu sur son téléphone ; aucun test ne l'attrapait.
{
  for(const st of ['anneau','moniteur']){
    for(const sc of [0,64,100,null]){
      const q=await page({ft4_ringstyle:st},null,sc);
      const r=await q.p.evaluate(()=>{
        const h=document.getElementById('home-hero');
        return {sale:/\bNaN\b|\bundefined\b|\[object/.test(h.innerText||''),
                extrait:(h.innerText||'').slice(0,60).replace(/\n/g,' | ')};
      });
      t('carte propre — style '+st+', score '+sc, r.sale===false, r.extrait);
      await q.c.close();
    }
  }
}
// ── ft-v645 : la 2e apparence « moniteur » (Menu → Apparence) ───────────────
{
  const q=await page(null,null,87);          // aucun réglage -> défaut
  const d=await q.p.evaluate(()=>({anneau:!!document.getElementById('recup-ring'),
                                   moniteur:!!document.getElementById('rj'), style:S.ringStyle}));
  t('par défaut, personne ne voit la nouvelle apparence',
    d.anneau===true && d.moniteur===false && d.style==='anneau', JSON.stringify(d));
  await q.c.close();
}
{
  const q=await page({ft4_ringstyle:'moniteur'},null,87);
  const r=await q.p.evaluate(()=>{
    const j=document.getElementById('rj'); if(!j)return {no:1};
    const cs=n=>getComputedStyle(document.getElementById(n));
    const mk=n=>(cs(n).webkitMaskImage||cs(n).maskImage||'');
    // ⚠️ LE PIÈGE DE ft-v645 : le rayon du point doit valoir le MILIEU de la bande.
    // Michel l'avait vu à l'œil sur la maquette — ici on le MESURE.
    const rj=j.getBoundingClientRect(), pt=document.getElementById('rj-point').getBoundingClientRect();
    const dist=Math.hypot((pt.x+pt.width/2)-(rj.x+rj.width/2),(pt.y+pt.height/2)-(rj.y+rj.height/2));
    const int=0.85*(rj.width/2), ext=rj.width/2;
    return {
      anneauAbsent:!document.getElementById('recup-ring'),
      chiffre:(document.getElementById('rr-num')||{}).textContent,
      arcOuvert:/conic-gradient/.test(mk('rj-arcwrap')),
      trouEnfant:/radial-gradient/.test(mk('rj-piste')),
      pointDansLaBande: dist>int && dist<ext,
      ecart:+(dist-(int+ext)/2).toFixed(2),
      ecg:cs('rj-ecg').display!=='none',
      ecgDuree:getComputedStyle(document.querySelector('#rj-ecg path')).animationDuration
    };
  });
  t('style choisi -> jauge affichée, anneau retiré', r.anneauAbsent&&r.chiffre==='87', JSON.stringify(r));
  t('le cercle est OUVERT en bas (masque conique de 306°)', r.arcOuvert===true);
  t('masques imbriqués : trou sur l\'enfant', r.trouEnfant===true);
  t('le point est PILE au milieu de la bande', r.pointDansLaBande&&Math.abs(r.ecart)<0.5, 'écart '+r.ecart+'px');
  t('l\'ECG tourne en continu, lentement (5,5 s)', r.ecg&&r.ecgDuree==='5.5s', r.ecgDuree);
  t('0 erreur JS (moniteur)', q.errs.length===0, q.errs.join(' | '));
  await q.c.close();
}
{
  const q=await page({ft4_ringstyle:'moniteur'},'reduce',87);
  const a=await q.p.evaluate(()=>getComputedStyle(document.querySelector('#rj-ecg path')).animationName);
  t('« réduire les animations » fige l\'ECG', a==='none', a);
  await q.c.close();
}
{
  const q=await page(null,null,87);
  const r=await q.p.evaluate(()=>{ setRingStyle('moniteur');
    return {jauge:!!document.getElementById('rj'), cle:localStorage.getItem('ft4_ringstyle')}; });
  t('le réglage bascule la carte et se retient', r.jauge===true&&r.cle==='moniteur', JSON.stringify(r));
  await q.c.close();
}
// ─── PROCHAINE SÉANCE ANNONCÉE (ft-v654) ────────────────────────────────────
// Le trou n°1 du garde-fou des données : l'Accueil affichait « je m'en souviens »
// pendant que le chat n'avait JAMAIS reçu l'info. Ces tests figent la règle :
// l'Accueil et Milo doivent TOUJOURS dire la même chose sur la séance annoncée.
console.log('\n─── PROCHAINE SÉANCE ANNONCÉE ────────────────────────────');
const jour=n=>{const d=new Date(now);d.setDate(d.getDate()+n);return iso(d);};
// ⚠️ « PROCHAINE SÉANCE » tout court NE SUFFIT PAS : ces mots existent déjà dans le bloc qui
// apprend à Milo à ÉMETTRE une annonce. On cherche le bloc qui la lui DONNE.
const RECU=/PROCHAINE SÉANCE — il\/elle TE l'a annoncée/;
const annonce=(d,lab)=>({ft4_nextplanned:JSON.stringify({date:d,label:lab||''})});
async function accueilEtChat(extra){
  const q=await page(extra,null,87);
  const r=await q.p.evaluate(()=>{
    let ctx='';try{ctx=buildCoachContext()||'';}catch(e){ctx='ERREUR: '+e.message;}
    return {carte:(document.getElementById('home-milo')||{}).textContent||'', ctx:ctx};
  });
  await q.c.close(); return r;
}
{
  const r=await accueilEtChat(annonce(jour(1),'jambes'));
  t('Accueil : « séance prévue demain, je m\'en souviens »',
    /prévue demain/i.test(r.carte)&&/je m'en souviens/i.test(r.carte), r.carte.slice(0,120));
  t('⭐ LE FIX : Milo REÇOIT la séance annoncée', RECU.test(r.ctx));
  t('   … avec le bon jour et le libellé', r.ctx.includes(jour(1))&&/DEMAIN/.test(r.ctx)&&/jambes/.test(r.ctx));
  t('   … et la consigne de ne pas la redemander', /tu ne le redemandes pas/i.test(r.ctx));
  t('   … et de ne pas relancer « ça fait X jours »', /ça fait X jours/i.test(r.ctx));
  t('le contexte se construit sans erreur', !/^ERREUR:/.test(r.ctx), r.ctx.slice(0,80));
}
{
  const r=await accueilEtChat(null);
  t('aucune annonce → rien dans le contexte (0 régression)', !RECU.test(r.ctx));
  t('aucune annonce → l\'Accueil n\'invente pas de séance prévue', !/prévue/i.test(r.carte), r.carte.slice(0,100));
}
{
  const r=await accueilEtChat(annonce(jour(-3)));
  t('annonce PÉRIMÉE : l\'Accueil n\'en parle plus', !/prévue/i.test(r.carte), r.carte.slice(0,100));
  t('annonce PÉRIMÉE : Milo non plus (même règle des 2 côtés)', !RECU.test(r.ctx));
}
{
  // séance enregistrée AUJOURD'HUI alors qu'elle était annoncée pour aujourd'hui → annonce honorée
  const faite=[{date:iso(now),exs:[{name:'Squat',sets:[{kg:100,reps:5,done:true,type:'N'}]}]}].concat(ss);
  const r=await accueilEtChat(Object.assign(annonce(iso(now)),{ft4_sessions:JSON.stringify(faite)}));
  t('annonce HONORÉE (séance faite) : l\'Accueil passe à autre chose', !/On la prépare/i.test(r.carte), r.carte.slice(0,100));
  t('annonce HONORÉE : Milo ne parle plus d\'une séance à venir', !RECU.test(r.ctx));
}
{
  // le cas réel de Michel : une pause ANNONCÉE ne doit pas déclencher la relance
  const vieux=[{date:jour(-6),exs:[{name:'Squat',sets:[{kg:100,reps:5,done:true,type:'N'}]}]}];
  const r=await accueilEtChat(Object.assign(annonce(jour(2)),{ft4_sessions:JSON.stringify(vieux)}));
  t('6 jours sans séance MAIS une annonce → pas de relance « ça fait 6 jours »',
    !/ça fait 6 jours/i.test(r.carte)&&/prévue/i.test(r.carte), r.carte.slice(0,120));
  t('Milo le sait aussi (une pause annoncée n\'est pas un abandon)',
    RECU.test(r.ctx)&&/n'est pas un abandon/i.test(r.ctx));
}
// ─── LE CHECK-IN DÉPLIÉ PARLE LE LANGAGE DES TUILES (ft-v661) ───────────────
// Retour Michel : « quand on rentre dedans ça reste avec des petits bonhommes,
// c'est pas en adéquation avec ce qu'on a modifié ».
console.log('\n─── CHECK-IN DÉPLIÉ ──────────────────────────────────────');
{
  const q=await page(null,null,64);
  const r=await q.p.evaluate(()=>{
    setDayEnergy(3); setDayMood(1);
    _checkinOpen=true; _renderDayStateCard();
    const el=document.getElementById('home-daystate');
    const opts=[...el.querySelectorAll('.ck-opt')];
    const on=el.querySelectorAll('.ck-opt.on');
    const coul=n=>getComputedStyle(n).getPropertyValue('--ck').trim();
    return {
      nb:opts.length,
      plusDEmoji:!/😴|😐|🙂|⚡|😔|😕|😄/.test(el.textContent),
      mots:opts.map(o=>o.textContent.trim()),
      traits:el.querySelectorAll('.ck-opt-b .ck-b').length,
      visages:el.querySelectorAll('.ck-opt svg circle').length>0,
      // ⚠️ getPropertyValue rend la couleur RÉSOLUE (#FF8A72), pas « var(--orange) » :
      // on résout donc aussi les variables de référence pour comparer des choses comparables.
      selCouls:[...on].map(coul),
      refs:{orange:coul(el).trim()||getComputedStyle(el).getPropertyValue('--orange').trim(),
            or:getComputedStyle(el).getPropertyValue('--gold').trim(),
            org:getComputedStyle(el).getPropertyValue('--orange').trim(),
            rouge:getComputedStyle(el).getPropertyValue('--red').trim()},
      // ⚠️ « (optionnel) » du titre : j'avais nommé ma classe .ds-opt, déjà prise —
      // le mot devenait un gros bouton. Il doit rester du simple texte.
      optionnelEstUnBouton:!!el.querySelector('.ds-opt.ck-opt') || getComputedStyle(el.querySelector('.ds-opt')).display==='flex',
      sale:/NaN|undefined|\[object/.test(el.textContent)
    };
  });
  t('8 options (4 énergie + 4 moral), plus de boutons emoji', r.nb===8&&r.plusDEmoji===true, JSON.stringify({n:r.nb,e:r.plusDEmoji}));
  t('les mêmes mots que les tuiles du replié',
    ['Faible','Basse','Bonne','Au top','Bas','Moyen','Bien','Content'].every(m=>r.mots.includes(m)), r.mots.join('|'));
  t('l\'énergie se lit aux TRAITS (4 par option)', r.traits===16, 'reçu '+r.traits);
  t('le moral porte un VISAGE dessiné', r.visages===true);
  t('⭐ le choix s\'allume dans SA couleur, plus en rouge pour tout',
    r.selCouls.length===2 && r.selCouls.includes(r.refs.org) && r.selCouls.includes(r.refs.or)
    && !r.selCouls.includes(r.refs.rouge),
    r.selCouls.join(' · ')+'  (attendu '+r.refs.org+' + '+r.refs.or+')');
  t('« (optionnel) » reste du texte, pas un bouton', r.optionnelEstUnBouton===false);
  t('aucun texte parasite dans la carte', r.sale===false);
  t('0 erreur JS (check-in déplié)', q.errs.length===0, q.errs.join(' | '));
  await q.c.close();
}

// ─── « C'ÉTAIT CELLE-LÀ ? » (ft-v662) ───────────────────────────────────────
// Cas réel : Michel annonce « bas du corps demain » puis la fait le JOUR MÊME.
// La règle compare des DATES, pas ce qui a été fait → l'Accueil annonçait une
// séance déjà faite. On ne devine pas, on demande — en un tap.
console.log('\n─── « C\'ÉTAIT CELLE-LÀ ? » ────────────────────────────────');
const seanceDuJour=[{date:iso(now),exs:[{name:'Squat',sets:[{kg:120,reps:5,done:true,type:'N'}]}],volume:3000}];
{
  const q=await page(Object.assign(annonce(jour(1),'bas du corps'),
    {ft4_sessions:JSON.stringify(seanceDuJour.concat(ss))}),null,64);
  const r=await q.p.evaluate(()=>{
    const el=document.getElementById('home-milo');
    return {txt:el.textContent||'', bouton:!!el.querySelector('button.milo-plan')};
  });
  t('⭐ séance faite aujourd\'hui + annonce pour demain → Milo DEMANDE',
    /c'était celle-là/i.test(r.txt)&&/bas du corps/i.test(r.txt), r.txt.slice(0,140));
  t('… avec un bouton en un tap', r.bouton===true);
  // et une fois confirmé, les DEUX côtés se taisent
  const apres=await q.p.evaluate(()=>{
    _confirmPlannedDone();
    let ctx=''; try{ctx=buildCoachContext()||'';}catch(e){}
    return {carte:(document.getElementById('home-milo')||{}).textContent||'',
            reste:!!(S.nextPlanned&&S.nextPlanned.date),
            miloEnParle:/PROCHAINE SÉANCE — il\/elle TE l'a annoncée/.test(ctx)};
  });
  t('… « oui » retire l\'annonce', apres.reste===false);
  t('… et l\'Accueil ne la propose plus', !/c'était celle-là/i.test(apres.carte), apres.carte.slice(0,100));
  t('… Milo non plus (les deux côtés d\'accord)', apres.miloEnParle===false);
  t('0 erreur JS', q.errs.length===0, q.errs.join(' | '));
  await q.c.close();
}
{
  // ── Ce que l'app VOIT (ft-v663) : elle montre, elle ne devine pas ──────────
  const q=await page(Object.assign(annonce(jour(1),'bas du corps'),
    {ft4_sessions:JSON.stringify([{date:iso(now),volume:3000,exs:[
      {name:'Squat à la Barre',sets:[{kg:120,reps:5,done:true,type:'N'}]},
      {name:'Presse à Cuisses',sets:[{kg:200,reps:10,done:true,type:'N'}]}]}].concat(ss))}),null,64);
  const r=await q.p.evaluate(()=>(document.getElementById('home-milo')||{}).textContent||'');
  t('la carte MONTRE les exercices du jour', /Squat à la Barre/.test(r), r.slice(0,170));
  // ⚠️ Michel : « plutôt bas du corps, ça fait genre il ne connaît pas l'anatomie ».
  // On vérifie qu'il y a de VRAIS pourcentages, cohérents, et que ça fait bien ~100 %.
  t('… et la RÉPARTITION en pourcentages, pas un « plutôt » flou',
    /\d+ % bas du corps/.test(r)&&!/plutôt/.test(r), r.slice(0,190));
  const pcs=(r.match(/(\d+) %/g)||[]).map(x=>parseInt(x,10));
  t('… les pourcentages affichés totalisent ~100 %',
    pcs.length>=1&&pcs.reduce((a,b)=>a+b,0)>=92&&pcs.reduce((a,b)=>a+b,0)<=100, JSON.stringify(pcs));
  t('… le bas du corps domine (séance de jambes)',
    /8[0-9] % bas du corps|9[0-9] % bas du corps/.test(r), r.slice(0,190));
  // ⚠️ ft-v665 : après une séance de JAMBES on ne doit JAMAIS lire « dos ». Les érecteurs du
  // rachis sont des STABILISATEURS (vocabulaire des références du domaine) → bucket gainage.
  t('… et on ne lit pas « dos » après une séance de jambes',
    !/% dos/.test(r)&&/% gainage/.test(r), r.slice(0,190));
  t('… mais elle DEMANDE quand même, elle ne tranche pas', /c'était celle-là/i.test(r));
  await q.c.close();
}
{
  // ⚠️ LES 4 PIÈGES QUE MICHEL A SENTIS (29/07) — l'app doit SE TAIRE, pas inventer.
  const cas=[
    ['exercice perso inconnu du moteur',
      [{name:'Mon exo à moi',sets:[{kg:50,reps:10,done:true,type:'N'}]}]],
    ['aucun exercice (cardio seul)', []],
    ['nom d\'exercice vide', [{name:'',sets:[{kg:50,reps:10,done:true,type:'N'}]}]],
    ['nom piégé (injection HTML)',
      [{name:'<img src=x onerror=alert(1)>',sets:[{kg:50,reps:10,done:true,type:'N'}]}]]
  ];
  for(const [nom,exs] of cas){
    const q=await page(Object.assign(annonce(jour(1),'bas du corps'),
      {ft4_sessions:JSON.stringify([{date:iso(now),volume:1000,exs}].concat(ss))}),null,64);
    const r=await q.p.evaluate(()=>{
      const el=document.getElementById('home-milo');
      return {txt:el.textContent||'', html:el.innerHTML||'',
              imgInjectee:!!el.querySelector('img')};
    });
    t(nom+' → la question reste posée', /c'était celle-là/i.test(r.txt), r.txt.slice(0,130));
    t('  … sans pourcentage inventé', !/\d+ % (bas|haut|dos|gainage)/.test(r.txt), r.txt.slice(0,130));
    t('  … sans texte parasite', !/NaN|undefined|\[object/.test(r.txt), r.txt.slice(0,130));
    if(nom.indexOf('injection')>=0)
      t('  … et le nom piégé est ÉCHAPPÉ (aucune balise exécutée)', r.imgInjectee===false);
    await q.c.close();
  }
}
{
  // 0 régression : annonce pour demain SANS séance aujourd'hui → message inchangé
  const q=await page(annonce(jour(1),'bas du corps'),null,64);
  const r=await q.p.evaluate(()=>(document.getElementById('home-milo')||{}).textContent||'');
  t('pas de séance aujourd\'hui → on garde « prévue demain », aucune question',
    /prévue demain/i.test(r)&&!/c'était celle-là/i.test(r), r.slice(0,120));
  await q.c.close();
}

console.log('──────────────────────────────────────────────────────────');
console.log((ko?'❌ ':'✅ ')+ok+'/'+(ok+ko));
await b.close(); srv.close(); process.exit(ko?1:0);
})();
