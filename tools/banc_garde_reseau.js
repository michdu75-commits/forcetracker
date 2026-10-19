#!/usr/bin/env node
/* BANC — D031S (D-031-SÉCURITÉ-01, 19/10/2026) : le garde réseau des tests, éprouvé sur des destinations FICTIVES.
   Mêmes témoins que la passe complète (blocs D031S-I et D031S-II de tests/parcours/garde_reseau.js).
   Sert aussi au contrôle négatif : `python3 tools/mut_garde_reseau.py`.
   ⛔ Le garde est chargé en PREMIÈRE ligne, avant Playwright — c'est ce qu'on éprouve.
   ⚠️ Ce banc ne pose PAS d'enveloppe sur newContext (la passe en pose une) : il éprouve la porte du garde SEULE.
   Usage : node tools/banc_garde_reseau.js   (depuis la racine du dépôt ou d'une copie) */
const GARDE = require('../tests/_garde_reseau.js');
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
let ok = 0, ko = 0;
const t = (nom, cond, det) => { if (cond) { ok++; console.log('   OK  ' + nom); } else { ko++; console.log('❌ ROUGE ' + nom + (det ? '  >> ' + det : '')); } };
(async () => {
  await new Promise(r => srv.listen(0, r));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const T = require(path.join(ROOT, 'tests', 'parcours', 'garde_reseau.js'));
  await T.debut(t, b, srv.address().port, chromium);
  await T.fin(t);
  await b.close(); srv.close();
  console.log('\n──── ' + ok + ' OK / ' + ko + ' rouge ────');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error('PLANTAGE : ' + (e && e.message || e)); process.exit(2); });
