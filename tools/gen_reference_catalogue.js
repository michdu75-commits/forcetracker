#!/usr/bin/env node
/**
 * GÉNÈRE L'EMPREINTE DE RÉFÉRENCE DU CATALOGUE — tests/croises/catalogue-reference.json
 *
 * POURQUOI. Mesuré le 02/08 : sur 337 exercices, **60 (18 %) sont classés de façon FRAGILE**,
 * c'est-à-dire que plusieurs règles leur correspondent en donnant des muscles DIFFÉRENTS. Ils
 * sont justes aujourd'hui parce que la bonne règle est placée avant — mais leur justesse ne
 * tient qu'à l'ORDRE. Insérer une règle au mauvais endroit les fait basculer en silence : c'est
 * exactement ce qui est arrivé aux oiseaux et aux élévations latérales.
 *
 * L'empreinte fige le classement des 337. Le test `tests/croises/` la compare à chaque version
 * et signale le moindre exercice qui bouge — voulu ou non.
 *
 * ⚠️ Quand un changement est VOULU : relancer ce script, et le diff git montre exactement quels
 * exercices ont bougé. C'est la revue qui manquait.
 *
 * Lancer : node tools/gen_reference_catalogue.js
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
(async()=>{
await new Promise(r=>srv.listen(0,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
const p=await c.newPage();
await p.goto('http://localhost:'+srv.address().port+'/index.html');
await p.waitForTimeout(2500);
const out=await p.evaluate(()=>{
  const noms=[...new Set((EXLIB||[]).map(e=>e.n))].sort();
  const naz=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const E=n=>({name:n,sets:[{kg:60,reps:10,done:true,type:'N'}]});
  const N=_MEX.length;
  const sig=r=>(r.p||[]).slice().sort().join('+')+'|'+(r.s||[]).slice().sort().join('+');
  const ex={}; let fragiles=0;
  noms.forEach(n=>{
    const d=_mscScores([E(n)])||{}, sc=d.sc||{};
    const s=naz(n); const match=[];
    for(let k=0;k<N;k++) if(_MEX[k].re.test(s)) match.push(k);
    // Muscles ÉCRITS → l'ordre des règles ne s'applique plus : l'exercice sort du compte.
    const ecrit=(typeof exMuscles==='function')&&exMuscles(n);
    const avis=ecrit?1:[...new Set(match.map(k=>sig(_MEX[k])))].length;
    if(avis>1) fragiles++;
    ex[n]={p:Object.keys(sc).filter(k=>sc[k]===2).sort().join(','),
           s:Object.keys(sc).filter(k=>sc[k]===1).sort().join(','),
           pat:_movPattern(n)||'', eq:_exEquip(n), met:getExerciseMET(n),
           frag:avis>1?1:0};
  });
  return {genere:'a-remplir', total:noms.length, nbRegles:N, fragiles, ex};
});
out.genere=new Date().toISOString().slice(0,10);
await b.close(); srv.close();
fs.writeFileSync(path.join(ROOT,'tests/croises/catalogue-reference.json'), JSON.stringify(out,null,1));
console.log('empreinte écrite :', out.total, 'exercices ·', out.fragiles, 'classés de façon fragile ('+Math.round(100*out.fragiles/out.total)+' %)');
})().catch(e=>{console.error(e);process.exit(2);});
