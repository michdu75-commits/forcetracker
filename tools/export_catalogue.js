#!/usr/bin/env node
/**
 * EXPORT DU CATALOGUE D'EXERCICES — pour réutilisation dans une autre application.
 *
 * Produit trois fichiers dans docs/export/ :
 *   · catalogue-exercices.json  — tout, lisible par une machine
 *   · catalogue-exercices.csv   — le même, ouvrable dans un tableur
 *   · LISEZ-MOI-EXPORT.md       — le schéma expliqué, à lire AVANT d'utiliser les données
 *
 * Les données sont LUES DANS L'APPLICATION (exécutée dans un navigateur réel), pas recopiées :
 * l'export ne peut donc pas diverger du produit.
 *
 * Lancer : node tools/export_catalogue.js
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http=require('http'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const M={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
 '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';
 const f=path.join(ROOT,p);
 if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
 r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});

// Libellés français des 17 codes musculaires (le code n'en contient pas de table dédiée).
const MUSCLES={
 pec:'Pectoraux', lats:'Grand dorsal', traps:'Trapèzes',
 'front-delt':'Deltoïde antérieur', 'side-delt':'Deltoïde moyen', 'rear-delt':'Deltoïde postérieur',
 biceps:'Biceps', triceps:'Triceps', forearms:'Avant-bras',
 quads:'Quadriceps', hamstrings:'Ischio-jambiers', glutes:'Fessiers', calves:'Mollets',
 abs:'Abdominaux', obliques:'Obliques', 'lower-back':'Lombaires', 'hip-flexors':'Fléchisseurs de hanche'
};
const EQUIP={barre:'Barre', libre:'Poids libre (haltères, kettlebell)', guide:'Guidé (machine, poulie)',
 corps:'Poids du corps', elast:'Élastique', trx:'Sangles / TRX', cardio:'Cardio / conditionnement',
 autre:'Polyvalent / non déterminé'};

(async()=>{
await new Promise(r=>srv.listen(0,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
const p=await c.newPage();
await p.goto('http://localhost:'+srv.address().port+'/index.html');
await p.waitForTimeout(2500);
const brut=await p.evaluate(()=>{
  const noms=[...new Set((EXLIB||[]).map(e=>e.n))].sort((a,b)=>a.localeCompare(b,'fr'));
  const naz=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const N=_MEX.length;
  const sig=r=>(r.p||[]).slice().sort().join('+')+'|'+(r.s||[]).slice().sort().join('+');
  const patLbl={}; _MOV_PATTERNS.forEach(P=>patLbl[P.id]=P.label);
  return {
    patterns:_MOV_PATTERNS.map(P=>({id:P.id,label:P.label})),
    groupes:[...new Set(EXLIB.map(e=>e.g))],
    ex: noms.map(n=>{
      const d=_mscScores([E(n)])||{}, sc=d.sc||{};
      const q=naz(n); const match=[];
      for(let k=0;k<N;k++) if(_MEX[k].re.test(q)) match.push(k);
      const avis=[...new Set(match.map(k=>sig(_MEX[k])))].length;
      const pat=_movPattern(n);
      return {nom:n, groupe:(EXLIB.find(x=>x.n===n)||{}).g,
        musclesPrincipaux:Object.keys(sc).filter(k=>sc[k]===2).sort(),
        musclesSecondaires:Object.keys(sc).filter(k=>sc[k]===1).sort(),
        schemaMouvement:pat||null, schemaLibelle:pat?patLbl[pat]:null,
        materiel:_exEquip(n), met:getExerciseMET(n),
        role:(typeof _exRole==='function')?_exRole(n):null,
        termeAnglais:(typeof EX_EN!=='undefined'&&EX_EN[n])||null,
        classementCertain: avis<=1};
    })};
});
await b.close(); srv.close();

const D=new Date().toISOString().slice(0,10);
const ex=brut.ex.map(e=>Object.assign({}, e, {
  musclesPrincipauxFr:e.musclesPrincipaux.map(m=>MUSCLES[m]||m),
  musclesSecondairesFr:e.musclesSecondaires.map(m=>MUSCLES[m]||m),
  materielLibelle:EQUIP[e.materiel]||e.materiel
}));
const json={
  source:'Force Tracker', exporte:D, nbExercices:ex.length,
  avertissement:'LIRE LISEZ-MOI-EXPORT.md avant utilisation : ces données sont DÉDUITES du nom '+
    'de chaque exercice par 69 règles, elles ne sont pas saisies à la main. Voir la section '+
    '« Fiabilité » pour ce que le champ classementCertain signifie.',
  vocabulaire:{muscles:MUSCLES, materiel:EQUIP, schemasMouvement:brut.patterns,
               groupes:brut.groupes},
  exercices:ex
};
fs.mkdirSync(path.join(ROOT,'docs/export'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'docs/export/catalogue-exercices.json'), JSON.stringify(json,null,1));

const esc=v=>{const s=String(v==null?'':v); return /[",;\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
const cols=['nom','groupe','musclesPrincipauxFr','musclesSecondairesFr','schemaLibelle',
            'materielLibelle','met','role','termeAnglais','classementCertain'];
const csv=[cols.join(';')].concat(ex.map(e=>cols.map(k=>{
  const v=e[k]; return esc(Array.isArray(v)?v.join(' + '):v);
}).join(';'))).join('\n');
fs.writeFileSync(path.join(ROOT,'docs/export/catalogue-exercices.csv'), '﻿'+csv);

const certains=ex.filter(e=>e.classementCertain).length;
console.log('export écrit :', ex.length, 'exercices ·', certains, 'au classement certain ('
  +Math.round(100*certains/ex.length)+' %)');
console.log('  docs/export/catalogue-exercices.json');
console.log('  docs/export/catalogue-exercices.csv');
})().catch(e=>{console.error(e);process.exit(2);});
