#!/usr/bin/env node
/* AUDIT NUTRITION DE NUIT — SONDE CIBLÉE (outil d'audit, hors runtime) : quelques requêtes, top 4 CIQUAL en ligne / hors ligne,
   fast-food et journal. Usage : node tools/audit-nut-night/sonde_ciblee.js "<req1>" "<req2>" ... */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'); const Q = process.argv.slice(2);
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html'; const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
(async () => { await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }); const cx = await b.newContext({ serviceWorkers: 'block' });
  await cx.route(/script\.google\.com|workers\.dev|anthropic|openfoodfacts/, rt => rt.abort());
  const pg = await cx.newPage(); await pg.addInitScript(`localStorage.setItem('ft4_ob2','1');localStorage.setItem('ft4_guide_shown','1');localStorage.setItem('ft4_wn_seen','99');`);
  await pg.goto('http://localhost:' + srv.address().port + '/index.html'); await pg.waitForTimeout(1500);
  const r = await pg.evaluate(async Q => { await Promise.all([_ciqualCharger(), _aliasCharger(), _marquesCharger()]);
    const top = (q, en) => { const s = _alias; if (!en) _alias = null; try { return _ciqualChercher(q, 6).slice(0, 4).map(a => a[1] + ' [' + a[3] + ']'); } finally { _alias = s; } };
    return Q.map(q => ({ q, mots: _afMots(q), en: top(q, true), hors: top(q, false), ff: _marquesChercher(q, 4).map(i => _marques.a[i][1] + ' · ' + _marques.a[i][0]) })); }, Q);
  for (const o of r) console.log(JSON.stringify(o, null, 0));
  await b.close(); srv.close(); })();
