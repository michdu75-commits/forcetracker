// F14 (complément) : noms du catalogue qu'AUCUNE tuile du sélecteur ne montre (vraie app, réseau coupé).
require('../../tests/_garde_reseau.js');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2]);
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.jpg':'image/jpeg'};
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('404'); }
  r.writeHead(200, {'Content-Type': M[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
(async () => {
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const cx = await b.newContext({ serviceWorkers: 'block' }); await cx.route(u => !/^http:\/\/localhost:/.test(String(u)), rt => rt.abort());
  await cx.addInitScript(`try{localStorage.setItem('ft4_ob2','1');localStorage.setItem('ft4_bw','80');localStorage.setItem('ft4_stmig1','1');}catch(e){}`);
  const pg = await cx.newPage(); await pg.goto('http://localhost:' + srv.address().port + '/index.html'); await pg.waitForTimeout(1500);
  const r = await pg.evaluate(() => {
    const vus = new Set(); EX_GROUPS.forEach(g => EXLIB.filter(e => (g.tags || []).includes(e.g)).forEach(e => vus.add(e.n)));
    const noms = [...new Set(EXLIB.map(e => e.n))], horsTuile = noms.filter(n => !vus.has(n));
    const parGroupe = {}; horsTuile.forEach(n => { const g = EXLIB.filter(e => e.n === n).map(e => e.g).join('+'); parGroupe[g] = (parGroupe[g] || 0) + 1; });
    return { tags: EX_GROUPS.map(g => g.label + ' = ' + (g.tags || []).join(',')), horsTuile: horsTuile.length, parGroupe };
  });
  console.log(JSON.stringify(r, null, 1)); await b.close(); srv.close();
})();
