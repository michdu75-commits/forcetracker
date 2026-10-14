#!/usr/bin/env node
/* INSTANTANÉ DE RÉFÉRENCE — NUT-LOT-B (13/10/2026). Capture, sur l'arbre où il est lancé, ce que LOT-B ne doit PAS
   changer : ① les 3 premiers codes CIQUAL de chaque clé de la table d'alias tapée SANS quantité (en ligne) ; ② l'empreinte
   `_fsTete` de chaque nom CIQUAL proposable (le découpage des NOMS de la base) ; ③ ce que rendent les requêtes faites
   d'une quantité SEULE (« 100g », « 250ml », « 200 g ») dans les quatre sources.
   ⛔ Généré UNE fois sur la base de LOT-B (`205cd17b`), relu par `tests/parcours/food_lot_b.js` ; on ne le régénère pas
   pour faire passer un témoin. Usage : node tools/instantane_food_lot_b.js > tests/parcours/food_lot_b_instantane.json */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const cx = await b.newContext({ serviceWorkers: 'block' });
  await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => rt.abort());
  const pg = await cx.newPage();
  await pg.addInitScript(`try{localStorage.setItem('ft4_ob2','1');localStorage.setItem('ft4_guide_shown','1');localStorage.setItem('ft4_wn_seen','99');}catch(e){}`);
  await pg.goto('http://localhost:' + srv.address().port + '/index.html'); await pg.waitForTimeout(1500);
  const R = await pg.evaluate(async () => {
    await Promise.all([_ciqualCharger(), _aliasCharger(), _marquesCharger(), _complCharger()]);
    const cles = {}; Object.keys(_alias.a).sort().forEach(k => { cles[k] = _ciqualChercher(k, 3).map(a => a[0]); });
    const tetes = _ciqual.a.filter(a => a[3] != null).map(a => a[0] + '=' + _fsTete(a[1], false) + '|' + _fsTete(a[1], true));
    const seules = {};
    ['100g', '250ml', '200 g'].forEach(q => { seules[q] = { ciq: _ciqualChercher(q, 6).map(a => a[0]), ff: _marquesChercher(q, 4).map(i => _marques.a[i][1]), compl: _complChercher(q, 6).map(a => a[0]) }; });
    return { base: null, n_cles: Object.keys(cles).length, cles, n_tetes: tetes.length, tetes, seules };
  });
  R.base = process.argv[2] || 'non précisée';
  process.stdout.write(JSON.stringify(R) + '\n');
  await b.close(); srv.close();
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
