#!/usr/bin/env node
/**
 * 📸 CAPTURES D'ÉCRAN DE L'APPLICATION — pour la promotion, la doc, ou un outil extérieur
 *
 * Pourquoi ce fichier existe (17/08/2026). Michel voulait faire fabriquer un site
 * promotionnel par un outil extérieur. Or ni ChatGPT ni aucun robot ne peut VOIR
 * Force Tracker : l'app se construit en JavaScript, donc une adresse ne rend qu'une
 * coquille vide — le clone compris. La seule chose transmissible, c'est l'IMAGE.
 * Et les reprendre à la main sur un téléphone, c'est une heure à chaque fois.
 *
 * ⚠️ LES DONNÉES SONT FICTIVES, ET C'EST LE POINT IMPORTANT. Un athlète inventé
 * (« Alex », 79 kg, 4 mois d'entraînement), une adresse qui n'existe pas. Aucune
 * donnée réelle : ces images se publient sans rien exposer de personne.
 *
 * ⚠️ PIÈGES DÉJÀ PAYÉS, à ne pas re-découvrir :
 *   · goScreen() prend 'home'/'log'/'progress'…, PAS 's-home' — sinon écran vide ;
 *   · les noms d'exercices doivent venir du CATALOGUE au mot près, sinon les
 *     graphiques affichent « Aucune donnée » et les figurines ne colorient rien ;
 *   · sess.calories est un NOMBRE et sess.duration est en SECONDES (un objet
 *     donne « [object Object] kcal ») ; une pesée se range sous `kg`, pas `bw` ;
 *   · il faut poser ft4_ob2 / ft4_guide_shown / ft4_wn_seen, sinon on ne capture
 *     que l'écran d'installation ;
 *   · shot() pose un display:none EN LIGNE sur les modales : modal() doit le
 *     retirer avant d'ajouter .open, sinon la fenêtre reste invisible.
 *
 * Lancer :  node tools/captures.js
 * Sortie :  ./captures/  (ou $FT_SHOTS_OUT)
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');            // la racine du dépôt
const OUT=path.resolve(process.env.FT_SHOTS_OUT||path.join(ROOT,'captures'));
fs.mkdirSync(OUT,{recursive:true});
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
         '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});

/* ── Un athlète de démo crédible : 4 mois d'entraînement, 3 séances/semaine ── */
function demo(){
  const j=(d)=>{const x=new Date();x.setDate(x.getDate()-d);return x.toISOString().slice(0,10);};
  /* ⚠️ Noms pris TELS QUELS dans le catalogue (EXLIB) : sinon les graphiques de l'onglet
     Progrès affichent « Aucune donnée » et les figurines ne colorient aucun muscle. */
  const PLANS=[
    {label:'Pousser',exs:[['Développé Couché',[[60,10,'W'],[80,8],[85,6],[85,6],[82.5,7]]],
                          ['Développé Militaire',[[40,10],[45,8],[45,8]]],
                          ['Dips',[[0,12],[0,10],[0,9]]],
                          ['Triceps Poulie',[[30,12],[32.5,10],[32.5,10]]]]},
    {label:'Tirer',exs:[['Soulevé de Terre',[[80,5,'W'],[120,5],[130,3],[130,3],[125,4]]],
                        ['Tirage Poulie Haute (Lat Pulldown)',[[55,10],[60,8],[60,8]]],
                        ['Rowing Barre (Tirage Horizontal)',[[60,10],[65,8],[65,8]]],
                        ['Curl Haltères',[[20,12],[22.5,10],[22.5,9]]]]},
    {label:'Jambes',exs:[['Squat à la Barre',[[60,8,'W'],[100,6],[105,5],[105,5],[100,6]]],
                         ['Press Jambes 45°',[[180,12],[200,10],[200,10]]],
                         ['Leg Curl Couché Machine',[[45,12],[50,10],[50,10]]],
                         ['Élévations Mollets Debout',[[80,15],[80,15],[80,14]]]]}
  ];
  const sessions=[],prs={},wlog=[],sleep=[];
  let n=0;
  for(let d=112; d>=1; d-=1){
    const dow=new Date(Date.now()-d*864e5).getDay();
    if(![1,3,5].includes(dow)) continue;                       // lun / mer / ven
    const plan=PLANS[n%3]; n++;
    const prog=1+(112-d)/112*0.12;                             // +12 % de progression sur 4 mois
    const exs=plan.exs.map(([name,sets])=>({name,sets:sets.map(([kg,reps,t])=>{
      const K=kg?Math.round(kg*prog*2)/2:0;
      return {kg:K,reps,done:true,type:t||'N'};
    })}));
    let vol=0; exs.forEach(e=>e.sets.forEach(s=>{if(s.done&&s.type!=='W')vol+=s.kg*s.reps;}));
    /* ⚠️ Formes RÉELLES : `calories` est un NOMBRE (log.js `sess.calories=calData.total`)
       et `duration` est en SECONDES. Avec un objet on obtient « [object Object] kcal ». */
    const ts=new Date(j(d)+'T18:00:00').getTime();
    sessions.unshift({id:ts,ts,date:j(d),progLabel:plan.label,exs,volume:Math.round(vol),
      calories:Math.round(300+vol/60),duration:Math.round((58+Math.random()*14)*60),
      startHour:18,warmupMin:10,engineVersion:3,synced:true,uniConv:1});
    exs.forEach(e=>e.sets.forEach(s=>{
      if(!s.done||s.type==='W'||!s.kg&&!s.reps)return;
      const rm=Math.round((s.kg||1)*(36/(37-s.reps))*10)/10;
      if(!prs[e.name]||rm>prs[e.name].rm1) prs[e.name]={rm1:rm,kg:s.kg,reps:s.reps,date:j(d)};
    }));
    wlog.push({date:j(d),kg:Math.round((76.4+(112-d)/112*2.6)*10)/10,bf:Math.round((15.8-(112-d)/112*1.4)*10)/10});
    sleep.push({date:j(d),hours:7+Math.round(Math.random()*3)/2,energy:3+Math.round(Math.random())});
  }
  sleep.push({date:j(0),hours:7.5,energy:4});
  wlog.push({date:j(0),kg:79,bf:14.4});
  return {
    ft4_name:'Alex', ft4_bw:'79', ft4_age:'32', ft4_ht:'179', ft4_gender:'H',
    ft4_act:'1.55', ft4_work:'bureau', ft4_goal:'muscle', ft4_rest:'150',
    ft4_neck:'39', ft4_waist:'84', ft4_target:'82', ft4_discipline:'muscu',
    ft4_level:'intermediaire', ft4_ok:'1', ft4_nphase:'charge',
    ft4_email:'alex@exemple.fr',   // adresse de DÉMONSTRATION, elle n'existe pas
    ft4_sessions:JSON.stringify(sessions),
    ft4_prs:JSON.stringify(prs),
    ft4_wlog:JSON.stringify(wlog),
    ft4_sleep:JSON.stringify(sleep),
    ft4_priorities:JSON.stringify(['pecs','dos']),
    ft4_foodlog:JSON.stringify([
      {date:j(0),meal:'petitdej', name:'Flocons d\'avoine + lait',   kcal:420,prot:22,carbs:62,fat:9, ts:1},
      {date:j(0),meal:'petitdej', name:'2 œufs brouillés',           kcal:180,prot:14,carbs:1, fat:13,ts:2},
      {date:j(0),meal:'dejeuner', name:'Poulet riz brocolis',        kcal:680,prot:52,carbs:78,fat:14,ts:3},
      {date:j(0),meal:'collation',name:'Skyr + amandes',             kcal:310,prot:26,carbs:14,fat:16,ts:4},
      {date:j(0),meal:'diner',    name:'Saumon patate douce salade', kcal:640,prot:41,carbs:52,fat:26,ts:5}]),
    ft4_cycle:JSON.stringify({startDate:j(35),weeks:12,active:true,
      exercises:{'Squat à la Barre':{rm1:132,target:145},'Développé Couché':{rm1:101,target:110},
                 'Soulevé de Terre':{rm1:152,target:167}}}),
    ft4_strgoals:JSON.stringify({'Squat à la Barre':145,'Développé Couché':110,'Soulevé de Terre':167}),
    // profil déjà complet → Milo ne pose pas de question de complétion sur l'Accueil
    ft4_coachquiz:JSON.stringify({answers:{xp:'5a',freq:'3',place:'salle',time:'60',bar:'ok',
      motiv:'fort',weak:'pecs',cardio:'peu',pain:['aucune'],energy:'ok',goalfeel:'muscle',
      diet0:'propre',tone:'motiv'},done:true}),
    ft4_registre:JSON.stringify({facts:{},observations:[],updatedAt:'',lastObsAt:j(1)}),
    // le check-in du jour est rempli → les trois tuiles ne sont pas vides
    ft4_daystate:JSON.stringify({date:j(0),energy:3,mood:3,pains:[],note:''}),  // index 0..3,
    ft4_seen_ft:JSON.stringify(['x']),                          // pas de point rouge « nouveauté »
    // compte déjà installé : ni onboarding, ni guide-film, ni « quoi de neuf »
    ft4_ob2:'1', ft4_guide_shown:'1', ft4_whatsnew_v2:'1', ft4_wn_seen:'999',
  };
}

(async()=>{
await new Promise(r=>srv.listen(0,r));
const PORT=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},
  deviceScaleFactor:3, timezoneId:'Europe/Paris', locale:'fr-FR'});
const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
const seed=demo();
await p.addInitScript(`(()=>{try{${Object.entries(seed).map(([k,v])=>
  `localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)});`).join('')}
  window._demoMode=true;}catch(e){}})();`);
await p.goto('http://localhost:'+PORT+'/index.html');
await p.waitForTimeout(3000);

// referme tout ce qui pourrait s'ouvrir au démarrage (pop-ups, tutoriels)
await p.evaluate(()=>{document.querySelectorAll('.overlay.open').forEach(o=>o.classList.remove('open'));});
await p.waitForTimeout(400);

/* Une capture au format téléphone + une capture ENTIÈRE de l'écran (utile au maquettiste) */
async function shot(name,fn,opts){
  opts=opts||{};
  try{
    if(opts.viewport) await p.setViewportSize({width:390,height:opts.viewport});
    if(fn) await p.evaluate(fn);
    await p.waitForTimeout(1300);
    await p.evaluate(()=>{
      document.querySelectorAll('.overlay').forEach(o=>{o.classList.remove('open');o.style.display='none';});
      window.scrollTo(0,0);
    });
    await p.waitForTimeout(500);
    await p.screenshot({path:path.join(OUT,name+'.png')});
    console.log('  ✅ '+name+'.png');
    if(opts.viewport) await p.setViewportSize({width:390,height:844});
    if(opts.full===false) return;
    // ── version longue : on déplie le conteneur qui scrolle et on agrandit la fenêtre ──
    const h=await p.evaluate(()=>{
      const sc=document.querySelector('.screen.active'); if(!sc)return 0;
      sc.dataset._h=sc.style.height||''; sc.dataset._o=sc.style.overflow||'';
      sc.style.height='auto'; sc.style.overflow='visible';
      return Math.min(sc.scrollHeight+180, 6000);
    });
    if(h>900){
      await p.setViewportSize({width:390,height:Math.round(h)});
      await p.waitForTimeout(700);
      await p.screenshot({path:path.join(OUT,name+'-complet.png')});
      console.log('     ↳ '+name+'-complet.png ('+Math.round(h)+' px)');
      await p.setViewportSize({width:390,height:844});
    }
    await p.evaluate(()=>{const sc=document.querySelector('.screen.active');
      if(sc){sc.style.height=sc.dataset._h||'';sc.style.overflow=sc.dataset._o||'';}});
    await p.waitForTimeout(300);
  }catch(e){ console.log('  ❌ '+name+' → '+e.message); }
}

console.log('\n═══ Captures Force Tracker (démo) ═══');
await shot('01-accueil',        ()=>{ goScreen('home'); });
await shot('02-progres',        ()=>{ goScreen('progress'); });
await shot('03-nutrition',      ()=>{ goScreen('nutrition'); });
await shot('04-coach-milo',     ()=>{ goScreen('coach'); });
// une conversation avec Milo (l'âme du produit : la mémoire)
await shot('04b-milo-conversation',()=>{
  goScreen('coach');
  coachHistory=[
    {role:'user',content:'Je fais quoi aujourd\'hui ? J\'ai mal dormi.'},
    {role:'assistant',content:"5 h de sommeil et ta dernière séance jambes date d'avant-hier — ton score de récup est à 61.\n\nJe ne te propose pas de PR aujourd'hui, ce serait le mauvais jour. Par contre ton **développé couché** est monté de 80 à 87,5 kg en 4 mois sans jamais bloquer : il y a de la marge pour un travail de volume.\n\nJe te propose **4×8 à 72,5 kg**, plus léger que d'habitude, avec 2 min 30 de repos. Tu gardes le rythme sans creuser la fatigue.\n\nEt on refait les jambes jeudi, à tête reposée."},
    {role:'user',content:'ok mais mon épaule droite tire un peu depuis la semaine dernière'},
    {role:'assistant',content:"Noté — je garde ça en tête pour la suite.\n\nOn enlève le **développé militaire** aujourd'hui : la barre au-dessus de la tête, c'est exactement ce qui va tirer. À la place, **développé haltères assis à 45°** — même muscle, l'épaule reste dans un angle confortable.\n\nSi ça tire toujours dans 10 jours, ce n'est plus une courbature : ça vaut le coup d'en parler à un kiné. Je ne peux pas te dire ce que c'est, et je ne vais pas essayer."}
  ];
  if(typeof _showCoachChat==='function')_showCoachChat();
  if(typeof _renderCoachThread==='function')_renderCoachThread();
  if(typeof updateCoachHeader==='function')updateCoachHeader();
  const m=document.getElementById('coach-msgs'); if(m)m.scrollTop=0;
}, {full:false});
// le fil entier de la conversation, en une image
await shot('04c-milo-conversation-complet', ()=>{
  const m=document.getElementById('coach-msgs');
  if(m){m.style.height='auto';m.style.maxHeight='none';m.style.overflow='visible';}
  const sc=document.getElementById('s-coach');
  if(sc){sc.style.height='auto';sc.style.overflow='visible';}
}, {full:false, viewport:3000});
await shot('05-profil',         ()=>{ goScreen('setup'); });
await shot('06-seance-vide',    ()=>{ goScreen('log'); });
// une séance EN COURS (le cœur du produit)
await shot('07-seance-en-cours',()=>{
  goScreen('log');
  if(typeof startWorkout==='function'&&(!S.wkt||!S.wkt.exs||!S.wkt.exs.length)) startWorkout();
  S.wkt.exs=[{name:'Développé Couché',sets:[
      {kg:60,reps:10,done:true,type:'W'},{kg:80,reps:8,done:true,type:'N'},
      {kg:87.5,reps:6,done:true,type:'N'},{kg:87.5,reps:6,done:false,type:'N'}]},
    {name:'Développé Militaire',sets:[
      {kg:45,reps:8,done:false,type:'N'},{kg:45,reps:8,done:false,type:'N'}]},
    {name:'Dips',sets:[{kg:0,reps:12,done:false,type:'N'}]}];
  S.wkt.progLabel='Pousser';
  persist(); renderLog();
  if(typeof toggleExBlock==='function'){ try{ toggleExBlock(0); }catch(e){} }
});


// ── Onglets internes ────────────────────────────────────────────────
await shot('08-progres-poids',  ()=>{ goScreen('progress');
  switchProgTab('poids',document.getElementById('ptab-poids')); });
await shot('09-progres-badges', ()=>{ goScreen('progress');
  if(typeof checkBadges==='function'){try{checkBadges(true);}catch(e){}}
  switchProgTab('badges',document.getElementById('ptab-badges')); });
await shot('10-nutrition-journal',()=>{ goScreen('nutrition');
  switchNuTab('journal',document.getElementById('ntab-journal')); });
await shot('11-nutrition-supplements',()=>{ goScreen('nutrition');
  switchNuTab('suppl',document.getElementById('ntab-suppl')); });
await shot('12-cycle-de-force', ()=>{ goScreen('cycle'); });

// ── Modales : c'est là que vit une bonne part de l'identité ─────────
async function modal(name,fn){
  // ⚠️ shot() a posé un display:none EN LIGNE sur toutes les modales : sans ce nettoyage,
  // ajouter la classe .open ne les rend pas visibles (le style en ligne gagne).
  await p.evaluate(()=>{document.querySelectorAll('.overlay').forEach(o=>{o.style.display='';});
    if(typeof S!=='undefined'){S.wkt=null;try{persist();}catch(e){}}});
  await p.evaluate(fn);
  await p.waitForTimeout(1500);
  await p.screenshot({path:path.join(OUT,name+'.png')});
  console.log('  ✅ '+name+'.png');
  await p.evaluate(()=>document.querySelectorAll('.overlay.open')
    .forEach(o=>o.classList.remove('open')));
  await p.waitForTimeout(400);
}
console.log('\n── modales ──');
await modal('20-muscles-travailles',()=>{                    // ⭐ la figurine, la marque de fabrique
  goScreen('home');
  const s=S.sessions[0];
  if(typeof showMuscleMap==='function') showMuscleMap(s.exs);
});
await modal('21-detail-seance',()=>{
  goScreen('progress');
  const s=S.sessions[0];
  if(typeof openSessDetail==='function') openSessDetail(s.ts||s.id);
});
await modal('22-timer-repos',()=>{
  goScreen('log');
  if(typeof startRest==='function') startRest(150);
});
await modal('23-pourquoi-ce-score',()=>{
  goScreen('home');
  if(typeof openRecoWhy==='function') openRecoWhy();
});
await modal('24-ce-que-milo-sait',()=>{
  if(typeof openMiloKnows==='function') openMiloKnows();
});
await modal('25-choix-exercice',()=>{
  goScreen('log');
  if(typeof openExPicker==='function') openExPicker();
});
await modal('26-historique-exercice',()=>{
  goScreen('log');
  if(typeof openExHistory==='function') openExHistory('Développé Couché');
});
await modal('27-guide-de-lapp',()=>{
  if(typeof openAppGuide==='function') openAppGuide();
});
await modal('28-resume-semaine',()=>{
  goScreen('home');
  S.lastWeekSummary='';
  if(typeof checkWeeklySummary==='function'){try{checkWeeklySummary();}catch(e){}}
  const o=document.getElementById('ov-week-summary'); if(o)o.classList.add('open');
});
await modal('29-aide-contextuelle',()=>{
  goScreen('home');
  if(typeof showHelp==='function') showHelp();
});

if(errs.length) console.log('\n⚠️  erreurs page : '+errs.slice(0,4).join(' | '));
await b.close(); srv.close();
console.log('\n→ '+OUT+'\n');
})();
