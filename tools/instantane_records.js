#!/usr/bin/env node
/**
 * INSTANTANE DES RECORDS — le critere de reussite du constat C (C1 et C2).
 *
 * Michel : *« le but n'est pas de changer le calcul des records aujourd'hui ; le but est
 * d'empecher qu'un futur import d'historique avec type de serie puisse creer un record
 * d'echauffement en silence »*. Le contrat est donc binaire : ⭐ AUCUN RECORD NE DOIT BOUGER.
 *
 *   node tools/instantane_records.js > /tmp/avant_records.json   (avant de toucher au code)
 *   node tools/instantane_records.js > /tmp/apres_records.json   (apres)
 *   diff /tmp/avant_records.json /tmp/apres_records.json         -> DOIT etre vide
 *
 * ⭐ CE QU'IL CONDUIT, CE QU'IL OBSERVE, CE QU'IL NE COUVRE PAS :
 *   - CONDUIT  : les DEUX vrais chemins, par leur porte d'entree reelle —
 *                `openSessDetail()` puis `saveSessEdits()` (C1), et `finalImportHist()` (C2).
 *                ⛔ On n'appelle PAS la regle d'eligibilite toute seule : verifier la fonction
 *                n'est pas verifier l'appel (`BUGS.md` §58).
 *   - OBSERVE  : `S.prs` en entier (charge, reps, 1RM, date) apres chaque chemin, ET le volume
 *                de la seance, ET le nombre de seances creees — parce qu'une regle
 *                d'eligibilite mal deplacee peut deborder sur le volume sans toucher au record.
 *   - NE COUVRE PAS : `finishWorkout` (il emploie DEJA le proprietaire, rien n'y change) ni
 *                l'ecran de recalcul des records (setup.js), tous deux hors perimetre — mais
 *                un temoin de source verifie qu'ils n'ont pas bouge.
 *
 * ⛔ LES TYPES SONT BALAYES EN ENTIER, y compris ceux que le chemin ne peut PAS porter
 *    aujourd'hui ('É' a l'import) : c'est exactement le cas futur que C2 protege, et un
 *    instantane qui ne le contient pas ne pourrait pas dire si le correctif a change quelque
 *    chose le jour ou ce type arrivera.
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
         '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
  const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});

const seed=`(()=>{try{
  localStorage.setItem('ft4_name','Testeur');localStorage.setItem('ft4_bw','80');
  localStorage.setItem('ft4_age','30');localStorage.setItem('ft4_ht','178');
  localStorage.setItem('ft4_gender','H');localStorage.setItem('ft4_act','1.55');
  localStorage.setItem('ft4_goal','muscle');
  window._demoMode=true;
}catch(e){}})();`;

(async()=>{
await new Promise(r=>srv.listen(0,r));
const PORT=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(seed);
await p.goto('http://localhost:'+PORT+'/index.html');
await p.waitForTimeout(2500);

const snap=await p.evaluate(async()=>{
  const out={};
  const sur=f=>{ try{ return f(); }catch(e){ return 'ERREUR: '+e.message; } };
  /* Les records, formates a l'identique : c'est CE CHIFFRE qui ne doit pas bouger. */
  const lirePrs=()=>Object.keys(S.prs||{}).sort().map(n=>{
    const r=S.prs[n];
    return n+' = '+r.kg+'kg x'+r.reps+' -> 1RM '+(Math.round(r.rm1*100)/100)+' ('+r.date+')';
  });
  /* ⛔ Les TYPES balayes : les 4 reels + ceux que le chemin ne porte pas encore. */
  const TYPES=['', 'É', 'W', 'D', 'N', 'X'];

  /* ══════════ C1 — L'EDITION D'UNE SEANCE (`openSessDetail` -> `saveSessEdits`) ══════════
     On passe par la VRAIE porte : `openSessDetail` pose `_sessId` et `_sessEdits`, et c'est
     `saveSessEdits` qui decide des records. Poser `_sessEdits` a la main sauterait la copie
     profonde et ne testerait pas le chemin de la personne. */
  out.C1=[];
  TYPES.forEach(ty=>{
    [true,false].forEach(fait=>{
      const ts=1750000000000;
      S.prs={};
      S.sessions=[{id:ts, ts, date:'2026-09-01', volume:0, exs:[
        {name:'Développé Couché', sets:[{kg:100,reps:5,done:fait,type:ty,rm1:0}]}
      ]}];
      const r=sur(()=>{
        openSessDetail(ts);
        saveSessEdits();
        return {prs:lirePrs(), volume:(S.sessions[0]||{}).volume};
      });
      out.C1.push({cas:'type="'+ty+'" done='+fait, prs:r.prs||r, volume:r.volume});
    });
  });
  /* ⛔ Le cas qui compte vraiment : PLUSIEURS series dans la meme seance, dont un echauffement
     LOURD. Si la regle deborde, c'est lui qui poserait le faux record. */
  out.C1melange=sur(()=>{
    const ts=1750000001000;
    S.prs={};
    S.sessions=[{id:ts, ts, date:'2026-09-02', volume:0, exs:[
      {name:'Squat à la Barre', sets:[
        {kg:200,reps:3,done:true,type:'É',rm1:0},    // echauffement LOURD -> doit etre refuse
        {kg:120,reps:8,done:true,type:'',rm1:0},     // vraie serie de travail
        {kg:180,reps:2,done:true,type:'W',rm1:0},    // W -> refuse
        {kg:130,reps:6,done:true,type:'D',rm1:0},    // drop set -> ACCEPTE
        {kg:250,reps:1,done:false,type:'',rm1:0}     // non faite -> refusee
      ]}
    ]}];
    openSessDetail(ts); saveSessEdits();
    return {prs:lirePrs(), volume:S.sessions[0].volume};
  });

  /* ══════════ C2 — L'IMPORT D'HISTORIQUE (`finalImportHist`) ══════════
     ⚠️ Il lit `_histExtracted` et `_histConflicts` : on les pose, puis on appelle la VRAIE
     fonction. Elle cree les seances, force le type, puis calcule les records. */
  /* ⚠️⚠️ SANS `window.`, ET C'EST LA CAUSE D'UNE SONDE QUI ETAIT VERTE EN NE MESURANT RIEN.
     `_histExtracted` est declare `let` en tete de `log.js` : dans un script classique, un `let`
     de premier niveau vit dans l'environnement lexical global et n'est **PAS** une propriete de
     `window`. Ecrire `window._histExtracted = …` creait donc une SECONDE variable que
     `finalImportHist` ne lit jamais — elle voyait `null`, sortait par « Aucune seance a
     importer », et l'instantane rendait 0 seance / 0 record **sans la moindre erreur**.
     👉 *Une sonde qui n'atteint pas sa fonction ressemble trait pour trait a une sonde qui
     mesure un resultat vide.* L'affectation nue, elle, resout bien vers le `let`. */
  const importer=(exercises)=>{
    S.prs={}; S.sessions=[]; S.customExercises=[];
    _histExtracted={sessions:[{date:'2026-08-15', exercises}]};
    _histConflicts=[];
    finalImportHist();
    return {prs:lirePrs(),
            seances:(S.sessions||[]).length,
            types:((S.sessions[0]||{}).exs||[]).map(e=>(e.sets||[]).map(s=>'"'+s.type+'"').join('/')).join(' | '),
            volume:(S.sessions[0]||{}).volume};
  };
  out.C2=[];
  TYPES.forEach(ty=>{
    out.C2.push({cas:'import type="'+ty+'"',
      r:sur(()=>importer([{name:'Développé Couché', sets:[{kg:100,reps:5,type:ty}]}]))});
  });
  /* ⛔⛔ LE CAS FUTUR, EN ENTIER : une seance importee dont l'echauffement est PLUS LOURD que
     la serie de travail. Aujourd'hui le type est ecrase a '' deux lignes plus haut, donc
     l'echauffement POSE le record — et c'est ce que l'instantane doit figer tel quel, sans
     le corriger : C2 supprime la dependance accidentelle, il ne change pas le calcul. */
  out.C2echauffementLourd=sur(()=>importer([{name:'Squat à la Barre', sets:[
      {kg:200,reps:3,type:'É'},
      {kg:120,reps:8,type:''},
      {kg:180,reps:2,type:'W'},
      {kg:130,reps:6,type:'D'}
  ]}]));
  /* Plusieurs seances, plusieurs exercices : le chemin complet, trie par date. */
  out.C2plusieurs=sur(()=>{
    S.prs={}; S.sessions=[]; S.customExercises=[];
    _histExtracted={sessions:[
      {date:'2026-08-20', exercises:[{name:'Développé Couché', sets:[{kg:90,reps:6,type:''}]}]},
      {date:'2026-08-10', exercises:[{name:'Développé Couché', sets:[{kg:95,reps:4,type:'D'}]}]},
      {date:'2026-08-25', exercises:[{name:'Rowing Barre',     sets:[{kg:80,reps:10,type:'É'}]}]}
    ]};
    _histConflicts=[];
    finalImportHist();
    return {prs:lirePrs(), seances:(S.sessions||[]).length};
  });

  /* ══════════ LE PROPRIETAIRE, POUR LUI-MEME ══════════
     ⛔ Ce bloc ne remplace PAS les deux precedents (§58) : il dit ce que la regle REPOND, pas
     ce que les chemins en FONT. Les deux sont necessaires, et c'est leur COMPOSITION qui
     prouve la protection du cas futur. */
  out.proprietaire=TYPES.map(ty=>{
    const s={done:true,kg:100,reps:5,type:ty};
    return 'type="'+ty+'" -> '+sur(()=>String(_serieFaitFoiPourPR(s)));
  }).concat([
    'done=false -> '+sur(()=>String(_serieFaitFoiPourPR({done:false,kg:100,reps:5,type:''}))),
    'kg=0     -> '+sur(()=>String(_serieFaitFoiPourPR({done:true,kg:0,reps:5,type:''}))),
    'reps=0   -> '+sur(()=>String(_serieFaitFoiPourPR({done:true,kg:100,reps:0,type:''}))),
    'null     -> '+sur(()=>String(_serieFaitFoiPourPR(null)))
  ]);

  return out;
});

console.log(JSON.stringify({erreurs:errs, ...snap}, null, 1));
await b.close(); srv.close();
})();
