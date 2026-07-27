// Tests permanents du CALENDRIER de l'Accueil (ft-v639).
// Chacun fige un bug RÉEL trouvé à la relecture du code proposé, avant sa mise en prod.
// Lancer : node tests/calendrier/runner.js   (sortie 1 si un test casse)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'../..');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
            '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]); if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('404');}
  res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(res);
});
let ok=0,ko=0;
const t=(id,label,cond,detail)=>{
  if(cond){ok++;console.log('✅ '+id+' '+label);}
  else{ko++;console.log('❌ '+id+' '+label+(detail?'\n     → '+detail:''));}
};
(async()=>{
  await new Promise(r=>server.listen(0,r)); const PORT=server.address().port;
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const page=await ctx.newPage(); const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('ft4_name','Test');localStorage.setItem('ft4_ok','1');localStorage.setItem('ft4_bw','84');});
  await page.goto(`http://localhost:${PORT}/index.html`);
  await page.waitForTimeout(2200);
  console.log('\n─── CALENDRIER — noyau ───────────────────────────────────');

  // CAL-001 — n° de semaine ISO. Bug d'origine : la formule proposée se décalait
  // d'une semaine sur TOUTE l'année 2027 et 2028 (elle ajoutait jan1.getDay()).
  const semaines=await page.evaluate(()=>{
    function ref(m){const d=new Date(Date.UTC(m.getFullYear(),m.getMonth(),m.getDate()));
      d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));
      const y0=new Date(Date.UTC(d.getUTCFullYear(),0,1));
      return Math.ceil((((d-y0)/864e5)+1)/7);}
    const bad=[];
    for(let y=2024;y<=2032;y++)for(let i=0;i<53;i++){
      const d=new Date(y,0,1+i*7); if(d.getFullYear()!==y)break;
      const mon=new Date(d); mon.setDate(d.getDate()-((d.getDay()+6)%7));
      if(_calIsoWeek(mon)!==ref(mon))bad.push(y+'/'+mon.toISOString().slice(0,10));
    }
    return bad;
  });
  t('CAL-001','n° de semaine ISO juste de 2024 à 2032',semaines.length===0,semaines.slice(0,4).join(', '));

  // CAL-002 — couleur du groupe travaillé. Bug d'origine : le code cherchait « dos » et
  // « épaule » dans les libellés, qui sont « Grand dorsal » et « Deltoïdes » → une séance
  // de dos s'affichait en rouge (pecs) et le full body n'était jamais vert.
  const cols=await page.evaluate(()=>{
    const mk=n=>({name:n,sets:[{kg:60,reps:10,done:true}]});
    const S1=(d,names)=>({date:d,exs:names.map(mk)});
    return {
      push:      _calSessColor(S1('2026-07-01',['Développé Couché','Développé Militaire','Extension Triceps Poulie'])),
      pull:      _calSessColor(S1('2026-07-02',['Rowing Barre','Tractions','Curl Barre'])),
      jambes:    _calSessColor(S1('2026-07-03',['Squat','Presse à Cuisses','Leg Curl'])),
      abdos:     _calSessColor(S1('2026-07-04',['Crunch','Gainage'])),
      full:      _calSessColor(S1('2026-07-05',['Squat','Développé Couché','Rowing Barre'])),
      full2:     _calSessColor(S1('2026-07-06',['Soulevé de Terre','Développé Couché','Tractions','Squat'])),
      hautCorps: _calSessColor(S1('2026-07-07',['Développé Couché','Rowing Barre','Curl Barre','Élévations Latérales']))
    };
  });
  t('CAL-002','séance de DOS → bleu (et pas rouge)',cols.pull==='var(--blue)',cols.pull);
  t('CAL-003','FULL BODY → vert (haut ET bas travaillés), sur 2 compositions différentes',
    cols.full==='var(--green)'&&cols.full2==='var(--green)',JSON.stringify({full:cols.full,full2:cols.full2}));
  t('CAL-004','push → rouge · jambes → violet · abdos → orange',
    cols.push==='var(--red)'&&cols.jambes==='var(--purp)'&&cols.abdos==='var(--orange)',JSON.stringify(cols));
  t('CAL-004b','une séance haut-du-corps complète n\'est PAS prise pour du full body',
    cols.hautCorps!=='var(--green)',cols.hautCorps);

  // CAL-005 — volume : mêmes exclusions que les records (échauffement É, W, séries non faites)
  const vols=await page.evaluate(()=>({
    normal:_calSessVol({exs:[{sets:[{kg:100,reps:10,done:true}]}]}),
    horsCompte:_calSessVol({exs:[{sets:[
      {kg:100,reps:10,done:true,type:'É'},{kg:100,reps:10,done:true,type:'W'},{kg:100,reps:10,done:false}]}]}),
    poidsDuCorps:_calSessVol({exs:[{sets:[{kg:0,reps:20,done:true}]}]})
  }));
  t('CAL-005','échauffement / W / série non faite exclus du tonnage',
    vols.normal===1000&&vols.horsCompte===0,JSON.stringify(vols));

  // CAL-006 — une semaine AU POIDS DU CORPS pèse 0 kg : ce n'est PAS du repos.
  // Bug d'origine : la gouttière affichait « repos » alors que la personne s'était entraînée.
  const gout=await page.evaluate(()=>{
    const d=new Date(); const iso=x=>x.toISOString().slice(0,10);
    S.sessions=[{date:iso(d),progLabel:'Gainage',exs:[{name:'Gainage',sets:[{kg:0,reps:60,done:true}]}]}];
    _calDate=new Date(); _calZoomWeek=null; _calSelDay=null;
    _renderHomeCalendar();
    const el=document.getElementById('home-secondary');
    return [...el.querySelectorAll('[onclick^="_calZoom"]')].map(x=>x.textContent);
  });
  t('CAL-006','semaine au poids du corps ≠ « repos »',
    gout.some(x=>/S\d+1×/.test(x.replace(/\s/g,''))), gout.join(' | '));

  // CAL-007 — repli si color-mix n'est pas supporté (vieux Safari) : sans lui, les jours
  // de séance seraient totalement transparents, donc invisibles.
  const heat=await page.evaluate(()=>_calHeatBg(1));
  t('CAL-007','fond de séance : repli avant color-mix',
    /^background:rgba\(/.test(heat)&&heat.includes('color-mix'),heat);

  // CAL-008 — la sélection d'un jour se remet à zéro quand on change de mois,
  // sinon le panneau affiche un jour qui n'est plus dans la grille.
  const sel=await page.evaluate(()=>{
    const d=new Date(); const iso=x=>x.toISOString().slice(0,10);
    S.sessions=[{date:iso(d),progLabel:'Push',exs:[{name:'Développé Couché',sets:[{kg:80,reps:8,done:true}]}]}];
    _calDate=new Date(); _calZoomWeek=null;
    _calSelect(iso(d)); const apres=_calSelDay;
    _calNav(-1);        const apresNav=_calSelDay;
    _calSelect(iso(d)); const r=_calSelDay; _calSelect(iso(d));
    return {apres:apres===iso(d), apresNav:apresNav===null, bascule:r===iso(d)&&_calSelDay===null};
  });
  t('CAL-008','sélection : un tap ouvre, un 2e referme, un changement de mois annule',
    sel.apres&&sel.apresNav&&sel.bascule,JSON.stringify(sel));

  t('CAL-009','0 erreur JS',errs.length===0,errs.join(' | '));
  console.log('──────────────────────────────────────────────────────────');
  console.log('Total '+(ok+ko)+' · ✅ '+ok+' · ❌ '+ko);
  await ctx.close(); await b.close(); server.close();
  process.exit(ko?1:0);
})();
