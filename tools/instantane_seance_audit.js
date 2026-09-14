#!/usr/bin/env node
/**
 * INSTANTANE DES 3 CONSTATS DE L'AUDIT « ONGLET SEANCE » — le critere de reussite.
 *
 * Michel : *« vas-y corrige tout »* (12/09/2026) sur trois constats qui sont TOUS invisibles a
 * l'ecran aujourd'hui. Donc le contrat est le meme que pour les extractions nutrition :
 * ⭐ AUCUNE VALEUR AFFICHEE NE DOIT BOUGER. Une passe verte ne prouve pas ca — elle prouve que
 * ce que les temoins REGARDENT n'a pas bouge. Ce fichier dumpe la SORTIE BRUTE des trois zones.
 *
 *   node tools/instantane_seance_audit.js > /tmp/avant_audit.json   (avant de toucher au code)
 *   node tools/instantane_seance_audit.js > /tmp/apres_audit.json   (apres)
 *   diff /tmp/avant_audit.json /tmp/apres_audit.json                -> DOIT etre vide
 *
 * ⚠️⚠️ SAUF UNE LIGNE, ET ELLE EST NOMMEE : le bloc `repli_sans_reglage` MESURE l'etat
 *    IMPOSSIBLE (`S.defRest` absent). C'est exactement ce que le constat n°3 corrige, donc ce
 *    bloc-la DOIT changer (90 et 120 deviennent 130) — et c'est la seule difference autorisee.
 *    Le bloc `repli_avec_reglage` mesure la vraie vie (le reglage est toujours pose au
 *    chargement) et lui ne doit pas bouger d'un caractere.
 *    👉 *Un instantane qui ne separe pas les deux ne saurait pas dire si le correctif a deborde.*
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
  localStorage.setItem('ft4_goal','muscle');localStorage.setItem('ft4_rest','130');
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

  /* ══════════ CONSTAT n°1 et n°2 — LES LIBELLES DE LA RESERVE ══════════
     C'est CE QUE LA PERSONNE LIT. La conversion RPE = 10 - RIR est retapee a la main dans
     plusieurs fonctions ; la centraliser ne doit changer AUCUN de ces caracteres.
     ⛔ On balaie volontairement HORS de l'echelle (-1, 5, 9) : une extraction peut etre juste
        sur le domaine utile et fausse au bord, et c'est au bord que les copies divergent. */
  const crans=[null,-1,0,1,2,3,4,5,9];
  ['rir','rpe'].forEach(ech=>{
    S.echelleReserve=ech;
    const bloc={};
    bloc.question = sur(()=>_reserveQuestion());
    bloc.echec    = sur(()=>_reserveEchecTxt());
    bloc.bouton   = crans.map(n=>sur(()=>String(_reserveBoutonTxt(n))));
    bloc.badge    = crans.map(n=>sur(()=>String(_reserveBadgeTxt(n))));
    bloc.conversion = crans.map(n=>sur(()=>{
      const v=_rpeDeRir(n); return (v===null||v===undefined)?'null':String(v);
    }));
    /* Le badge de la colonne « precedent » tel qu'il est REELLEMENT fabrique (avec sa regle
       « un X ne porte pas de RIR »). ⭐ C'est l'appel, pas la fonction — §58. */
    bloc.prevBadge = [
      sur(()=>_prevRirBadge({rir:2})),
      sur(()=>_prevRirBadge({rir:0})),
      sur(()=>_prevRirBadge({rir:4})),
      sur(()=>_prevRirBadge({rir:2,type:'X'})),
      sur(()=>_prevRirBadge({})),
      sur(()=>_prevRirBadge(null))
    ];
    out['reserve_'+ech]=bloc;
  });
  S.echelleReserve='rir';

  /* ══════════ CONSTAT n°3 — LE REPOS PAR DEFAUT ══════════ */
  const types=['','N','É','W','X','E','D'];
  const seance={date:'2026-09-12',duration:3600,exs:[
    {name:'Développé Couché',sets:[{kg:80,reps:8,done:true},{kg:80,reps:8,done:true},{kg:80,reps:6,done:true}]},
    {name:'Squat',sets:[{kg:100,reps:5,done:true},{kg:100,reps:5,done:true}]}
  ]};

  /* ⭐ LA VRAIE VIE : le reglage est TOUJOURS pose par `load()`. Ce bloc ne doit pas bouger. */
  S.defRest=130;
  out.repli_avec_reglage={
    defRestForType: types.map(t=>sur(()=>String(_defRestForType(t)))),
    calories:       sur(()=>JSON.stringify(calcSessionCalories(seance))),
    duree:          sur(()=>JSON.stringify(_dureeSeanceMin(seance,5,0))),
    rythme:         sur(()=>JSON.stringify(_rythmeSeance()))
  };

  /* ⛔ L'ETAT IMPOSSIBLE : `S.defRest` absent. C'est LE bloc que le constat n°3 change. */
  const garde=S.defRest; delete S.defRest;
  out.repli_sans_reglage={
    defRestForType: types.map(t=>sur(()=>String(_defRestForType(t)))),
    calories:       sur(()=>JSON.stringify(calcSessionCalories(seance))),
    duree:          sur(()=>JSON.stringify(_dureeSeanceMin(seance,5,0))),
    rythme:         sur(()=>JSON.stringify(_rythmeSeance()))
  };
  S.defRest=garde;

  return out;
});

await b.close(); srv.close();
if(errs.length) console.error('⚠️ erreurs de page : '+errs.join(' | '));
console.log(JSON.stringify(snap,null,1));
})();
