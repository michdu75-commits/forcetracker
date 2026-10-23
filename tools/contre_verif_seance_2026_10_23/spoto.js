// F05 appliqué à un vrai cas cité par l'audit : « Spoto press » exercice PERSO (rangé Polyvalent). Données fictives.
require('../../tests/_garde_reseau.js');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2]);
const M = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp'};
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
    const noms = ['Spoto press', 'Spoto Press', 'Larsen press maison', 'Rowing Zorglub', 'Squat Zorglub', 'Tirage Zorglub', 'Pompes Zorglub', 'Zorglub'];
    return noms.map(nom => {
      S.customExercises = [{ n: nom, g: 'Polyvalent', custom: true, muscles: { p: ['abs'], s: ['calves'] } }];   // muscles volontairement « faux » pour voir qui gagne
      const sc = _mscScores([{ name: nom, sets: [{ done: true }] }]).sc;
      const regle = _MEX.find(x => x.re.test(_naz(nom)));
      return { nom, catalogue: !!exMuscles(exNomCatalogue(nom)), regle: regle ? String(regle.re).slice(0, 70) : null,
        figurine: Object.keys(sc).filter(k => sc[k] >= 1).join(','), metUtilise: (typeof getExerciseMET === 'function') ? getExerciseMET(nom) : null };
    });
  });
  console.log(JSON.stringify(r, null, 1)); await b.close(); srv.close();
})();
