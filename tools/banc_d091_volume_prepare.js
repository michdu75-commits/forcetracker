#!/usr/bin/env node
/* BANC — D031S-B (D-031-SÉCURITÉ-01, 19/10/2026) : les témoins PRÉPARÉS de D-091 (volume et échauffements), seuls.
   ⛔ NON BRANCHÉS dans la passe : à brancher par Principal quand D-091 est livré. Sur le code d'avant D-091, les
   témoins du TOTAL rougissent — c'est attendu. Garde réseau chargé en première ligne.
   Usage : node tools/banc_d091_volume_prepare.js */
require('../tests/_garde_reseau.js');
const IDF = require('../tests/identites_fictives.js');
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
  const fictif = IDF.servir(f); if (fictif) return r.end(fictif);
  fs.createReadStream(f).pipe(r);
});
let ok = 0, ko = 0;
const t = (nom, cond, det) => { if (cond) { ok++; console.log('   OK  ' + nom); } else { ko++; console.log('❌ ROUGE ' + nom + (det ? '  >> ' + det : '')); } };
(async () => {
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  await require(path.join(ROOT, 'tests', 'parcours', 'd091_volume_prepare.js')).ecran(t, b, srv.address().port);
  await b.close(); srv.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
