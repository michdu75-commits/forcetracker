#!/usr/bin/env node
/* 🔬 PHASE 3bis — L'EFFET DE LA MASSE MAIGRE CONNUE SUR LES MACROS.
   ⛔ LECTURE SEULE. Question mesurée : quand un bilan corporel FRAIS existe, que change-t-il ?
   ⭐ Le corpus principal a trouve 885 profils a ZERO glucide. Ici on cherche POURQUOI. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
           '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2',
           '.webp':'image/webp','.ico':'image/x-icon','.wasm':'application/wasm'};
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'});
  fs.createReadStream(f).pipe(r);
});
(async () => {
  await new Promise(r => srv.listen(0, r));
  const PORT = srv.address().port;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const cx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 },
                                  timezoneId: 'Europe/Paris' });
  const pg = await cx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(`try{localStorage.clear();}catch(e){}`);
  await pg.goto('http://localhost:' + PORT + '/index.html');
  await pg.waitForTimeout(2200);

  const R = await pg.evaluate(() => {
    const j = n => { const d = new Date(Date.now() - n * 864e5);
      return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
    const cas = [], cmp = [];
    const POIDS = [60, 75, 90, 110, 130];
    const MG = [10, 15, 20, 25, 30, 35, 40, 45];
    const GOAL = ['perte', 'recomp', 'muscle', 'equilibre'];
    for (const bw of POIDS) for (const mg of MG) for (const goal of GOAL) {
      for (const bilan of [false, true]) {
        S.gender = 'H'; S.bw = bw; S.height = 175; S.age = 40;
        S.activityLevel = 1.55; S.workType = 'bureau'; S.goal = goal;
        S.nutritionPhase = 'charge'; S.manualKcal = 0; S.foodMode = ''; S.keto = false;
        S.smoker = false; S.sessions = []; S.weightLog = []; S.otherSports = ''; S.stepsLog = null;
        const lm = +(bw * (1 - mg / 100)).toFixed(1);
        S.bodyScans = bilan ? [{ date: j(10), leanMass: lm, weight: bw, bodyFat: mg }] : [];
        const bd = bmrDetail(), m = calcMacros('charge');
        cas.push({ bw, mg, lm, goal, bilan, methode: bd.methode, bmr: bd.kcal,
                   tdee: calcTDEE(), kcal: m.calories, P: m.prot_g, G: m.carbs_g, L: m.fat_g,
                   gkgP_poids: +(m.prot_g / bw).toFixed(2),
                   gkgP_maigre: +(m.prot_g / lm).toFixed(2),
                   gkgL_maigre: +(m.fat_g / lm).toFixed(2),
                   pctP: +(m.prot_g * 4 / m.calories * 100).toFixed(1) });
      }
      const sans = cas[cas.length - 2], avec = cas[cas.length - 1];
      cmp.push({ bw, mg, goal, dBMR: avec.bmr - sans.bmr, dKcal: avec.kcal - sans.kcal,
                 dP: avec.P - sans.P, dG: avec.G - sans.G, dL: avec.L - sans.L,
                 methodeAvec: avec.methode });
    }
    return { cas, cmp };
  });
  R.erreursPage = errs;
  fs.writeFileSync('/tmp/corpus_nutri_mg.json', JSON.stringify(R, null, 1));
  console.log('cas : ' + R.cas.length + ' · erreurs de page : ' + errs.length);
  await cx.close(); await b.close(); srv.close();
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
