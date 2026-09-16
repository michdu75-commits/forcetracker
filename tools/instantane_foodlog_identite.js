/* ══════════════════════════════════════════════════════════════════════════════
   INSTANTANÉ — LE JOURNAL ALIMENTAIRE, AVANT / APRÈS LA CORRECTION D'IDENTITÉ (T-01)
   ⛔ POURQUOI IL EXISTE : une passe verte ne prouve pas qu'une donnée n'a pas bougé —
      elle prouve que ce que les témoins REGARDENT n'a pas bougé. Le chantier T-01
      ajoute un champ à des lignes déjà enregistrées ; la seule façon honnête de tenir
      la promesse « aucune donnée métier ne change » est de PROJETER le journal entier,
      sans l'identité, et de comparer les empreintes avant et après.
   ⭐ Le journal semé est REPRÉSENTATIF (consigne de Michel, étape 9) : ligne manuelle,
      ligne CIQUAL, ligne code-barres, ligne avec portion, ligne SANS `per100`, ligne
      d'ANCIEN format (sans `v`, sans provenance), et un repas rejoué en COLLISION de `ts`.
   ⛔ Il ne modifie rien dans le dépôt : il lit, il rend, il projette.
   Usage : node tools/instantane_foodlog_identite.js
   ══════════════════════════════════════════════════════════════════════════ */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');

const ROOT = process.env.FT_ROOT || path.resolve(__dirname, '..');
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
           '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.wasm':'application/wasm'};
const srv = http.createServer((q,r)=>{
  let p = decodeURIComponent(q.url.split('?')[0]); if(p==='/') p='/index.html';
  const f = path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){ r.writeHead(404); return r.end('404'); }
  r.writeHead(200,{'Content-Type':M[path.extname(f)]||'application/octet-stream'});
  fs.createReadStream(f).pipe(r);
});
const sha = s => crypto.createHash('sha256').update(s).digest('hex').slice(0,16);

(async()=>{
await new Promise(r=>srv.listen(0,r));
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const c = await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},timezoneId:'Europe/Paris'});
const p = await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(`(()=>{try{
  ['ft4_name|Testeur','ft4_bw|80','ft4_age|30','ft4_ht|178','ft4_gender|H','ft4_act|1.55',
   'ft4_work|bureau','ft4_goal|muscle','ft4_rest|120'].forEach(s=>{const[k,v]=s.split('|');localStorage.setItem(k,v);});
  window._demoMode=true;}catch(e){}})();`);
await p.goto('http://localhost:'+srv.address().port+'/index.html');
await p.waitForTimeout(2400);

const R = await p.evaluate(async ()=>{
  const pause = ms => new Promise(r=>setTimeout(r,ms));
  /* ⛔ DATE FIXE : un instantané qui change de valeur chaque jour ne peut pas être comparé. */
  const J = '2026-09-10';
  const REPRESENTATIF = [
    /* ① manuelle, sans per100 */
    {date:J, meal:'dejeuner', name:'Poulet maison', ts:1789500000000, kcal:220, prot:38, carbs:0, fat:7,
     v:1, saisie:'manuel', origine:'utilisateur', q:null, u:null, etat:null, sourceId:null, per100:null, modifie:false},
    /* ② CIQUAL, avec per100 et quantité */
    {date:J, meal:'dejeuner', name:'Riz blanc cuit', ts:1789500001000, kcal:195, prot:4, carbs:43, fat:.5,
     v:1, saisie:'liste', origine:'ciqual', q:150, u:'g', etat:'cuit', sourceId:'ciqual:9110', modifie:false,
     per100:{kcal:130, prot:2.7, carbs:28.7, fat:.3}},
    /* ③ code-barres tapé, état « vendu » */
    {date:J, meal:'soir', name:'Lentilles Raynal', ts:1789500002000, kcal:407, prot:25, carbs:41, fat:13,
     v:1, saisie:'code-tape', origine:'barcode', q:410, u:'g', etat:'vendu', sourceId:'off:3021690201123',
     modifie:false, per100:{kcal:99.2, prot:6.1, carbs:10, fat:3.2}},
    /* ④ avec portion nommée */
    {date:J, meal:'collation', name:'Yaourt nature', ts:1789500003000, kcal:61, prot:3.5, carbs:4.7, fat:3.2,
     v:1, saisie:'liste', origine:'marque', q:1, u:'portion', portionLabel:'1 pot', portionWeightG:125,
     etat:'vendu', sourceId:'off:0000000000001', modifie:false, per100:{kcal:49, prot:2.8, carbs:3.8, fat:2.6}},
    /* ⑤ ANCIEN FORMAT : ni `v`, ni provenance, ni quantité — tel qu'écrit avant ft-v907 */
    {date:J, meal:'matin', name:'Cafe', ts:1789500004000, kcal:2, prot:0, carbs:0, fat:0},
    /* ⑥⑦⑧ REPAS REJOUÉ EN COLLISION : trois lignes, un seul `ts`, aucune identité */
    {date:J, meal:'matin', name:'PAIN', ts:1789500005000, kcal:260, prot:9, carbs:49, fat:3,
     v:1, saisie:'liste', origine:'reprise', q:100, u:'g', etat:null, sourceId:null, modifie:false, per100:null},
    {date:J, meal:'matin', name:'OEUF', ts:1789500005000, kcal:150, prot:13, carbs:1, fat:11,
     v:1, saisie:'liste', origine:'reprise', q:100, u:'g', etat:null, sourceId:null, modifie:false, per100:null},
    {date:J, meal:'matin', name:'JUS',  ts:1789500005000, kcal:90,  prot:1,  carbs:21, fat:0,
     v:1, saisie:'liste', origine:'reprise', q:200, u:'ml', etat:null, sourceId:null, modifie:false, per100:null}
  ];
  localStorage.setItem('ft4_foodlog', JSON.stringify(REPRESENTATIF));
  S.foodLog = JSON.parse(JSON.stringify(REPRESENTATIF));

  goScreen('s-nutrition'); switchNuTab('journal');
  journalAllerA(J); await pause(120);
  renderFoodJournal(); await pause(300);

  /* ⭐⭐ LA PROJECTION MÉTIER : tout SAUF l'identité, à plat et TRIÉ — une empreinte qui
     changerait parce que les clés sont dans un autre ordre ne mesurerait que JSON. */
  const METIER = ['date','meal','name','ts','kcal','prot','carbs','fat','q','u','portionLabel',
                  'portionWeightG','per100','saisie','origine','etat','sourceId','v','modifie','codeDouteux'];
  const proj = o => METIER.map(k => k+'='+(o[k]===undefined?'∅':JSON.stringify(o[k]))).join(' | ');
  const lignes = (S.foodLog||[]).map(proj);

  /* ⭐ ET CE QUE L'ÉCRAN MONTRE : une correction d'identité ne doit rien changer à l'affichage. */
  const el = document.getElementById('food-journal');
  const ecran = (el ? el.innerText : '').replace(/\s+/g,' ').trim();

  /* ⭐ LE TOTAL DU JOUR, par le vrai calculateur */
  const tot = (typeof _foodTotals==='function') ? _foodTotals(J) : null;

  /* ⭐ LA DOUANE SUR CHAQUE LIGNE : son verdict ne doit pas bouger non plus. */
  const douane = (S.foodLog||[]).map(l=>{
    try{ const r=_douaneLigne(JSON.parse(JSON.stringify(l)),'instantane');
         return (r&&r.etat||'?')+':'+((r&&r.regles||[]).map(x=>x.r).sort().join(',')||'-'); }
    catch(e){ return 'ERREUR'; }
  });

  return {lignes, ecran, tot, douane, n:(S.foodLog||[]).length,
          idsPresents:(S.foodLog||[]).filter(e=>typeof e.id==='string').length};
});

const bloc = t => t.join('\n');
console.log('═══ INSTANTANÉ — JOURNAL ALIMENTAIRE, PROJECTION MÉTIER ═══\n');
console.log('lignes                : ' + R.n);
console.log('identités posées      : ' + R.idsPresents + '  (information, HORS de l\'empreinte)');
console.log('');
console.log('--- ① DONNÉES MÉTIER (identité exclue) ---');
R.lignes.forEach((l,i)=>console.log('  ['+i+'] '+l));
console.log('  sha : ' + sha(bloc(R.lignes)));
console.log('');
console.log('--- ② CE QUE L\'ÉCRAN MONTRE ---');
console.log('  sha : ' + sha(R.ecran));
console.log('  ' + R.ecran.slice(0,220) + (R.ecran.length>220?' …':''));
console.log('');
console.log('--- ③ TOTAUX DU JOUR ---');
console.log('  ' + JSON.stringify(R.tot) + '   sha : ' + sha(JSON.stringify(R.tot)));
console.log('');
console.log('--- ④ VERDICT DE LA DOUANE, LIGNE PAR LIGNE ---');
R.douane.forEach((d,i)=>console.log('  ['+i+'] '+d));
console.log('  sha : ' + sha(bloc(R.douane)));
console.log('');
console.log('═══ EMPREINTE GLOBALE : ' +
  sha(bloc(R.lignes)+'\n'+R.ecran+'\n'+JSON.stringify(R.tot)+'\n'+bloc(R.douane)) + ' ═══');
console.log('erreurs JS : ' + (errs.length?errs.join(' | '):'aucune'));
await b.close(); srv.close();
})();
