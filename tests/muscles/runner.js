#!/usr/bin/env node
/**
 * LE MOTEUR « MUSCLES TRAVAILLÉS » — garde-fou sur TOUT le catalogue (ft-v666).
 *
 * Pourquoi ce test existe : le 29/07/2026, après avoir déplacé les érecteurs du
 * rachis de « dos » vers « gainage » (ft-v665), j'avais vérifié sur **9 types de
 * séances** et conclu « aucune couleur ne change ». Michel a demandé : *« sur tous
 * les mouvements tu as vérifié ? »* — non. En passant les **287 exercices** du
 * catalogue, 4 changeaient bel et bien de couleur.
 * *Tester des archétypes n'est pas tester le catalogue.*
 *
 * Ce passage a révélé que **86 exercices sur 287 (30 %)** n'avaient AUCUNE
 * correspondance musculaire — comblé en ft-v667 (rattrapage par famille).
 *
 * Il fige quatre choses :
 *   1. la FIGURINE ne dépend jamais du découpage en régions (elle lit les muscles) ;
 *   2. les 4 exercices de fessiers restent classés « bas du corps » (et non full body) ;
 *   3. **TOUT** le catalogue a une correspondance musculaire — ce compte ne doit
 *      jamais remonter au-dessus de 0 ;
 *   4. les EXCLUSIONS des règles génériques tiennent (le « leg curl » n'est pas
 *      du biceps, le développé couché n'est pas de l'épaule) — et la règle de
 *      rattrapage reste la DERNIÈRE de `_MEX`, sinon elle serait morte.
 *
 * Lancer : node tests/muscles/runner.js
 */
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

// ✅ ft-v667 : le trou est COMBLÉ — 0 exercice sans correspondance musculaire.
// Ce chiffre ne doit JAMAIS remonter : tout exercice ajouté au catalogue doit être
// attrapé par `_MEX` (au pire par une règle générique de fin de liste).
const SANS_MUSCLES_CONNUS = 0;

(async()=>{
await new Promise(r=>srv.listen(0,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:'+srv.address().port+'/index.html');
await p.waitForTimeout(2500);

console.log('\n─── MOTEUR MUSCLES — TOUT LE CATALOGUE ───────────────────');
const r=await p.evaluate(()=>{
  const noms=[]; try{ (EXLIB||[]).forEach(e=>{ if(e&&e.n)noms.push(e.n); }); }catch(e){}
  const E=n=>({name:n,sets:[{kg:100,reps:8,done:true,type:'N'}]});
  const out={total:noms.length, sansMuscles:[], figKo:[], regions:{}};
  for(const n of noms){
    const d=_mscScores([E(n)])||{}; const sc=d.sc||{};
    if(!Object.keys(sc).length){ out.sansMuscles.push(n); continue; }
    // la figurine se rend depuis les MUSCLES : elle doit être stable et non vide
    const svg=_mscSVG({sc:sc, ind:d.ind||{}});
    if(!svg||svg.length<200||svg!==_mscSVG({sc:sc, ind:d.ind||{}})) out.figKo.push(n);
    out.regions[n]=_calSessRegion({date:'2026-07-29',exs:[E(n)]});
  }
  return out;
});

t('le catalogue est bien chargé (> 250 exercices)', r.total>250, 'reçu '+r.total);
t('⭐ la FIGURINE se rend pour TOUS les exercices reconnus (stable, non vide)',
  r.figKo.length===0, r.figKo.slice(0,8).join(', '));

// ── Les 4 exercices de FESSIERS : « bas du corps », jamais « full body » ─────
// Avant ft-v665 ils étaient classés full body parce que le bas du dos gonflait la
// part « haut+dos ». Un hip thrust n'est pas une séance full body.
for(const ex of ['Poussée de Hanche (Hip Thrust)','Pont Fessier (Glute Bridge)',
                 'Extension Fessiers Arrière (Kickback)','Tirage Cable Fessiers (Cable Pull Through)']){
  const reg=r.regions[ex];
  t('« '+ex.replace(/\s*\(.*\)/,'')+' » = bas du corps (et non full body)',
    reg==='bas', 'reçu '+reg);
}
// les grands mouvements gardent leur classement
t('le squat reste « bas du corps »', r.regions['Squat à la Barre']==='bas', 'reçu '+r.regions['Squat à la Barre']);
t('le développé couché reste « haut du corps »', r.regions['Développé Couché']==='haut', 'reçu '+r.regions['Développé Couché']);
t('le soulevé de terre reste « full body »', r.regions['Soulevé de Terre']==='full', 'reçu '+r.regions['Soulevé de Terre']);

// ── Aucune figurine vide : le trou de 86 exercices est comblé (ft-v667) ─────
console.log('     ℹ️  ' + r.sansMuscles.length + ' exercice(s) sur ' + r.total +
            ' sans correspondance musculaire (86 avant ft-v667)');
t('⭐ TOUT le catalogue a une correspondance musculaire (aucune figurine vide)',
  r.sansMuscles.length<=SANS_MUSCLES_CONNUS,
  'reçu ' + r.sansMuscles.length + ' — nouveaux non mappés : ' + r.sansMuscles.slice(0,6).join(', '));
// ── Les exclusions qui doivent TENIR malgré les règles génériques (ft-v667) ──
// ⚠️ Le piège du rattrapage : une règle « curl » trop large attraperait le LEG curl
// (ischio-jambiers) et le classerait en biceps. Ces témoins figent les cas limites.
const temoins=await p.evaluate(()=>{
  const E=n=>({name:n,sets:[{kg:100,reps:8,done:true,type:'N'}]});
  const sc=n=>(_mscScores([E(n)])||{}).sc||{};
  return {
    legCurl:sc('Leg Curl Couché Machine'), curlIschio:sc('Curl Ischio-jambiers (Leg Curl)'),
    curlBiceps:sc('Curl Barre'), dcCouche:sc('Développé Couché'),
    dArnold:sc('Développé Arnold (Arnold Press)'), presseCuisses:sc('Presse à Cuisses'),
    // la dernière règle de _MEX doit rester le rattrapage « développé » (sinon règle morte)
    nbRegles:(typeof _MEX!=='undefined')?_MEX.length:0,
    derniereAttrape:(typeof _MEX!=='undefined')&&_MEX[_MEX.length-1].re.test('developpe halteres assis')
  };
});
t('⚠️ le LEG curl reste des ISCHIOS (pas du biceps)',
  temoins.legCurl.hamstrings===2&&!temoins.legCurl.biceps, JSON.stringify(temoins.legCurl));
t('⚠️ « Curl Ischio-jambiers » aussi', temoins.curlIschio.hamstrings===2&&!temoins.curlIschio.biceps,
  JSON.stringify(temoins.curlIschio));
t('un curl de BRAS est bien du biceps', temoins.curlBiceps.biceps===2, JSON.stringify(temoins.curlBiceps));
t('le développé COUCHÉ reste des pectoraux', temoins.dcCouche.pec===2&&!temoins.dcCouche['side-delt'],
  JSON.stringify(temoins.dcCouche));
t('un développé d\'ÉPAULES est bien des épaules',
  temoins.dArnold['front-delt']===2&&temoins.dArnold['side-delt']===2&&!temoins.dArnold.pec,
  JSON.stringify(temoins.dArnold));
t('la presse à cuisses reste des quadriceps', temoins.presseCuisses.quads===2, JSON.stringify(temoins.presseCuisses));
t('⚠️ la DERNIÈRE règle de _MEX est bien le rattrapage générique (sinon règle morte)',
  temoins.derniereAttrape===true, 'nb règles : '+temoins.nbRegles);

t('0 erreur JS', errs.length===0, errs.join(' | '));

console.log('──────────────────────────────────────────────────────────');
console.log((ko?'❌ ':'✅ ')+ok+'/'+(ok+ko));
await b.close(); srv.close(); process.exit(ko?1:0);
})();
