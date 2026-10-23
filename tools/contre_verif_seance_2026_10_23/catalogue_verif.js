// Vérification INDÉPENDANTE (session-C) des chiffres catalogue/images de l'audit et de l'agent : la vraie app, réseau coupé.
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
    const appart = EXLIB.length, noms = [...new Set(EXLIB.map(e => e.n))], groupes = [...new Set(EXLIB.map(e => e.g))];
    const sansImg = noms.filter(n => !EX_YT[exNomCatalogue(n)]);
    const valeurs = Object.values(EX_YT), clesHors = Object.keys(EX_YT).filter(k => !noms.includes(k));
    const legCurl = EXLIB.filter(e => /leg curl/i.test(e.n)).map(e => e.n + ' → ' + e.g + ' (' + ((exMuscles(exNomCatalogue(e.n)) || {}).p || []).join('+') + ')');
    // le fait « Groupes musculaires (30 j) » envoyé à Milo, pour 4 séances de leg curl + 1 de squat
    const mk = (i, n) => ({ id: 900 + i, ts: Date.now() - i * 864e5, date: today(Date.now() - i * 864e5), uniConv: 1, exs: [{ name: n, sets: [{ kg: 40, reps: 10, done: true, type: 'N' }] }] });
    S.sessions = [mk(1, legCurl.length ? EXLIB.find(e => /leg curl/i.test(e.n)).n : 'Leg Curl Couché Machine'), mk(2, EXLIB.find(e => /leg curl/i.test(e.n)).n), mk(3, EXLIB.find(e => /leg curl/i.test(e.n)).n), mk(4, EXLIB.find(e => /leg curl/i.test(e.n)).n), mk(5, 'Développé Couché')];
    let fait = null; try { computeRegistreFacts(); fait = (S.registre.facts.groupe_travail || {}).value || null; } catch (e) { fait = 'ERREUR ' + e.message; }
    const vol = _volumeParMuscle(Date.now(), 14).liste.map(x => x.code + ':' + x.series).join(', ');
    return { appart, noms: noms.length, groupes: groupes.length, groupesListe: groupes, sansImg, nbValeursEXYT: valeurs.length, clesHors, legCurl, faitMilo: fait, volumeProgres: vol };
  });
  // fichiers : chaque valeur d'EX_YT existe-t-elle ? quels .webp de exercises/ ne sont référencés par aucune valeur ?
  const vals = await pg.evaluate(() => Object.values(EX_YT).map(v => (v && v.img) || String(v)));
  const manquants = vals.filter(v => !fs.existsSync(path.join(ROOT, v)));
  const webp = fs.readdirSync(path.join(ROOT, 'exercises')).filter(f => f.endsWith('.webp')).map(f => 'exercises/' + f);
  const orphelins = webp.filter(w => !vals.some(v => v.replace(/^\.\//, '') === w));
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  console.log(JSON.stringify(Object.assign(r, { fichiersManquants: manquants, orphelins: orphelins.map(o => o + (sw.includes(o) ? ' [précaché]' : '')) }), null, 1));
  await b.close(); srv.close();
})();
