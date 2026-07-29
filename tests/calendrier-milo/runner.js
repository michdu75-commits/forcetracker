#!/usr/bin/env node
/**
 * MILO NE CALCULE PLUS LES JOURS — ON LES LUI DONNE (ft-v658).
 *
 * Le bug (Michel, mercredi 29/07/2026 à 08 h 11) : il écrit « c'est demain plutôt »,
 * Milo répond « demain MERCREDI alors » — alors qu'on ÉTAIT mercredi et que demain
 * était jeudi. Il avait pourtant la bonne date d'aujourd'hui dans son contexte : ce
 * qu'on lui demandait, c'était de DÉDUIRE le nom du jour de demain. Un modèle de
 * langage se trompe sur ce calcul.
 *
 * C'est la règle R8 en plein : un prompt ne compense jamais une donnée absente.
 * Le fix n'est pas « mieux lui expliquer », c'est LUI DONNER les jours.
 *
 * Lancer : node tests/calendrier-milo/runner.js
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

(async()=>{
await new Promise(r=>srv.listen(0,r));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});

// Le contexte est construit avec l'horloge GELÉE sur un instant précis : on peut donc
// vérifier les VRAIS noms de jours, pas « ce que l'ordinateur pense être aujourd'hui ».
async function ctxLe(instantISO){
  const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
  await c.addInitScript(([s,fixe])=>{
    for(const k in s)localStorage.setItem(k,s[k]);
    const F=new Date(fixe), R=Date;
    window.Date=class extends R{constructor(...a){super(...(a.length?a:[F.getTime()]));}static now(){return F.getTime();}};
    window.Date.parse=R.parse; window.Date.UTC=R.UTC;
  },[{ft4_name:'Michel',ft4_bw:'87',ft4_age:'45',ft4_height:'178',ft4_gender:'h',
      ft4_ok:'1',ft4_premium:'1',ft4_email:'x@y.z'},instantISO]);
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:'+srv.address().port+'/index.html');
  await p.waitForTimeout(2300);
  const ctx=await p.evaluate(()=>{try{return buildCoachContext()||'';}catch(e){return 'ERREUR: '+e.message;}});
  await c.close();
  return {ctx,errs};
}

console.log('\n─── MILO NE CALCULE PLUS LES JOURS ───────────────────────');

// ── 1. Le cas EXACT de Michel : un mercredi matin ────────────────────────────
{
  const {ctx,errs}=await ctxLe('2026-07-29T08:11:00+02:00');   // mercredi
  t('⭐ LE CAS DE MICHEL : « demain » = JEUDI, pas mercredi',
    /- demain = jeudi 30 juillet \(2026-07-30\)/.test(ctx),
    (ctx.match(/- demain = .*/)||['(absent)'])[0]);
  t('… « aujourd\'hui » est bien mercredi', /- AUJOURD'HUI = mercredi 29 juillet \(2026-07-29\)/.test(ctx));
  t('… « hier » est bien mardi (la séance jambes)', /- hier = mardi 28 juillet \(2026-07-28\)/.test(ctx));
  t('… et la consigne de ne PAS calculer est présente',
    /NE CALCULE JAMAIS UN JOUR TOI-MÊME/.test(ctx)&&/Ne déduis jamais un nom de jour de tête/.test(ctx));
  t('le contexte se construit sans erreur', !/^ERREUR:/.test(ctx)&&errs.length===0, errs.join(' | '));
}

// ── 2. Les jours suivants sont donnés, pour « lundi », « dans 3 jours »… ─────
{
  const {ctx}=await ctxLe('2026-07-29T08:11:00+02:00');
  t('après-demain est nommé', /- après-demain = vendredi 31 juillet \(2026-07-31\)/.test(ctx));
  t('les 14 jours à venir sont listés (couvre la règle « au plus 14 jours »)',
    /lundi 3 août \(2026-08-03\)/.test(ctx)&&/mercredi 12 août \(2026-08-12\)/.test(ctx));
  t('le bloc « séance annoncée » renvoie au calendrier au lieu de faire calculer',
    /recopiée depuis le CALENDRIER/.test(ctx)&&!/calcule le bon jour à venir/.test(ctx));
}

// ── 3. Les pièges de calendrier : changement de mois et d'année ──────────────
{
  const {ctx}=await ctxLe('2026-07-31T10:00:00+02:00');        // vendredi, dernier jour du mois
  t('fin de mois : demain passe bien au 1er août',
    /- demain = samedi 1 août \(2026-08-01\)/.test(ctx), (ctx.match(/- demain = .*/)||[''])[0]);
}
{
  const {ctx}=await ctxLe('2026-12-31T18:00:00+01:00');        // jeudi, dernier jour de l'année
  t('fin d\'année : demain passe bien au 1er janvier 2027',
    /- demain = vendredi 1 janvier \(2027-01-01\)/.test(ctx), (ctx.match(/- demain = .*/)||[''])[0]);
}
// ── 4. Minuit et demi : le jour donné à Milo est celui du TÉLÉPHONE (ft-v655)
{
  const {ctx}=await ctxLe('2026-07-29T00:30:00+02:00');
  t('00 h 30 : « aujourd\'hui » reste le 29, pas la veille',
    /- AUJOURD'HUI = mercredi 29 juillet \(2026-07-29\)/.test(ctx),
    (ctx.match(/- AUJOURD'HUI = .*/)||[''])[0]);
  t('… et les deux façons de dire la date CONCORDENT',
    /- AUJOURD'HUI = mercredi 29 juillet/.test(ctx)&&/On est mercredi 29 juillet/.test(ctx));
}

console.log('──────────────────────────────────────────────────────────');
console.log((ko?'❌ ':'✅ ')+ok+'/'+(ok+ko));
await b.close(); srv.close(); process.exit(ko?1:0);
})();
